import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { checkApiRole } from "@/lib/auth";

function normalizeEquipmentPayload(body: Record<string, unknown>) {
    return {
        name: String(body.name || "").trim(),
        type: String(body.type || "").trim(),
        serial: String(body.serial || "").trim(),
        status: body.status ? String(body.status).trim() : undefined,
        image_url: body.image_url ? String(body.image_url).trim() : null,
        brand: body.brand ? String(body.brand).trim() : null,
        model: body.model ? String(body.model).trim() : null,
        purchase_year: body.purchase_year ? Number(body.purchase_year) : null,
    };
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { error: authError } = await checkApiRole("admin", "approver", "technician", "user");
    if (authError) return NextResponse.json({ error: authError.message }, { status: authError.status });

    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase.from("equipment").select("*").eq("id", id).single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(data);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { error: authError } = await checkApiRole("admin");
    if (authError) return NextResponse.json({ error: authError.message }, { status: authError.status });

    const { id } = await params;
    const supabase = await createClient();
    const body = normalizeEquipmentPayload(await request.json());

    if (!body.name || !body.type || !body.serial) {
        return NextResponse.json(
            { error: "กรุณาระบุชื่อเครื่อง ประเภท และเลขครุภัณฑ์/เลขเครื่องให้ครบ" },
            { status: 400 },
        );
    }

    const { data: existingSerial } = await supabase
        .from("equipment")
        .select("id")
        .eq("serial", body.serial)
        .neq("id", id)
        .maybeSingle();

    if (existingSerial) {
        return NextResponse.json({ error: "เลขครุภัณฑ์/เลขเครื่องนี้มีอยู่ในระบบแล้ว" }, { status: 409 });
    }

    const { data, error } = await supabase.from("equipment").update(body).eq("id", id).select().single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { error: authError } = await checkApiRole("admin");
    if (authError) return NextResponse.json({ error: authError.message }, { status: authError.status });

    const { id } = await params;
    const supabase = await createClient();

    const { data: activeBorrow } = await supabase
        .from("borrows")
        .select("id")
        .contains("equipment_ids", [Number(id)])
        .in("status", ["pending_borrow_approval", "pending_delivery", "borrowed"])
        .limit(1)
        .maybeSingle();

    if (activeBorrow) {
        return NextResponse.json(
            { error: "ไม่สามารถลบได้ เพราะเครื่องนี้ยังอยู่ในคำขอยืมหรือกำลังใช้งาน" },
            { status: 409 },
        );
    }

    const { error } = await supabase.from("equipment").delete().eq("id", id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
