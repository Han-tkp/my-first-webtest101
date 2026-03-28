import { Button, Section, Text } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./base-layout";

interface UserStatusChangedProps {
    userName: string;
    status: "active" | "suspended" | "rejected";
    loginUrl: string;
}

const statusMessages = {
    active: {
        title: "บัญชีของคุณได้รับการอนุมัติแล้ว",
        message: "คุณสามารถเข้าสู่ระบบและเริ่มใช้งานได้ทันที",
        color: "#22c55e",
    },
    suspended: {
        title: "บัญชีของคุณถูกระงับ",
        message: "กรุณาติดต่อผู้ดูแลระบบหากต้องการข้อมูลเพิ่มเติม",
        color: "#ef4444",
    },
    rejected: {
        title: "การสมัครของคุณไม่ได้รับการอนุมัติ",
        message: "กรุณาติดต่อผู้ดูแลระบบหากต้องการสอบถามรายละเอียดเพิ่มเติม",
        color: "#ef4444",
    },
};

export function UserStatusChangedEmail({
    userName,
    status,
    loginUrl,
}: UserStatusChangedProps) {
    const info = statusMessages[status];

    return (
        <BaseLayout preview={info.title}>
            <Text style={heading}>{info.title}</Text>
            <Text style={paragraph}>สวัสดี {userName}</Text>
            <Section style={{ ...statusBadge, borderLeftColor: info.color }}>
                <Text style={statusText}>{info.message}</Text>
            </Section>
            {status === "active" ? (
                <Section style={buttonContainer}>
                    <Button style={button} href={loginUrl}>
                        เข้าสู่ระบบ
                    </Button>
                </Section>
            ) : null}
        </BaseLayout>
    );
}

const heading = { fontSize: "20px", fontWeight: "bold" as const, color: "#1a1a2e" };
const paragraph = { fontSize: "14px", color: "#525f7f", lineHeight: "24px" };
const statusBadge = { borderLeft: "4px solid", padding: "12px 16px", backgroundColor: "#f8f9fa", borderRadius: "0 6px 6px 0", margin: "16px 0" };
const statusText = { fontSize: "14px", color: "#333", margin: "0" };
const buttonContainer = { textAlign: "center" as const, margin: "24px 0" };
const button = {
    backgroundColor: "#22c55e",
    borderRadius: "6px",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "bold" as const,
    textDecoration: "none",
    textAlign: "center" as const,
    padding: "12px 24px",
};
