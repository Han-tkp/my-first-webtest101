import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
    subsets: ["thai", "latin"],
    weight: ["300", "400", "500", "600", "700"],
    variable: "--font-noto-sans-thai",
});

export const metadata: Metadata = {
    title: "VBDC 12.4 | ระบบบริหารจัดการเครื่องพ่นหมอกควัน",
    description:
        "ระบบสนับสนุนการยืม-คืน อนุมัติ และซ่อมบำรุงเครื่องพ่นหมอกควันสำหรับงานสาธารณสุขภาครัฐ",
    keywords: [
        "เครื่องพ่นหมอกควัน",
        "ระบบยืมคืน",
        "ซ่อมบำรุง",
        "สาธารณสุข",
        "Equipment Management",
    ],
    icons: {
        icon: "/favicon.ico",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="th" className={notoSansThai.variable}>
            <body className="font-sans antialiased text-[color:var(--color-foreground)]">{children}</body>
        </html>
    );
}
