import { Button, Section, Text } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./base-layout";

interface NotificationMessageProps {
    preview: string;
    title: string;
    message: string;
    buttonLabel?: string;
    buttonUrl?: string;
}

export function NotificationMessageEmail({
    preview,
    title,
    message,
    buttonLabel,
    buttonUrl,
}: NotificationMessageProps) {
    return (
        <BaseLayout preview={preview}>
            <Text style={heading}>{title}</Text>
            <Section style={infoBox}>
                <Text style={messageText}>{message}</Text>
            </Section>
            {buttonLabel && buttonUrl ? (
                <Section style={buttonContainer}>
                    <Button style={button} href={buttonUrl}>
                        {buttonLabel}
                    </Button>
                </Section>
            ) : null}
        </BaseLayout>
    );
}

const heading = { fontSize: "20px", fontWeight: "bold" as const, color: "#1a1a2e" };
const infoBox = { backgroundColor: "#f8f9fa", padding: "16px", borderRadius: "6px", margin: "16px 0" };
const messageText = { fontSize: "14px", color: "#333", lineHeight: "24px", margin: 0 };
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
