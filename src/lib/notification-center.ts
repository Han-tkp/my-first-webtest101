import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/auth";

export type NotificationEventType =
    | "user.registered"
    | "user.approved"
    | "user.suspended"
    | "user.role_changed"
    | "borrow.submitted"
    | "borrow.pending_delivery"
    | "borrow.borrowed"
    | "borrow.rejected"
    | "borrow.returned"
    | "borrow.returned_late"
    | "borrow.returned_early"
    | "borrow.returned_damaged"
    | "borrow.due_soon"
    | "borrow.return_due_today"
    | "borrow.overdue"
    | "repair.submitted"
    | "repair.approved"
    | "repair.completed"
    | "repair.rejected";

export interface NotificationRecord {
    id: number;
    user_id: string;
    role_audience: Role | null;
    event_type: NotificationEventType;
    entity_type: string;
    entity_id: string;
    title: string;
    body: string;
    action_url: string | null;
    metadata: Record<string, unknown> | null;
    is_read: boolean;
    read_at: string | null;
    emailed_at: string | null;
    email_status: string | null;
    dedupe_key: string | null;
    created_at: string;
}

export type NotificationDeliveryChannel = "in_app" | "email";
export type NotificationDeliveryStatus = "queued" | "sent" | "skipped" | "failed";

interface ActiveRecipient {
    id: string;
    email: string;
    full_name: string;
    role: Role;
}

interface NotificationInsert {
    user_id: string;
    role_audience: Role;
    event_type: NotificationEventType;
    entity_type: string;
    entity_id: string;
    title: string;
    body: string;
    action_url?: string | null;
    metadata?: Record<string, unknown> | null;
    dedupe_key?: string | null;
}

interface NotificationDeliveryInsert {
    notification_id?: number | null;
    dedupe_key: string;
    channel: NotificationDeliveryChannel;
    provider: string;
    recipient: string;
    status: NotificationDeliveryStatus;
    provider_message_id?: string | null;
    error_name?: string | null;
    error_message?: string | null;
    metadata?: Record<string, unknown> | null;
    last_attempt_at?: string | null;
}

export async function getActiveRecipientsByRoles(roles: Role[]) {
    const supabase = await createClient();
    const { data } = await supabase
        .from("profiles")
        .select("id, email, full_name, role")
        .in("role", roles)
        .eq("status", "active");

    return ((data as ActiveRecipient[] | null) || []).filter((recipient) => Boolean(recipient.email));
}

export async function getRecipientByUserId(userId: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from("profiles")
        .select("id, email, full_name, role")
        .eq("id", userId)
        .eq("status", "active")
        .maybeSingle();

    return (data as ActiveRecipient | null) ?? null;
}

export async function createInAppNotifications(records: NotificationInsert[]) {
    if (records.length === 0) return;

    const supabase = await createClient();
    const payload = records.map((record) => ({
        ...record,
        action_url: record.action_url || null,
        metadata: record.metadata || null,
        dedupe_key: record.dedupe_key || null,
    }));

    await supabase.from("notifications").upsert(payload, {
        onConflict: "dedupe_key",
        ignoreDuplicates: true,
    });

    const dedupeKeys = payload
        .map((record) => record.dedupe_key)
        .filter((dedupeKey): dedupeKey is string => Boolean(dedupeKey));

    if (dedupeKeys.length === 0) return;

    const { data: notificationRows } = await supabase
        .from("notifications")
        .select("id, dedupe_key, user_id")
        .in("dedupe_key", dedupeKeys);

    if (!notificationRows || notificationRows.length === 0) return;

    await createNotificationDeliveries(
        notificationRows
            .filter((row) => Boolean(row.dedupe_key))
            .map((row) => ({
                notification_id: row.id,
                dedupe_key: row.dedupe_key as string,
                channel: "in_app",
                provider: "system",
                recipient: row.user_id,
                status: "sent",
                last_attempt_at: new Date().toISOString(),
            })),
    );
}

export async function createNotificationDeliveries(records: NotificationDeliveryInsert[]) {
    if (records.length === 0) return;

    try {
        const supabase = await createClient();
        await supabase.from("notification_deliveries").upsert(
            records.map((record) => ({
                notification_id: record.notification_id || null,
                dedupe_key: record.dedupe_key,
                channel: record.channel,
                provider: record.provider,
                recipient: record.recipient,
                status: record.status,
                provider_message_id: record.provider_message_id || null,
                error_name: record.error_name || null,
                error_message: record.error_message || null,
                metadata: record.metadata || null,
                last_attempt_at: record.last_attempt_at || new Date().toISOString(),
            })),
            {
                onConflict: "dedupe_key,channel",
                ignoreDuplicates: false,
            },
        );
    } catch (error) {
        console.error("[NotificationDelivery] Failed to create deliveries", error);
    }
}

export async function updateNotificationDeliveryStatus(
    dedupeKeys: string[],
    channel: NotificationDeliveryChannel,
    status: NotificationDeliveryStatus,
    details?: {
        provider_message_id?: string | null;
        error_name?: string | null;
        error_message?: string | null;
    },
) {
    if (dedupeKeys.length === 0) return;

    try {
        const supabase = await createClient();
        await supabase
            .from("notification_deliveries")
            .update({
                status,
                provider_message_id: details?.provider_message_id || null,
                error_name: details?.error_name || null,
                error_message: details?.error_message || null,
                last_attempt_at: new Date().toISOString(),
            })
            .in("dedupe_key", dedupeKeys)
            .eq("channel", channel);
    } catch (error) {
        console.error("[NotificationDelivery] Failed to update delivery status", error);
    }
}

export async function updateNotificationEmailStatus(
    dedupeKeys: string[],
    status: "sent" | "skipped" | "failed",
) {
    if (dedupeKeys.length === 0) return;

    const supabase = await createClient();
    await supabase
        .from("notifications")
        .update({
            email_status: status,
            emailed_at: status === "sent" ? new Date().toISOString() : null,
        })
        .in("dedupe_key", dedupeKeys);
}

export async function getExistingDedupeKeys(dedupeKeys: string[]) {
    if (dedupeKeys.length === 0) return new Set<string>();

    const supabase = await createClient();
    const { data } = await supabase
        .from("notifications")
        .select("dedupe_key")
        .in("dedupe_key", dedupeKeys);

    return new Set((data || []).map((item) => item.dedupe_key).filter(Boolean));
}

export async function listNotifications(userId: string, limit = 20) {
    const supabase = await createClient();
    const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

    return (data as NotificationRecord[] | null) || [];
}

export async function getUnreadNotificationCount(userId: string) {
    const supabase = await createClient();
    const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_read", false);

    return count || 0;
}

export async function markNotificationRead(userId: string, notificationId: number) {
    const supabase = await createClient();
    await supabase
        .from("notifications")
        .update({
            is_read: true,
            read_at: new Date().toISOString(),
        })
        .eq("id", notificationId)
        .eq("user_id", userId);
}

export async function markAllNotificationsRead(userId: string) {
    const supabase = await createClient();
    await supabase
        .from("notifications")
        .update({
            is_read: true,
            read_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("is_read", false);
}


