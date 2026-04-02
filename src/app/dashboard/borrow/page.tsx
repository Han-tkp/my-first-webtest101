"use client";

import { useEffect, useMemo, useState } from "react";
import {
    CalendarRange,
    CircleAlert,
    FileText,
    Hash,
    Minus,
    Phone,
    Plus,
    ShieldCheck,
    Stethoscope,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { getEquipmentTypeDescription } from "@/lib/equipment-catalog";
import { EquipmentImage } from "@/components/ui/EquipmentImage";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { useListPagination } from "@/hooks/useListPagination";

interface EquipmentItem {
    id: number;
    name: string;
    type: string;
    serial: string;
    image_url: string | null;
    status?: string;
}

interface EquipmentGroup {
    type: string;
    availableCount: number;
    imageUrl: string | null;
    description: string;
    items: EquipmentItem[];
}

export default function BorrowPage() {
    const [userAgency, setUserAgency] = useState<string | null>(null);
    const [catalog, setCatalog] = useState<EquipmentGroup[]>([]);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [formData, setFormData] = useState({
        borrow_date: new Date().toISOString().split("T")[0],
        purpose: "",
        contact_name: "",
        contact_phone: "",
        notes: "",
        document_reference: "",
        subject: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const digitsOnly = (value: string, maxLength = 10) => value.replace(/\D/g, "").slice(0, maxLength);

    useEffect(() => {
        void loadEquipmentCatalog();
        void loadUserAgency();
    }, []);

    const loadUserAgency = async () => {
        const supabase = createBrowserClient();
        if (!supabase) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase.from("profiles").select("agency").eq("id", user.id).single();
        if (data?.agency) setUserAgency(data.agency);
    };

    const loadEquipmentCatalog = async () => {
        const response = await fetch("/api/equipment", { cache: "no-store" });
        if (!response.ok) {
            setMessage({ type: "error", text: "ไม่สามารถโหลดข้อมูลอุปกรณ์ได้ในขณะนี้" });
            return;
        }

        const data = ((await response.json()) as EquipmentItem[]).filter((item) => item.status === "available");
        const grouped = new Map<string, EquipmentGroup>();

        data.forEach((item) => {
            const existing = grouped.get(item.type);

            if (existing) {
                existing.availableCount += 1;
                existing.items.push(item);
                existing.imageUrl = existing.imageUrl || item.image_url;
                return;
            }

            grouped.set(item.type, {
                type: item.type,
                availableCount: 1,
                imageUrl: item.image_url,
                description: getEquipmentTypeDescription(item.type),
                items: [item],
            });
        });

        const nextCatalog = Array.from(grouped.values()).sort((a, b) => a.type.localeCompare(b.type, "th"));
        setCatalog(nextCatalog);
        setQuantities((previous) =>
            nextCatalog.reduce<Record<string, number>>((accumulator, group) => {
                accumulator[group.type] = Math.min(previous[group.type] || 0, group.availableCount);
                return accumulator;
            }, {}),
        );
    };

    const filteredCatalog = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return catalog.filter((group) => {
            const matchType = typeFilter === "all" || group.type === typeFilter;
            if (!matchType) return false;

            if (!keyword) return true;

            const inGroup = group.type.toLowerCase().includes(keyword) || group.description.toLowerCase().includes(keyword);
            const inItems = group.items.some(
                (item) => item.name.toLowerCase().includes(keyword) || item.serial.toLowerCase().includes(keyword),
            );
            return inGroup || inItems;
        });
    }, [catalog, search, typeFilter]);

    const pagination = useListPagination(filteredCatalog);

    const updateQuantity = (type: string, nextValue: number) => {
        const group = catalog.find((item) => item.type === type);
        if (!group) return;

        const safeValue = Number.isFinite(nextValue) ? nextValue : 0;
        const clampedValue = Math.max(0, Math.min(group.availableCount, Math.trunc(safeValue)));

        setQuantities((previous) => ({
            ...previous,
            [type]: clampedValue,
        }));
    };

    const getDueDate = () => {
        if (!formData.borrow_date) return "";
        const date = new Date(formData.borrow_date);
        date.setDate(date.getDate() + 7);
        return date.toISOString().split("T")[0];
    };

    const selectedRequests = catalog
        .map((group) => ({
            type: group.type,
            quantity: quantities[group.type] || 0,
            availableCount: group.availableCount,
            imageUrl: group.imageUrl,
            description: group.description,
            items: group.items,
        }))
        .filter((group) => group.quantity > 0);

    const totalRequested = selectedRequests.reduce((sum, group) => sum + group.quantity, 0);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setMessage({ type: "", text: "" });

        if (selectedRequests.length === 0) {
            setMessage({ type: "error", text: "กรุณาเลือกอุปกรณ์อย่างน้อย 1 ประเภทและระบุจำนวนที่ต้องการ" });
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("/api/borrows", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    equipment_requests: selectedRequests.map((group) => ({
                        type: group.type,
                        quantity: group.quantity,
                    })),
                    borrow_date: formData.borrow_date,
                    due_date: getDueDate(),
                    purpose: formData.purpose,
                    contact_name: formData.contact_name,
                    contact_phone: formData.contact_phone,
                    notes: formData.notes,
                    document_reference: formData.document_reference,
                    subject: formData.subject,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "ไม่สามารถส่งคำขอได้");
            }

            setMessage({
                type: "success",
                text: "ส่งคำขอยืมเรียบร้อยแล้ว กรุณารอการอนุมัติและการจัดเตรียมอุปกรณ์จากเจ้าหน้าที่",
            });
            setQuantities({});
            setFormData({
                borrow_date: new Date().toISOString().split("T")[0],
                purpose: "",
                contact_name: "",
                contact_phone: "",
                notes: "",
                document_reference: "",
                subject: "",
            });
            await loadEquipmentCatalog();
        } catch (error: any) {
            setMessage({ type: "error", text: error.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-6xl space-y-6 fade-in">
            <div className="space-y-2">
                <p className="section-kicker">Borrow Request</p>
                <h1 className="text-3xl font-semibold text-slate-900">แบบฟอร์มขอยืมอุปกรณ์</h1>
                <p className="max-w-3xl text-sm leading-7 text-slate-600">
                    เลือกอุปกรณ์ตามประเภทและจำนวนที่ต้องการ รายละเอียดรุ่นและเลขเครื่องจะแสดงเพิ่มเมื่อมีการเลือกใช้งานเพื่อให้หน้ารายการไม่แน่นเกินไปบนมือถือ
                </p>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <GlassCard className="bg-white">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="tone-info flex h-11 w-11 items-center justify-center rounded-2xl">
                                <Stethoscope className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900">คลังอุปกรณ์พร้อมให้ยืม</h2>
                                <p className="text-sm text-slate-500">ค้นหา เลือกจำนวน และแบ่งหน้าอัตโนมัติ</p>
                            </div>
                        </div>
                    </div>

                    <ListToolbar
                        searchValue={search}
                        onSearchChange={setSearch}
                        pageSize={pagination.pageSize}
                        onPageSizeChange={pagination.setPageSize}
                        resultCount={pagination.totalItems}
                        placeholder="ค้นหาประเภท รุ่น หรือเลขทะเบียน"
                    />

                    <div className="mt-4">
                        <select
                            value={typeFilter}
                            onChange={(event) => setTypeFilter(event.target.value)}
                            className="form-select w-full text-sm sm:w-64"
                        >
                            <option value="all">ทุกประเภทเครื่อง</option>
                            {catalog.map((group) => (
                                <option key={group.type} value={group.type}>
                                    {group.type} ({group.availableCount} เครื่อง)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mt-6 grid gap-4 xl:grid-cols-2">
                        {pagination.paginatedItems.length > 0 ? (
                            pagination.paginatedItems.map((group) => {
                                const quantity = quantities[group.type] || 0;

                                return (
                                    <div key={group.type} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                                        <div className="flex gap-4">
                                            <EquipmentImage
                                                src={group.imageUrl}
                                                alt={group.type}
                                                className="h-24 w-24 shrink-0 rounded-3xl border border-slate-200"
                                                imageClassName="object-cover"
                                                labelClassName="text-xs"
                                                sizes="96px"
                                            />

                                            <div className="min-w-0 flex-1 space-y-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="text-base font-semibold text-slate-900">{group.type}</h3>
                                                    <span className="chip chip-success">{group.availableCount} เครื่อง</span>
                                                </div>
                                                <p className="text-sm text-slate-500">
                                                    เลือกจำนวนก่อน ระบบจะแสดงรายละเอียดอ้างอิงของรายการที่เลือกด้านล่าง
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">จำนวนที่ต้องการ</p>
                                                <p className="text-xs text-slate-500">สูงสุด {group.availableCount} เครื่อง</p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => updateQuantity(group.type, quantity - 1)}
                                                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:border-[#b7cfca] hover:bg-white"
                                                    aria-label={`ลดจำนวน ${group.type}`}
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </button>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={group.availableCount}
                                                    inputMode="numeric"
                                                    value={quantity}
                                                    onChange={(event) => updateQuantity(group.type, Number(event.target.value))}
                                                    className="form-input h-10 w-20 px-3 text-center"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => updateQuantity(group.type, quantity + 1)}
                                                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:border-[#b7cfca] hover:bg-white"
                                                    aria-label={`เพิ่มจำนวน ${group.type}`}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {quantity > 0 ? (
                                            <div className="mt-4 space-y-3 rounded-2xl border border-[#cfe1dc] bg-[#f7fbfa] p-4">
                                                <p className="text-sm leading-6 text-slate-600">{group.description}</p>
                                                <div className="space-y-2">
                                                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                                                        รายการอ้างอิงในคลัง
                                                    </p>
                                                    {group.items.slice(0, Math.min(quantity + 1, 3)).map((item) => (
                                                        <div
                                                            key={item.id}
                                                            className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-600"
                                                        >
                                                            <span className="min-w-0 break-words font-medium text-slate-700">{item.name}</span>
                                                            <span className="shrink-0 text-xs text-slate-500">{item.serial}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center text-sm text-slate-500 xl:col-span-2">
                                ไม่พบอุปกรณ์ที่ตรงกับคำค้นหา
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

                <div className="space-y-6 xl:sticky xl:top-28 xl:self-start">
                    <GlassCard className="bg-white">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="tone-info flex h-11 w-11 items-center justify-center rounded-2xl">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900">สรุปคำขอและข้อมูลภารกิจ</h2>
                                <p className="text-sm text-slate-500">ตรวจสอบรายการที่เลือกและกรอกข้อมูลผู้ประสานงาน</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {message.text ? (
                                <div
                                    className={`rounded-2xl px-4 py-3 text-sm ${
                                        message.type === "error"
                                            ? "border border-rose-200 bg-rose-50 text-rose-700"
                                            : "border border-emerald-200 bg-emerald-50 text-emerald-700"
                                    }`}
                                >
                                    {message.text}
                                </div>
                            ) : null}

                            {userAgency ? (
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                    <span className="text-xs font-medium uppercase tracking-wider text-slate-500">หน่วยงาน</span>
                                    <p className="mt-0.5 text-sm font-semibold text-slate-900">{userAgency}</p>
                                </div>
                            ) : null}

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <label className="label">มีหนังสือเลขที่</label>
                                    <div className="relative">
                                        <Hash className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={formData.document_reference}
                                            onChange={(event) => setFormData({ ...formData, document_reference: event.target.value })}
                                            placeholder="เช่น สธ 0402/1234"
                                            className="form-input form-input-icon"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="label">เรื่อง</label>
                                    <input
                                        type="text"
                                        value={formData.subject}
                                        onChange={(event) => setFormData({ ...formData, subject: event.target.value })}
                                        placeholder="เช่น ขอยืมเครื่องพ่นสารเคมี"
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">รายการอุปกรณ์ที่ขอยืม</p>
                                        <p className="text-xs text-slate-500">รวม {totalRequested} เครื่อง ({selectedRequests.length} ประเภท)</p>
                                    </div>
                                </div>

                                {selectedRequests.length > 0 ? (
                                    <div className="mt-4 overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                    <th className="px-3 py-2 text-center">#</th>
                                                    <th className="px-3 py-2">รายการ</th>
                                                    <th className="px-3 py-2 text-center">จำนวน</th>
                                                    <th className="px-3 py-2">รหัสครุภัณฑ์</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(() => {
                                                    let rowIndex = 0;
                                                    return selectedRequests.flatMap((group) =>
                                                        group.items.slice(0, group.quantity).map((item, itemIdx) => {
                                                            rowIndex += 1;
                                                            return (
                                                                <tr key={item.id} className="border-b border-slate-100 bg-white">
                                                                    <td className="px-3 py-2.5 text-center text-slate-500">{rowIndex}</td>
                                                                    <td className="px-3 py-2.5">
                                                                        <span className="font-medium text-slate-900">{item.name}</span>
                                                                        {itemIdx === 0 && group.quantity > 1 ? (
                                                                            <span className="ml-2 text-xs text-slate-400">
                                                                                ({group.quantity} เครื่อง)
                                                                            </span>
                                                                        ) : null}
                                                                    </td>
                                                                    <td className="px-3 py-2.5 text-center text-slate-600">1</td>
                                                                    <td className="px-3 py-2.5 text-slate-600">{item.serial}</td>
                                                                </tr>
                                                            );
                                                        }),
                                                    );
                                                })()}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm text-slate-500">
                                        ยังไม่ได้เลือกอุปกรณ์ กรุณาระบุจำนวนจากรายการด้านซ้ายก่อนส่งคำขอ
                                    </div>
                                )}
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <label className="label">วันที่ใช้งาน</label>
                                    <div className="relative">
                                        <CalendarRange className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="date"
                                            value={formData.borrow_date}
                                            onChange={(event) => setFormData({ ...formData, borrow_date: event.target.value })}
                                            required
                                            className="form-input form-input-icon"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="label">กำหนดคืนอัตโนมัติ</label>
                                    <input type="date" value={getDueDate()} readOnly className="form-input bg-slate-100 text-slate-500" />
                                </div>
                            </div>

                            <div>
                                <label className="label">วัตถุประสงค์ / พื้นที่ปฏิบัติงาน</label>
                                <div className="relative">
                                    <FileText className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={formData.purpose}
                                        onChange={(event) => setFormData({ ...formData, purpose: event.target.value })}
                                        required
                                        placeholder="เช่น ภารกิจควบคุมโรคในพื้นที่ชุมชนหรือสถานศึกษา"
                                        className="form-input form-input-icon"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <label className="label">ผู้ประสานงาน</label>
                                    <input
                                        type="text"
                                        value={formData.contact_name}
                                        onChange={(event) => setFormData({ ...formData, contact_name: event.target.value })}
                                        required
                                        placeholder="ชื่อผู้ประสานงาน"
                                        className="form-input"
                                    />
                                </div>

                                <div>
                                    <label className="label">เบอร์โทรติดต่อ</label>
                                    <div className="relative">
                                        <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="tel"
                                            value={formData.contact_phone}
                                            onChange={(event) =>
                                                setFormData({ ...formData, contact_phone: digitsOnly(event.target.value) })
                                            }
                                            required
                                            inputMode="numeric"
                                            pattern="[0-9]{9,10}"
                                            maxLength={10}
                                            placeholder="0812345678"
                                            className="form-input form-input-icon"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="label">หมายเหตุเพิ่มเติม</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(event) => setFormData({ ...formData, notes: event.target.value })}
                                    rows={4}
                                    placeholder="ระบุรายละเอียดเพิ่มเติม เช่น ช่วงเวลาปฏิบัติงานหรือข้อจำกัดของพื้นที่"
                                    className="form-textarea"
                                />
                            </div>

                            <div className="tone-info rounded-3xl px-4 py-4 text-sm leading-6">
                                <div className="flex items-start gap-3">
                                    <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                                    <p>
                                        หลังส่งคำขอ ระบบจะจัดสรรเครื่องจากรายการที่พร้อมใช้งานตามจำนวนที่ขอ หากจำนวนคงเหลือเปลี่ยนระหว่างทำรายการ ระบบจะแจ้งเตือนก่อนบันทึกคำขอ
                                    </p>
                                </div>
                            </div>

                            <Button type="submit" size="lg" isLoading={isLoading} className="w-full">
                                ส่งคำขอยืมอุปกรณ์
                            </Button>
                        </form>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
