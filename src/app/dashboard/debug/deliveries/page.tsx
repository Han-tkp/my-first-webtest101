"use client";

import { useCallback, useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { AlertTriangle, CheckCircle, Clock, XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Delivery {
    id: number;
    channel: string;
    provider: string;
    recipient: string;
    status: string;
    error_name: string | null;
    error_message: string | null;
    dedupe_key: string;
    last_attempt_at: string | null;
    created_at: string;
}

const statusConfig: Record<string, { label: string; class: string; icon: typeof CheckCircle }> = {
    sent: { label: "ส่งสำเร็จ", class: "chip-success", icon: CheckCircle },
    failed: { label: "ล้มเหลว", class: "chip-danger", icon: XCircle },
    queued: { label: "รอส่ง", class: "chip-warning", icon: Clock },
    skipped: { label: "ข้าม", class: "chip", icon: AlertTriangle },
};

export default function DeliveriesPage() {
    const [deliveries, setDeliveries] = useState<Delivery[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<string>("all");
    const [channelFilter, setChannelFilter] = useState<string>("all");

    const loadDeliveries = useCallback(async () => {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (filter !== "all") params.set("status", filter);
        if (channelFilter !== "all") params.set("channel", channelFilter);
        params.set("limit", "100");

        try {
            const res = await fetch(`/api/notifications/deliveries?${params}`);
            if (res.ok) {
                setDeliveries(await res.json());
            }
        } finally {
            setIsLoading(false);
        }
    }, [filter, channelFilter]);

    useEffect(() => {
        void loadDeliveries();
    }, [loadDeliveries]);

    const failedCount = deliveries.filter((d) => d.status === "failed").length;

    return (
        <div className="mx-auto max-w-6xl space-y-6 fade-in">
            <div className="flex items-center gap-3">
                <Link
                    href="/dashboard/debug"
                    className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div className="space-y-1">
                    <p className="section-kicker">Notification Deliveries</p>
                    <h1 className="text-3xl font-semibold text-slate-900">สถานะการส่งแจ้งเตือน</h1>
                </div>
            </div>

            {failedCount > 0 ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    พบการส่งล้มเหลว {failedCount} รายการ
                </div>
            ) : null}

            <GlassCard className="bg-white">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="form-select w-full text-sm sm:w-48"
                    >
                        <option value="all">ทุกสถานะ</option>
                        <option value="failed">ล้มเหลว</option>
                        <option value="sent">ส่งสำเร็จ</option>
                        <option value="queued">รอส่ง</option>
                        <option value="skipped">ข้าม</option>
                    </select>
                    <select
                        value={channelFilter}
                        onChange={(e) => setChannelFilter(e.target.value)}
                        className="form-select w-full text-sm sm:w-48"
                    >
                        <option value="all">ทุกช่องทาง</option>
                        <option value="email">Email</option>
                        <option value="in_app">In-App</option>
                    </select>
                </div>

                {isLoading ? (
                    <div className="py-12 text-center text-sm text-slate-500">กำลังโหลด...</div>
                ) : deliveries.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center text-sm text-slate-500">
                        ไม่พบรายการส่งแจ้งเตือนที่ตรงกับเงื่อนไข
                    </div>
                ) : (
                    <div className="space-y-3">
                        {deliveries.map((d) => {
                            const cfg = statusConfig[d.status] || statusConfig.queued!;
                            const Icon = cfg.icon;
                            return (
                                <div key={d.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Icon className="h-4 w-4 shrink-0" />
                                                <span className={`chip ${cfg.class}`}>{cfg.label}</span>
                                                <span className="chip">{d.channel}</span>
                                                <span className="text-xs text-slate-500">{d.provider}</span>
                                            </div>
                                            <div className="mt-2 space-y-1 text-sm text-slate-600">
                                                <div>
                                                    <span className="font-medium text-slate-700">ผู้รับ:</span> {d.recipient}
                                                </div>
                                                <div>
                                                    <span className="font-medium text-slate-700">เวลา:</span>{" "}
                                                    {new Date(d.created_at).toLocaleString("th-TH")}
                                                </div>
                                                {d.error_message ? (
                                                    <div className="mt-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                                                        <span className="font-semibold">{d.error_name || "Error"}:</span> {d.error_message}
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                        <div className="text-xs text-slate-400 sm:text-right">
                                            #{d.id}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </GlassCard>
        </div>
    );
}
