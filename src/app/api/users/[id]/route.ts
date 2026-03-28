import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { checkApiRole } from "@/lib/auth";

// PUT — Admin update user profile
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const { error: authError } = await checkApiRole("admin");
    if (authError) return NextResponse.json({ error: authError.message }, { status: authError.status });

    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const allowedFields = ["full_name", "agency", "phone", "role", "status"];
    const updatePayload = Object.fromEntries(
        Object.entries(body).filter(([k]) => allowedFields.includes(k)),
    );

    if (Object.keys(updatePayload).length === 0) {
        return NextResponse.json({ error: "ไม่มีข้อมูลที่ต้องอัปเดต" }, { status: 400 });
    }

    const validRoles = ["admin", "approver", "technician", "user"];
    if (updatePayload.role && !validRoles.includes(updatePayload.role as string)) {
        return NextResponse.json({ error: "บทบาทที่ระบุไม่ถูกต้อง" }, { status: 400 });
    }

    const { data, error } = await supabase
        .from("profiles")
        .update(updatePayload)
        .eq("id", id)
        .select("id, email, full_name, agency, phone, role, status")
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

// DELETE — Admin delete user (profile + auth)
export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const { error: authError } = await checkApiRole("admin");
    if (authError) return NextResponse.json({ error: authError.message }, { status: authError.status });

    const { id } = await params;
    const supabase = await createClient();

    // Check for active borrows
    const { data: activeBorrow } = await supabase
        .from("borrows")
        .select("id")
        .eq("user_id", id)
        .in("status", ["pending_borrow_approval", "pending_delivery", "borrowed"])
        .limit(1)
        .maybeSingle();

    if (activeBorrow) {
        return NextResponse.json(
            { error: "ไม่สามารถลบได้ ผู้ใช้ยังมีรายการยืมที่ยังไม่คืน" },
            { status: 409 },
        );
    }

    // Delete profile first (cascade will handle related FK)
    const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", id);

    if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    // Delete auth user
    await supabase.auth.admin.deleteUser(id).catch(() => undefined);

    return NextResponse.json({ success: true });
}
