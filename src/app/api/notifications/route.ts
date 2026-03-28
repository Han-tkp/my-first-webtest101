import { NextResponse } from "next/server";
import { checkApiRole } from "@/lib/auth";
import { getUnreadNotificationCount, listNotifications } from "@/lib/notification-center";

export async function GET(request: Request) {
    const { profile, error: authError } = await checkApiRole("admin", "approver", "technician", "user");
    if (authError) {
        return NextResponse.json({ error: authError.message }, { status: authError.status });
    }

    const { searchParams } = new URL(request.url);
    const limit = Number.parseInt(searchParams.get("limit") || "20", 10);
    const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 100) : 20;

    const [notifications, unreadCount] = await Promise.all([
        listNotifications(profile!.id, safeLimit),
        getUnreadNotificationCount(profile!.id),
    ]);

    return NextResponse.json({
        notifications,
        unreadCount,
    });
}
