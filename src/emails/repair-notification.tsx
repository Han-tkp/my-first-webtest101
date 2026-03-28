import { Button, Section, Text } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./base-layout";

interface RepairNotificationProps {
    equipmentName: string;
    description: string;
    status: string;
    cost?: number;
    dashboardUrl: string;
}

const statusLabels: Record<string, { label: string; message: string; color: string }> = {
    pending_repair_approval: {
        label: "รออนุมัติซ่อม",
        message: "มีงานซ่อมใหม่รอการอนุมัติ",
        color: "#f59e0b",
    },
    repair_approved: {
        label: "อนุมัติซ่อมแล้ว",
        message: "งานซ่อมได้รับการอนุมัติและพร้อมดำเนินการ",
        color: "#3b82f6",
    },
    completed: {
        label: "ซ่อมเสร็จแล้ว",
        message: "งานซ่อมเสร็จสิ้นและอุปกรณ์พร้อมกลับมาใช้งาน",
        color: "#22c55e",
    },
    repair_rejected: {
        label: "ไม่อนุมัติซ่อม",
        message: "งานซ่อมไม่ได้รับการอนุมัติ",
        color: "#ef4444",
    },
};

export function RepairNotificationEmail({
    equipmentName,
    description,
    status,
    cost,
    dashboardUrl,
}: RepairNotificationProps) {
    const info = statusLabels[status] || {
        label: status,
        message: `สถานะงานซ่อมเปลี่ยนเป็น ${status}`,
        color: "#6b7280",
    };

    return (
        <BaseLayout preview={`${info.label}: ${equipmentName}`}>
            <Text style={heading}>แจ้งเตือนงานซ่อมบำรุง</Text>
            <Section style={{ ...statusBadge, borderLeftColor: info.color }}>
                <Text style={{ ...statusLabelStyle, color: info.color }}>{info.label}</Text>
                <Text style={statusText}>{info.message}</Text>
            </Section>
            <Section style={infoBox}>
                <Text style={infoText}><strong>อุปกรณ์:</strong> {equipmentName}</Text>
                <Text style={infoText}><strong>รายละเอียด:</strong> {description}</Text>
                {cost !== undefined && cost > 0 ? (
                    <Text style={infoText}><strong>ค่าใช้จ่าย:</strong> {cost.toLocaleString()} บาท</Text>
                ) : null}
            </Section>
            <Section style={buttonContainer}>
                <Button style={button} href={dashboardUrl}>
                    ดูรายละเอียด
                </Button>
            </Section>
        </BaseLayout>
    );
}

const heading = { fontSize: "20px", fontWeight: "bold" as const, color: "#1a1a2e" };
const statusBadge = { borderLeft: "4px solid", padding: "12px 16px", backgroundColor: "#f8f9fa", borderRadius: "0 6px 6px 0", margin: "16px 0" };
const statusLabelStyle = { fontSize: "16px", fontWeight: "bold" as const, margin: "0 0 4px" };
const statusText = { fontSize: "14px", color: "#333", margin: "0" };
const infoBox = { backgroundColor: "#f8f9fa", padding: "16px", borderRadius: "6px", margin: "8px 0" };
const infoText = { fontSize: "14px", color: "#333", margin: "4px 0" };
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
