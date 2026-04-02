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
import { EquipmentImage } from "@/components/ui/EquipmentImage";
import { getEquipmentImageUrl } from "@/lib/equipment-catalog";
import { FileText, Plus, ArrowLeft, Eye, Trash2, Printer } from "lucide-react";

interface Equipment {
    id: number;
    name: string;
    type: string;
    serial: string;
    brand: string | null;
    model: string | null;
    purchase_year: number | null;
    image_url?: string | null;
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
    clean_exterior: string | null;
    clean_nozzle: string | null;
    flow_control_type: string | null;
    flow_control_size: string | null;
    spray_distance: string | null;
    chemical_substance: string | null;
    chemical_concentration: string | null;
    chemical_volume: string | null;
    chemical_mix_ratio: string | null;
    season: string | null;
    location: string | null;
    result_temp: string | null;
    result_flow_rate: string | null;
    recommendations: string | null;
    notes: string | null;
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
    const [viewingAssessment, setViewingAssessment] = useState<Assessment | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [search, setSearch] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const handleDelete = async (id: number) => {
        if (!confirm("ต้องการลบรายงานประเมินนี้หรือไม่?")) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/assessments/${id}`, { method: "DELETE" });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                alert(err.error || "ไม่สามารถลบได้");
                return;
            }
            setViewingAssessment(null);
            router.refresh();
        } finally {
            setIsDeleting(false);
        }
    };

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

    // Detail view for a single assessment
    if (viewingAssessment) {
        const eq = viewingAssessment.equipment;
        const imgSrc = eq ? getEquipmentImageUrl(eq.name, eq.image_url) : null;
        return (
            <div className="mx-auto max-w-5xl space-y-6 fade-in">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setViewingAssessment(null)}
                            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 print:hidden"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div className="space-y-1">
                            <p className="section-kicker">Assessment Detail</p>
                            <h1 className="text-3xl font-semibold text-slate-900">รายละเอียดการประเมิน #{viewingAssessment.id}</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 print:hidden">
                        <button
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                            <Printer className="h-4 w-4" />
                            พิมพ์
                        </button>
                        <button
                            onClick={() => handleDelete(viewingAssessment.id)}
                            disabled={isDeleting}
                            className="inline-flex items-center gap-1.5 rounded-2xl border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                        >
                            <Trash2 className="h-4 w-4" />
                            {isDeleting ? "กำลังลบ..." : "ลบ"}
                        </button>
                    </div>
                </div>

                {/* Equipment info with image */}
                <GlassCard className="bg-white">
                    <h3 className="mb-4 text-lg font-semibold text-slate-900">ข้อมูลเครื่องพ่นสารเคมี</h3>
                    <div className="flex flex-col gap-5 sm:flex-row">
                        <EquipmentImage
                            src={imgSrc}
                            alt={eq?.name || "อุปกรณ์"}
                            className="h-32 w-32 shrink-0 rounded-2xl border border-slate-200"
                        />
                        <div className="grid flex-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                            <DetailField label="ชื่อเครื่อง" value={eq?.name} />
                            <DetailField label="ชนิดเครื่อง" value={eq?.type} />
                            <DetailField label="เลขครุภัณฑ์" value={eq?.serial} />
                            <DetailField label="ยี่ห้อ" value={eq?.brand} />
                            <DetailField label="รุ่น" value={eq?.model} />
                            <DetailField label="ปีที่ซื้อ" value={eq?.purchase_year?.toString()} />
                        </div>
                    </div>
                </GlassCard>

                {/* Assessment details */}
                <GlassCard className="bg-white">
                    <h3 className="mb-4 text-lg font-semibold text-slate-900">ผลการประเมิน</h3>
                    <div className="space-y-6">
                        {/* Dates & Assessor */}
                        <div className="grid gap-3 text-sm sm:grid-cols-3">
                            <DetailField label="วันที่ประเมิน" value={new Date(viewingAssessment.assessment_date).toLocaleDateString("th-TH")} />
                            <DetailField label="วันที่ออกรายงาน" value={viewingAssessment.report_date ? new Date(viewingAssessment.report_date).toLocaleDateString("th-TH") : null} />
                            <DetailField label="ผู้ประเมิน" value={viewingAssessment.assessor_name} />
                        </div>

                        <hr className="border-slate-200" />

                        {/* Flow Control */}
                        <div>
                            <h4 className="mb-3 font-medium text-slate-800">ตัวควบคุมการไหล</h4>
                            <div className="grid gap-3 text-sm sm:grid-cols-3">
                                <DetailField label="ประเภทตัวควบคุม" value={viewingAssessment.flow_control_type} />
                                <DetailField label="ขนาด" value={viewingAssessment.flow_control_size} />
                                <DetailField label="ระยะพ่น (เมตร)" value={viewingAssessment.spray_distance} />
                            </div>
                        </div>

                        <hr className="border-slate-200" />

                        {/* External Condition */}
                        <div>
                            <h4 className="mb-3 font-medium text-slate-800">สภาพภายนอก</h4>
                            <div className="grid gap-3 text-sm sm:grid-cols-3">
                                <DetailField label="สภาพเครื่อง" value={viewingAssessment.exterior_condition_class} />
                                <DetailField label="ความสะอาดภายนอก" value={viewingAssessment.clean_exterior} />
                                <DetailField label="หัวพ่น" value={viewingAssessment.clean_nozzle} />
                            </div>
                        </div>

                        <hr className="border-slate-200" />

                        {/* Engine */}
                        <div>
                            <h4 className="mb-3 font-medium text-slate-800">การติดเครื่องยนต์</h4>
                            <div className="grid gap-3 text-sm sm:grid-cols-2">
                                <DetailField label="การสตาร์ท" value={viewingAssessment.engine_start_quality} />
                            </div>
                        </div>

                        <hr className="border-slate-200" />

                        {/* Chemical */}
                        <div>
                            <h4 className="mb-3 font-medium text-slate-800">ข้อมูลการทดสอบสารเคมี</h4>
                            <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                                <DetailField label="สารเคมี" value={viewingAssessment.chemical_substance} />
                                <DetailField label="ความเข้มข้น (%)" value={viewingAssessment.chemical_concentration} />
                                <DetailField label="ปริมาณ (ลิตร)" value={viewingAssessment.chemical_volume} />
                                <DetailField label="อัตราส่วนผสม" value={viewingAssessment.chemical_mix_ratio} />
                                <DetailField label="ฤดูกาล" value={viewingAssessment.season} />
                                <DetailField label="สถานที่" value={viewingAssessment.location} />
                            </div>
                        </div>

                        <hr className="border-slate-200" />

                        {/* Measurement Results */}
                        <div>
                            <h4 className="mb-3 font-medium text-slate-800">ผลการวัด</h4>
                            <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                                <DetailField label="อุณหภูมิ (°C)" value={viewingAssessment.result_temp} />
                                <DetailField label="อัตราการไหล" value={viewingAssessment.result_flow_rate} />
                                <DetailField label="VMD (ไมครอน)" value={viewingAssessment.vmd_value} />
                                <DetailField label="SPAN" value={viewingAssessment.span_value} />
                            </div>
                        </div>

                        {/* Recommendations & Notes */}
                        {(viewingAssessment.recommendations || viewingAssessment.notes) ? (
                            <>
                                <hr className="border-slate-200" />
                                <div className="grid gap-3 text-sm sm:grid-cols-2">
                                    {viewingAssessment.recommendations ? <DetailField label="ข้อเสนอแนะ" value={viewingAssessment.recommendations} /> : null}
                                    {viewingAssessment.notes ? <DetailField label="หมายเหตุ" value={viewingAssessment.notes} /> : null}
                                </div>
                            </>
                        ) : null}
                    </div>
                </GlassCard>
            </div>
        );
    }

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
                            pagination.paginatedItems.map((assessment) => {
                                const eq = assessment.equipment;
                                const imgSrc = eq ? getEquipmentImageUrl(eq.name, eq.image_url) : null;
                                return (
                                    <div
                                        key={assessment.id}
                                        className="cursor-pointer rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-slate-300 hover:shadow-sm"
                                        onClick={() => setViewingAssessment(assessment)}
                                    >
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                                            <EquipmentImage
                                                src={imgSrc}
                                                alt={eq?.name || "อุปกรณ์"}
                                                className="h-20 w-20 shrink-0 rounded-2xl border border-slate-200"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="text-lg font-semibold text-slate-900">
                                                        {eq?.name || `อุปกรณ์ #${assessment.equipment_id}`}
                                                    </h3>
                                                    <span className="chip chip-info">
                                                        {eq?.type || "-"}
                                                    </span>
                                                </div>
                                                <div className="mt-2 grid gap-2 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
                                                    <div>
                                                        <span className="font-medium text-slate-700">เลขครุภัณฑ์:</span>{" "}
                                                        {eq?.serial || "-"}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-slate-700">ยี่ห้อ:</span>{" "}
                                                        {eq?.brand || "-"}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-slate-700">รุ่น:</span>{" "}
                                                        {eq?.model || "-"}
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
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setViewingAssessment(assessment);
                                                }}
                                                className="inline-flex shrink-0 items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                            >
                                                <Eye className="h-4 w-4" />
                                                ดูรายละเอียด
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
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

function DetailField({ label, value }: { label: string; value?: string | null }) {
    return (
        <div>
            <span className="font-medium text-slate-700">{label}</span>
            <p className="mt-0.5 text-slate-600">{value || "-"}</p>
        </div>
    );
}
