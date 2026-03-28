import { Button, Section, Text } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./base-layout";

interface NewUserRegisteredProps {
    userName: string;
    userEmail: string;
    agency: string;
    dashboardUrl: string;
}

export function NewUserRegisteredEmail({
    userName,
    userEmail,
    agency,
    dashboardUrl,
}: NewUserRegisteredProps) {
    return (
        <BaseLayout preview={`มีผู้ใช้งานใหม่รออนุมัติ: ${userName}`}>
            <Text style={heading}>มีผู้ใช้งานใหม่ลงทะเบียน</Text>
            <Text style={paragraph}>มีผู้ใช้งานใหม่ลงทะเบียนเข้าสู่ระบบและกำลังรอการอนุมัติจากผู้รับผิดชอบ</Text>
            <Section style={infoBox}>
                <Text style={infoText}><strong>ชื่อ:</strong> {userName}</Text>
                <Text style={infoText}><strong>อีเมล:</strong> {userEmail}</Text>
                <Text style={infoText}><strong>หน่วยงาน:</strong> {agency || "-"}</Text>
            </Section>
            <Section style={buttonContainer}>
                <Button style={button} href={dashboardUrl}>
                    ไปยังศูนย์อนุมัติ
                </Button>
            </Section>
        </BaseLayout>
    );
}

const heading = { fontSize: "20px", fontWeight: "bold" as const, color: "#1a1a2e" };
const paragraph = { fontSize: "14px", color: "#525f7f", lineHeight: "24px" };
const infoBox = { backgroundColor: "#f8f9fa", padding: "16px", borderRadius: "6px", margin: "16px 0" };
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
