"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SupabaseTestPage() {
    const [status, setStatus] = useState<"checking" | "connected" | "error">("checking");
    const [message, setMessage] = useState("");

    useEffect(() => {
        async function testConnection() {
            try {
                const supabase = createClient();
                
                if (!supabase) {
                    setStatus("error");
                    setMessage("❌ Supabase client ไม่สามารถสร้างได้ - ตรวจสอบ environment variables");
                    return;
                }

                // Test connection by fetching server info
                const { error } = await supabase.from("profiles").select("count").limit(1);

                if (error) {
                    if (error.message.includes("relation") || error.message.includes("doesn't exist")) {
                        setStatus("connected");
                        setMessage("✅ เชื่อมต่อ Supabase สำเร็จ! แต่ยังไม่มีตาราง 'profiles' - ต้องรัน migration");
                    } else {
                        setStatus("error");
                        setMessage(`❌ Error: ${error.message}`);
                    }
                    return;
                }

                setStatus("connected");
                setMessage("✅ เชื่อมต่อ Supabase สำเร็จ! พร้อมใช้งาน");
            } catch (err) {
                setStatus("error");
                setMessage(`❌ เกิดข้อผิดพลาด: ${err instanceof Error ? err.message : String(err)}`);
            }
        }

        testConnection();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
            <div className="glass-card max-w-xl w-full p-8 text-center">
                <h1 className="text-2xl font-semibold mb-6">ทดสอบการเชื่อมต่อ Supabase</h1>
                
                <div className={`p-4 rounded-xl mb-4 ${
                    status === "checking" ? "bg-blue-50 text-blue-700" :
                    status === "connected" ? "bg-green-50 text-green-700" :
                    "bg-red-50 text-red-700"
                }`}>
                    <p className="text-lg">{message}</p>
                </div>

                {status === "checking" && (
                    <p className="text-slate-600">กำลังตรวจสอบการเชื่อมต่อ...</p>
                )}

                {status === "connected" && (
                    <div className="space-y-4 text-left">
                        <p className="text-slate-700">
                            <strong>URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL}
                        </p>
                        <p className="text-slate-700">
                            <strong>สถานะ:</strong> พร้อมใช้งาน
                        </p>
                        <a href="/dashboard" className="block mt-4">
                            <button className="action-primary px-6 py-3 rounded-xl w-full">
                                ไปที่ Dashboard →
                            </button>
                        </a>
                    </div>
                )}

                {status === "error" && (
                    <div className="space-y-4 text-left">
                        <p className="text-slate-700">
                            <strong>สิ่งที่ต้องตรวจสอบ:</strong>
                        </p>
                        <ol className="list-decimal list-inside space-y-2 text-slate-600">
                            <li>ตรวจสอบ `.env.local` ว่ามีค่าที่ถูกต้อง</li>
                            <li>ตรวจสอบว่า Supabase project ยังทำงานอยู่</li>
                            <li>ตรวจสอบ network connection</li>
                        </ol>
                        <button 
                            onClick={() => window.location.reload()}
                            className="action-primary px-6 py-3 rounded-xl w-full mt-4"
                        >
                            ลองอีกครั้ง
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
