import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notifyNewUserRegistered } from "@/lib/notifications";
import { consumeRateLimit, getRequestIp } from "@/lib/rate-limit";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type RegisterBody = {
    email?: string;
    password?: string;
    full_name?: string;
    agency?: string;
    phone?: string;
    address?: string;
};

export async function POST(request: Request) {
    if (!isSupabaseConfigured()) {
        return NextResponse.json(
            { error: "ระบบยังไม่พร้อมใช้งาน กรุณาลองใหม่อีกครั้ง" },
            { status: 503 },
        );
    }

    const registerRateLimit = await consumeRateLimit({
        action: "auth.register",
        scope: getRequestIp(request),
        limit: 5,
        windowSeconds: 15 * 60,
        blockSeconds: 15 * 60,
    });

    if (!registerRateLimit.allowed) {
        return NextResponse.json(
            { error: "Too many registration attempts. Please try again later." },
            {
                status: 429,
                headers: {
                    "Retry-After": String(registerRateLimit.retryAfter),
                },
            },
        );
    }

    const supabase = await createClient();
    if (!supabase) {
        return NextResponse.json(
            { error: "ระบบยังไม่พร้อมใช้งาน กรุณาลองใหม่อีกครั้ง" },
            { status: 503 },
        );
    }
    const body = (await request.json()) as RegisterBody;

    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const fullName = String(body.full_name || "").trim();
    const agency = String(body.agency || "").trim();
    const phone = String(body.phone || "").replace(/\D/g, "").slice(0, 10);
    const address = String(body.address || "").trim();

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

    const { data: authUserData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            full_name: fullName,
            agency,
            phone,
        },
    });

    if (authError || !authUserData.user) {
        return NextResponse.json(
            { error: authError?.message || "Unable to create auth user" },
            { status: 500 },
        );
    }

    const profileId = authUserData.user.id;

    const { data, error } = await supabase
        .from("profiles")
        .insert([
            {
                id: profileId,
                email,
                full_name: fullName,
                agency,
                phone,
                address,
                role: "user",
                status: "pending_approval",
                password_hash: null,
                auth_provider: "legacy_supabase",
            },
        ])
        .select("id, email, full_name, agency, status")
        .single();

    if (error) {
        await supabase.auth.admin.deleteUser(profileId).catch(() => undefined);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    notifyNewUserRegistered({
        full_name: fullName,
        email,
        agency,
    }).catch(console.error);

    return NextResponse.json(
        {
            user: data,
            message: "ลงทะเบียนเรียบร้อยแล้ว กรุณารอการอนุมัติจากผู้ดูแลระบบ",
        },
        { status: 201 },
    );
}
