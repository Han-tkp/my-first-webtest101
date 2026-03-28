import {
    Body,
    Container,
    Head,
    Hr,
    Html,
    Preview,
    Section,
    Text,
} from "@react-email/components";
import * as React from "react";

interface BaseLayoutProps {
    preview: string;
    children: React.ReactNode;
}

export function BaseLayout({ preview, children }: BaseLayoutProps) {
    return (
        <Html>
            <Head />
            <Preview>{preview}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={header}>
                        <Text style={logo}>VBDC 12.4</Text>
                        <Text style={subtitle}>ระบบยืม คืน และซ่อมบำรุงอุปกรณ์สำหรับงานสาธารณสุข</Text>
                    </Section>
                    <Section style={content}>{children}</Section>
                    <Hr style={hr} />
                    <Text style={footer}>VBDC 12.4 - ระบบบริหารอุปกรณ์และงานภาคสนาม</Text>
                </Container>
            </Body>
        </Html>
    );
}

const main = {
    backgroundColor: "#f6f9fc",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "20px 0 48px",
    marginBottom: "64px",
    maxWidth: "560px",
    borderRadius: "8px",
};

const header = {
    backgroundColor: "#1a1a2e",
    padding: "24px",
    borderRadius: "8px 8px 0 0",
    textAlign: "center" as const,
};

const logo = {
    color: "#ffffff",
    fontSize: "28px",
    fontWeight: "bold" as const,
    margin: "0",
};

const subtitle = {
    color: "#a0a0c0",
    fontSize: "12px",
    margin: "4px 0 0",
};

const content = {
    padding: "24px",
};

const hr = {
    borderColor: "#e6ebf1",
    margin: "20px 0",
};

const footer = {
    color: "#8898aa",
    fontSize: "12px",
    textAlign: "center" as const,
    padding: "0 24px",
};
