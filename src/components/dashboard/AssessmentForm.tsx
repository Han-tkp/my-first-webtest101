"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import {
    flowControlTypeOptions,
    exteriorConditionClassOptions,
    cleanExteriorOptions,
    cleanNozzleOptions,
    engineStartQualityOptions,
    seasonOptions,
    validateAssessmentData,
    type AssessmentData,
} from "@/lib/assessments";

interface Equipment {
    id: number;
    name: string;
    type: string;
    serial: string;
    brand: string | null;
    model: string | null;
    purchase_year: number | null;
}

interface AssessmentFormProps {
    equipment: Equipment;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function AssessmentForm({ equipment, onSuccess, onCancel }: AssessmentFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<AssessmentData>>({
        equipment_id: equipment.id,
        assessment_date: new Date().toISOString().split("T")[0],
        report_date: new Date().toISOString().split("T")[0],
    });

    const updateField = <K extends keyof AssessmentData>(key: K, value: AssessmentData[K]) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const data: AssessmentData = {
            equipment_id: equipment.id,
            assessor_id: "", // Will be set by API
            assessment_date: formData.assessment_date || new Date().toISOString().split("T")[0]!,
            equipment_type: equipment.type,
            equipment_brand: equipment.brand,
            equipment_model: equipment.model,
            equipment_purchase_year: equipment.purchase_year,
            flow_control_type: formData.flow_control_type || null,
            flow_control_size: formData.flow_control_size || null,
            spray_distance: formData.spray_distance || null,
            exterior_condition_class: formData.exterior_condition_class || null,
            clean_exterior: formData.clean_exterior || null,
            clean_nozzle: formData.clean_nozzle || null,
            engine_start_quality: formData.engine_start_quality || null,
            exterior_condition: formData.exterior_condition || null,
            engine_start: formData.engine_start || null,
            clean_pipe: formData.clean_pipe ?? null,
            clean_chem_line: formData.clean_chem_line ?? null,
            clean_gas_tank: formData.clean_gas_tank ?? null,
            clean_chem_tank: formData.clean_chem_tank ?? null,
            chem_name: formData.chem_name || null,
            chem_concentration: formData.chem_concentration || null,
            chemical_substance: formData.chemical_substance || null,
            chemical_concentration: formData.chemical_concentration || null,
            chemical_volume: formData.chemical_volume || null,
            chemical_mix_ratio: formData.chemical_mix_ratio || null,
            season: formData.season || null,
            location: formData.location || null,
            result_temp: formData.result_temp || null,
            result_flow_rate: formData.result_flow_rate || null,
            vmd_value: formData.vmd_value || null,
            span_value: formData.span_value || null,
            recommendations: formData.recommendations || null,
            notes: formData.notes || null,
            assessor_name: formData.assessor_name || null,
            report_date: formData.report_date || new Date().toISOString().split("T")[0]!,
        };

        const validation = validateAssessmentData(data);
        if (!validation.valid) {
            setError(validation.errors.join(", "));
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/assessments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "ไม่สามารถบันทึกแบบประเมินได้");
            }

            if (onSuccess) {
                onSuccess();
            } else {
                router.push("/dashboard/assessments");
                router.refresh();
            }
        } catch (err: any) {
            setError(err.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <GlassCard className="bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
                {error ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {error}
                    </div>
                ) : null}

                {/* Equipment Info Header */}
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="text-lg font-semibold text-slate-900">ข้อมูลเครื่องพ่นสารเคมี</h3>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <label className="label">ชนิดเครื่อง</label>
                            <input
                                type="text"
                                value={equipment.type}
                                readOnly
                                className="form-input bg-slate-100 text-slate-500"
                            />
                        </div>
                        <div>
                            <label className="label">ยี่ห้อ</label>
                            <input
                                type="text"
                                value={equipment.brand || "-"}
                                readOnly
                                className="form-input bg-slate-100 text-slate-500"
                            />
                        </div>
                        <div>
                            <label className="label">รุ่น</label>
                            <input
                                type="text"
                                value={equipment.model || "-"}
                                readOnly
                                className="form-input bg-slate-100 text-slate-500"
                            />
                        </div>
                        <div>
                            <label className="label">ปีที่ซื้อ</label>
                            <input
                                type="text"
                                value={equipment.purchase_year?.toString() || "-"}
                                readOnly
                                className="form-input bg-slate-100 text-slate-500"
                            />
                        </div>
                        <div>
                            <label className="label">เลขครุภัณฑ์/เลขเครื่อง</label>
                            <input
                                type="text"
                                value={equipment.serial}
                                readOnly
                                className="form-input bg-slate-100 text-slate-500"
                            />
                        </div>
                        <div>
                            <label className="label">ชื่อเครื่อง</label>
                            <input
                                type="text"
                                value={equipment.name}
                                readOnly
                                className="form-input bg-slate-100 text-slate-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Assessment Date */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="label">วันที่ประเมิน</label>
                        <input
                            type="date"
                            value={formData.assessment_date ?? ""}
                            onChange={(e) => updateField("assessment_date", e.target.value)}
                            className="form-input"
                            required
                        />
                    </div>
                    <div>
                        <label className="label">วันที่ออกรายงาน</label>
                        <input
                            type="date"
                            value={formData.report_date ?? ""}
                            onChange={(e) => updateField("report_date", e.target.value)}
                            className="form-input"
                            required
                        />
                    </div>
                </div>

                {/* Flow Control */}
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="text-lg font-semibold text-slate-900">ตัวควบคุมการไหล</h3>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="label">ประเภทตัวควบคุม</label>
                            <select
                                value={formData.flow_control_type || ""}
                                onChange={(e) => updateField("flow_control_type", e.target.value)}
                                className="form-select"
                            >
                                <option value="">-- เลือก --</option>
                                {flowControlTypeOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="label">ขนาด</label>
                            <input
                                type="text"
                                value={formData.flow_control_size || ""}
                                onChange={(e) => updateField("flow_control_size", e.target.value)}
                                placeholder="เช่น 2.5 mm"
                                className="form-input"
                            />
                        </div>
                    </div>
                </div>

                {/* External Condition */}
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="text-lg font-semibold text-slate-900">สภาพภายนอก</h3>
                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                        <div>
                            <label className="label">สภาพเครื่อง</label>
                            <select
                                value={formData.exterior_condition_class || ""}
                                onChange={(e) => updateField("exterior_condition_class", e.target.value)}
                                className="form-select"
                            >
                                <option value="">-- เลือก --</option>
                                {exteriorConditionClassOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="label">ความสะอาดภายนอก</label>
                            <select
                                value={formData.clean_exterior || ""}
                                onChange={(e) => updateField("clean_exterior", e.target.value)}
                                className="form-select"
                            >
                                <option value="">-- เลือก --</option>
                                {cleanExteriorOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="label">หัวพ่น</label>
                            <select
                                value={formData.clean_nozzle || ""}
                                onChange={(e) => updateField("clean_nozzle", e.target.value)}
                                className="form-select"
                            >
                                <option value="">-- เลือก --</option>
                                {cleanNozzleOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Engine Start */}
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="text-lg font-semibold text-slate-900">การติดเครื่องยนต์</h3>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="label">การสตาร์ท</label>
                            <select
                                value={formData.engine_start_quality || ""}
                                onChange={(e) => updateField("engine_start_quality", e.target.value)}
                                className="form-select"
                            >
                                <option value="">-- เลือก --</option>
                                {engineStartQualityOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="label">ระยะห่างจากจุดพ่นถึงปลาย (เมตร)</label>
                            <input
                                type="text"
                                value={formData.spray_distance || ""}
                                onChange={(e) => updateField("spray_distance", e.target.value)}
                                placeholder="เช่น 5"
                                className="form-input"
                            />
                        </div>
                    </div>
                </div>

                {/* Chemical Testing */}
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="text-lg font-semibold text-slate-900">ข้อมูลการทดสอบสารเคมี</h3>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <label className="label">สารเคมี</label>
                            <input
                                type="text"
                                value={formData.chemical_substance || ""}
                                onChange={(e) => updateField("chemical_substance", e.target.value)}
                                className="form-input"
                            />
                        </div>
                        <div>
                            <label className="label">ความเข้มข้น (%)</label>
                            <input
                                type="text"
                                value={formData.chemical_concentration || ""}
                                onChange={(e) => updateField("chemical_concentration", e.target.value)}
                                placeholder="เช่น 2.5"
                                className="form-input"
                            />
                        </div>
                        <div>
                            <label className="label">ปริมาณ (ลิตร)</label>
                            <input
                                type="text"
                                value={formData.chemical_volume || ""}
                                onChange={(e) => updateField("chemical_volume", e.target.value)}
                                placeholder="เช่น 10"
                                className="form-input"
                            />
                        </div>
                        <div>
                            <label className="label">อัตราส่วนผสม</label>
                            <input
                                type="text"
                                value={formData.chemical_mix_ratio || ""}
                                onChange={(e) => updateField("chemical_mix_ratio", e.target.value)}
                                placeholder="เช่น 1:50"
                                className="form-input"
                            />
                        </div>
                        <div>
                            <label className="label">ฤดูกาล</label>
                            <select
                                value={formData.season || ""}
                                onChange={(e) => updateField("season", e.target.value)}
                                className="form-select"
                            >
                                <option value="">-- เลือก --</option>
                                {seasonOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="label">สถานที่</label>
                            <input
                                type="text"
                                value={formData.location || ""}
                                onChange={(e) => updateField("location", e.target.value)}
                                className="form-input"
                            />
                        </div>
                    </div>
                </div>

                {/* Measurement Results */}
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="text-lg font-semibold text-slate-900">ผลการวัด</h3>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <label className="label">อุณหภูมิ (°C)</label>
                            <input
                                type="text"
                                value={formData.result_temp || ""}
                                onChange={(e) => updateField("result_temp", e.target.value)}
                                placeholder="เช่น 30"
                                className="form-input"
                            />
                        </div>
                        <div>
                            <label className="label">อัตราการไหล</label>
                            <input
                                type="text"
                                value={formData.result_flow_rate || ""}
                                onChange={(e) => updateField("result_flow_rate", e.target.value)}
                                placeholder="เช่น 2.5 L/min"
                                className="form-input"
                            />
                        </div>
                        <div>
                            <label className="label">VMD (ไมครอน) ≤30</label>
                            <input
                                type="text"
                                value={formData.vmd_value || ""}
                                onChange={(e) => updateField("vmd_value", e.target.value)}
                                placeholder="เช่น 25"
                                className="form-input"
                            />
                        </div>
                        <div>
                            <label className="label">SPAN ≤2</label>
                            <input
                                type="text"
                                value={formData.span_value || ""}
                                onChange={(e) => updateField("span_value", e.target.value)}
                                placeholder="เช่น 1.5"
                                className="form-input"
                            />
                        </div>
                    </div>
                </div>

                {/* Recommendations */}
                <div>
                    <label className="label">ข้อเสนอแนะ</label>
                    <textarea
                        value={formData.recommendations || ""}
                        onChange={(e) => updateField("recommendations", e.target.value)}
                        rows={3}
                        className="form-textarea"
                        placeholder="ข้อเสนอแนะเพิ่มเติม"
                    />
                </div>

                {/* Notes */}
                <div>
                    <label className="label">หมายเหตุ</label>
                    <textarea
                        value={formData.notes || ""}
                        onChange={(e) => updateField("notes", e.target.value)}
                        rows={2}
                        className="form-textarea"
                        placeholder="หมายเหตุ"
                    />
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                    <Button type="submit" disabled={isLoading} className="action-primary">
                        {isLoading ? "กำลังบันทึก..." : "บันทึกแบบประเมิน"}
                    </Button>
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isLoading}
                            className="rounded-2xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                            ยกเลิก
                        </button>
                    )}
                </div>
            </form>
        </GlassCard>
    );
}
