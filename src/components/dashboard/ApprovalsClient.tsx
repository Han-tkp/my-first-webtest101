"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck, ClipboardCheck, ShieldAlert } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { EquipmentImage } from "@/components/ui/EquipmentImage";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { DateRangeFilter } from "@/components/ui/DateRangeFilter";
import { useListPagination } from "@/hooks/useListPagination";
import { isWithinDateRange } from "@/lib/date-range";

interface PendingUser {
    id: string;
    full_name: string;
    agency: string | null;
    email: string;
    phone: string | null;
    created_at: string;
}

interface PendingBorrow {
    id: number;
    user_name: string;
    purpose: string;
    borrow_date: string;
    due_date: string;
    notes: string | null;
    contact_name: string;
    contact_phone: string;
    equipment_ids: number[] | null;
}

interface PendingRepair {
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

interface ApprovalsClientProps {
    pendingUsers: PendingUser[];
    pendingBorrows: PendingBorrow[];
    pendingRepairs: PendingRepair[];
    equipmentMap: Record<number, EquipmentSummary>;
}

export function ApprovalsClient({
    pendingUsers,
    pendingBorrows,
    pendingRepairs,
    equipmentMap,
}: ApprovalsClientProps) {
    const router = useRouter();
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [userSearch, setUserSearch] = useState("");
    const [borrowSearch, setBorrowSearch] = useState("");
    const [repairSearch, setRepairSearch] = useState("");
    const [userDateFrom, setUserDateFrom] = useState("");
    const [userDateTo, setUserDateTo] = useState("");
    const [borrowDateFrom, setBorrowDateFrom] = useState("");
    const [borrowDateTo, setBorrowDateTo] = useState("");
    const [repairDateFrom, setRepairDateFrom] = useState("");
    const [repairDateTo, setRepairDateTo] = useState("");

    const handleAction = async (url: string, actionKey: string) => {
        setActionLoading(actionKey);
        setActionError(null);
        try {
            const res = await fetch(url, { method: "POST" });
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

    const filteredUsers = useMemo(() => {
        const keyword = userSearch.trim().toLowerCase();

        return pendingUsers.filter((user) => {
            const matchesSearch =
                !keyword ||
                [user.full_name, user.email, user.agency || "", user.phone || ""].some((value) =>
                    value.toLowerCase().includes(keyword),
                );

            return matchesSearch && isWithinDateRange(user.created_at, userDateFrom, userDateTo);
        });
    }, [pendingUsers, userDateFrom, userDateTo, userSearch]);

    const filteredBorrows = useMemo(() => {
        const keyword = borrowSearch.trim().toLowerCase();

        return pendingBorrows.filter((borrow) => {
            const equipmentText = (borrow.equipment_ids || [])
                .map((equipmentId) => {
                    const equipment = equipmentMap[equipmentId];
                    return `${equipment?.name || ""} ${equipment?.serial || ""}`.trim();
                })
                .join(" ");

            const matchesSearch =
                !keyword ||
                [
                    String(borrow.id),
                    borrow.user_name,
                    borrow.purpose,
                    borrow.contact_name,
                    borrow.contact_phone,
                    borrow.notes || "",
                    equipmentText,
                ].some((value) => value.toLowerCase().includes(keyword));

            return matchesSearch && isWithinDateRange(borrow.borrow_date, borrowDateFrom, borrowDateTo);
        });
    }, [borrowDateFrom, borrowDateTo, borrowSearch, equipmentMap, pendingBorrows]);

    const filteredRepairs = useMemo(() => {
        const keyword = repairSearch.trim().toLowerCase();

        return pendingRepairs.filter((repair) => {
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
    }, [equipmentMap, pendingRepairs, repairDateFrom, repairDateTo, repairSearch]);

    const userPagination = useListPagination(filteredUsers);
    const borrowPagination = useListPagination(filteredBorrows);
    const repairPagination = useListPagination(filteredRepairs);

    return (
        <div className="space-y-6 fade-in">
            {actionError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {actionError}
                    <button onClick={() => setActionError(null)} className="ml-3 font-semibold underline">ปิด</button>
                </div>
            ) : null}
            <GlassCard className="bg-white">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="tone-warning flex h-11 w-11 items-center justify-center rounded-2xl">
                            <ShieldAlert className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">อนุมัติบัญชีผู้ใช้งานใหม่</h2>
                            <p className="text-sm text-slate-500">ตรวจสอบข้อมูลผู้สมัครก่อนเปิดสิทธิ์ใช้งาน</p>
                        </div>
                    </div>
                    <span className="tone-warning rounded-full px-3 py-1 text-xs font-semibold">
                        {filteredUsers.length} รายการ
                    </span>
                </div>

                <ListToolbar
                    searchValue={userSearch}
                    onSearchChange={setUserSearch}
                    pageSize={userPagination.pageSize}
                    onPageSizeChange={userPagination.setPageSize}
                    resultCount={userPagination.totalItems}
                    placeholder="ค้นหาชื่อ อีเมล หน่วยงาน หรือเบอร์โทร"
                />

                <div className="mt-4">
                    <DateRangeFilter
                        from={userDateFrom}
                        to={userDateTo}
                        onFromChange={setUserDateFrom}
                        onToChange={setUserDateTo}
                        fromLabel="ลงทะเบียนตั้งแต่วันที่"
                        toLabel="ลงทะเบียนถึงวันที่"
                    />
                </div>

                <div className="mt-6 space-y-3 max-h-[min(60vh,600px)] overflow-y-auto pr-2 custom-scrollbar">
                    {userPagination.paginatedItems.length > 0 ? (
                        userPagination.paginatedItems.map((user) => (
                            <div key={user.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="space-y-1">
                                        <p className="font-semibold text-slate-900">{user.full_name}</p>
                                        <p className="text-sm text-slate-600">{user.agency || "ไม่ระบุหน่วยงาน"}</p>
                                        <p className="text-sm text-slate-600">{user.email}</p>
                                        <p className="text-sm text-slate-600">{user.phone || "-"}</p>
                                        <p className="text-xs text-slate-500">
                                            ลงทะเบียนวันที่ {new Date(user.created_at).toLocaleDateString("th-TH")}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => handleAction(`/api/users/${user.id}/approve`, `user-approve-${user.id}`)}
                                            disabled={actionLoading !== null}
                                            className="action-success px-4 py-2 text-sm disabled:opacity-50"
                                        >
                                            {actionLoading === `user-approve-${user.id}` ? "กำลังดำเนินการ..." : "อนุมัติ"}
                                        </button>
                                        <button
                                            onClick={() => handleAction(`/api/users/${user.id}/reject`, `user-reject-${user.id}`)}
                                            disabled={actionLoading !== null}
                                            className="action-danger px-4 py-2 text-sm disabled:opacity-50"
                                        >
                                            {actionLoading === `user-reject-${user.id}` ? "กำลังดำเนินการ..." : "ไม่อนุมัติ"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                            ไม่พบบัญชีที่ตรงกับเงื่อนไขการค้นหาและช่วงวันที่
                        </div>
                    )}
                </div>

                <div className="mt-6">
                    <PaginationControls
                        currentPage={userPagination.currentPage}
                        totalPages={userPagination.totalPages}
                        totalItems={userPagination.totalItems}
                        pageSize={userPagination.pageSize}
                        onPageChange={userPagination.setCurrentPage}
                    />
                </div>
            </GlassCard>

            <GlassCard className="bg-white">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="tone-info flex h-11 w-11 items-center justify-center rounded-2xl">
                            <ClipboardCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">อนุมัติคำขอยืมอุปกรณ์</h2>
                            <p className="text-sm text-slate-500">ทบทวนภารกิจ ช่วงใช้งาน และรายการอุปกรณ์ก่อนอนุมัติ</p>
                        </div>
                    </div>
                    <span className="tone-info rounded-full px-3 py-1 text-xs font-semibold">
                        {filteredBorrows.length} รายการ
                    </span>
                </div>

                <ListToolbar
                    searchValue={borrowSearch}
                    onSearchChange={setBorrowSearch}
                    pageSize={borrowPagination.pageSize}
                    onPageSizeChange={borrowPagination.setPageSize}
                    resultCount={borrowPagination.totalItems}
                    placeholder="ค้นหาผู้ยืม วัตถุประสงค์ ผู้ประสานงาน หรือชื่อเครื่อง"
                />

                <div className="mt-4">
                    <DateRangeFilter
                        from={borrowDateFrom}
                        to={borrowDateTo}
                        onFromChange={setBorrowDateFrom}
                        onToChange={setBorrowDateTo}
                        fromLabel="วันยืมตั้งแต่วันที่"
                        toLabel="วันยืมถึงวันที่"
                    />
                </div>

                <div className="mt-6 space-y-3 max-h-[min(60vh,600px)] overflow-y-auto pr-2 custom-scrollbar">
                    {borrowPagination.paginatedItems.length > 0 ? (
                        borrowPagination.paginatedItems.map((borrow) => (
                            <div key={borrow.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                    <div className="min-w-0 space-y-3">
                                        <div className="space-y-1">
                                            <p className="font-semibold text-slate-900">
                                                คำขอยืมเลขที่ {borrow.id} โดย {borrow.user_name}
                                            </p>
                                            <p className="text-sm text-slate-600">
                                                ใช้งานวันที่ {new Date(borrow.borrow_date).toLocaleDateString("th-TH")} ถึง{" "}
                                                {new Date(borrow.due_date).toLocaleDateString("th-TH")}
                                            </p>
                                            <p className="text-sm text-slate-600">วัตถุประสงค์: {borrow.purpose}</p>
                                            <p className="text-sm text-slate-600">
                                                ผู้ประสานงาน: {borrow.contact_name} ({borrow.contact_phone})
                                            </p>
                                            {borrow.notes ? (
                                                <p className="text-sm text-slate-600">หมายเหตุ: {borrow.notes}</p>
                                            ) : null}
                                        </div>

                                        <div className="grid gap-2 md:grid-cols-2">
                                            {(borrow.equipment_ids || []).map((equipmentId) => {
                                                const equipment = equipmentMap[equipmentId];
                                                return (
                                                    <div
                                                        key={equipmentId}
                                                        className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3"
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
                                                            <p className="truncate text-sm font-medium text-slate-800">
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
                                    </div>

                                    <div className="flex shrink-0 flex-wrap gap-2">
                                        <button
                                            onClick={() => handleAction(`/api/borrows/${borrow.id}/approve`, `borrow-approve-${borrow.id}`)}
                                            disabled={actionLoading !== null}
                                            className="action-success px-4 py-2 text-sm disabled:opacity-50"
                                        >
                                            {actionLoading === `borrow-approve-${borrow.id}` ? "กำลังดำเนินการ..." : "อนุมัติ"}
                                        </button>
                                        <button
                                            onClick={() => handleAction(`/api/borrows/${borrow.id}/reject`, `borrow-reject-${borrow.id}`)}
                                            disabled={actionLoading !== null}
                                            className="action-danger px-4 py-2 text-sm disabled:opacity-50"
                                        >
                                            {actionLoading === `borrow-reject-${borrow.id}` ? "กำลังดำเนินการ..." : "ไม่อนุมัติ"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                            ไม่พบคำขอยืมที่ตรงกับเงื่อนไขการค้นหาและช่วงวันที่
                        </div>
                    )}
                </div>

                <div className="mt-6">
                    <PaginationControls
                        currentPage={borrowPagination.currentPage}
                        totalPages={borrowPagination.totalPages}
                        totalItems={borrowPagination.totalItems}
                        pageSize={borrowPagination.pageSize}
                        onPageChange={borrowPagination.setCurrentPage}
                    />
                </div>
            </GlassCard>

            <GlassCard className="bg-white">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="tone-danger flex h-11 w-11 items-center justify-center rounded-2xl">
                            <CheckCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">อนุมัติงานซ่อมบำรุง</h2>
                            <p className="text-sm text-slate-500">ทบทวนอาการชำรุดก่อนส่งต่องานซ่อมให้ช่าง</p>
                        </div>
                    </div>
                    <span className="tone-danger rounded-full px-3 py-1 text-xs font-semibold">
                        {filteredRepairs.length} รายการ
                    </span>
                </div>

                <ListToolbar
                    searchValue={repairSearch}
                    onSearchChange={setRepairSearch}
                    pageSize={repairPagination.pageSize}
                    onPageSizeChange={repairPagination.setPageSize}
                    resultCount={repairPagination.totalItems}
                    placeholder="ค้นหาชื่ออุปกรณ์ อาการชำรุด หรือเลขครุภัณฑ์"
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

                <div className="mt-6 grid gap-3 lg:grid-cols-2 max-h-[min(60vh,600px)] overflow-y-auto pr-2 custom-scrollbar">
                    {repairPagination.paginatedItems.length > 0 ? (
                        repairPagination.paginatedItems.map((repair) => {
                            const equipment = repair.equipment_id ? equipmentMap[repair.equipment_id] : undefined;

                            return (
                                <div key={repair.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                                    <div className="flex items-start gap-3">
                                        <EquipmentImage
                                            src={equipment?.image_url}
                                            alt={repair.equipment_name}
                                            className="h-14 w-14 shrink-0 rounded-2xl border border-slate-200"
                                            imageClassName="object-cover"
                                            labelClassName="text-[10px]"
                                            sizes="56px"
                                        />
                                        <div className="min-w-0 space-y-1">
                                            <p className="break-words font-semibold text-slate-900">
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

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <button
                                            onClick={() => handleAction(`/api/repairs/${repair.id}/approve`, `repair-approve-${repair.id}`)}
                                            disabled={actionLoading !== null}
                                            className="action-success px-4 py-2 text-sm disabled:opacity-50"
                                        >
                                            {actionLoading === `repair-approve-${repair.id}` ? "กำลังดำเนินการ..." : "อนุมัติ"}
                                        </button>
                                        <button
                                            onClick={() => handleAction(`/api/repairs/${repair.id}/reject`, `repair-reject-${repair.id}`)}
                                            disabled={actionLoading !== null}
                                            className="action-danger px-4 py-2 text-sm disabled:opacity-50"
                                        >
                                            {actionLoading === `repair-reject-${repair.id}` ? "กำลังดำเนินการ..." : "ไม่อนุมัติ"}
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500 lg:col-span-2">
                            ไม่พบคำขอซ่อมที่ตรงกับเงื่อนไขการค้นหาและช่วงวันที่
                        </div>
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
        </div>
    );
}
