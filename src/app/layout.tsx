import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
    subsets: ["thai", "latin"],
    weight: ["300", "400", "500", "600", "700"],
    variable: "--font-noto-sans-thai",
});

export const metadata: Metadata = {
    title: "Yonchuw – ระบบจอง ยืม-คืน และซ่อมบำรุง",
    description: "ระบบบริหารจัดการเครื่องพ่นหมอกควัน ลดขั้นตอนงานเอกสาร เพิ่มประสิทธิภาพการทำงาน ติดตามสถานะอุปกรณ์ได้แบบเรียลไทม์",
    keywords: ["เครื่องพ่นหมอกควัน", "ยืม-คืน", "ซ่อมบำรุง", "Equipment Management"],
    icons: {
        icon: "/favicon.ico",
        apple: "/icons/icon-192x192.png",
    },
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "Yonchuw",
    },
    applicationName: "Yonchuw",
    themeColor: "#ffffff",
    viewport: {
        width: "device-width",
        initialScale: 1,
        maximumScale: 1,
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="th" className={notoSansThai.variable}>
            <body className="font-sans antialiased">{children}</body>
        </html>
    );
}
