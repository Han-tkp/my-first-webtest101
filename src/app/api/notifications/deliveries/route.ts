import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { checkApiRole } from "@/lib/auth";

export async function GET(request: Request) {
    if (!isSupabaseConfigured()) {
        return NextResponse.json({ error: "ระบบฐานข้อมูลยังไม่ได้เชื่อมต่อ" }, { status: 503 });
    }

    const { error: authError } = await checkApiRole("admin");
    if (authError) return NextResponse.json({ error: authError.message }, { status: authError.status });

    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ error: "ระบบฐานข้อมูลยังไม่ได้เชื่อมต่อ" }, { status: 503 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const channel = searchParams.get("channel");
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 200);

    let query = supabase
        .from("notification_deliveries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

    if (status) {
        query = query.eq("status", status);
    }

    if (channel) {
        query = query.eq("channel", channel);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: "ไม่สามารถดึงข้อมูลการส่งแจ้งเตือนได้: " + error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
