"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { DateRangeFilter } from "@/components/ui/DateRangeFilter";
import { useListPagination } from "@/hooks/useListPagination";
import { isWithinDateRange } from "@/lib/date-range";
import { AssessmentForm } from "./AssessmentForm";
import { FileText, Plus } from "lucide-react";

interface Equipment {
    id: number;
    name: string;
    type: string;
    serial: string;
    brand: string | null;
    model: string | null;
    purchase_year: number | null;
}

interface Assessment {
    id: number;
    equipment_id: number | null;
    assessment_date: string;
    report_date: string | null;
    assessor_name: string | null;
    vmd_value: string | null;
    span_value: string | null;
    exterior_condition_class: string | null;
    engine_start_quality: string | null;
    equipment: Equipment | null;
}

interface AssessmentsClientProps {
    assessments: Assessment[];
    allEquipment: Equipment[];
}

export function AssessmentsClient({ assessments, allEquipment }: AssessmentsClientProps) {
    const router = useRouter();
    const [showNewForm, setShowNewForm] = useState(false);
    const [selectedEquipmentId, setSelectedEquipmentId] = useState<number | null>(null);
    const [search, setSearch] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const filteredAssessments = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return assessments.filter((assessment) => {
            const equipmentText = assessment.equipment
                ? `${assessment.equipment.name} ${assessment.equipment.type} ${assessment.equipment.serial}`.toLowerCase()
                : "";

            const matchesSearch =
                !keyword ||
                [
                    String(assessment.id),
                    assessment.assessor_name || "",
                    equipmentText,
                ].some((value) => value.toLowerCase().includes(keyword));

            return matchesSearch && isWithinDateRange(assessment.assessment_date, dateFrom, dateTo);
        });
    }, [assessments, search, dateFrom, dateTo]);

    const pagination = useListPagination(filteredAssessments);

    if (showNewForm && selectedEquipmentId) {
        const selectedEquipment = allEquipment.find((eq) => eq.id === selectedEquipmentId);
        if (selectedEquipment) {
            return (
                <div className="mx-auto max-w-5xl space-y-6 fade-in">
                    <div className="space-y-2">
                        <p className="section-kicker">Assessment Form</p>
                        <h1 className="text-3xl font-semibold text-slate-900">แบบประเมินมาตรฐานเครื่องพ่นเคมี</h1>
                        <p className="text-sm text-slate-600">
                            ประเมินอุปกรณ์: {selectedEquipment.name} ({selectedEquipment.serial})
                        </p>
                    </div>
                    <AssessmentForm
                        equipment={selectedEquipment}
                        onSuccess={() => {
                            setShowNewForm(false);
                            setSelectedEquipmentId(null);
                            router.refresh();
                        }}
                        onCancel={() => {
                            setShowNewForm(false);
                            setSelectedEquipmentId(null);
                        }}
                    />
                </div>
            );
        }
    }

    return (
        <div className="mx-auto max-w-7xl space-y-6 fade-in">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                    <p className="section-kicker">Assessment Management</p>
                    <h1 className="text-3xl font-semibold text-slate-900">แบบประเมินมาตรฐานเครื่องพ่นเคมี</h1>
                    <p className="text-sm text-slate-600">จัดการและดูประวัติการประเมินอุปกรณ์</p>
                </div>
                <Button
                    onClick={() => setShowNewForm(true)}
                    className="action-primary inline-flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    สร้างแบบประเมินใหม่
                </Button>
            </div>

            {showNewForm ? (
                <GlassCard className="bg-white">
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-slate-900">เลือกอุปกรณ์เพื่อประเมิน</h2>
                        <div>
                            <label className="label">เลือกอุปกรณ์</label>
                            <select
                                value={selectedEquipmentId || ""}
                                onChange={(e) => setSelectedEquipmentId(Number(e.target.value))}
                                className="form-select"
                            >
                                <option value="">-- เลือกอุปกรณ์ --</option>
                                {allEquipment.map((eq) => (
                                    <option key={eq.id} value={eq.id}>
                                        {eq.name} ({eq.type}) - {eq.serial}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowNewForm(false)}
                                className="rounded-2xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                                ยกเลิก
                            </button>
                        </div>
                    </div>
                </GlassCard>
            ) : (
                <GlassCard className="bg-white">
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="tone-info flex h-11 w-11 items-center justify-center rounded-2xl">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900">รายการประเมินทั้งหมด</h2>
                                <p className="text-sm text-slate-500">
                                    {filteredAssessments.length} จาก {assessments.length} รายการ
                                </p>
                            </div>
                        </div>
                    </div>

                    <ListToolbar
                        searchValue={search}
                        onSearchChange={setSearch}
                        pageSize={pagination.pageSize}
                        onPageSizeChange={pagination.setPageSize}
                        resultCount={pagination.totalItems}
                        placeholder="ค้นหาอุปกรณ์ ผู้ประเมิน หรือเลขที่คำขอ"
                    />

                    <div className="mt-4">
                        <DateRangeFilter
                            from={dateFrom}
                            to={dateTo}
                            onFromChange={setDateFrom}
                            onToChange={setDateTo}
                            fromLabel="วันที่ประเมินตั้งแต่"
                            toLabel="วันที่ประเมินถึง"
                        />
                    </div>

                    <div className="mt-6 space-y-3">
                        {pagination.paginatedItems.length > 0 ? (
                            pagination.paginatedItems.map((assessment) => (
                                <div
                                    key={assessment.id}
                                    className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                                >
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="text-lg font-semibold text-slate-900">
                                                    {assessment.equipment?.name || `อุปกรณ์ #${assessment.equipment_id}`}
                                                </h3>
                                                <span className="chip chip-info">
                                                    {assessment.equipment?.type || "-"}
                                                </span>
                                            </div>
                                            <div className="mt-2 grid gap-2 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
                                                <div>
                                                    <span className="font-medium text-slate-700">เลขครุภัณฑ์:</span>{" "}
                                                    {assessment.equipment?.serial || "-"}
                                                </div>
                                                <div>
                                                    <span className="font-medium text-slate-700">ยี่ห้อ:</span>{" "}
                                                    {assessment.equipment?.brand || "-"}
                                                </div>
                                                <div>
                                                    <span className="font-medium text-slate-700">รุ่น:</span>{" "}
                                                    {assessment.equipment?.model || "-"}
                                                </div>
                                                <div>
                                                    <span className="font-medium text-slate-700">วันที่ประเมิน:</span>{" "}
                                                    {new Date(assessment.assessment_date).toLocaleDateString("th-TH")}
                                                </div>
                                                <div>
                                                    <span className="font-medium text-slate-700">ผู้ประเมิน:</span>{" "}
                                                    {assessment.assessor_name || "-"}
                                                </div>
                                                <div>
                                                    <span className="font-medium text-slate-700">VMD:</span>{" "}
                                                    {assessment.vmd_value || "-"} ไมครอน
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center text-sm text-slate-500">
                                ไม่พบรายการประเมินที่ตรงกับเงื่อนไขการค้นหา
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
            )}
        </div>
    );
}
