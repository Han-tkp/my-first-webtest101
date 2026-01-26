"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";

export default function BorrowPage() {
    const [equipmentTypes, setEquipmentTypes] = useState<string[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        borrow_date: new Date().toISOString().split("T")[0],
        purpose: "",
        contact_name: "",
        contact_phone: "",
        notes: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        loadEquipmentTypes();
    }, []);

    const loadEquipmentTypes = async () => {
        const supabase = createClient();
        const { data } = await supabase
            .from("equipment")
            .select("type")
            .eq("status", "available");

        if (data) {
            const types = Array.from(new Set(data.map((e) => e.type)));
            setEquipmentTypes(types);
        }
    };

    const handleTypeToggle = (type: string) => {
        setSelectedTypes((prev) =>
            prev.includes(type)
                ? prev.filter((t) => t !== type)
                : [...prev, type]
        );
    };

    const getDueDate = () => {
        if (!formData.borrow_date) return "";
        const date = new Date(formData.borrow_date);
        date.setDate(date.getDate() + 7);
        return date.toISOString().split("T")[0];
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: "", text: "" });

        if (selectedTypes.length === 0) {
            setMessage({ type: "error", text: "กรุณาเลือกประเภทอุปกรณ์อย่างน้อย 1 รายการ" });
            return;
        }

        setIsLoading(true);

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setMessage({ type: "error", text: "กรุณาเข้าสู่ระบบก่อน" });
                return;
            }

            // Find available equipment for each type
            const equipmentIds: number[] = [];
            for (const type of selectedTypes) {
                const { data: availableEquip } = await supabase
                    .from("equipment")
                    .select("id")
                    .eq("type", type)
                    .eq("status", "available")
                    .limit(1);

                if (availableEquip && availableEquip.length > 0) {
                    equipmentIds.push(availableEquip[0].id);
                } else {
                    setMessage({ type: "error", text: `ไม่มีเครื่องประเภท "${type}" ว่างในขณะนี้` });
                    setIsLoading(false);
                    return;
                }
            }

            // Create borrow request via API
            const response = await fetch("/api/borrows", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    equipment_ids: equipmentIds,
                    borrow_date: formData.borrow_date,
                    due_date: getDueDate(),
                    purpose: formData.purpose,
                    contact_name: formData.contact_name,
                    contact_phone: formData.contact_phone,
                    notes: formData.notes,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to submit request");
            }

            setMessage({ type: "success", text: "ส่งคำขอยืมสำเร็จ! รอการอนุมัติจากผู้ดูแล" });
            setSelectedTypes([]);
            setFormData({
                borrow_date: new Date().toISOString().split("T")[0],
                purpose: "",
                contact_name: "",
                contact_phone: "",
                notes: "",
            });
            // Refresh available types
            loadEquipmentTypes();
        } catch (err: any) {
            setMessage({ type: "error", text: err.message || "เกิดข้อผิดพลาด กรุณาลองใหม่" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto fade-in">
            <GlassCard>
                <h2 className="text-xl font-bold mb-6">สร้างคำขอยืมอุปกรณ์</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {message.text && (
                        <div
                            className={`p-4 rounded-xl text-sm ${message.type === "error"
                                ? "bg-red-500/10 border border-red-500/30 text-red-300"
                                : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                                }`}
                        >
                            {message.text}
                        </div>
                    )}

                    {/* Equipment Type Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-3">
                            เลือกประเภทเครื่องที่ต้องการยืม
                        </label>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 max-h-48 overflow-y-auto space-y-2">
                            {equipmentTypes.length === 0 ? (
                                <p className="text-white/50 text-sm">ไม่มีอุปกรณ์ว่าง</p>
                            ) : (
                                equipmentTypes.map((type) => (
                                    <label
                                        key={type}
                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedTypes.includes(type)}
                                            onChange={() => handleTypeToggle(type)}
                                            className="w-4 h-4 rounded border-white/30 bg-white/10 text-indigo-500 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm">{type}</span>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">วันที่ยืม</label>
                            <input
                                type="date"
                                value={formData.borrow_date}
                                onChange={(e) => setFormData({ ...formData, borrow_date: e.target.value })}
                                required
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">วันกำหนดคืน</label>
                            <input
                                type="date"
                                value={getDueDate()}
                                readOnly
                                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white/60"
                            />
                        </div>
                    </div>

                    {/* Purpose */}
                    <div>
                        <label className="block text-sm font-medium mb-2">วัตถุประสงค์/พื้นที่ปฏิบัติงาน</label>
                        <input
                            type="text"
                            value={formData.purpose}
                            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                            required
                            placeholder="เช่น พ่นป้องกันไข้เลือดออก หมู่บ้านจัดสรร"
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Contact */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">ผู้ประสานงาน</label>
                            <input
                                type="text"
                                value={formData.contact_name}
                                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                                required
                                placeholder="ชื่อผู้ประสานงาน"
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">เบอร์โทรติดต่อ</label>
                            <input
                                type="tel"
                                value={formData.contact_phone}
                                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                                required
                                placeholder="08X-XXX-XXXX"
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium mb-2">หมายเหตุ</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                            placeholder="รายละเอียดเพิ่มเติม (เช่น พื้นที่เสี่ยง, เวลาเริ่มงาน)"
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        />
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        isLoading={isLoading}
                        className="w-full"
                    >
                        ส่งคำขอยืม
                    </Button>
                </form>

                <p className="text-xs text-white/50 mt-4 text-center">
                    หมายเหตุ: ระบบจะเลือกเครื่องที่ว่างให้โดยอัตโนมัติ และกำหนดวันคืน 7 วันนับจากวันที่ยืม
                </p>
            </GlassCard>
        </div>
    );
}
