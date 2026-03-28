"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

const TEST_RECIPIENTS = [
    "delivered@resend.dev",
    "bounced@resend.dev",
    "complained@resend.dev",
    "suppressed@resend.dev",
] as const;

export function EmailTestPanel() {
    const [recipient, setRecipient] = useState<(typeof TEST_RECIPIENTS)[number]>("delivered@resend.dev");
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

    const handleSend = async () => {
        setIsLoading(true);
        setResult(null);

        try {
            const response = await fetch("/api/debug/email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ to: recipient }),
            });

            const payload = (await response.json()) as { error?: string };

            if (!response.ok) {
                setResult({
                    type: "error",
                    message: payload.error || "ไม่สามารถส่งอีเมลทดสอบได้",
                });
                return;
            }

            setResult({
                type: "success",
                message: `ส่งคำขอทดสอบไปยัง ${recipient} แล้ว`,
            });
        } catch {
            setResult({
                type: "error",
                message: "เกิดข้อผิดพลาดระหว่างเรียกใช้งาน API ทดสอบอีเมล",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="border-t border-slate-200 pt-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                Resend Email Test
            </h2>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm leading-7 text-slate-600">
                    ใช้สำหรับทดสอบ flow การส่งอีเมลของระบบผ่าน Resend โดยส่งไปยัง test address ที่รองรับอย่างเป็นทางการ
                </p>

                <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]">
                    <select
                        value={recipient}
                        onChange={(event) => setRecipient(event.target.value as (typeof TEST_RECIPIENTS)[number])}
                        className="form-input"
                    >
                        {TEST_RECIPIENTS.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>

                    <Button type="button" onClick={handleSend} isLoading={isLoading}>
                        ส่งอีเมลทดสอบ
                    </Button>
                </div>

                <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-600">
                    ต้องใช้ `EMAIL_FROM` ที่อยู่บนโดเมนซึ่ง Resend ตรวจสอบผ่านแล้วก่อน จึงจะยืนยันการส่งจริงได้
                </div>

                {result ? (
                    <div
                        className={`mt-4 rounded-2xl px-4 py-3 text-sm ${
                            result.type === "success"
                                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border border-rose-200 bg-rose-50 text-rose-700"
                        }`}
                    >
                        {result.message}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
