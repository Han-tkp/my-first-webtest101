import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { checkApiRole } from "@/lib/auth";
import { notifyBorrowRequest } from "@/lib/notifications";
import { consumeRateLimit } from "@/lib/rate-limit";

interface EquipmentRequest {
    type: string;
    quantity: number;
}

/**
 * Parses raw equipment requests from the request body.
 * Normalizes types and ensures quantities are valid positive integers.
 */
function parseEquipmentRequests(rawRequests: unknown): EquipmentRequest[] {
    const requestsMap = new Map<string, number>();

    if (!Array.isArray(rawRequests)) {
        return [];
    }

    for (const entry of rawRequests) {
        const type = typeof entry?.type === "string" ? entry.type.trim() : "";
        const parsedQuantity = Number.parseInt(String(entry?.quantity ?? 0), 10);
        const quantity = Number.isFinite(parsedQuantity) ? Math.max(0, parsedQuantity) : 0;

        if (!type || quantity < 1) {
            continue;
        }

        requestsMap.set(type, (requestsMap.get(type) || 0) + quantity);
    }

    return Array.from(requestsMap.entries()).map(([type, quantity]) => ({ type, quantity }));
}

/**
 * Resolves equipment IDs based on the provided requests (by type, specific IDs, or type list).
 */
async function resolveEquipmentIds(
    supabase: Awaited<ReturnType<typeof createClient>>,
    equipmentRequests: EquipmentRequest[],
    equipmentTypes: string[],
    requestedEquipmentIds: number[],
) {
    const selectedIds: number[] = [];

    // 1. Resolve by explicit quantity per type (Primary method)
    if (equipmentRequests.length > 0) {
        for (const request of equipmentRequests) {
            const { data, error } = await supabase
                .from("equipment")
                .select("id")
                .eq("type", request.type)
                .eq("status", "available")
                .order("updated_at", { ascending: true })
                .limit(request.quantity);

            if (error) return { error: error.message, status: 500 as const };

            if (!data || data.length < request.quantity) {
                return { 
                    error: `อุปกรณ์ประเภท "${request.type}" คงเหลือไม่เพียงพอ (ต้องการ ${request.quantity} แต่มี ${data?.length || 0})`, 
                    status: 409 as const 
                };
            }

            selectedIds.push(...data.map((item) => item.id));
        }
        return { equipmentIds: selectedIds };
    }

    // 2. Resolve by list of types (Old method / fallback)
    if (equipmentTypes.length > 0) {
        for (const type of equipmentTypes) {
            const { data, error } = await supabase
                .from("equipment")
                .select("id")
                .eq("type", type)
                .eq("status", "available")
                .order("updated_at", { ascending: true })
                .limit(1);

            if (error) return { error: error.message, status: 500 as const };

            if (!data || data.length === 0) {
                return { error: `ไม่พบอุปกรณ์ประเภท "${type}" ที่พร้อมใช้งาน`, status: 409 as const };
            }

            selectedIds.push(data[0]!.id);
        }
        return { equipmentIds: selectedIds };
    }

    // 3. Resolve by explicit IDs (Fallback for direct selection)
    if (requestedEquipmentIds.length > 0) {
        return { equipmentIds: requestedEquipmentIds };
    }

    return { error: "กรุณาเลือกอุปกรณ์ที่ต้องการยืม", status: 400 as const };
}

export async function GET(request: Request) {
    if (!isSupabaseConfigured()) {
        return NextResponse.json({ error: "ระบบยังไม่พร้อมใช้งาน" }, { status: 503 });
    }

    const { profile, error: authError } = await checkApiRole("admin", "approver", "technician", "user");
    if (authError) return NextResponse.json({ error: authError.message }, { status: authError.status });

    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ error: "ระบบยังไม่พร้อมใช้งาน" }, { status: 503 });

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");

    let query = supabase.from("borrows").select("*").order("created_at", { ascending: false });

    // Regular users only see their own borrows
    if (profile?.role === "user") {
        query = query.eq("user_id", profile.id);
    } else if (userId) {
        query = query.eq("user_id", userId);
    }

    if (status) {
        query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    if (!isSupabaseConfigured()) {
        return NextResponse.json({ error: "ระบบยังไม่พร้อมใช้งาน" }, { status: 503 });
    }

    const { profile, error: authError } = await checkApiRole("admin", "user");
    if (authError) return NextResponse.json({ error: authError.message }, { status: authError.status });

    // Enforce rate limiting per user
    const rateLimit = await consumeRateLimit({
        action: "borrows.create",
        scope: profile!.id,
        limit: 10,
        windowSeconds: 5 * 60,
        blockSeconds: 10 * 60,
    });

    if (!rateLimit.allowed) {
        return NextResponse.json(
            { error: "ส่งคำขอถี่เกินไป กรุณารอสักครู่แล้วลองใหม่" },
            { 
                status: 429, 
                headers: { "Retry-After": String(rateLimit.retryAfter) } 
            },
        );
    }

    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ error: "ระบบยังไม่พร้อมใช้งาน" }, { status: 503 });

    const body = await request.json();
    
    // Extract and normalize inputs
    const requestedEquipmentIds = Array.isArray(body.equipment_ids)
        ? body.equipment_ids.filter((id: unknown) => Number.isInteger(Number(id)) && Number(id) > 0)
        : [];
    const equipmentRequests = parseEquipmentRequests(body.equipment_requests);
    const equipmentTypes = Array.isArray(body.equipment_types) ? body.equipment_types : [];
    const contactPhone = typeof body.contact_phone === "string" 
        ? body.contact_phone.replace(/\D/g, "").slice(0, 10) 
        : "";

    // Resolve specific equipment IDs
    const resolved = await resolveEquipmentIds(supabase, equipmentRequests, equipmentTypes, requestedEquipmentIds);
    if ("error" in resolved) {
        return NextResponse.json({ error: resolved.error }, { status: resolved.status });
    }

    const equipmentIds = resolved.equipmentIds;

    // Final availability check before inserting
    const { data: availableItems, error: availError } = await supabase
        .from("equipment")
        .select("id")
        .in("id", equipmentIds)
        .eq("status", "available");

    if (availError) return NextResponse.json({ error: availError.message }, { status: 500 });

    if ((availableItems?.length || 0) !== equipmentIds.length) {
        return NextResponse.json({ error: "อุปกรณ์บางรายการไม่พร้อมใช้งานในขณะนี้" }, { status: 409 });
    }

    const borrowData = {
        user_id: profile!.id,
        user_name: profile!.full_name,
        borrow_date: body.borrow_date,
        due_date: body.due_date,
        purpose: typeof body.purpose === "string" ? body.purpose.trim() : "",
        contact_name: typeof body.contact_name === "string" ? body.contact_name.trim() : "",
        contact_phone: contactPhone,
        notes: typeof body.notes === "string" ? body.notes.trim() : "",
        equipment_ids: equipmentIds,
        status: "pending_borrow_approval",
    };

    const { data, error } = await supabase.from("borrows").insert([borrowData]).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Trigger notifications (Fire and forget, but logged on error)
    notifyBorrowRequest({
        borrowId: data.id,
        user_name: profile!.full_name,
        purpose: borrowData.purpose,
        borrow_date: borrowData.borrow_date,
        due_date: borrowData.due_date,
        equipment_ids: equipmentIds,
    }).catch((err) => console.error("[Notify] Borrow request failed:", err));

    return NextResponse.json(data, { status: 201 });
}
