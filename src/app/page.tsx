import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { BentoGrid, BentoItem } from "@/components/ui/BentoGrid";
import { KineticText } from "@/components/effects/KineticText";
import { ScrollReveal } from "@/components/effects/ParallaxSection";
import { SprayLogo } from "@/components/icons/SprayLogo";

// Dynamic import for 3D scene (client-side only)
const Scene3D = dynamic(
    () => import("@/components/effects/Scene3D").then((mod) => mod.Scene3D),
    { ssr: false }
);

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-dark">
            {/* Header */}
            <header className="sticky top-0 z-50 glass">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <SprayLogo className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-lg">Yonchuw</p>
                            <p className="text-white/70 text-xs">ระบบบริหารจัดการเครื่องพ่นหมอกควัน</p>
                        </div>
                    </div>
                    <nav className="flex items-center gap-3">
                        <Link href="/login">
                            <Button variant="glass" size="sm">เข้าสู่ระบบ</Button>
                        </Link>
                        <Link href="/register">
                            <Button variant="secondary" size="sm">ลงทะเบียน</Button>
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Hero Section with 3D */}
            <section className="relative min-h-[90vh] flex items-center overflow-hidden">
                <Scene3D />
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="max-w-3xl">
                        <KineticText
                            text="ระบบจอง ยืม-คืน"
                            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight"
                            delay={0.2}
                        />
                        <KineticText
                            text="และซ่อมบำรุง"
                            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mt-2 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"
                            delay={0.8}
                        />
                        <ScrollReveal delay={1.2}>
                            <p className="mt-8 text-xl text-white/80 max-w-xl">
                                ลดขั้นตอนงานเอกสาร เพิ่มประสิทธิภาพการทำงาน
                                ติดตามสถานะอุปกรณ์ได้แบบเรียลไทม์
                            </p>
                        </ScrollReveal>
                        <ScrollReveal delay={1.4}>
                            <div className="mt-10 flex flex-wrap gap-4">
                                <Link href="/login">
                                    <Button variant="primary" size="lg">
                                        เริ่มต้นใช้งาน
                                    </Button>
                                </Link>
                                <Button variant="glass" size="lg">
                                    ดูรายละเอียด
                                </Button>
                            </div>
                        </ScrollReveal>
                        <ScrollReveal delay={1.6}>
                            <div className="mt-8 flex items-center gap-3">
                                <span className="chip">Responsive</span>
                                <span className="chip">Role-based</span>
                                <span className="chip">Real-time</span>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* Features Bento Grid */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <ScrollReveal>
                    <h2 className="text-4xl font-bold text-center mb-4">
                        ฟีเจอร์หลัก
                    </h2>
                    <p className="text-center text-white/60 mb-16 max-w-2xl mx-auto">
                        ระบบครบวงจรสำหรับการบริหารจัดการอุปกรณ์ ตั้งแต่การยืม-คืน ไปจนถึงการซ่อมบำรุง
                    </p>
                </ScrollReveal>

                <BentoGrid>
                    <BentoItem span={2} className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                        <div className="flex flex-col h-full justify-between">
                            <div>
                                <span className="text-4xl mb-4 block">📦</span>
                                <h3 className="text-2xl font-bold mb-2">จัดการอุปกรณ์</h3>
                                <p className="text-white/70">
                                    ดูสถานะอุปกรณ์ทั้งหมด ค้นหา กรอง และจัดการได้อย่างง่ายดาย
                                </p>
                            </div>
                            <div className="mt-6 flex gap-2">
                                <span className="chip chip-success">40 เครื่อง</span>
                                <span className="chip">พร้อมใช้งาน</span>
                            </div>
                        </div>
                    </BentoItem>

                    <BentoItem className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
                        <span className="text-4xl mb-4 block">📝</span>
                        <h3 className="text-xl font-bold mb-2">ยืม-คืน</h3>
                        <p className="text-white/70 text-sm">
                            ส่งคำขอยืม อนุมัติ และติดตามสถานะ
                        </p>
                    </BentoItem>

                    <BentoItem className="bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                        <span className="text-4xl mb-4 block">🔧</span>
                        <h3 className="text-xl font-bold mb-2">ซ่อมบำรุง</h3>
                        <p className="text-white/70 text-sm">
                            แจ้งซ่อม ติดตามงาน บันทึกค่าใช้จ่าย
                        </p>
                    </BentoItem>

                    <BentoItem className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                        <span className="text-4xl mb-4 block">👥</span>
                        <h3 className="text-xl font-bold mb-2">จัดการผู้ใช้</h3>
                        <p className="text-white/70 text-sm">
                            ระบบ Role-based สำหรับ Admin, Approver, Technician
                        </p>
                    </BentoItem>

                    <BentoItem className="bg-gradient-to-br from-rose-500/20 to-pink-500/20">
                        <span className="text-4xl mb-4 block">📊</span>
                        <h3 className="text-xl font-bold mb-2">รายงาน</h3>
                        <p className="text-white/70 text-sm">
                            สถิติการยืม ค่าซ่อม Export ข้อมูล
                        </p>
                    </BentoItem>

                    <BentoItem span={2} rowSpan={1} className="bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20">
                        <div className="flex items-center gap-6">
                            <span className="text-5xl">🔔</span>
                            <div>
                                <h3 className="text-xl font-bold mb-2">แจ้งเตือนอัตโนมัติ</h3>
                                <p className="text-white/70">
                                    รับการแจ้งเตือนเมื่อมีคำขอใหม่ อนุมัติ หรือเมื่อถึงกำหนดคืน
                                </p>
                            </div>
                        </div>
                    </BentoItem>
                </BentoGrid>
            </section>

            {/* How it works */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-indigo-900/20">
                <div className="max-w-4xl mx-auto">
                    <ScrollReveal>
                        <h2 className="text-4xl font-bold text-center mb-16">
                            ขั้นตอนการใช้งาน
                        </h2>
                    </ScrollReveal>

                    <div className="space-y-8">
                        {[
                            { step: 1, title: "ลงทะเบียน", desc: "ผู้ใช้ใหม่ลงทะเบียน → สถานะเป็น \"รอตรวจสอบ\"", icon: "📝" },
                            { step: 2, title: "อนุมัติบัญชี", desc: "ผู้อนุมัติทำการอนุมัติ → ผู้ใช้จึงจะเข้าสู่ระบบได้", icon: "✅" },
                            { step: 3, title: "ส่งคำขอยืม", desc: "ผู้ใช้ทั่วไปส่งคำขอยืม (สามารถเลือกได้หลายเครื่อง)", icon: "📨" },
                            { step: 4, title: "อนุมัติการยืม", desc: "ผู้อนุมัติอนุมัติคำขอ → ช่างตรวจสภาพก่อนส่งมอบ", icon: "🔍" },
                            { step: 5, title: "คืนอุปกรณ์", desc: "เมื่อคืนอุปกรณ์ ช่างจะตรวจสภาพและตัดสินว่า \"เสีย/ไม่เสีย\"", icon: "📦" },
                            { step: 6, title: "ซ่อมบำรุง", desc: "หากเสีย → สร้างคำขอซ่อม → อนุมัติ → ซ่อมเสร็จ → กลับมา \"ว่าง\"", icon: "🔧" },
                        ].map((item, index) => (
                            <ScrollReveal key={item.step} delay={index * 0.1} direction="left">
                                <GlassCard hover className="flex items-start gap-6">
                                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/30 shrink-0">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold">
                                                {item.step}
                                            </span>
                                            <h3 className="text-xl font-bold">{item.title}</h3>
                                        </div>
                                        <p className="text-white/70">{item.desc}</p>
                                    </div>
                                </GlassCard>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8">
                <ScrollReveal>
                    <div className="max-w-4xl mx-auto text-center">
                        <GlassCard className="py-16 px-8" glow>
                            <h2 className="text-4xl font-bold mb-4">
                                พร้อมเริ่มใช้งานแล้วหรือยัง?
                            </h2>
                            <p className="text-white/70 mb-8 max-w-lg mx-auto">
                                ลงทะเบียนวันนี้เพื่อเริ่มต้นใช้งานระบบบริหารจัดการเครื่องพ่นหมอกควัน
                            </p>
                            <div className="flex justify-center gap-4">
                                <Link href="/register">
                                    <Button variant="primary" size="lg">
                                        ลงทะเบียนฟรี
                                    </Button>
                                </Link>
                                <Link href="/login">
                                    <Button variant="glass" size="lg">
                                        เข้าสู่ระบบ
                                    </Button>
                                </Link>
                            </div>
                        </GlassCard>
                    </div>
                </ScrollReveal>
            </section>

            {/* Footer */}
            <footer className="py-12 px-4 border-t border-white/10">
                <div className="max-w-4xl mx-auto text-center text-white/60 text-sm">
                    <p className="font-semibold text-white/80 mb-2">
                        หน่วยควบคุมโรคติดต่อนำโดยแมลงที่ 12.4.4
                    </p>
                    <p>11 ถนนระแงะมรรคา ตำบลบางนาค อำเภอเมืองนราธิวาส จังหวัดนราธิวาส 96000</p>
                    <p className="mt-2">โทรศัพท์: 073-514-960</p>
                </div>
            </footer>
        </div>
    );
}
