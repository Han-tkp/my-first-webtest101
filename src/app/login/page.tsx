"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Activity, ArrowLeft, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        setError("");
        setIsLoading(true);

        const supabase = createClient();
        
        if (!supabase) {
            setError("ระบบยังไม่พร้อมใช้งาน กรุณาลองใหม่อีกครั้ง");
            setIsLoading(false);
            return;
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
        });

        if (signInError) {
            setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
            setIsLoading(false);
            return;
        }

        router.push("/dashboard");
        router.refresh();
    };

    return (
        <div className="min-h-screen bg-gradient-dark px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
                <div className="space-y-6">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        กลับสู่หน้าหลัก
                    </Link>

                    <div className="flex items-center gap-4">
                        <div className="brand-fill flex h-14 w-14 items-center justify-center rounded-3xl">
                            <Activity className="h-7 w-7" />
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-slate-900">VBDC 12.4</p>
                            <p className="text-sm text-slate-500">
                                ระบบบริหารการยืม คืน และซ่อมบำรุงอุปกรณ์สำหรับงานสาธารณสุข
                            </p>
                        </div>
                    </div>

                    <div className="max-w-xl space-y-4">
                        <p className="section-kicker">Secure Access</p>
                        <h1 className="text-4xl font-semibold leading-tight text-slate-900">
                            เข้าสู่ระบบด้วยบัญชีที่ได้รับอนุมัติแล้ว
                        </h1>
                        <p className="text-base leading-8 text-slate-600">
                            ระบบนี้ใช้ Supabase Auth เป็นแหล่งยืนยันตัวตนหลัก และใช้ข้อมูลบทบาทกับสถานะจากโปรไฟล์ในระบบเพื่อควบคุมสิทธิ์การใช้งาน
                        </p>
                    </div>

                    <GlassCard className="max-w-xl bg-white">
                        <div className="flex items-start gap-3">
                            <div className="brand-fill-soft flex h-11 w-11 items-center justify-center rounded-2xl">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-900">หมายเหตุการเข้าสู่ระบบ</p>
                                <p className="mt-2 text-sm leading-7 text-slate-600">
                                    บัญชีที่เพิ่งลงทะเบียนใหม่จะยังอยู่ในสถานะรออนุมัติ และจะเข้าสู่แดชบอร์ดได้เมื่อผู้ดูแลระบบหรือผู้อนุมัติเปิดสิทธิ์ให้แล้วเท่านั้น
                                </p>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                <GlassCard className="mx-auto w-full max-w-xl bg-white p-8 sm:p-10">
                    <div className="mb-8">
                        <p className="section-kicker">Sign In</p>
                        <h2 className="mt-3 text-3xl font-semibold text-slate-900">เข้าสู่ระบบ</h2>
                        <p className="mt-2 text-sm leading-7 text-slate-600">
                            กรอกอีเมลและรหัสผ่านเพื่อเข้าสู่พื้นที่ปฏิบัติงานของหน่วยงาน
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        {error ? (
                            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                {error}
                            </div>
                        ) : null}

                        <div>
                            <label className="label">อีเมล</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                                placeholder="name@agency.go.th"
                                className="form-input"
                            />
                        </div>

                        <div>
                            <label className="label">รหัสผ่าน</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    required
                                    placeholder="อย่างน้อย 8 ตัวอักษร"
                                    className="form-input pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <Button type="submit" size="lg" isLoading={isLoading} className="w-full">
                            เข้าสู่ระบบ
                        </Button>
                    </form>

                    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                        ยังไม่มีบัญชีผู้ใช้งาน?{" "}
                        <Link href="/register" className="brand-link font-semibold">
                            ลงทะเบียนที่นี่
                        </Link>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
