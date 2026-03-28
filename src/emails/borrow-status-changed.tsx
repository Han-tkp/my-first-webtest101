import { Button, Section, Text } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./base-layout";

interface BorrowStatusChangedProps {
    userName: string;
    status: string;
    equipmentNames: string[];
    dashboardUrl: string;
}

const statusLabels: Record<string, { label: string; message: string; color: string }> = {
    pending_delivery: {
        label: "อนุมัติแล้ว",
        message: "คำขอยืมของคุณได้รับการอนุมัติแล้ว และอยู่ระหว่างเตรียมส่งมอบอุปกรณ์",
        color: "#22c55e",
    },
    rejected: {
        label: "ไม่อนุมัติ",
        message: "คำขอยืมของคุณไม่ได้รับการอนุมัติ",
        color: "#ef4444",
    },
    borrowed: {
        label: "ส่งมอบแล้ว",
        message: "อุปกรณ์ถูกส่งมอบให้คุณแล้ว กรุณาดูแลและคืนตามกำหนด",
        color: "#3b82f6",
    },
    returned: {
        label: "คืนแล้ว",
        message: "ระบบบันทึกการคืนอุปกรณ์เรียบร้อยแล้ว",
        color: "#22c55e",
    },
    returned_late: {
        label: "คืนล่าช้า",
        message: "ระบบบันทึกการคืนอุปกรณ์ล่าช้าเรียบร้อยแล้ว",
        color: "#f59e0b",
    },
    returned_early: {
        label: "คืนก่อนกำหนด",
        message: "ระบบบันทึกการคืนอุปกรณ์ก่อนกำหนดเรียบร้อยแล้ว",
        color: "#0ea5e9",
    },
    returned_damaged: {
        label: "คืนพร้อมแจ้งชำรุด",
        message: "ระบบบันทึกการคืนอุปกรณ์พร้อมแจ้งชำรุด และเปิดงานซ่อมต่อแล้ว",
        color: "#f59e0b",
    },
};

export function BorrowStatusChangedEmail({
    userName,
    status,
    equipmentNames,
    dashboardUrl,
}: BorrowStatusChangedProps) {
    const info = statusLabels[status] || {
        label: status,
        message: `สถานะคำขอยืมเปลี่ยนเป็น ${status}`,
        color: "#6b7280",
    };

    return (
        <BaseLayout preview={`คำขอยืมของคุณ: ${info.label}`}>
            <Text style={heading}>สถานะคำขอยืมอุปกรณ์</Text>
            <Text style={paragraph}>สวัสดี {userName}</Text>
            <Section style={{ ...statusBadge, borderLeftColor: info.color }}>
                <Text style={{ ...statusLabel, color: info.color }}>{info.label}</Text>
                <Text style={statusText}>{info.message}</Text>
            </Section>
            {equipmentNames.length > 0 ? (
                <Section style={infoBox}>
                    <Text style={infoText}><strong>รายการอุปกรณ์:</strong></Text>
                    {equipmentNames.map((name) => (
                        <Text key={name} style={equipItem}>- {name}</Text>
                    ))}
                </Section>
            ) : null}
            <Section style={buttonContainer}>
                <Button style={button} href={dashboardUrl}>
                    ดูรายละเอียด
                </Button>
            </Section>
        </BaseLayout>
    );
}

const heading = { fontSize: "20px", fontWeight: "bold" as const, color: "#1a1a2e" };
const paragraph = { fontSize: "14px", color: "#525f7f", lineHeight: "24px" };
const statusBadge = { borderLeft: "4px solid", padding: "12px 16px", backgroundColor: "#f8f9fa", borderRadius: "0 6px 6px 0", margin: "16px 0" };
const statusLabel = { fontSize: "16px", fontWeight: "bold" as const, margin: "0 0 4px" };
const statusText = { fontSize: "14px", color: "#333", margin: "0" };
const infoBox = { backgroundColor: "#f8f9fa", padding: "16px", borderRadius: "6px", margin: "8px 0" };
const infoText = { fontSize: "14px", color: "#333", margin: "4px 0" };
const equipItem = { fontSize: "13px", color: "#555", margin: "2px 0 2px 12px" };
const buttonContainer = { textAlign: "center" as const, margin: "24px 0" };
const button = {
    backgroundColor: "#1a1a2e",
    borderRadius: "6px",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "bold" as const,
    textDecoration: "none",
    textAlign: "center" as const,
    padding: "12px 24px",
};
