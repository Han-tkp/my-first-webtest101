import Link from "next/link";
import { ArrowRight, Building2, ChartColumn, ClipboardCheck, ShieldCheck, Wrench } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { BentoGrid, BentoItem } from "@/components/ui/BentoGrid";
import { PublicHeader } from "@/components/layout/PublicHeader";

const principles = [
    {
        title: "ติดตามอุปกรณ์อย่างเป็นระบบ",
        description: "บันทึกสถานะ ยืม-คืน และประวัติการใช้งานของเครื่องพ่นหมอกควันแบบตรวจสอบย้อนหลังได้",
        icon: ClipboardCheck,
    },
    {
        title: "รองรับลำดับการอนุมัติ",
        description: "แยกบทบาทผู้ใช้งาน ผู้อนุมัติ และช่างเทคนิคอย่างชัดเจนตามกระบวนงานราชการ",
        icon: ShieldCheck,
    },
    {
        title: "ดูแลงานซ่อมบำรุงต่อเนื่อง",
        description: "แจ้งซ่อม อนุมัติซ่อม และบันทึกค่าใช้จ่ายในระบบเดียว ลดเอกสารกระจัดกระจาย",
        icon: Wrench,
    },
    {
        title: "สรุปข้อมูลเพื่อการบริหาร",
        description: "ดูภาพรวมจำนวนอุปกรณ์ คำขอที่รออนุมัติ และภารกิจที่อยู่ระหว่างดำเนินการ",
        icon: ChartColumn,
    },
];

const processSteps = [
    "ลงทะเบียนผู้ใช้งานพร้อมข้อมูลหน่วยงานและผู้ประสานงาน",
    "ผู้มีสิทธิ์ตรวจสอบและอนุมัติบัญชีผู้ใช้ก่อนเข้าใช้งานจริง",
    "ส่งคำขอยืมอุปกรณ์ พร้อมระบุวันใช้งานและวัตถุประสงค์ของภารกิจ",
    "ช่างเทคนิคส่งมอบ ตรวจรับคืน และบันทึกผลการซ่อมบำรุงตามสภาพอุปกรณ์",
];

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-dark">
            <PublicHeader />

            <main>
                <section className="page-shell px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
                    <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
                        <div className="space-y-6">
                            <p className="section-kicker">Public Health Operations</p>
                            <div className="max-w-3xl space-y-4">
                                <h1 className="text-4xl font-semibold leading-tight text-[color:var(--color-foreground)] sm:text-5xl lg:text-6xl">
                                    ระบบยืม-คืนและซ่อมบำรุงอุปกรณ์ที่ออกแบบให้เหมาะกับงานสาธารณสุขภาครัฐ
                                </h1>
                                <p className="max-w-2xl text-lg leading-8 text-[color:var(--color-foreground-muted)]">
                                    รองรับขั้นตอนการลงทะเบียน ตรวจสอบสิทธิ์ อนุมัติคำขอ และติดตามสภาพอุปกรณ์
                                    ด้วยภาษาภาพที่อ่านง่าย สุภาพ และพร้อมใช้งานในบริบทหน่วยงานราชการ
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Link href="/login">
                                    <Button size="lg">
                                        เริ่มใช้งานระบบ
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button variant="glass" size="lg">
                                        ขอเปิดบัญชีผู้ใช้
                                    </Button>
                                </Link>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-2">
                                <span className="chip">ธีมสว่างอ่านง่าย</span>
                                <span className="chip chip-success">รองรับหลายบทบาท</span>
                                <span className="chip chip-warning">เหมาะกับงานเอกสารราชการ</span>
                            </div>
                        </div>

                        <GlassCard className="overflow-hidden p-0">
                            <div className="brand-panel border-b border-white/10 px-6 py-5">
                                <p className="text-sm uppercase tracking-[0.18em] text-white/75">Operational Snapshot</p>
                                <h2 className="mt-2 text-2xl font-semibold">ภาพรวมการดำเนินงานที่อ่านง่ายในหน้าเดียว</h2>
                            </div>
                            <div className="space-y-5 px-6 py-6">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] p-4">
                                        <p className="text-sm text-[color:var(--color-foreground-muted)]">โครงสร้างการอนุมัติ</p>
                                        <p className="mt-2 text-2xl font-semibold text-[color:var(--color-foreground)]">3 ระดับ</p>
                                        <p className="mt-1 text-sm text-[color:var(--color-foreground-muted)]">ผู้ใช้ ผู้อนุมัติ และช่างเทคนิค</p>
                                    </div>
                                    <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] p-4">
                                        <p className="text-sm text-[color:var(--color-foreground-muted)]">ข้อมูลสำคัญ</p>
                                        <p className="mt-2 text-2xl font-semibold text-[color:var(--color-foreground)]">Realtime</p>
                                        <p className="mt-1 text-sm text-[color:var(--color-foreground-muted)]">ติดตามสถานะคำขอและอุปกรณ์ได้ต่อเนื่อง</p>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] p-5">
                                    <div className="flex items-start gap-3">
                                        <div className="brand-fill-soft flex h-11 w-11 items-center justify-center rounded-2xl">
                                            <Building2 className="h-5 w-5" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="font-semibold text-[color:var(--color-foreground)]">ออกแบบสำหรับหน่วยงานภาครัฐและสาธารณสุข</p>
                                            <p className="text-sm leading-7 text-[color:var(--color-foreground-muted)]">
                                                โทนสีและองค์ประกอบถูกปรับให้ดูเป็นทางการ สงบ และเหมาะกับการใช้งานโดยบุคลากรในงานควบคุมโรค
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </section>

                <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-8 max-w-3xl">
                            <p className="section-kicker">Core Functions</p>
                            <h2 className="mt-3 text-3xl font-semibold text-[color:var(--color-foreground)]">ฟังก์ชันหลักที่ครอบคลุมงานยืมคืนและซ่อมบำรุง</h2>
                            <p className="mt-3 text-base leading-7 text-[color:var(--color-foreground-muted)]">
                                เน้นความชัดเจนของข้อมูล การอนุมัติอย่างมีลำดับ และการใช้งานที่ไม่ซับซ้อนสำหรับเจ้าหน้าที่ทุกระดับ
                            </p>
                        </div>

                        <BentoGrid>
                            {principles.map(({ title, description, icon: Icon }) => (
                                <BentoItem key={title} className="bg-[color:var(--color-surface)]">
                                    <div className="brand-fill-soft flex h-12 w-12 items-center justify-center rounded-2xl">
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="mt-5 text-xl font-semibold text-[color:var(--color-foreground)]">{title}</h3>
                                    <p className="mt-3 text-sm leading-7 text-[color:var(--color-foreground-muted)]">{description}</p>
                                </BentoItem>
                            ))}
                        </BentoGrid>
                    </div>
                </section>

                <section className="px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
                    <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                        <GlassCard className="brand-panel">
                            <p className="section-kicker !text-white/70">Workflow</p>
                            <h2 className="mt-3 text-3xl font-semibold">ลำดับงานที่สอดคล้องกับการปฏิบัติงานจริง</h2>
                            <p className="mt-4 text-sm leading-7 text-white/80">
                                ตั้งแต่การเปิดบัญชี การขอใช้อุปกรณ์ ไปจนถึงการส่งคืนและงานซ่อมบำรุง
                                ระบบช่วยให้ทุกขั้นตอนมีหลักฐานอ้างอิงและติดตามต่อได้
                            </p>
                        </GlassCard>

                        <div className="space-y-4">
                            {processSteps.map((step, index) => (
                                <GlassCard key={step} className="flex gap-4 bg-white">
                                    <div className="brand-fill-soft flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-semibold">
                                        {index + 1}
                                    </div>
                                    <p className="pt-1 text-base leading-7 text-[color:var(--color-foreground-muted)]">{step}</p>
                                </GlassCard>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="px-4 pb-16 pt-8 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-5xl">
                        <GlassCard className="bg-[color:var(--color-surface)] text-center">
                            <p className="section-kicker">Ready To Use</p>
                            <h2 className="mt-3 text-3xl font-semibold text-[color:var(--color-foreground)]">เริ่มต้นใช้งานในรูปแบบที่เป็นทางการและเข้าใจง่าย</h2>
                            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[color:var(--color-foreground-muted)]">
                                ผู้ปฏิบัติงานสามารถลงทะเบียนใช้งานและรอการอนุมัติจากผู้รับผิดชอบได้ทันที
                                ส่วนผู้ดูแลสามารถบริหารคำขอ อุปกรณ์ และประวัติการซ่อมได้จากหน้าแดชบอร์ดเดียว
                            </p>
                            <div className="mt-8 flex flex-wrap justify-center gap-3">
                                <Link href="/register">
                                    <Button size="lg">ลงทะเบียนผู้ใช้ใหม่</Button>
                                </Link>
                                <Link href="/login">
                                    <Button variant="glass" size="lg">
                                        เข้าสู่ระบบ
                                    </Button>
                                </Link>
                            </div>
                        </GlassCard>
                    </div>
                </section>
            </main>

            <footer className="border-t border-[color:var(--color-border)] bg-[color:var(--color-surface)]/80 px-4 py-8 text-sm text-[color:var(--color-foreground-muted)] sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-7xl flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <p className="font-medium text-[color:var(--color-foreground)]">ระบบสนับสนุนงานควบคุมโรคติดต่อและบริหารอุปกรณ์ภาคสนาม</p>
                    <p>ออกแบบให้เหมาะกับการใช้งานในหน่วยงานสาธารณสุขและองค์กรปกครองส่วนท้องถิ่น</p>
                </div>
            </footer>
        </div>
    );
}
