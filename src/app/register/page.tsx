"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, ArrowLeft, ClipboardCheck, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        password: "",
        agency: "",
        phone: "",
        address: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const digitsOnly = (value: string, maxLength = 10) => value.replace(/\D/g, "").slice(0, maxLength);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "phone" ? digitsOnly(value) : value,
        }));
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        if (formData.password.length < 8) {
            setError("รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร");
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    full_name: formData.full_name,
                    agency: formData.agency,
                    phone: formData.phone,
                    address: formData.address,
                }),
            });

            const result = await res.json();
            if (!res.ok) {
                setError(result.error || "ไม่สามารถลงทะเบียนได้");
                return;
            }

            setSuccess(true);
        } catch {
            setError("เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-dark px-4 py-10 sm:px-6 lg:px-8">
                <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center justify-center">
                    <GlassCard className="w-full max-w-2xl bg-white p-8 text-center sm:p-10">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--color-secondary-soft)] text-[color:var(--color-secondary)]">
                            <ClipboardCheck className="h-8 w-8" />
                        </div>
                        <p className="section-kicker mt-6">Registration Completed</p>
                        <h1 className="mt-3 text-3xl font-semibold text-slate-900">ส่งคำขอลงทะเบียนเรียบร้อยแล้ว</h1>
                        <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-slate-600">
                            บัญชีของคุณอยู่ในสถานะรออนุมัติ ผู้รับผิดชอบจะตรวจสอบข้อมูลก่อนเปิดสิทธิ์เข้าใช้งานระบบ
                        </p>
                        <div className="mt-8 flex flex-wrap justify-center gap-3">
                            <Link href="/login">
                                <Button size="lg">ไปยังหน้าเข้าสู่ระบบ</Button>
                            </Link>
                            <button
                                type="button"
                                onClick={() => router.push("/")}
                                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                กลับหน้าหลัก
                            </button>
                        </div>
                    </GlassCard>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-dark px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
                <div className="space-y-6 pt-4">
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
                            <p className="text-sm text-slate-500">ระบบบริหารเครื่องพ่นหมอกควันสำหรับงานสาธารณสุข</p>
                        </div>
                    </div>

                    <div className="max-w-xl space-y-4">
                        <p className="section-kicker">New User Access</p>
                        <h1 className="text-4xl font-semibold leading-tight text-slate-900">
                            เปิดบัญชีผู้ใช้งานใหม่สำหรับหน่วยงานและภารกิจภาคสนาม
                        </h1>
                        <p className="text-base leading-8 text-slate-600">
                            ใช้ข้อมูลจริงของหน่วยงานเพื่อให้ผู้อนุมัติตรวจสอบสิทธิ์ได้สะดวก
                            ช่วยลดการติดต่อซ้ำและทำให้กระบวนการอนุมัติมีความน่าเชื่อถือ
                        </p>
                    </div>

                    <GlassCard className="max-w-xl bg-white">
                        <div className="space-y-3">
                            <p className="font-semibold text-slate-900">คำแนะนำก่อนลงทะเบียน</p>
                            <ul className="space-y-2 text-sm leading-7 text-slate-600">
                                <li>ใช้อีเมลที่สามารถติดต่อกลับได้จริง</li>
                                <li>ระบุชื่อหน่วยงานและเบอร์ติดต่อของผู้ประสานงานให้ครบถ้วน</li>
                                <li>หลังส่งคำขอ ระบบจะตั้งสถานะเป็น “รออนุมัติ” จนกว่าผู้รับผิดชอบจะตรวจสอบ</li>
                            </ul>
                        </div>
                    </GlassCard>
                </div>

                <GlassCard className="bg-white p-8 sm:p-10">
                    <div className="mb-8">
                        <p className="section-kicker">Registration Form</p>
                        <h2 className="mt-3 text-3xl font-semibold text-slate-900">แบบฟอร์มลงทะเบียน</h2>
                        <p className="mt-2 text-sm leading-7 text-slate-600">
                            กรอกข้อมูลให้ครบถ้วนเพื่อช่วยให้กระบวนการอนุมัติเป็นไปอย่างรวดเร็ว
                        </p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-5">
                        {error && (
                            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                {error}
                            </div>
                        )}

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label className="label">ชื่อ-สกุล</label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    required
                                    placeholder="เช่น นายสมชาย ใจดี"
                                    className="form-input"
                                />
                            </div>
                            <div>
                                <label className="label">หน่วยงาน</label>
                                <input
                                    type="text"
                                    name="agency"
                                    value={formData.agency}
                                    onChange={handleChange}
                                    required
                                    placeholder="เช่น สำนักงานสาธารณสุขอำเภอ"
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label className="label">อีเมล</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="name@agency.go.th"
                                    className="form-input"
                                />
                            </div>
                            <div>
                                <label className="label">เบอร์โทรศัพท์</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    inputMode="numeric"
                                    pattern="[0-9]{9,10}"
                                    maxLength={10}
                                    placeholder="0812345678"
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="label">ที่อยู่หน่วยงาน</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows={3}
                                placeholder="ระบุที่อยู่สำหรับประสานงาน"
                                className="form-textarea"
                            />
                        </div>

                        <div>
                            <label className="label">รหัสผ่าน</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={8}
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
                            <p className="helper-text mt-2">ระบบจะแยกสิทธิ์การใช้งานตามบทบาทหลังได้รับการอนุมัติ</p>
                        </div>

                        <Button type="submit" size="lg" isLoading={isLoading} className="w-full">
                            ส่งคำขอลงทะเบียน
                        </Button>
                    </form>

                    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                        มีบัญชีอยู่แล้ว?{" "}
                        <Link href="/login" className="brand-link font-semibold">
                            เข้าสู่ระบบที่นี่
                        </Link>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
