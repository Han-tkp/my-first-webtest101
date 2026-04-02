import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { checkApiRole } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

function normalizeEquipmentPayload(body: Record<string, unknown>) {
    return {
        name: String(body.name || "").trim(),
        type: String(body.type || "").trim(),
        serial: String(body.serial || "").trim(),
        status: String(body.status || "available").trim() || "available",
        image_url: body.image_url ? String(body.image_url).trim() : null,
        brand: body.brand ? String(body.brand).trim() : null,
        model: body.model ? String(body.model).trim() : null,
        purchase_year: body.purchase_year ? Number(body.purchase_year) : null,
    };
}

export async function GET() {
    if (!isSupabaseConfigured()) {
        return NextResponse.json(
            { error: "ระบบยังไม่พร้อมใช้งาน กรุณาลองใหม่อีกครั้ง" },
            { status: 503 }
        );
    }

    const { error: authError } = await checkApiRole("admin", "approver", "technician", "user");
    if (authError) return NextResponse.json({ error: authError.message }, { status: authError.status });

    const supabase = await createClient();
    if (!supabase) {
        return NextResponse.json(
            { error: "ระบบยังไม่พร้อมใช้งาน" },
            { status: 503 }
        );
    }

    const { data, error } = await supabase
        .from("equipment")
        .select("*")
        .order("type", { ascending: true })
        .order("serial", { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    if (!isSupabaseConfigured()) {
        return NextResponse.json(
            { error: "ระบบยังไม่พร้อมใช้งาน กรุณาลองใหม่อีกครั้ง" },
            { status: 503 }
        );
    }

    const { error: authError } = await checkApiRole("admin");
    if (authError) return NextResponse.json({ error: authError.message }, { status: authError.status });

    const supabase = await createClient();
    if (!supabase) {
        return NextResponse.json(
            { error: "ระบบยังไม่พร้อมใช้งาน" },
            { status: 503 }
        );
    }
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
        .maybeSingle();

    if (existingSerial) {
        return NextResponse.json({ error: "เลขครุภัณฑ์/เลขเครื่องนี้มีอยู่ในระบบแล้ว" }, { status: 409 });
    }

    const { data, error } = await supabase.from("equipment").insert([body]).select().single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
}
