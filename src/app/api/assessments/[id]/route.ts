import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { checkApiRole } from "@/lib/auth";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!isSupabaseConfigured()) {
        return NextResponse.json({ error: "ระบบฐานข้อมูลยังไม่ได้เชื่อมต่อ" }, { status: 503 });
    }

    const { error: authError } = await checkApiRole("admin", "approver", "technician");
    if (authError) return NextResponse.json({ error: authError.message }, { status: authError.status });

    const { id } = await params;
    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ error: "ระบบฐานข้อมูลยังไม่ได้เชื่อมต่อ" }, { status: 503 });

    const { data, error } = await supabase
        .from("assessments")
        .select(`
            *,
            equipment:equipment_id (
                id,
                name,
                type,
                serial,
                brand,
                model,
                purchase_year
            )
        `)
        .eq("id", id)
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(data);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!isSupabaseConfigured()) {
        return NextResponse.json({ error: "ระบบฐานข้อมูลยังไม่ได้เชื่อมต่อ" }, { status: 503 });
    }

    const { error: authError } = await checkApiRole("admin", "technician");
    if (authError) return NextResponse.json({ error: authError.message }, { status: authError.status });

    const { id } = await params;
    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ error: "ระบบฐานข้อมูลยังไม่ได้เชื่อมต่อ" }, { status: 503 });

    const body = await request.json();

    // Remove fields that shouldn't be updated directly
    delete body.id;
    delete body.assessor_id;
    delete body.created_at;
    delete body.equipment;

    const { data, error } = await supabase
        .from("assessments")
        .update(body)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: "ไม่สามารถอัปเดตรายงานประเมินได้: " + error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!isSupabaseConfigured()) {
        return NextResponse.json({ error: "ระบบฐานข้อมูลยังไม่ได้เชื่อมต่อ" }, { status: 503 });
    }

    const { error: authError } = await checkApiRole("admin", "technician");
    if (authError) return NextResponse.json({ error: authError.message }, { status: authError.status });

    const { id } = await params;
    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ error: "ระบบฐานข้อมูลยังไม่ได้เชื่อมต่อ" }, { status: 503 });

    const { error } = await supabase.from("assessments").delete().eq("id", id);

    if (error) {
        return NextResponse.json({ error: "ไม่สามารถลบรายงานประเมินได้: " + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
