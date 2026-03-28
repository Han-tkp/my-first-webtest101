import { Button, Section, Text } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./base-layout";

interface BorrowRequestProps {
    userName: string;
    purpose: string;
    borrowDate: string;
    dueDate: string;
    equipmentNames: string[];
    dashboardUrl: string;
}

export function BorrowRequestEmail({
    userName,
    purpose,
    borrowDate,
    dueDate,
    equipmentNames,
    dashboardUrl,
}: BorrowRequestProps) {
    return (
        <BaseLayout preview={`มีคำขอยืมอุปกรณ์ใหม่จาก ${userName}`}>
            <Text style={heading}>มีคำขอยืมอุปกรณ์ใหม่</Text>
            <Text style={paragraph}>มีคำขอยืมอุปกรณ์ใหม่รอการอนุมัติจากเจ้าหน้าที่ผู้รับผิดชอบ</Text>
            <Section style={infoBox}>
                <Text style={infoText}><strong>ผู้ขอ:</strong> {userName}</Text>
                <Text style={infoText}><strong>วัตถุประสงค์:</strong> {purpose}</Text>
                <Text style={infoText}><strong>วันที่ยืม:</strong> {borrowDate}</Text>
                <Text style={infoText}><strong>กำหนดคืน:</strong> {dueDate}</Text>
                <Text style={infoText}><strong>รายการอุปกรณ์:</strong></Text>
                {equipmentNames.map((name) => (
                    <Text key={name} style={equipItem}>- {name}</Text>
                ))}
            </Section>
            <Section style={buttonContainer}>
                <Button style={button} href={dashboardUrl}>
                    ไปหน้าศูนย์อนุมัติ
                </Button>
            </Section>
        </BaseLayout>
    );
}

const heading = { fontSize: "20px", fontWeight: "bold" as const, color: "#1a1a2e" };
const paragraph = { fontSize: "14px", color: "#525f7f", lineHeight: "24px" };
const infoBox = { backgroundColor: "#f8f9fa", padding: "16px", borderRadius: "6px", margin: "16px 0" };
const infoText = { fontSize: "14px", color: "#333", margin: "4px 0" };
const equipItem = { fontSize: "13px", color: "#555", margin: "2px 0 2px 12px" };
const buttonContainer = { textAlign: "center" as const, margin: "24px 0" };
const button = {
    backgroundColor: "#f59e0b",
    borderRadius: "6px",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "bold" as const,
    textDecoration: "none",
    textAlign: "center" as const,
    padding: "12px 24px",
};
