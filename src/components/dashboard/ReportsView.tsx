"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, FileSpreadsheet, Wrench } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { BentoGrid, BentoItem } from "@/components/ui/BentoGrid";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { DateRangeFilter } from "@/components/ui/DateRangeFilter";
import { useListPagination } from "@/hooks/useListPagination";
import { isWithinDateRange } from "@/lib/date-range";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface EquipmentItem {
    id: number;
    name: string;
    type: string;
    serial: string;
    status: string;
}

interface Borrow {
    id: number;
    user_name: string;
    borrow_date: string;
    due_date: string;
    actual_return_date: string | null;
    purpose: string;
    status: string;
    equipment_ids: number[];
    contact_name: string;
    contact_phone: string;
}

interface Repair {
    id: number;
    equipment_name: string;
    damage_description: string;
    status: string;
    cost: number | null;
    request_date: string;
    repair_date: string | null;
}

const borrowStatusLabels: Record<string, string> = {
    pending_borrow_approval: "รออนุมัติยืม",
    pending_delivery: "รอส่งมอบ",
    borrowed: "กำลังใช้งาน",
    returned: "คืนแล้ว",
    returned_damaged: "คืนพร้อมแจ้งชำรุด",
    returned_late: "คืนล่าช้า",
    returned_early: "คืนก่อนกำหนด",
    repair_rejected: "ไม่อนุมัติ",
    cancelled: "ยกเลิก",
};

const repairStatusLabels: Record<string, string> = {
    pending_repair_approval: "รออนุมัติซ่อม",
    repair_approved: "กำลังซ่อม",
    completed: "ซ่อมเสร็จ",
    rejected: "ไม่อนุมัติ",
};

const BORROW_STATUS_COLORS: Record<string, string> = {
    pending_borrow_approval: "rgba(245, 158, 11, 0.8)",
    pending_delivery: "rgba(14, 165, 233, 0.8)",
    borrowed: "rgba(16, 185, 129, 0.8)",
    returned: "rgba(100, 116, 139, 0.7)",
    returned_damaged: "rgba(239, 68, 68, 0.8)",
    returned_late: "rgba(234, 88, 12, 0.8)",
    returned_early: "rgba(168, 85, 247, 0.7)",
    repair_rejected: "rgba(127, 29, 29, 0.7)",
    cancelled: "rgba(148, 163, 184, 0.5)",
};

const REPAIR_STATUS_COLORS: Record<string, string> = {
    pending_repair_approval: "rgba(245, 158, 11, 0.8)",
    repair_approved: "rgba(14, 165, 233, 0.8)",
    completed: "rgba(16, 185, 129, 0.8)",
    rejected: "rgba(239, 68, 68, 0.8)",
};

function escapeCsvValue(value: string | number | null | undefined) {
    const safeValue = value === null || value === undefined ? "" : String(value);
    return `"${safeValue.replaceAll('"', '""')}"`;
}

function downloadCsv(filename: string, rows: string[]) {
    const blob = new Blob(["\uFEFF" + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
}

export default function ReportsView() {
    const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
    const [borrows, setBorrows] = useState<Borrow[]>([]);
    const [repairs, setRepairs] = useState<Repair[]>([]);
    const [isExporting, setIsExporting] = useState(false);
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [borrowSearch, setBorrowSearch] = useState("");
    const [repairSearch, setRepairSearch] = useState("");
    const [borrowViewMode, setBorrowViewMode] = useState<"grid" | "table">("table");
    const [repairViewMode, setRepairViewMode] = useState<"grid" | "table">("table");

    useEffect(() => {
        Promise.all([
            fetch("/api/equipment", { cache: "no-store" }),
            fetch("/api/borrows", { cache: "no-store" }),
            fetch("/api/repairs", { cache: "no-store" }),
        ]).then(async ([equipmentResponse, borrowResponse, repairResponse]) => {
            if (equipmentResponse.ok) {
                setEquipment(await equipmentResponse.json());
            }

            if (borrowResponse.ok) {
                setBorrows(await borrowResponse.json());
            }

            if (repairResponse.ok) {
                setRepairs(await repairResponse.json());
            }
        });
    }, []);

    const filteredBorrows = useMemo(() => {
        const keyword = borrowSearch.trim().toLowerCase();

        return borrows.filter((borrow) => {
            const matchesSearch =
                !keyword ||
                [
                    String(borrow.id),
                    borrow.user_name,
                    borrow.purpose,
                    borrow.contact_name,
                    borrow.contact_phone,
                    borrowStatusLabels[borrow.status] || borrow.status,
                ].some((value) => value.toLowerCase().includes(keyword));

            return matchesSearch && isWithinDateRange(borrow.borrow_date, dateFrom, dateTo);
        });
    }, [borrowSearch, borrows, dateFrom, dateTo]);

    const filteredRepairs = useMemo(() => {
        const keyword = repairSearch.trim().toLowerCase();

        return repairs.filter((repair) => {
            const matchesSearch =
                !keyword ||
                [
                    String(repair.id),
                    repair.equipment_name,
                    repair.damage_description,
                    repairStatusLabels[repair.status] || repair.status,
                ].some((value) => value.toLowerCase().includes(keyword));

            return matchesSearch && isWithinDateRange(repair.request_date, dateFrom, dateTo);
        });
    }, [dateFrom, dateTo, repairSearch, repairs]);

    const borrowPagination = useListPagination(filteredBorrows);
    const repairPagination = useListPagination(filteredRepairs);

    const totalEquipment = equipment.length;
    const availableEquipment = equipment.filter((item) => item.status === "available").length;
    const totalRepairCost = filteredRepairs.reduce((sum, repair) => sum + (Number(repair.cost) || 0), 0);
    const lateReturns = filteredBorrows.filter((borrow) => borrow.status === "returned_late").length;
    const completedRepairs = filteredRepairs.filter((repair) => repair.status === "completed").length;

    // ===== Chart Data =====
    const borrowStatusChartData = useMemo(() => {
        const counts: Record<string, number> = {};
        filteredBorrows.forEach((b) => {
            const key = b.status;
            counts[key] = (counts[key] || 0) + 1;
        });

        const labels = Object.keys(counts).map((key) => borrowStatusLabels[key] || key);
        const data = Object.values(counts);
        const backgroundColor = Object.keys(counts).map((key) => BORROW_STATUS_COLORS[key] || "rgba(148, 163, 184, 0.5)");

        return {
            labels,
            datasets: [{ data, backgroundColor, borderWidth: 0 }],
        };
    }, [filteredBorrows]);

    const repairStatusChartData = useMemo(() => {
        const counts: Record<string, number> = {};
        const costs: Record<string, number> = {};
        filteredRepairs.forEach((r) => {
            const key = r.status;
            counts[key] = (counts[key] || 0) + 1;
            costs[key] = (costs[key] || 0) + (Number(r.cost) || 0);
        });

        const labels = Object.keys(counts).map((key) => repairStatusLabels[key] || key);
        const backgroundColor = Object.keys(counts).map((key) => REPAIR_STATUS_COLORS[key] || "rgba(148, 163, 184, 0.5)");

        return {
            labels,
            datasets: [
                {
                    label: "จำนวน (รายการ)",
                    data: Object.values(counts),
                    backgroundColor,
                    borderRadius: 8,
                },
                {
                    label: "ค่าซ่อม (บาท)",
                    data: Object.keys(counts).map((key) => costs[key] || 0),
                    backgroundColor: Object.keys(counts).map((key) => {
                        const base = REPAIR_STATUS_COLORS[key] || "rgba(148, 163, 184, 0.5)";
                        return base.replace(/[\d.]+\)$/, "0.4)");
                    }),
                    borderRadius: 8,
                },
            ],
        };
    }, [filteredRepairs]);

    const equipmentStatusChartData = useMemo(() => {
        const counts: Record<string, number> = {};
        equipment.forEach((item) => {
            counts[item.status] = (counts[item.status] || 0) + 1;
        });

        const statusMap: Record<string, string> = {
            available: "ว่าง",
            reserved: "จองแล้ว",
            borrowed: "ถูกยืม",
            under_maintenance: "ซ่อมบำรุง",
            pending_repair_approval: "รออนุมัติซ่อม",
        };

        const colorMap: Record<string, string> = {
            available: "rgba(16, 185, 129, 0.8)",
            reserved: "rgba(14, 165, 233, 0.8)",
            borrowed: "rgba(99, 102, 241, 0.8)",
            under_maintenance: "rgba(245, 158, 11, 0.8)",
            pending_repair_approval: "rgba(239, 68, 68, 0.8)",
        };

        const labels = Object.keys(counts).map((key) => statusMap[key] || key);
        const data = Object.values(counts);
        const backgroundColor = Object.keys(counts).map((key) => colorMap[key] || "rgba(148, 163, 184, 0.5)");

        return {
            labels,
            datasets: [{ data, backgroundColor, borderWidth: 0 }],
        };
    }, [equipment]);

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom" as const,
                labels: {
                    padding: 16,
                    usePointStyle: true,
                    pointStyleWidth: 10,
                    font: { size: 12, family: "'Noto Sans Thai', sans-serif" },
                },
            },
        },
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top" as const,
                labels: {
                    padding: 16,
                    usePointStyle: true,
                    font: { size: 12, family: "'Noto Sans Thai', sans-serif" },
                },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { font: { size: 11, family: "'Noto Sans Thai', sans-serif" } },
            },
            y: {
                beginAtZero: true,
                grid: { color: "rgba(148, 163, 184, 0.15)" },
                ticks: { font: { size: 11 } },
            },
        },
    };

    const exportBorrowsCsv = () => {
        setIsExporting(true);

        const rows = [
            [
                "รหัส",
                "ผู้ยืม",
                "วันที่ยืม",
                "กำหนดคืน",
                "วันที่คืนจริง",
                "วัตถุประสงค์",
                "สถานะ",
                "จำนวนอุปกรณ์",
                "ผู้ประสานงาน",
                "เบอร์โทร",
            ].join(","),
            ...filteredBorrows.map((borrow) =>
                [
                    borrow.id,
                    escapeCsvValue(borrow.user_name),
                    borrow.borrow_date,
                    borrow.due_date,
                    borrow.actual_return_date || "-",
                    escapeCsvValue(borrow.purpose),
                    escapeCsvValue(borrowStatusLabels[borrow.status] || borrow.status),
                    Array.isArray(borrow.equipment_ids) ? borrow.equipment_ids.length : 0,
                    escapeCsvValue(borrow.contact_name),
                    escapeCsvValue(borrow.contact_phone),
                ].join(","),
            ),
        ];

        downloadCsv(`borrows_report_${new Date().toISOString().split("T")[0]}.csv`, rows);
        setIsExporting(false);
    };

    const exportRepairsCsv = () => {
        setIsExporting(true);

        const rows = [
            ["รหัส", "ชื่ออุปกรณ์", "อาการชำรุด", "สถานะ", "ค่าซ่อม", "วันที่แจ้ง", "วันที่ซ่อมเสร็จ"].join(","),
            ...filteredRepairs.map((repair) =>
                [
                    repair.id,
                    escapeCsvValue(repair.equipment_name),
                    escapeCsvValue(repair.damage_description),
                    escapeCsvValue(repairStatusLabels[repair.status] || repair.status),
                    repair.cost || 0,
                    repair.request_date,
                    repair.repair_date || "-",
                ].join(","),
            ),
        ];

        downloadCsv(`repairs_report_${new Date().toISOString().split("T")[0]}.csv`, rows);
        setIsExporting(false);
    };

    return (
        <div className="space-y-5 fade-in">
            <div className="space-y-2">
                <p className="section-kicker">Reporting</p>
                <h1 className="text-2xl font-semibold text-slate-900">รายงานและสถิติการใช้งาน</h1>
                <p className="max-w-3xl text-sm leading-7 text-slate-600">
                    สรุปภาพรวมการใช้อุปกรณ์ คำขอยืม และงานซ่อมบำรุง โดยสามารถกรองช่วงวันที่ก่อนดูตัวเลขหรือส่งออก CSV ได้
                </p>
            </div>

            <DateRangeFilter
                from={dateFrom}
                to={dateTo}
                onFromChange={setDateFrom}
                onToChange={setDateTo}
                fromLabel="รายงานตั้งแต่วันที่"
                toLabel="รายงานถึงวันที่"
            />

            <BentoGrid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <BentoItem className="border border-slate-200 bg-white">
                    <p className="text-xs text-slate-500">ครุภัณฑ์ทั้งหมดในระบบ</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{totalEquipment}</p>
                    <p className="mt-1 text-xs text-slate-500">พร้อมใช้งาน {availableEquipment} เครื่อง</p>
                </BentoItem>
                <BentoItem className="tone-info">
                    <p className="text-xs text-slate-500">คำขอยืมในช่วงวันที่เลือก</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{filteredBorrows.length}</p>
                </BentoItem>
                <BentoItem className="tone-warning">
                    <p className="text-xs text-slate-500">งานซ่อมในช่วงวันที่เลือก</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{filteredRepairs.length}</p>
                    <p className="mt-1 text-xs text-slate-500">ซ่อมเสร็จแล้ว {completedRepairs} รายการ</p>
                </BentoItem>
                <BentoItem className="tone-danger">
                    <p className="text-xs text-slate-500">ค่าซ่อมรวมในช่วงวันที่เลือก</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">
                        {totalRepairCost.toLocaleString()} บาท
                    </p>
                    <p className="mt-2 text-xs text-slate-500">คืนล่าช้า {lateReturns} รายการ</p>
                </BentoItem>
            </BentoGrid>

            {/* ===== Charts Section ===== */}
            <div className="grid gap-6 lg:grid-cols-3">
                <GlassCard className="bg-white">
                    <h3 className="text-lg font-semibold text-slate-900">สถานะครุภัณฑ์ทั้งหมด</h3>
                    <p className="mt-1 text-sm text-slate-500">สัดส่วนสถานะเครื่องมือในระบบ</p>
                    <div className="mt-4 h-64">
                        {equipment.length > 0 ? (
                            <Doughnut data={equipmentStatusChartData} options={doughnutOptions} />
                        ) : (
                            <div className="flex h-full items-center justify-center text-sm text-slate-400">ไม่มีข้อมูล</div>
                        )}
                    </div>
                </GlassCard>

                <GlassCard className="bg-white">
                    <h3 className="text-lg font-semibold text-slate-900">สถานะคำขอยืม</h3>
                    <p className="mt-1 text-sm text-slate-500">สัดส่วนตามสถานะในช่วงวันที่เลือก</p>
                    <div className="mt-4 h-64">
                        {filteredBorrows.length > 0 ? (
                            <Doughnut data={borrowStatusChartData} options={doughnutOptions} />
                        ) : (
                            <div className="flex h-full items-center justify-center text-sm text-slate-400">ไม่มีข้อมูล</div>
                        )}
                    </div>
                </GlassCard>

                <GlassCard className="bg-white">
                    <h3 className="text-lg font-semibold text-slate-900">ภาพรวมงานซ่อม</h3>
                    <p className="mt-1 text-sm text-slate-500">จำนวนและค่าซ่อมตามสถานะ</p>
                    <div className="mt-4 h-64">
                        {filteredRepairs.length > 0 ? (
                            <Bar data={repairStatusChartData} options={barOptions} />
                        ) : (
                            <div className="flex h-full items-center justify-center text-sm text-slate-400">ไม่มีข้อมูล</div>
                        )}
                    </div>
                </GlassCard>
            </div>

            {/* ===== Borrow Table ===== */}
            <div className="grid gap-6 lg:grid-cols-2">
                <GlassCard className="bg-white">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="tone-info flex h-11 w-11 items-center justify-center rounded-2xl">
                            <FileSpreadsheet className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">รายการคำขอยืม</h2>
                            <p className="text-sm text-slate-500">ค้นหาและทบทวนคำขอยืมย้อนหลังตามช่วงวันที่</p>
                        </div>
                    </div>

                    <ListToolbar
                        searchValue={borrowSearch}
                        onSearchChange={setBorrowSearch}
                        pageSize={borrowPagination.pageSize}
                        onPageSizeChange={borrowPagination.setPageSize}
                        resultCount={borrowPagination.totalItems}
                        placeholder="ค้นหาผู้ยืม วัตถุประสงค์ ผู้ประสานงาน หรือสถานะ"
                        viewMode={borrowViewMode}
                        onViewModeChange={setBorrowViewMode}
                    />

                    {borrowViewMode === "table" ? (
                        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
                            <table className="min-w-full divide-y divide-slate-200 text-sm">
                                <thead className="bg-slate-50 text-left text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">รหัส</th>
                                        <th className="px-4 py-3 font-medium">ผู้ยืม</th>
                                        <th className="px-4 py-3 font-medium">วันยืม</th>
                                        <th className="px-4 py-3 font-medium">กำหนดคืน</th>
                                        <th className="px-4 py-3 font-medium">สถานะ</th>
                                        <th className="px-4 py-3 font-medium text-right">จำนวนเครื่อง</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {borrowPagination.paginatedItems.length > 0 ? (
                                        borrowPagination.paginatedItems.map((borrow) => (
                                            <tr key={borrow.id}>
                                                <td className="px-4 py-3 text-slate-700">#{borrow.id}</td>
                                                <td className="px-4 py-3 text-slate-700">{borrow.user_name}</td>
                                                <td className="px-4 py-3 text-slate-700">
                                                    {new Date(borrow.borrow_date).toLocaleDateString("th-TH")}
                                                </td>
                                                <td className="px-4 py-3 text-slate-700">
                                                    {new Date(borrow.due_date).toLocaleDateString("th-TH")}
                                                </td>
                                                <td className="px-4 py-3 text-slate-700">
                                                    {borrowStatusLabels[borrow.status] || borrow.status}
                                                </td>
                                                <td className="px-4 py-3 text-right text-slate-700">
                                                    {Array.isArray(borrow.equipment_ids) ? borrow.equipment_ids.length : 0}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                                                ไม่พบคำขอยืมที่ตรงกับเงื่อนไขการค้นหาและช่วงวันที่
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="mt-6 space-y-3">
                            {borrowPagination.paginatedItems.length > 0 ? (
                                borrowPagination.paginatedItems.map((borrow) => (
                                    <div key={borrow.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                            <div>
                                                <p className="font-semibold text-slate-900">#{borrow.id} — {borrow.user_name}</p>
                                                <p className="mt-1 text-sm text-slate-600">{borrow.purpose}</p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    วันยืม {new Date(borrow.borrow_date).toLocaleDateString("th-TH")} | กำหนดคืน {new Date(borrow.due_date).toLocaleDateString("th-TH")}
                                                </p>
                                            </div>
                                            <span className="inline-flex self-start rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                                {borrowStatusLabels[borrow.status] || borrow.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center text-sm text-slate-500">
                                    ไม่พบคำขอยืมที่ตรงกับเงื่อนไขการค้นหาและช่วงวันที่
                                </div>
                            )}
                        </div>
                    )}

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

                {/* ===== Repair Table ===== */}
                <GlassCard className="bg-white">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="tone-success flex h-11 w-11 items-center justify-center rounded-2xl">
                            <Wrench className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">รายการงานซ่อม</h2>
                            <p className="text-sm text-slate-500">ติดตามคำขอซ่อมและค่าใช้จ่ายตามช่วงวันที่</p>
                        </div>
                    </div>

                    <ListToolbar
                        searchValue={repairSearch}
                        onSearchChange={setRepairSearch}
                        pageSize={repairPagination.pageSize}
                        onPageSizeChange={repairPagination.setPageSize}
                        resultCount={repairPagination.totalItems}
                        placeholder="ค้นหาชื่ออุปกรณ์ อาการชำรุด หรือสถานะ"
                        viewMode={repairViewMode}
                        onViewModeChange={setRepairViewMode}
                    />

                    {repairViewMode === "table" ? (
                        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
                            <table className="min-w-full divide-y divide-slate-200 text-sm">
                                <thead className="bg-slate-50 text-left text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">รหัส</th>
                                        <th className="px-4 py-3 font-medium">อุปกรณ์</th>
                                        <th className="px-4 py-3 font-medium">วันที่แจ้ง</th>
                                        <th className="px-4 py-3 font-medium">สถานะ</th>
                                        <th className="px-4 py-3 font-medium text-right">ค่าซ่อม</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {repairPagination.paginatedItems.length > 0 ? (
                                        repairPagination.paginatedItems.map((repair) => (
                                            <tr key={repair.id}>
                                                <td className="px-4 py-3 text-slate-700">#{repair.id}</td>
                                                <td className="px-4 py-3 text-slate-700">{repair.equipment_name}</td>
                                                <td className="px-4 py-3 text-slate-700">
                                                    {new Date(repair.request_date).toLocaleDateString("th-TH")}
                                                </td>
                                                <td className="px-4 py-3 text-slate-700">
                                                    {repairStatusLabels[repair.status] || repair.status}
                                                </td>
                                                <td className="px-4 py-3 text-right text-slate-700">
                                                    {(Number(repair.cost) || 0).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                                                ไม่พบงานซ่อมที่ตรงกับเงื่อนไขการค้นหาและช่วงวันที่
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="mt-6 space-y-3">
                            {repairPagination.paginatedItems.length > 0 ? (
                                repairPagination.paginatedItems.map((repair) => (
                                    <div key={repair.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                            <div>
                                                <p className="font-semibold text-slate-900">#{repair.id} — {repair.equipment_name}</p>
                                                <p className="mt-1 text-sm text-slate-600">{repair.damage_description}</p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    วันที่แจ้ง {new Date(repair.request_date).toLocaleDateString("th-TH")}
                                                    {repair.repair_date ? ` | ซ่อมเสร็จ ${new Date(repair.repair_date).toLocaleDateString("th-TH")}` : ""}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 self-start">
                                                <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                                    {repairStatusLabels[repair.status] || repair.status}
                                                </span>
                                                {repair.cost ? (
                                                    <span className="inline-flex rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                                                        {Number(repair.cost).toLocaleString()} บาท
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center text-sm text-slate-500">
                                    ไม่พบงานซ่อมที่ตรงกับเงื่อนไขการค้นหาและช่วงวันที่
                                </div>
                            )}
                        </div>
                    )}

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

            <GlassCard className="bg-white">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">ส่งออกรายงาน</h2>
                        <p className="mt-2 text-sm leading-7 text-slate-600">
                            ไฟล์ CSV จะอ้างอิงตามช่วงวันที่และผลค้นหาปัจจุบัน เพื่อนำไปวิเคราะห์ต่อใน Excel หรือ Google Sheets
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={exportBorrowsCsv}
                            disabled={isExporting || filteredBorrows.length === 0}
                            className="action-primary gap-2 px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Download className="h-4 w-4" />
                            ส่งออกข้อมูลการยืม
                        </button>
                        <button
                            onClick={exportRepairsCsv}
                            disabled={isExporting || filteredRepairs.length === 0}
                            className="action-success gap-2 px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Download className="h-4 w-4" />
                            ส่งออกข้อมูลงานซ่อม
                        </button>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
}
