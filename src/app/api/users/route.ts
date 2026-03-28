import { NextResponse } from "next/server";
import { checkApiRole, type Role } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_ROLES: Role[] = ["admin", "approver", "technician", "user"];

export async function GET() {
    const { error: authError } = await checkApiRole("admin");
    if (authError) {
        return NextResponse.json({ error: authError.message }, { status: authError.status });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, agency, phone, role, status, created_at")
        .order("created_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const { error: authError } = await checkApiRole("admin");
    if (authError) {
        return NextResponse.json({ error: authError.message }, { status: authError.status });
    }

    const supabase = await createClient();
    const body = await request.json();

    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const fullName = String(body.full_name || "").trim();
    const agency = String(body.agency || "").trim();
    const phone = String(body.phone || "").replace(/\D/g, "").slice(0, 10);
    const role = String(body.role || "user").trim() as Role;

    if (!email || !password || !fullName) {
        return NextResponse.json(
            { error: "กรุณากรอกอีเมล รหัสผ่าน และชื่อผู้ใช้งานให้ครบถ้วน" },
            { status: 400 },
        );
    }

    if (password.length < 8) {
        return NextResponse.json(
            { error: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" },
            { status: 400 },
        );
    }

    if (!ALLOWED_ROLES.includes(role)) {
        return NextResponse.json(
            { error: "บทบาทที่ระบุไม่ถูกต้อง" },
            { status: 400 },
        );
    }

    const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .ilike("email", email)
        .maybeSingle();

    if (existingProfile) {
        return NextResponse.json(
            { error: "อีเมลนี้มีอยู่ในระบบแล้ว" },
            { status: 409 },
        );
    }

    const { data: authUserData, error: authCreateError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            full_name: fullName,
            agency,
            phone,
        },
    });

    if (authCreateError || !authUserData.user) {
        return NextResponse.json(
            { error: authCreateError?.message || "ไม่สามารถสร้างบัญชีผู้ใช้ได้" },
            { status: 500 },
        );
    }

    const profileId = authUserData.user.id;

    // Wait briefly for the Supabase trigger to create the initial profile
    await new Promise((resolve) => setTimeout(resolve, 500));

    const { data, error } = await supabase
        .from("profiles")
        .upsert(
            {
                id: profileId,
                email,
                full_name: fullName,
                agency,
                phone,
                role,
                status: "active",
            },
            { onConflict: "id" },
        )
        .select("id, email, full_name, agency, phone, role, status")
        .single();

    if (error) {
        await supabase.auth.admin.deleteUser(profileId).catch(() => undefined);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
}
