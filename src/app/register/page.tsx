"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        if (formData.password.length < 8) {
            setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
            setIsLoading(false);
            return;
        }

        try {
            const supabase = createClient();

            // Sign up with Supabase Auth
            const { data, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.full_name,
                        agency: formData.agency,
                        phone: formData.phone,
                        address: formData.address,
                        role: "user",
                        status: "pending_approval",
                    },
                },
            });

            if (authError) {
                setError(authError.message);
                return;
            }

            // Create profile in profiles table
            if (data.user) {
                const { error: profileError } = await supabase
                    .from("profiles")
                    .insert({
                        id: data.user.id,
                        full_name: formData.full_name,
                        email: formData.email,
                        agency: formData.agency,
                        phone: formData.phone,
                        address: formData.address,
                        role: "user",
                        status: "pending_approval",
                    });

                if (profileError) {
                    console.error("Profile creation error:", profileError);
                }
            }

            setSuccess(true);
        } catch (err) {
            setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-dark flex items-center justify-center px-4">
                <GlassCard className="max-w-md text-center">
                    <div className="text-6xl mb-6">✅</div>
                    <h2 className="text-2xl font-bold mb-4">ลงทะเบียนสำเร็จ!</h2>
                    <p className="text-white/70 mb-6">
                        บัญชีของคุณอยู่ในสถานะ "รอตรวจสอบ" และจะใช้งานได้ต่อเมื่อผู้อนุมัติทำการอนุมัติเรียบร้อยแล้ว
                    </p>
                    <Link href="/login">
                        <Button variant="primary">ไปหน้าเข้าสู่ระบบ</Button>
                    </Link>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-dark flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-xl">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <span className="text-2xl">🔄</span>
                        </div>
                        <span className="text-2xl font-bold">Yonchuw</span>
                    </Link>
                    <h1 className="text-3xl font-bold">ลงทะเบียนผู้ใช้งานใหม่</h1>
                    <p className="text-white/60 mt-2">กรอกข้อมูลเพื่อสร้างบัญชี</p>
                </div>

                <GlassCard>
                    <form onSubmit={handleRegister} className="space-y-5">
                        {error && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">ชื่อ-สกุล</label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    required
                                    placeholder="นายสมชาย ใจดี"
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">หน่วยงาน</label>
                                <input
                                    type="text"
                                    name="agency"
                                    value={formData.agency}
                                    onChange={handleChange}
                                    required
                                    placeholder="เทศบาลนคร / อบต."
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                />
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">เบอร์โทรศัพท์</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    placeholder="08X-XXX-XXXX"
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">อีเมล</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="your@email.com"
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">ที่อยู่หน่วยงาน</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows={2}
                                placeholder="123 ถ.สุขุมวิท ..."
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">รหัสผ่าน</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={8}
                                placeholder="อย่างน้อย 8 ตัวอักษร"
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            />
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            isLoading={isLoading}
                            className="w-full"
                        >
                            ยืนยันการลงทะเบียน
                        </Button>
                    </form>

                    <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm">
                        <strong>หมายเหตุ:</strong> หลังลงทะเบียน บัญชีจะอยู่ในสถานะ "รอตรวจสอบ" และจะใช้งานได้ต่อเมื่อผู้อนุมัติทำการอนุมัติเรียบร้อยแล้ว
                    </div>

                    <div className="mt-6 text-center text-sm text-white/60">
                        มีบัญชีอยู่แล้ว?{" "}
                        <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
                            เข้าสู่ระบบที่นี่
                        </Link>
                    </div>
                </GlassCard>

                <div className="mt-8 text-center">
                    <Link href="/" className="text-sm text-white/40 hover:text-white/60 transition">
                        ← กลับหน้าหลัก
                    </Link>
                </div>
            </div>
        </div>
    );
}
