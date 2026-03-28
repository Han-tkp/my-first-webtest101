import { NextResponse } from "next/server";
import { checkApiRole } from "@/lib/auth";
import { markAllNotificationsRead } from "@/lib/notification-center";

export async function POST() {
    const { profile, error: authError } = await checkApiRole("admin", "approver", "technician", "user");
    if (authError) {
        return NextResponse.json({ error: authError.message }, { status: authError.status });
    }

    await markAllNotificationsRead(profile!.id);
    return NextResponse.json({ ok: true });
}
