import { BorrowRequestEmail } from "@/emails/borrow-request";
import { BorrowStatusChangedEmail } from "@/emails/borrow-status-changed";
import { NewUserRegisteredEmail } from "@/emails/new-user-registered";
import { NotificationMessageEmail } from "@/emails/notification-message";
import { RepairNotificationEmail } from "@/emails/repair-notification";
import { UserStatusChangedEmail } from "@/emails/user-status-changed";
import type { Role } from "@/lib/auth";
import type { ReactElement } from "react";
import { sendEmail } from "./email";
import { sendLineMessage } from "./line";
import {
    createInAppNotifications,
    getActiveRecipientsByRoles,
    getExistingDedupeKeys,
    getRecipientByUserId,
    type NotificationEventType,
    updateNotificationEmailStatus,
    updateNotificationDeliveryStatus,
} from "./notification-center";
import { createClient } from "./supabase/server";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

interface Recipient {
    id: string;
    email: string;
    full_name: string;
    role: Role;
    line_user_id: string | null;
}

interface DeliverOptions {
    recipients: Recipient[];
    eventType: NotificationEventType;
    entityType: string;
    entityId: string;
    title: string;
    body: string;
    actionUrl: string;
    metadata?: Record<string, unknown>;
    dedupePrefix: string;
    emailSubject?: string;
    buildEmailTemplate?: (recipient: Recipient) => ReactElement;
}

interface BorrowReminderRow {
    id: number;
    user_id: string | null;
    user_name: string;
    due_date: string;
}

function buildDedupeKey(prefix: string, recipientId: string) {
    return `${prefix}/${recipientId}`;
}

async function sendLineNotification(recipient: Recipient, title: string, body: string, actionUrl: string) {
    if (!recipient.line_user_id) return { skipped: true };

    const message = `🔔 ${title}\n\n${body}\n\nดูรายละเอียด: ${BASE_URL}${actionUrl}`;
    
    try {
        await sendLineMessage(recipient.line_user_id, message);
        return { success: true };
    } catch (error) {
        console.error(`[LINE] Failed to send to ${recipient.id}`, error);
        return { error };
    }
}

async function deliverNotifications({
    recipients,
    eventType,
    entityType,
    entityId,
    title,
    body,
    actionUrl,
    metadata,
    dedupePrefix,
    emailSubject,
    buildEmailTemplate,
}: DeliverOptions) {
    if (recipients.length === 0) return;

    const dedupeKeys = recipients.map((recipient) => buildDedupeKey(dedupePrefix, recipient.id));
    const existingKeys = await getExistingDedupeKeys(dedupeKeys);
    const freshRecipients = recipients.filter(
        (recipient) => !existingKeys.has(buildDedupeKey(dedupePrefix, recipient.id)),
    );

    if (freshRecipients.length === 0) return;

    // 1. In-App Notifications
    await createInAppNotifications(
        freshRecipients.map((recipient) => ({
            user_id: recipient.id,
            role_audience: recipient.role,
            event_type: eventType,
            entity_type: entityType,
            entity_id: entityId,
            title,
            body,
            action_url: actionUrl,
            metadata: metadata || null,
            dedupe_key: buildDedupeKey(dedupePrefix, recipient.id),
        })),
    );

    // 2. LINE Notifications
    for (const recipient of freshRecipients) {
        if (recipient.line_user_id) {
            const result = await sendLineNotification(recipient, title, body, actionUrl);
            const dedupeKey = buildDedupeKey(dedupePrefix, recipient.id);
            
            await updateNotificationDeliveryStatus(
                [dedupeKey],
                "in_app",
                result.success ? "sent" : "failed",
                { error_message: result.error ? String(result.error) : undefined },
            );
        }
    }

    // 3. Email Notifications
    if (!emailSubject || !buildEmailTemplate) {
        await updateNotificationEmailStatus(
            freshRecipients.map((recipient) => buildDedupeKey(dedupePrefix, recipient.id)),
            "skipped",
        );
        return;
    }

    const sentKeys: string[] = [];
    const skippedKeys: string[] = [];
    const failedKeys: string[] = [];

    for (const recipient of freshRecipients) {
        const dedupeKey = buildDedupeKey(dedupePrefix, recipient.id);
        const { error } = await sendEmail({
            to: recipient.email,
            subject: emailSubject,
            template: buildEmailTemplate(recipient),
            idempotencyKey: dedupeKey,
        });

        if (!error) {
            sentKeys.push(dedupeKey);
            continue;
        }

        if (error.name === "ConfigError") {
            skippedKeys.push(dedupeKey);
            continue;
        }

        failedKeys.push(dedupeKey);
    }

    await Promise.all([
        updateNotificationEmailStatus(sentKeys, "sent"),
        updateNotificationEmailStatus(skippedKeys, "skipped"),
        updateNotificationEmailStatus(failedKeys, "failed"),
    ]);
}

async function getEquipmentNames(ids: number[]) {
    if (!ids || ids.length === 0) return [];

    const supabase = await createClient();
    const { data } = await supabase.from("equipment").select("name").in("id", ids);

    return data?.map((equipment) => equipment.name) || [];
}

function roleLabel(role: Role) {
    const labels: Record<Role, string> = {
        admin: "ผู้ดูแลระบบ",
        approver: "ผู้อนุมัติ",
        technician: "ช่างเทคนิค",
        user: "ผู้ใช้งานทั่วไป",
    };

    return labels[role];
}

export async function notifyNewUserRegistered(user: {
    full_name: string;
    email: string;
    agency?: string;
}) {
    const recipients = await getActiveRecipientsByRoles(["admin", "approver"]);

    await deliverNotifications({
        recipients,
        eventType: "user.registered",
        entityType: "user",
        entityId: user.email,
        title: "มีผู้ใช้งานใหม่รออนุมัติ",
        body: `${user.full_name} ลงทะเบียนใหม่${user.agency ? ` จาก ${user.agency}` : ""}`,
        actionUrl: "/dashboard/approvals",
        metadata: { email: user.email, agency: user.agency || "" },
        dedupePrefix: `user-registered/${user.email}`,
        emailSubject: `[VBDC 12.4] มีผู้ใช้งานใหม่รออนุมัติ: ${user.full_name}`,
        buildEmailTemplate: () =>
            NewUserRegisteredEmail({
                userName: user.full_name,
                userEmail: user.email,
                agency: user.agency || "",
                dashboardUrl: `${BASE_URL}/dashboard/approvals`,
            }),
    });
}

export async function notifyUserStatusChanged(
    userId: string,
    status: "active" | "suspended" | "rejected",
) {
    const user = await getRecipientByUserId(userId);
    if (!user) return;

    const adminRecipients = await getActiveRecipientsByRoles(["admin"]);
    const userTitle =
        status === "active"
            ? "บัญชีของคุณได้รับการอนุมัติแล้ว"
            : status === "suspended"
                ? "บัญชีของคุณถูกระงับการใช้งาน"
                : "สถานะบัญชีของคุณมีการเปลี่ยนแปลง";
    const userBody =
        status === "active"
            ? "คุณสามารถเข้าสู่ระบบและเริ่มใช้งานได้ทันที"
            : status === "suspended"
                ? "กรุณาติดต่อผู้ดูแลระบบหากต้องการข้อมูลเพิ่มเติม"
                : "กรุณาติดต่อผู้ดูแลระบบหากต้องการสอบถามรายละเอียด";

    await deliverNotifications({
        recipients: [user],
        eventType: status === "active" ? "user.approved" : "user.suspended",
        entityType: "user",
        entityId: userId,
        title: userTitle,
        body: userBody,
        actionUrl: status === "active" ? "/login" : "/suspended",
        dedupePrefix: `user-status/${userId}/${status}`,
        emailSubject: `[VBDC 12.4] ${userTitle}`,
        buildEmailTemplate: () =>
            UserStatusChangedEmail({
                userName: user.full_name,
                status,
                loginUrl: `${BASE_URL}/login`,
            }),
    });

    await deliverNotifications({
        recipients: adminRecipients,
        eventType: status === "active" ? "user.approved" : "user.suspended",
        entityType: "user",
        entityId: userId,
        title: "สถานะบัญชีผู้ใช้งานมีการเปลี่ยนแปลง",
        body: `${user.full_name} ถูกเปลี่ยนสถานะเป็น ${status === "active" ? "ใช้งาน" : "ระงับ"}`,
        actionUrl: "/dashboard",
        dedupePrefix: `admin-user-status/${userId}/${status}`,
    });
}

export async function notifyUserRoleChanged(userId: string, newRole: Role) {
    const user = await getRecipientByUserId(userId);
    if (!user) return;

    const adminRecipients = await getActiveRecipientsByRoles(["admin"]);
    const title = "บทบาทผู้ใช้งานของคุณเปลี่ยนแล้ว";
    const body = `ระบบได้เปลี่ยนบทบาทของคุณเป็น ${roleLabel(newRole)}`;

    await deliverNotifications({
        recipients: [user],
        eventType: "user.role_changed",
        entityType: "user",
        entityId: userId,
        title,
        body,
        actionUrl: "/dashboard",
        dedupePrefix: `user-role/${userId}/${newRole}`,
        emailSubject: `[VBDC 12.4] ${title}`,
        buildEmailTemplate: () =>
            NotificationMessageEmail({
                preview: title,
                title,
                message: body,
                buttonLabel: "ไปที่แดชบอร์ด",
                buttonUrl: `${BASE_URL}/dashboard`,
            }),
    });

    await deliverNotifications({
        recipients: adminRecipients,
        eventType: "user.role_changed",
        entityType: "user",
        entityId: userId,
        title: "มีการเปลี่ยนบทบาทผู้ใช้งาน",
        body: `${user.full_name} ถูกเปลี่ยนบทบาทเป็น ${roleLabel(newRole)}`,
        actionUrl: "/dashboard",
        dedupePrefix: `admin-user-role/${userId}/${newRole}`,
    });
}

export async function notifyBorrowRequest(borrow: {
    borrowId?: number;
    user_name: string;
    purpose: string;
    borrow_date: string;
    due_date: string;
    equipment_ids: number[];
}) {
    const recipients = await getActiveRecipientsByRoles(["admin", "approver"]);
    const equipmentNames = await getEquipmentNames(borrow.equipment_ids);
    const borrowId = borrow.borrowId || 0;

    await deliverNotifications({
        recipients,
        eventType: "borrow.submitted",
        entityType: "borrow",
        entityId: String(borrowId || borrow.user_name),
        title: "มีคำขอยืมอุปกรณ์ใหม่รออนุมัติ",
        body: `${borrow.user_name} ส่งคำขอยืมอุปกรณ์สำหรับ ${borrow.purpose}`,
        actionUrl: "/dashboard/approvals",
        metadata: { borrow_id: borrowId, borrow_date: borrow.borrow_date, due_date: borrow.due_date },
        dedupePrefix: `borrow-submitted/${borrowId || `${borrow.user_name}-${borrow.borrow_date}`}`,
        emailSubject: `[VBDC 12.4] คำขอยืมอุปกรณ์ใหม่จาก ${borrow.user_name}`,
        buildEmailTemplate: () =>
            BorrowRequestEmail({
                userName: borrow.user_name,
                purpose: borrow.purpose,
                borrowDate: borrow.borrow_date,
                dueDate: borrow.due_date,
                equipmentNames,
                dashboardUrl: `${BASE_URL}/dashboard/approvals`,
            }),
    });
}

export async function notifyBorrowStatusChanged(
    userId: string,
    status: string,
    equipmentIds: number[],
    borrowId?: number,
) {
    const user = await getRecipientByUserId(userId);
    if (!user) return;

    const equipmentNames = await getEquipmentNames(equipmentIds);
    const titles: Record<string, string> = {
        pending_delivery: "คำขอยืมของคุณได้รับการอนุมัติแล้ว",
        borrowed: "อุปกรณ์ถูกส่งมอบให้คุณแล้ว",
        rejected: "คำขอยืมของคุณไม่ได้รับการอนุมัติ",
        returned: "ระบบบันทึกการคืนอุปกรณ์เรียบร้อยแล้ว",
        returned_late: "ระบบบันทึกการคืนอุปกรณ์ล่าช้าเรียบร้อยแล้ว",
        returned_early: "ระบบบันทึกการคืนอุปกรณ์ก่อนกำหนดเรียบร้อยแล้ว",
        returned_damaged: "ระบบบันทึกการคืนอุปกรณ์พร้อมแจ้งชำรุดแล้ว",
    };

    const title = titles[status] || "สถานะคำขอยืมของคุณมีการเปลี่ยนแปลง";

    await deliverNotifications({
        recipients: [user],
        eventType: (status === "pending_delivery"
            ? "borrow.pending_delivery"
            : status === "borrowed"
                ? "borrow.borrowed"
                : status === "rejected"
                    ? "borrow.rejected"
                    : status === "returned_late"
                        ? "borrow.returned_late"
                        : status === "returned_early"
                            ? "borrow.returned_early"
                            : status === "returned_damaged"
                                ? "borrow.returned_damaged"
                                : "borrow.returned") as NotificationEventType,
        entityType: "borrow",
        entityId: String(borrowId || userId),
        title,
        body: "กรุณาตรวจสอบรายละเอียดล่าสุดของคำขอยืมและรายการอุปกรณ์ที่เกี่ยวข้อง",
        actionUrl: "/dashboard/history",
        metadata: { borrow_id: borrowId || null, status, equipment_ids: equipmentIds },
        dedupePrefix: `borrow-status/${borrowId || userId}/${status}`,
        emailSubject: `[VBDC 12.4] ${title}`,
        buildEmailTemplate: () =>
            BorrowStatusChangedEmail({
                userName: user.full_name,
                status,
                equipmentNames,
                dashboardUrl: `${BASE_URL}/dashboard/history`,
            }),
    });
}

export async function notifyRepairStatus(repair: {
    repairId?: number;
    equipment_name: string;
    damage_description: string;
    status: string;
    cost?: number;
}) {
    const statusMatrix: Record<string, { roles: Role[]; title: string; eventType: NotificationEventType }> = {
        pending_repair_approval: {
            roles: ["admin", "approver"],
            title: "มีคำขอซ่อมใหม่รออนุมัติ",
            eventType: "repair.submitted",
        },
        repair_approved: {
            roles: ["admin", "technician"],
            title: "คำขอซ่อมได้รับการอนุมัติแล้ว",
            eventType: "repair.approved",
        },
        completed: {
            roles: ["admin", "technician"],
            title: "งานซ่อมเสร็จสิ้นแล้ว",
            eventType: "repair.completed",
        },
        repair_rejected: {
            roles: ["admin", "technician"],
            title: "คำขอซ่อมไม่ได้รับการอนุมัติ",
            eventType: "repair.rejected",
        },
    };

    const config = statusMatrix[repair.status];
    if (!config) return;

    const recipients = await getActiveRecipientsByRoles(config.roles);
    const repairId = repair.repairId || repair.equipment_name;

    await deliverNotifications({
        recipients,
        eventType: config.eventType,
        entityType: "repair",
        entityId: String(repairId),
        title: config.title,
        body: `${repair.equipment_name}: ${repair.damage_description}`,
        actionUrl:
            repair.status === "pending_repair_approval"
                ? "/dashboard/approvals"
                : "/dashboard/technician",
        metadata: { repair_id: repair.repairId || null, status: repair.status, cost: repair.cost || 0 },
        dedupePrefix: `repair-status/${repairId}/${repair.status}`,
        emailSubject: `[VBDC 12.4] ${config.title}: ${repair.equipment_name}`,
        buildEmailTemplate: () =>
            RepairNotificationEmail({
                equipmentName: repair.equipment_name,
                description: repair.damage_description,
                status: repair.status,
                cost: repair.cost,
                dashboardUrl:
                    repair.status === "pending_repair_approval"
                        ? `${BASE_URL}/dashboard/approvals`
                        : `${BASE_URL}/dashboard/technician`,
            }),
    });
}

async function fetchBorrowReminders() {
    const supabase = await createClient();
    const { data } = await supabase
        .from("borrows")
        .select("id, user_id, user_name, due_date")
        .eq("status", "borrowed");

    return (data as BorrowReminderRow[] | null) || [];
}

function bangkokDate(offsetDays = 0) {
    const current = new Date();
    current.setUTCDate(current.getUTCDate() + offsetDays);

    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Bangkok",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(current);
}

export async function syncRoleNotifications() {
    const borrows = await fetchBorrowReminders();
    if (borrows.length === 0) return;

    const staffRecipients = await getActiveRecipientsByRoles(["admin", "technician"]);
    const today = bangkokDate(0);
    const tomorrow = bangkokDate(1);

    for (const borrow of borrows) {
        if (!borrow.user_id) continue;

        const borrower = await getRecipientByUserId(borrow.user_id);
        if (!borrower) continue;

        if (borrow.due_date === tomorrow) {
            await deliverNotifications({
                recipients: [borrower],
                eventType: "borrow.due_soon",
                entityType: "borrow",
                entityId: String(borrow.id),
                title: "ใกล้ถึงกำหนดคืนอุปกรณ์",
                body: `คำขอยืมเลขที่ ${borrow.id} ของคุณครบกำหนดคืนในวันที่ ${borrow.due_date}`,
                actionUrl: "/dashboard/history",
                dedupePrefix: `borrow-due-soon/${borrow.id}/${today}`,
                emailSubject: "[VBDC 12.4] ใกล้ถึงกำหนดคืนอุปกรณ์",
                buildEmailTemplate: () =>
                    NotificationMessageEmail({
                        preview: "ใกล้ถึงกำหนดคืนอุปกรณ์",
                        title: "ใกล้ถึงกำหนดคืนอุปกรณ์",
                        message: `คำขอยืมเลขที่ ${borrow.id} ของคุณครบกำหนดคืนในวันที่ ${borrow.due_date}`,
                        buttonLabel: "ดูประวัติการยืม",
                        buttonUrl: `${BASE_URL}/dashboard/history`,
                    }),
            });
        }

        if (borrow.due_date === today) {
            await deliverNotifications({
                recipients: staffRecipients,
                eventType: "borrow.return_due_today",
                entityType: "borrow",
                entityId: String(borrow.id),
                title: "มีรายการครบกำหนดคืนวันนี้",
                body: `คำขอยืมเลขที่ ${borrow.id} ของ ${borrow.user_name} ครบกำหนดคืนวันนี้`,
                actionUrl: "/dashboard/technician",
                dedupePrefix: `borrow-due-today/${borrow.id}/${today}`,
                emailSubject: "[VBDC 12.4] มีรายการครบกำหนดคืนวันนี้",
                buildEmailTemplate: () =>
                    NotificationMessageEmail({
                        preview: "มีรายการครบกำหนดคืนวันนี้",
                        title: "มีรายการครบกำหนดคืนวันนี้",
                        message: `คำขอยืมเลขที่ ${borrow.id} ของ ${borrow.user_name} ครบกำหนดคืนวันนี้`,
                        buttonLabel: "ดูงานช่าง",
                        buttonUrl: `${BASE_URL}/dashboard/technician`,
                    }),
            });
        }

        if (borrow.due_date < today) {
            await deliverNotifications({
                recipients: [borrower],
                eventType: "borrow.overdue",
                entityType: "borrow",
                entityId: String(borrow.id),
                title: "มีรายการยืมเกินกำหนดคืน",
                body: `คำขอยืมเลขที่ ${borrow.id} ของคุณเกินกำหนดคืนตั้งแต่วันที่ ${borrow.due_date}`,
                actionUrl: "/dashboard/history",
                dedupePrefix: `borrow-overdue-user/${borrow.id}/${today}`,
                emailSubject: "[VBDC 12.4] มีรายการยืมเกินกำหนดคืน",
                buildEmailTemplate: () =>
                    NotificationMessageEmail({
                        preview: "มีรายการยืมเกินกำหนดคืน",
                        title: "มีรายการยืมเกินกำหนดคืน",
                        message: `คำขอยืมเลขที่ ${borrow.id} ของคุณเกินกำหนดคืนตั้งแต่วันที่ ${borrow.due_date}`,
                        buttonLabel: "ดูประวัติการยืม",
                        buttonUrl: `${BASE_URL}/dashboard/history`,
                    }),
            });

            await deliverNotifications({
                recipients: staffRecipients,
                eventType: "borrow.overdue",
                entityType: "borrow",
                entityId: String(borrow.id),
                title: "มีรายการคืนอุปกรณ์เกินกำหนด",
                body: `คำขอยืมเลขที่ ${borrow.id} ของ ${borrow.user_name} เกินกำหนดคืนตั้งแต่วันที่ ${borrow.due_date}`,
                actionUrl: "/dashboard/technician",
                dedupePrefix: `borrow-overdue-staff/${borrow.id}/${today}`,
                emailSubject: "[VBDC 12.4] มีรายการคืนอุปกรณ์เกินกำหนด",
                buildEmailTemplate: () =>
                    NotificationMessageEmail({
                        preview: "มีรายการคืนอุปกรณ์เกินกำหนด",
                        title: "มีรายการคืนอุปกรณ์เกินกำหนด",
                        message: `คำขอยืมเลขที่ ${borrow.id} ของ ${borrow.user_name} เกินกำหนดคืนตั้งแต่วันที่ ${borrow.due_date}`,
                        buttonLabel: "ดูงานช่าง",
                        buttonUrl: `${BASE_URL}/dashboard/technician`,
                    }),
            });
        }
    }
}
