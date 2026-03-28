"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardCheck, PackageCheck, Wrench } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { EquipmentImage } from "@/components/ui/EquipmentImage";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { DateRangeFilter } from "@/components/ui/DateRangeFilter";
import { useListPagination } from "@/hooks/useListPagination";
import { inspectionItems, repairRecommendationOptions } from "@/lib/equipment-inspection";
import { isWithinDateRange } from "@/lib/date-range";

interface BorrowQueueItem {
    id: number;
    user_name: string;
    borrow_date: string;
    due_date: string;
    equipment_ids: number[] | null;
}

interface RepairItem {
    id: number;
    equipment_id: number | null;
    equipment_name: string;
    damage_description: string;
    request_date: string;
}

interface EquipmentSummary {
    name: string;
    image_url: string | null;
    serial: string;
}

interface TechnicianClientProps {
    deliveryQueue: BorrowQueueItem[];
    returnQueue: BorrowQueueItem[];
    activeRepairs: RepairItem[];
    equipmentMap: Record<number, EquipmentSummary>;
    allEquipment: { id: number; name: string; serial: string }[];
}

function InspectionFields({ prefix }: { prefix: string }) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            {inspectionItems.map((item) => (
                <div key={`${prefix}${item.key}`}>
                    <label className="label">{item.label}</label>
                    <select name={`${prefix}${item.key}`} defaultValue="ready" className="form-select" required>
                        {item.options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            ))}
            <div className="md:col-span-2">
                <label className="label">หมายเหตุ</label>
                <textarea
                    name={`${prefix}notes`}
                    rows={3}
                    className="form-textarea"
                    placeholder="บันทึกผลการตรวจสภาพเพิ่มเติม"
                />
            </div>
        </div>
    );
}

function EquipmentList({
    equipmentIds,
    equipmentMap,
}: {
    equipmentIds: number[] | null;
    equipmentMap: Record<number, EquipmentSummary>;
}) {
    if (!equipmentIds || equipmentIds.length === 0) {
        return null;
    }

    return (
        <div className="mt-4 grid gap-2 md:grid-cols-2">
            {equipmentIds.map((equipmentId) => {
                const equipment = equipmentMap[equipmentId];

                return (
                    <div
                        key={equipmentId}
                        className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3"
                    >
                        <EquipmentImage
                            src={equipment?.image_url}
                            alt={equipment?.name || `อุปกรณ์ ${equipmentId}`}
                            className="h-12 w-12 shrink-0 rounded-2xl border border-slate-200"
                            imageClassName="object-cover"
                            labelClassName="text-[10px]"
                            sizes="48px"
                        />
                        <div className="min-w-0">
                            <p className="truncate text-sm text-slate-700">
                                {equipment?.name || `อุปกรณ์ #${equipmentId}`}
                            </p>
                            {equipment?.serial ? (
                                <p className="truncate text-xs text-slate-500">{equipment.serial}</p>
                            ) : null}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export function TechnicianClient({
    deliveryQueue,
    returnQueue,
    activeRepairs,
    equipmentMap,
    allEquipment,
}: TechnicianClientProps) {
    const router = useRouter();
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [showNewRepairModal, setShowNewRepairModal] = useState(false);
    const [newRepairLoading, setNewRepairLoading] = useState(false);
    const [newRepairError, setNewRepairError] = useState<string | null>(null);

    const handleFormAction = async (url: string, formElement: HTMLFormElement, actionKey: string, extraData?: Record<string, string>) => {
        setActionLoading(actionKey);
        setActionError(null);
        try {
            const formData = new FormData(formElement);
            if (extraData) {
                for (const [key, value] of Object.entries(extraData)) {
                    formData.set(key, value);
                }
            }
            const res = await fetch(url, { method: "POST", body: formData });
            if (!res.ok) {
                const data = await res.json().catch(() => ({ error: "เกิดข้อผิดพลาด" }));
                setActionError(data.error || "เกิดข้อผิดพลาด");
                return;
            }
            router.refresh();
        } catch {
            setActionError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
        } finally {
            setActionLoading(null);
        }
    };

    const handleCreateRepair = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setNewRepairLoading(true);
        setNewRepairError(null);

        const formData = new FormData(e.currentTarget);
        const equipment_id = formData.get("equipment_id");
        const damage_description = formData.get("damage_description");

        if (!equipment_id || !damage_description) {
            setNewRepairError("กรุณากรอกข้อมูลให้ครบถ้วน");
            setNewRepairLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/repairs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ equipment_id: Number(equipment_id), damage_description }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({ error: "ไม่สามารถสร้างรายการแจ้งซ่อมได้" }));
                setNewRepairError(data.error || "ไม่สามารถสร้างรายการแจ้งซ่อมได้");
                setNewRepairLoading(false);
                return;
            }

            setShowNewRepairModal(false);
            router.refresh();
        } catch {
            setNewRepairError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
        } finally {
            setNewRepairLoading(false);
        }
    };

    const [deliverySearch, setDeliverySearch] = useState("");
    const [returnSearch, setReturnSearch] = useState("");
    const [repairSearch, setRepairSearch] = useState("");
    const [deliveryDateFrom, setDeliveryDateFrom] = useState("");
    const [deliveryDateTo, setDeliveryDateTo] = useState("");
    const [returnDateFrom, setReturnDateFrom] = useState("");
    const [returnDateTo, setReturnDateTo] = useState("");
    const [repairDateFrom, setRepairDateFrom] = useState("");
    const [repairDateTo, setRepairDateTo] = useState("");

    const filteredDeliveryQueue = useMemo(() => {
        const keyword = deliverySearch.trim().toLowerCase();

        return deliveryQueue.filter((borrow) => {
            const equipmentText = (borrow.equipment_ids || [])
                .map((equipmentId) => {
                    const equipment = equipmentMap[equipmentId];
                    return `${equipment?.name || ""} ${equipment?.serial || ""}`.trim();
                })
                .join(" ");

            const matchesSearch =
                !keyword ||
                [String(borrow.id), borrow.user_name, borrow.borrow_date, borrow.due_date, equipmentText].some(
                    (value) => value.toLowerCase().includes(keyword),
                );

            return matchesSearch && isWithinDateRange(borrow.borrow_date, deliveryDateFrom, deliveryDateTo);
        });
    }, [deliveryDateFrom, deliveryDateTo, deliveryQueue, deliverySearch, equipmentMap]);

    const filteredReturnQueue = useMemo(() => {
        const keyword = returnSearch.trim().toLowerCase();

        return returnQueue.filter((borrow) => {
            const equipmentText = (borrow.equipment_ids || [])
                .map((equipmentId) => {
                    const equipment = equipmentMap[equipmentId];
                    return `${equipment?.name || ""} ${equipment?.serial || ""}`.trim();
                })
                .join(" ");

            const matchesSearch =
                !keyword ||
                [String(borrow.id), borrow.user_name, borrow.borrow_date, borrow.due_date, equipmentText].some(
                    (value) => value.toLowerCase().includes(keyword),
                );

            return matchesSearch && isWithinDateRange(borrow.due_date, returnDateFrom, returnDateTo);
        });
    }, [equipmentMap, returnDateFrom, returnDateTo, returnQueue, returnSearch]);

    const filteredRepairs = useMemo(() => {
        const keyword = repairSearch.trim().toLowerCase();

        return activeRepairs.filter((repair) => {
            const equipment = repair.equipment_id ? equipmentMap[repair.equipment_id] : undefined;
            const matchesSearch =
                !keyword ||
                [
                    String(repair.id),
                    repair.equipment_name,
                    repair.damage_description,
                    equipment?.serial || "",
                ].some((value) => value.toLowerCase().includes(keyword));

            return matchesSearch && isWithinDateRange(repair.request_date, repairDateFrom, repairDateTo);
        });
    }, [activeRepairs, equipmentMap, repairDateFrom, repairDateTo, repairSearch]);

    const deliveryPagination = useListPagination(filteredDeliveryQueue);
    const returnPagination = useListPagination(filteredReturnQueue);
    const repairPagination = useListPagination(filteredRepairs);

    return (
        <div className="grid gap-6 xl:grid-cols-2 2xl:grid-cols-3 fade-in">
            {actionError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 xl:col-span-2 2xl:col-span-3">
                    {actionError}
                    <button onClick={() => setActionError(null)} className="ml-3 font-semibold underline">ปิด</button>
                </div>
            ) : null}
            <GlassCard className="bg-white">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="tone-info flex h-11 w-11 items-center justify-center rounded-2xl">
                            <PackageCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">รายการรอส่งมอบ</h2>
                            <p className="text-sm text-slate-500">บันทึกผลตรวจสภาพก่อนจ่ายเครื่องให้ผู้ใช้งาน</p>
                        </div>
                    </div>
                    <span className="tone-info rounded-full px-3 py-1 text-xs font-semibold">
                        {filteredDeliveryQueue.length} รายการ
                    </span>
                </div>

                <ListToolbar
                    searchValue={deliverySearch}
                    onSearchChange={setDeliverySearch}
                    pageSize={deliveryPagination.pageSize}
                    onPageSizeChange={deliveryPagination.setPageSize}
                    resultCount={deliveryPagination.totalItems}
                    placeholder="ค้นหาผู้รับมอบ อุปกรณ์ หรือเลขที่คำขอ"
                />

                <div className="mt-4">
                    <DateRangeFilter
                        from={deliveryDateFrom}
                        to={deliveryDateTo}
                        onFromChange={setDeliveryDateFrom}
                        onToChange={setDeliveryDateTo}
                        fromLabel="วันยืมตั้งแต่วันที่"
                        toLabel="วันยืมถึงวันที่"
                    />
                </div>

                <div className="mt-6 space-y-3 max-h-[min(60vh,600px)] overflow-y-auto pr-2 custom-scrollbar">
                    {deliveryPagination.paginatedItems.length > 0 ? (
                        deliveryPagination.paginatedItems.map((borrow) => (
                            <div key={borrow.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                                <p className="font-semibold text-slate-900">ส่งมอบให้ {borrow.user_name}</p>
                                <p className="mt-1 text-sm text-slate-600">
                                    คำขอ {borrow.id} | วันยืม {new Date(borrow.borrow_date).toLocaleDateString("th-TH")}
                                </p>

                                <EquipmentList equipmentIds={borrow.equipment_ids} equipmentMap={equipmentMap} />

                                <details className="mt-4 rounded-2xl border border-slate-200 bg-white">
                                    <summary className="brand-link cursor-pointer list-none px-4 py-3 text-sm font-semibold">
                                        แบบประเมินก่อนส่งมอบ
                                    </summary>
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            handleFormAction(`/api/borrows/${borrow.id}/deliver`, e.currentTarget, `deliver-${borrow.id}`);
                                        }}
                                        className="space-y-4 border-t border-slate-200 px-4 py-4"
                                    >
                                        <InspectionFields prefix="pre_" />
                                        <button disabled={actionLoading !== null} className="action-primary w-full px-4 py-2.5 text-sm disabled:opacity-50">
                                            {actionLoading === `deliver-${borrow.id}` ? "กำลังดำเนินการ..." : "บันทึกผลตรวจและยืนยันการส่งมอบ"}
                                        </button>
                                    </form>
                                </details>
                            </div>
                        ))
                    ) : (
                        <p className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                            ไม่พบรายการรอส่งมอบที่ตรงกับเงื่อนไขการค้นหาและช่วงวันที่
                        </p>
                    )}
                </div>

                <div className="mt-6">
                    <PaginationControls
                        currentPage={deliveryPagination.currentPage}
                        totalPages={deliveryPagination.totalPages}
                        totalItems={deliveryPagination.totalItems}
                        pageSize={deliveryPagination.pageSize}
                        onPageChange={deliveryPagination.setCurrentPage}
                    />
                </div>
            </GlassCard>

            <GlassCard className="bg-white">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="tone-warning flex h-11 w-11 items-center justify-center rounded-2xl">
                            <ClipboardCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">รายการรอตรวจรับคืน</h2>
                            <p className="text-sm text-slate-500">บันทึกผลประเมินหลังใช้งานและสภาพเครื่องตอนรับคืน</p>
                        </div>
                    </div>
                    <span className="tone-warning rounded-full px-3 py-1 text-xs font-semibold">
                        {filteredReturnQueue.length} รายการ
                    </span>
                </div>

                <ListToolbar
                    searchValue={returnSearch}
                    onSearchChange={setReturnSearch}
                    pageSize={returnPagination.pageSize}
                    onPageSizeChange={returnPagination.setPageSize}
                    resultCount={returnPagination.totalItems}
                    placeholder="ค้นหาผู้ยืม อุปกรณ์ หรือเลขที่คำขอ"
                />

                <div className="mt-4">
                    <DateRangeFilter
                        from={returnDateFrom}
                        to={returnDateTo}
                        onFromChange={setReturnDateFrom}
                        onToChange={setReturnDateTo}
                        fromLabel="กำหนดคืนตั้งแต่วันที่"
                        toLabel="กำหนดคืนถึงวันที่"
                    />
                </div>

                <div className="mt-6 space-y-3 max-h-[min(60vh,600px)] overflow-y-auto pr-2 custom-scrollbar">
                    {returnPagination.paginatedItems.length > 0 ? (
                        returnPagination.paginatedItems.map((borrow) => {
                            const isLate = new Date() > new Date(borrow.due_date);

                            return (
                                <div
                                    key={borrow.id}
                                    className={`rounded-3xl border p-5 ${
                                        isLate ? "border-rose-200 bg-rose-50" : "border-slate-200 bg-slate-50"
                                    }`}
                                >
                                    <p className="font-semibold text-slate-900">{borrow.user_name}</p>
                                    <p className="mt-1 text-sm text-slate-600">
                                        คำขอ {borrow.id} | กำหนดคืน {new Date(borrow.due_date).toLocaleDateString("th-TH")}
                                    </p>
                                    {isLate ? (
                                        <p className="mt-2 text-xs font-semibold text-rose-700">รายการนี้เลยกำหนดส่งคืนแล้ว</p>
                                    ) : null}

                                    <EquipmentList equipmentIds={borrow.equipment_ids} equipmentMap={equipmentMap} />

                                    <details className="mt-4 rounded-2xl border border-slate-200 bg-white">
                                        <summary className="brand-link cursor-pointer list-none px-4 py-3 text-sm font-semibold">
                                            แบบประเมินหลังใช้งาน / หลังคืน
                                        </summary>
                                        <form
                                            id={`return-form-${borrow.id}`}
                                            className="space-y-4 border-t border-slate-200 px-4 py-4"
                                            onSubmit={(e) => e.preventDefault()}
                                        >
                                            <InspectionFields prefix="post_" />
                                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                <button
                                                    type="button"
                                                    disabled={actionLoading !== null}
                                                    onClick={() => {
                                                        const form = document.getElementById(`return-form-${borrow.id}`) as HTMLFormElement;
                                                        handleFormAction(`/api/borrows/${borrow.id}/return`, form, `return-normal-${borrow.id}`, { condition: "normal" });
                                                    }}
                                                    className="action-success w-full px-3 py-2.5 text-sm disabled:opacity-50"
                                                >
                                                    {actionLoading === `return-normal-${borrow.id}` ? "กำลังดำเนินการ..." : "รับคืนปกติ"}
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={actionLoading !== null}
                                                    onClick={() => {
                                                        const form = document.getElementById(`return-form-${borrow.id}`) as HTMLFormElement;
                                                        handleFormAction(`/api/borrows/${borrow.id}/return`, form, `return-damaged-${borrow.id}`, { condition: "damaged" });
                                                    }}
                                                    className="action-danger w-full px-3 py-2.5 text-sm disabled:opacity-50"
                                                >
                                                    {actionLoading === `return-damaged-${borrow.id}` ? "กำลังดำเนินการ..." : "รับคืนชำรุด"}
                                                </button>
                                            </div>
                                        </form>
                                    </details>
                                </div>
                            );
                        })
                    ) : (
                        <p className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                            ไม่พบรายการรอตรวจรับคืนที่ตรงกับเงื่อนไขการค้นหาและช่วงวันที่
                        </p>
                    )}
                </div>

                <div className="mt-6">
                    <PaginationControls
                        currentPage={returnPagination.currentPage}
                        totalPages={returnPagination.totalPages}
                        totalItems={returnPagination.totalItems}
                        pageSize={returnPagination.pageSize}
                        onPageChange={returnPagination.setCurrentPage}
                    />
                </div>
            </GlassCard>

            <GlassCard className="bg-white">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="tone-info flex h-11 w-11 items-center justify-center rounded-2xl">
                            <Wrench className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">งานซ่อมที่กำลังดำเนินการ</h2>
                            <p className="text-sm text-slate-500">บันทึกรายละเอียดค่าใช้จ่ายและผลประเมินหลังซ่อม</p>
                        </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <span className="tone-info rounded-full px-3 py-1 text-xs font-semibold">
                            {filteredRepairs.length} รายการ
                        </span>
                        <button
                            onClick={() => setShowNewRepairModal(true)}
                            className="action-primary shrink-0 px-3 py-1.5 text-xs font-medium"
                        >
                            + แจ้งซ่อมใหม่
                        </button>
                    </div>
                </div>

                <ListToolbar
                    searchValue={repairSearch}
                    onSearchChange={setRepairSearch}
                    pageSize={repairPagination.pageSize}
                    onPageSizeChange={repairPagination.setPageSize}
                    resultCount={repairPagination.totalItems}
                    placeholder="ค้นหางานซ่อม ชื่ออุปกรณ์ หรือเลขครุภัณฑ์"
                />

                <div className="mt-4">
                    <DateRangeFilter
                        from={repairDateFrom}
                        to={repairDateTo}
                        onFromChange={setRepairDateFrom}
                        onToChange={setRepairDateTo}
                        fromLabel="แจ้งซ่อมตั้งแต่วันที่"
                        toLabel="แจ้งซ่อมถึงวันที่"
                    />
                </div>

                <div className="mt-6 space-y-3 max-h-[min(60vh,600px)] overflow-y-auto pr-2 custom-scrollbar">
                    {repairPagination.paginatedItems.length > 0 ? (
                        repairPagination.paginatedItems.map((repair) => {
                            const equipment = repair.equipment_id ? equipmentMap[repair.equipment_id] : undefined;

                            return (
                                <div key={repair.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <EquipmentImage
                                            src={equipment?.image_url}
                                            alt={repair.equipment_name}
                                            className="h-12 w-12 shrink-0 rounded-2xl border border-slate-200"
                                            imageClassName="object-cover"
                                            labelClassName="text-[10px]"
                                            sizes="48px"
                                        />
                                        <div className="min-w-0">
                                            <p className="wrap-break-word font-semibold text-slate-900">

                                                {repair.equipment_name}
                                            </p>
                                            {equipment?.serial ? (
                                                <p className="text-xs text-slate-500">{equipment.serial}</p>
                                            ) : null}
                                            <p className="text-sm text-slate-600">อาการ: {repair.damage_description}</p>
                                            <p className="text-xs text-slate-500">
                                                วันที่แจ้ง {new Date(repair.request_date).toLocaleDateString("th-TH")}
                                            </p>
                                        </div>
                                    </div>

                                    <details className="mt-4 rounded-2xl border border-slate-200 bg-white">
                                        <summary className="brand-link cursor-pointer list-none px-4 py-3 text-sm font-semibold">
                                            แบบบันทึกรายละเอียดการซ่อม
                                        </summary>
                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                handleFormAction(`/api/repairs/${repair.id}/complete`, e.currentTarget, `repair-complete-${repair.id}`);
                                            }}
                                            className="space-y-4 border-t border-slate-200 px-4 py-4"
                                        >
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div>
                                                    <label className="label">หน่วยงานเจ้าของเครื่อง</label>
                                                    <input
                                                        name="repair_location"
                                                        defaultValue=""
                                                        className="form-input"
                                                        placeholder="ระบุหน่วยงานหรือพื้นที่"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="label">ค่าซ่อมรวม (บาท)</label>
                                                    <input
                                                        name="cost"
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        inputMode="decimal"
                                                        placeholder="0.00"
                                                        className="form-input"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <p className="label mb-0">รายการซ่อม</p>
                                                {[1, 2, 3].map((row) => (
                                                    <div key={row} className="grid gap-3 md:grid-cols-[1.2fr_0.6fr_0.6fr]">
                                                        <input
                                                            name={`repair_item_${row}`}
                                                            className="form-input"
                                                            placeholder={`รายการชำรุด ${row}`}
                                                        />
                                                        <input
                                                            name={`parts_cost_${row}`}
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            inputMode="decimal"
                                                            className="form-input"
                                                            placeholder="ราคาอะไหล่"
                                                        />
                                                        <input
                                                            name={`labor_cost_${row}`}
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            inputMode="decimal"
                                                            className="form-input"
                                                            placeholder="ค่าแรง"
                                                        />
                                                    </div>
                                                ))}
                                            </div>

                                            <div>
                                                <label className="label">ความเห็นด้านเครื่อง</label>
                                                <select name="repair_recommendation" className="form-select" defaultValue="">
                                                    <option value="" disabled>
                                                        เลือกผลการประเมิน
                                                    </option>
                                                    {repairRecommendationOptions.map((option) => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="label">หมายเหตุเพิ่มเติม</label>
                                                <textarea
                                                    name="repair_notes"
                                                    rows={3}
                                                    className="form-textarea"
                                                    placeholder="บันทึกผลการซ่อม ข้อจำกัด หรือข้อเสนอแนะเพิ่มเติม"
                                                />
                                            </div>

                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div>
                                                    <label className="label">ผู้ซ่อม</label>
                                                    <input name="repairer_name" className="form-input" placeholder="ชื่อผู้ซ่อม" />
                                                </div>
                                                <div>
                                                    <label className="label">ผู้รับซ่อม / ผู้รับทราบ</label>
                                                    <input
                                                        name="receiver_name"
                                                        className="form-input"
                                                        placeholder="ชื่อผู้รับซ่อมหรือผู้รับทราบ"
                                                    />
                                                </div>
                                            </div>

                                            <button disabled={actionLoading !== null} className="action-primary w-full px-4 py-2.5 text-sm disabled:opacity-50">
                                                {actionLoading === `repair-complete-${repair.id}` ? "กำลังดำเนินการ..." : "บันทึกซ่อมเสร็จ"}
                                            </button>
                                        </form>
                                    </details>
                                </div>
                            );
                        })
                    ) : (
                        <p className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                            ไม่พบงานซ่อมที่ตรงกับเงื่อนไขการค้นหาและช่วงวันที่
                        </p>
                    )}
                </div>

                <div className="mt-6">
                    <PaginationControls
                        currentPage={repairPagination.currentPage}
                        totalPages={repairPagination.totalPages}
                        totalItems={repairPagination.totalItems}
                        pageSize={repairPagination.pageSize}
                        onPageChange={repairPagination.setCurrentPage}
                    />
                </div>
            </GlassCard>

            {showNewRepairModal ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setShowNewRepairModal(false)} />
                    <div className="glass-card relative w-full max-w-xl space-y-5 bg-white p-6">
                        <h3 className="text-xl font-bold">+ แจ้งซ่อมใหม่</h3>
                        <p className="text-sm text-slate-500">สร้างรายการแจ้งซ่อมใหม่สำหรับอุปกรณ์ที่ชำรุด</p>

                        {newRepairError ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{newRepairError}</div> : null}

                        <form onSubmit={handleCreateRepair} className="space-y-4">
                            <div>
                                <label className="label">อุปกรณ์ที่ชำรุด</label>
                                <select name="equipment_id" className="form-select w-full" required defaultValue="">
                                    <option value="" disabled>เลือกอุปกรณ์...</option>
                                    {allEquipment.map((eq) => (
                                        <option key={eq.id} value={eq.id}>
                                            {eq.name} {eq.serial ? `(${eq.serial})` : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="label">อาการชำรุด / ปัญหาที่พบ</label>
                                <textarea name="damage_description" className="form-textarea w-full" rows={4} placeholder="อธิบายอาการชำรุดหรือร่องรอยความเสียหาย" required />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="submit" disabled={newRepairLoading} className="action-primary flex-1 px-4 py-2.5 disabled:opacity-50">
                                    {newRepairLoading ? "กำลังดำเนินการ..." : "ยืนยันการแจ้งซ่อม"}
                                </button>
                                <button type="button" onClick={() => setShowNewRepairModal(false)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50">
                                    ยกเลิก
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
