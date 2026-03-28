"use client";

import { useMemo, useState } from "react";
import { History, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { EquipmentImage } from "@/components/ui/EquipmentImage";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { DateRangeFilter } from "@/components/ui/DateRangeFilter";
import { useListPagination } from "@/hooks/useListPagination";
import { getEquipmentImageUrl } from "@/lib/equipment-catalog";

interface BorrowRecord {
    id: number;
    borrow_date: string;
    due_date: string;
    actual_return_date: string | null;
    purpose: string;
    status: string;
    equipment_ids: number[] | null;
    late_return_reason: string | null;
}

interface EquipmentSummary {
    name: string;
    image_url: string | null;
    serial: string;
    type: string;
}

interface StatusLabel {
    text: string;
    className: string;
}

interface HistoryClientProps {
    borrows: BorrowRecord[];
    equipmentMap: Record<number, EquipmentSummary>;
    statusLabels: Record<string, StatusLabel>;
}

interface EquipmentTypeGroup {
    type: string;
    count: number;
    imageUrl: string | null;
}

function isWithinRange(dateValue: string, from: string, to: string) {
    if (!dateValue) return false;
    if (from && dateValue < from) return false;
    if (to && dateValue > to) return false;
    return true;
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

export function HistoryClient({ borrows, equipmentMap, statusLabels }: HistoryClientProps) {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [cancellingId, setCancellingId] = useState<number | null>(null);

    const handleCancel = async (id: number) => {
        if (!confirm("คุณต้องการยกเลิกคำขอยืมนี้ใช่หรือไม่?")) return;

        setCancellingId(id);
        const response = await fetch(`/api/borrows/${id}/cancel`, { method: "POST" });
        
        if (!response.ok) {
            const result = await response.json().catch(() => ({ error: "ไม่สามารถยกเลิกได้" }));
            alert(result.error || "ไม่สามารถยกเลิกได้");
        } else {
            router.refresh();
        }
        setCancellingId(null);
    };

    const filteredBorrows = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return borrows.filter((borrow) => {
            const equipmentText = (borrow.equipment_ids || [])
                .map((equipmentId) => {
                    const equipment = equipmentMap[equipmentId];
                    return `${equipment?.name || ""} ${equipment?.serial || ""} ${equipment?.type || ""}`.trim();
                })
                .join(" ");

            const statusText = statusLabels[borrow.status]?.text || borrow.status;
            const matchesSearch =
                !keyword ||
                [
                    String(borrow.id),
                    borrow.purpose,
                    borrow.borrow_date,
                    borrow.due_date,
                    borrow.actual_return_date || "",
                    borrow.late_return_reason || "",
                    statusText,
                    equipmentText,
                ].some((value) => value.toLowerCase().includes(keyword));

            const matchesDate = isWithinRange(borrow.borrow_date, dateFrom, dateTo);
            return matchesSearch && matchesDate;
        });
    }, [borrows, dateFrom, dateTo, equipmentMap, search, statusLabels]);

    const pagination = useListPagination(filteredBorrows);

    return (
        <div className="space-y-6 fade-in">
            <div className="space-y-2">
                <p className="section-kicker">Borrow History</p>
                <h1 className="text-3xl font-semibold text-slate-900">ประวัติการยืม-คืน</h1>
                <p className="max-w-3xl text-sm leading-7 text-slate-600">
                    ตรวจสอบคำขอที่ผ่านมา สถานะการอนุมัติ วันรับคืน และรายการอุปกรณ์ที่เคยใช้งาน พร้อมค้นหาและกรองช่วงวันที่ใช้งานได้
                </p>
            </div>

            <GlassCard className="bg-white">
                <div className="mb-6 flex items-center gap-3">
                    <div className="tone-info flex h-11 w-11 items-center justify-center rounded-2xl">
                        <History className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">รายการย้อนหลังทั้งหมด</h2>
                        <p className="text-sm text-slate-500">เรียงจากรายการล่าสุดไปเก่าสุด</p>
                    </div>
                </div>

                <ListToolbar
                    searchValue={search}
                    onSearchChange={setSearch}
                    pageSize={pagination.pageSize}
                    onPageSizeChange={pagination.setPageSize}
                    resultCount={pagination.totalItems}
                    placeholder="ค้นหาเลขที่คำขอ วัตถุประสงค์ สถานะ หรือชื่ออุปกรณ์"
                />

                <div className="mt-4">
                    <DateRangeFilter from={dateFrom} to={dateTo} onFromChange={setDateFrom} onToChange={setDateTo} />
                </div>

                <div className="mt-6 space-y-4 max-h-[min(60vh,600px)] overflow-y-auto pr-2 custom-scrollbar">
                    {pagination.paginatedItems.length > 0 ? (
                        pagination.paginatedItems.map((borrow) => {
                            const equipmentGroups = groupEquipmentByType(borrow.equipment_ids, equipmentMap);
                            const status = statusLabels[borrow.status] || {
                                text: borrow.status,
                                className: "border border-slate-200 bg-slate-100 text-slate-700",
                            };

                            return (
                                <div key={borrow.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <p className="font-semibold text-slate-900">
                                                คำขอยืมเลขที่ {borrow.id}
                                                <span className="ml-2 text-sm font-normal text-slate-500">
                                                    ({Array.isArray(borrow.equipment_ids) ? borrow.equipment_ids.length : 0} รายการ)
                                                </span>
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
                                                {status.text}
                                            </span>
                                            {borrow.status === "pending_borrow_approval" && (
                                                <button
                                                    onClick={() => handleCancel(borrow.id)}
                                                    disabled={cancellingId === borrow.id}
                                                    className="flex items-center gap-1.5 text-xs font-medium text-rose-600 transition hover:text-rose-800 disabled:opacity-50"
                                                >
                                                    <XCircle className="h-3.5 w-3.5" />
                                                    {cancellingId === borrow.id ? "กำลังยกเลิก..." : "ยกเลิกคำขอ"}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {equipmentGroups.length > 0 ? (
                                        <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                                            {equipmentGroups.map((group) => (
                                                <div key={group.type} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3">
                                                    <EquipmentImage
                                                        src={getEquipmentImageUrl(group.type, group.imageUrl)}
                                                        alt={group.type}
                                                        className="h-12 w-12 shrink-0 rounded-2xl border border-slate-200"
                                                        imageClassName="object-cover"
                                                        labelClassName="text-[10px]"
                                                        sizes="48px"
                                                    />
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium text-slate-700">{group.type}</p>
                                                        <p className="truncate text-[11px] text-slate-500">{group.count} เครื่อง</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : null}

                                    <div className="mt-4 space-y-1 text-sm leading-7 text-slate-600">
                                        <p>วัตถุประสงค์: {borrow.purpose}</p>
                                        <p>
                                            วันที่ยืม {new Date(borrow.borrow_date).toLocaleDateString("th-TH")} | กำหนดคืน {new Date(borrow.due_date).toLocaleDateString("th-TH")}
                                        </p>
                                        {borrow.actual_return_date ? <p>วันที่คืน {new Date(borrow.actual_return_date).toLocaleDateString("th-TH")}</p> : null}
                                        {borrow.late_return_reason ? <p className="font-medium text-orange-700">เหตุผลคืนช้า: {borrow.late_return_reason}</p> : null}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center text-sm text-slate-500">
                            ไม่พบบันทึกที่ตรงกับเงื่อนไขการค้นหาและช่วงวันที่
                        </div>
                    )}
                </div>

                <div className="mt-6">
                    <PaginationControls
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.totalItems}
                        pageSize={pagination.pageSize}
                        onPageChange={pagination.setCurrentPage}
                    />
                </div>
            </GlassCard>
        </div>
    );
}
