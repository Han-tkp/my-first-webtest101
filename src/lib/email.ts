import type { ReactElement } from "react";
import { Resend } from "resend";
import {
    createNotificationDeliveries,
    updateNotificationDeliveryStatus,
} from "@/lib/notification-center";

export async function sendEmail({
    to,
    subject,
    template,
    idempotencyKey,
    metadata,
}: {
    to: string;
    subject: string;
    template: ReactElement;
    idempotencyKey?: string;
    metadata?: Record<string, unknown>;
}) {
    if (idempotencyKey) {
        await createNotificationDeliveries([
            {
                dedupe_key: idempotencyKey,
                channel: "email",
                provider: "resend",
                recipient: to,
                status: "queued",
                metadata: metadata || null,
            },
        ]);
    }

    if (!process.env.RESEND_API_KEY) {
        console.warn("[Email] RESEND_API_KEY is not configured, skipping email to:", to);
        if (idempotencyKey) {
            await updateNotificationDeliveryStatus([idempotencyKey], "email", "skipped", {
                error_name: "ConfigError",
                error_message: "RESEND_API_KEY is missing",
            });
        }
        return { data: null, error: { message: "RESEND_API_KEY is missing", name: "ConfigError" } };
    }

    if (!process.env.EMAIL_FROM) {
        console.warn("[Email] EMAIL_FROM is not configured, skipping email to:", to);
        if (idempotencyKey) {
            await updateNotificationDeliveryStatus([idempotencyKey], "email", "skipped", {
                error_name: "ConfigError",
                error_message: "EMAIL_FROM is missing",
            });
        }
        return { data: null, error: { message: "EMAIL_FROM is missing", name: "ConfigError" } };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send(
        {
            from: process.env.EMAIL_FROM,
            to: [to],
            subject,
            react: template,
        },
        {
            idempotencyKey,
        },
    );

    if (error) {
        console.error("[Email] Failed to send:", error);
        if (idempotencyKey) {
            await updateNotificationDeliveryStatus([idempotencyKey], "email", "failed", {
                error_name: error.name || "EmailError",
                error_message: error.message || "Email delivery failed",
            });
        }
        return { data: null, error };
    }

    if (idempotencyKey) {
        await updateNotificationDeliveryStatus([idempotencyKey], "email", "sent", {
            provider_message_id: data?.id || null,
        });
    }

    console.log(`[Email] Sent "${subject}" to ${to}`);
    return { data, error: null };
}
