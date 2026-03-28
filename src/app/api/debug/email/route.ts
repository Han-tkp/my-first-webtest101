import { NextResponse } from "next/server";
import { NotificationMessageEmail } from "@/emails/notification-message";
import { checkApiRole } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { consumeRateLimit, getRequestIp } from "@/lib/rate-limit";

const TEST_RECIPIENTS = [
    "delivered@resend.dev",
    "bounced@resend.dev",
    "complained@resend.dev",
    "suppressed@resend.dev",
] as const;

export async function POST(request: Request) {
    const { profile, error: authError } = await checkApiRole("admin");
    if (authError) {
        return NextResponse.json({ error: authError.message }, { status: authError.status });
    }

    const debugEmailRateLimit = await consumeRateLimit({
        action: "debug.email",
        scope: `${profile!.id}:${getRequestIp(request)}`,
        limit: 10,
        windowSeconds: 15 * 60,
        blockSeconds: 15 * 60,
    });

    if (!debugEmailRateLimit.allowed) {
        return NextResponse.json(
            { error: "Too many debug email requests. Please try again later." },
            {
                status: 429,
                headers: {
                    "Retry-After": String(debugEmailRateLimit.retryAfter),
                },
            },
        );
    }

    const body = await request.json().catch(() => ({}));
    const to = typeof body.to === "string" ? body.to.trim().toLowerCase() : "";

    if (!TEST_RECIPIENTS.includes(to as (typeof TEST_RECIPIENTS)[number])) {
        return NextResponse.json(
            { error: "Recipient must be one of the Resend test addresses" },
            { status: 400 },
        );
    }

    const deliveryKey = `debug-email/${to}/${Date.now()}`;

    const { data, error } = await sendEmail({
        to,
        subject: "[VBDC 12.4] ทดสอบการส่งอีเมล",
        template: NotificationMessageEmail({
            preview: "ทดสอบการส่งอีเมล",
            title: "ทดสอบการส่งอีเมลจากระบบ VBDC 12.4",
            message:
                "หากคุณได้รับอีเมลฉบับนี้ แปลว่า flow การส่งอีเมลจากแอปไปยัง Resend ทำงานแล้วในระดับแอปพลิเคชัน",
            buttonLabel: "เปิดแดชบอร์ด",
            buttonUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard`,
        }),
        idempotencyKey: deliveryKey,
        metadata: {
            source: "dashboard-debug",
            requested_by: profile!.id,
        },
    });

    if (error) {
        return NextResponse.json({ error: error.message, name: error.name }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data });
}
