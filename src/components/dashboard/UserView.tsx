import Link from "next/link";
import { CalendarClock, ClipboardList } from "lucide-react";
import { CancelBorrowButton } from "./CancelBorrowButton";
import { createClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { EquipmentImage } from "@/components/ui/EquipmentImage";
import { getEquipmentImageUrl } from "@/lib/equipment-catalog";

interface EquipmentSummary {
    name: string;
    image_url: string | null;
    type: string;
}

interface EquipmentTypeGroup {
    type: string;
    count: number;
    imageUrl: string | null;
}

function groupEquipmentByType(equipmentIds: number[] | null | undefined, equipmentMap: Record<number, EquipmentSummary>) {
    const grouped = new Map<string, EquipmentTypeGroup>();

    (equipmentIds || []).forEach((equipmentId) => {
        const equipment = equipmentMap[equipmentId];
        const type = equipment?.type || "ไม่ระบุประเภท";
        const existing = grouped.get(type);

        if (existing) {
            existing.count += 1;
            existing.imageUrl = existing.imageUrl || equipment?.image_url || null;
            return;
        }

        grouped.set(type, {
            type,
            count: 1,
            imageUrl: equipment?.image_url || null,
        });
    });

    return Array.from(grouped.values()).sort((a, b) => a.type.localeCompare(b.type, "th"));
}

export default async function UserView({ userId }: { userId: string }) {
    const supabase = await createClient();

    const { data: myBorrows } = await supabase
        .from("borrows")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

    const activeBorrows =
        myBorrows?.filter((borrow) =>
            ["pending_borrow_approval", "pending_delivery", "borrowed"].includes(borrow.status),
        ) || [];

    const allEquipmentIds = new Set<number>();
    activeBorrows.forEach((borrow) => borrow.equipment_ids?.forEach((id: number) => allEquipmentIds.add(id)));

    const equipmentMap: Record<number, EquipmentSummary> = {};
    if (allEquipmentIds.size > 0) {
        const { data: equipment } = await supabase
            .from("equipment")
            .select("id, name, image_url, type")
            .in("id", Array.from(allEquipmentIds));

        equipment?.forEach((item) => {
            equipmentMap[item.id] = {
                name: item.name,
                image_url: item.image_url,
                type: item.type,
            };
        });
    }

    const statusLabels: Record<string, { text: string; className: string }> = {
        pending_borrow_approval: {
            text: "รออนุมัติ",
            className: "bg-amber-50 text-amber-700 border border-amber-100",
        },
        pending_delivery: {
            text: "รอรับอุปกรณ์",
            className: "bg-sky-50 text-sky-700 border border-sky-100",
        },
        borrowed: {
            text: "กำลังใช้งาน",
            className: "bg-emerald-50 text-emerald-700 border border-emerald-100",
        },
    };

    return (
        <div className="space-y-6 fade-in">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-2">
                    <p className="section-kicker">User Dashboard</p>
                    <h1 className="text-3xl font-semibold text-slate-900">ภาพรวมการขอใช้อุปกรณ์</h1>
                    <p className="max-w-2xl text-sm leading-7 text-slate-600">
                        ติดตามคำขอที่อยู่ระหว่างดำเนินการ ตรวจสอบกำหนดรับ-คืน และเข้าถึงเมนูหลักได้จากหน้าเดียว
                    </p>
                </div>

                <Link href="/dashboard/borrow">
                    <Button size="lg">สร้างคำขอยืมใหม่</Button>
                </Link>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <GlassCard className="bg-white">
                    <div className="flex items-center gap-3">
                        <div className="tone-info flex h-11 w-11 items-center justify-center rounded-2xl">
                            <ClipboardList className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">คำขอที่กำลังดำเนินการ</h2>
                            <p className="text-sm text-slate-500">แสดงรายการล่าสุดสูงสุด 5 รายการ</p>
                        </div>
                    </div>

                    <div className="mt-6 space-y-4">
                        {activeBorrows.length > 0 ? (
                            activeBorrows.map((borrow) => {
                                const equipmentGroups = groupEquipmentByType(borrow.equipment_ids, equipmentMap);
                                const status = statusLabels[borrow.status] || {
                                    text: borrow.status,
                                    className: "bg-slate-100 text-slate-700 border border-slate-200",
                                };

                                return (
                                    <div key={borrow.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div>
                                                <p className="font-semibold text-slate-900">คำขอเลขที่ {borrow.id}</p>
                                                <p className="mt-1 text-sm text-slate-600">
                                                    วันที่ใช้งาน {new Date(borrow.borrow_date).toLocaleDateString("th-TH")}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
                                                    {status.text}
                                                </span>
                                                {borrow.status === "pending_borrow_approval" && (
                                                    <CancelBorrowButton borrowId={borrow.id} />
                                                )}
                                            </div>
                                        </div>

                                        {equipmentGroups.length > 0 ? (
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {equipmentGroups.map((group) => (
                                                    <div
                                                        key={group.type}
                                                        className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600"
                                                    >
                                                        <EquipmentImage
                                                            src={getEquipmentImageUrl(group.type, group.imageUrl)}
                                                            alt={group.type}
                                                            className="h-7 w-7 rounded-lg border border-slate-200"
                                                            imageClassName="object-cover"
                                                            labelClassName="text-[9px]"
                                                            sizes="28px"
                                                        />
                                                        <span>{group.type}</span>
                                                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                                                            {group.count} เครื่อง
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : null}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                                <p className="font-medium text-slate-700">ยังไม่มีคำขอที่กำลังดำเนินการ</p>
                                <p className="mt-2 text-sm text-slate-500">
                                    เมื่อสร้างคำขอยืมใหม่ รายการจะแสดงที่นี่พร้อมสถานะการอนุมัติ
                                </p>
                                <Link href="/dashboard/borrow" className="brand-link mt-4 inline-block text-sm font-semibold">
                                    ไปยังหน้าสร้างคำขอ
                                </Link>
                            </div>
                        )}
                    </div>
                </GlassCard>

                <div className="space-y-6">
                    <GlassCard className="bg-white">
                        <div className="flex items-center gap-3">
                            <div className="tone-success flex h-11 w-11 items-center justify-center rounded-2xl">
                                <CalendarClock className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">เมนูด่วน</h3>
                                <p className="text-sm text-slate-500">เข้าถึงงานที่ใช้บ่อย</p>
                            </div>
                        </div>

                        <div className="mt-5 space-y-3">
                            <Link
                                href="/dashboard/borrow"
                                className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-700 transition hover:border-[#b7cfca] hover:bg-white"
                            >
                                ส่งคำขอยืมอุปกรณ์
                            </Link>
                            <Link
                                href="/dashboard/history"
                                className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-700 transition hover:border-[#b7cfca] hover:bg-white"
                            >
                                ดูประวัติการยืมทั้งหมด
                            </Link>
                        </div>
                    </GlassCard>

                    <GlassCard className="brand-panel">
                        <h3 className="text-lg font-semibold">ข้อแนะนำในการขอใช้อุปกรณ์</h3>
                        <p className="mt-3 text-sm leading-7 text-white/80">
                            ระบุวันใช้งาน พื้นที่ปฏิบัติงาน และผู้ประสานงานให้ครบถ้วน เพื่อช่วยให้การอนุมัติและการจัดเตรียมอุปกรณ์รวดเร็วขึ้น
                        </p>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
