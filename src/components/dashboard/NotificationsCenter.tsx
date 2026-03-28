"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface NotificationItem {
    id: number;
    title: string;
    body: string;
    action_url: string | null;
    is_read: boolean;
    created_at: string;
}

interface NotificationResponse {
    notifications: NotificationItem[];
    unreadCount: number;
}

type NotificationCategory = "all" | "borrow" | "repair" | "user";

const CATEGORIES: { value: NotificationCategory; label: string }[] = [
    { value: "all", label: "ทั้งหมด" },
    { value: "borrow", label: "คำขอยืม" },
    { value: "repair", label: "งานซ่อม" },
    { value: "user", label: "ผู้ใช้งาน" },
];

const BORROW_KEYWORDS = ["ยืม", "คืน", "borrow", "return", "delivery", "ส่งมอบ"];
const REPAIR_KEYWORDS = ["ซ่อม", "repair", "ชำรุด", "damage"];
const USER_KEYWORDS = ["ผู้ใช้", "user", "สมัคร", "register", "อนุมัติผู้ใช้"];

function categorize(item: NotificationItem): NotificationCategory {
    const text = `${item.title} ${item.body}`.toLowerCase();
    if (BORROW_KEYWORDS.some((kw) => text.includes(kw))) return "borrow";
    if (REPAIR_KEYWORDS.some((kw) => text.includes(kw))) return "repair";
    if (USER_KEYWORDS.some((kw) => text.includes(kw))) return "user";
    return "all";
}

function formatDate(dateValue: string) {
    return new Intl.DateTimeFormat("th-TH", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(dateValue));
}

export function NotificationsCenter() {
    const [items, setItems] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [category, setCategory] = useState<NotificationCategory>("all");

    const loadNotifications = async () => {
        setIsLoading(true);
        const response = await fetch("/api/notifications?limit=50", { cache: "no-store" });
        if (response.ok) {
            const payload = (await response.json()) as NotificationResponse;
            setItems(payload.notifications);
            setUnreadCount(payload.unreadCount);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        void loadNotifications();
    }, []);

    const filteredItems = useMemo(() => {
        if (category === "all") return items;
        return items.filter((item) => categorize(item) === category);
    }, [items, category]);

    const markAllAsRead = async () => {
        await fetch("/api/notifications/read-all", { method: "POST" });
        setItems((previous) => previous.map((item) => ({ ...item, is_read: true })));
        setUnreadCount(0);
    };

    const markAsRead = async (id: number) => {
        await fetch(`/api/notifications/${id}/read`, { method: "POST" });
        setItems((previous) =>
            previous.map((item) => (item.id === id ? { ...item, is_read: true } : item)),
        );
        setUnreadCount((previous) => Math.max(previous - 1, 0));
    };

    return (
        <div className="space-y-6 fade-in">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="section-kicker">Notifications</p>
                    <h1 className="text-3xl font-semibold text-slate-900">ศูนย์การแจ้งเตือน</h1>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                        ติดตามงานที่ต้องดำเนินการ สถานะที่เปลี่ยนแปลง และรายการสำคัญตามบทบาทของคุณในระบบ
                    </p>
                </div>
                <button
                    type="button"
                    onClick={markAllAsRead}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                    อ่านทั้งหมด ({unreadCount})
                </button>
            </div>

            {/* Category filter tabs */}
            <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.value}
                        type="button"
                        onClick={() => setCategory(cat.value)}
                        className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                            category === cat.value
                                ? "brand-tab-active"
                                : "brand-tab-idle"
                        }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            <div className="max-h-[600px] space-y-3 overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
                {isLoading ? (
                    <div className="rounded-3xl border border-slate-200 bg-white px-5 py-10 text-center text-sm text-slate-500">
                        กำลังโหลดการแจ้งเตือน...
                    </div>
                ) : filteredItems.length > 0 ? (
                    filteredItems.map((item) => {
                        const cardClass = item.is_read
                            ? "border-slate-200 bg-white"
                            : "border-[#cfe1dc] bg-[#f7fbfa]";

                        const content = (
                            <div className={`rounded-3xl border p-5 transition hover:bg-white ${cardClass}`}>
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <p className="font-semibold text-slate-900">{item.title}</p>
                                        <p className="mt-2 text-sm leading-7 text-slate-600">{item.body}</p>
                                    </div>
                                    {!item.is_read ? (
                                        <span className="tone-info rounded-full px-3 py-1 text-xs font-semibold">
                                            ใหม่
                                        </span>
                                    ) : null}
                                </div>
                                <p className="mt-3 text-xs text-slate-400">{formatDate(item.created_at)}</p>
                            </div>
                        );

                        return item.action_url ? (
                            <Link
                                key={item.id}
                                href={item.action_url}
                                onClick={() => void markAsRead(item.id)}
                                className="block"
                            >
                                {content}
                            </Link>
                        ) : (
                            <button key={item.id} type="button" onClick={() => void markAsRead(item.id)} className="block w-full text-left">
                                {content}
                            </button>
                        );
                    })
                ) : (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center text-sm text-slate-500">
                        {category === "all" ? "ยังไม่มีการแจ้งเตือนในระบบ" : "ไม่มีการแจ้งเตือนในหมวดนี้"}
                    </div>
                )}
            </div>
        </div>
    );
}
