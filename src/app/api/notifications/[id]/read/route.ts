import { NextResponse } from "next/server";
import { checkApiRole } from "@/lib/auth";
import { markNotificationRead } from "@/lib/notification-center";

export async function POST(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const { profile, error: authError } = await checkApiRole("admin", "approver", "technician", "user");
    if (authError) {
        return NextResponse.json({ error: authError.message }, { status: authError.status });
    }

    const { id } = await params;
    const notificationId = Number.parseInt(id, 10);

    if (!Number.isFinite(notificationId)) {
        return NextResponse.json({ error: "Invalid notification id" }, { status: 400 });
    }

    await markNotificationRead(profile!.id, notificationId);
    return NextResponse.json({ ok: true });
}
