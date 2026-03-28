"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";

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

function formatRelativeDate(dateValue: string) {
    return new Intl.DateTimeFormat("th-TH", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(dateValue));
}

export function NotificationsMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [items, setItems] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const loadNotifications = async () => {
        setIsLoading(true);
        const response = await fetch("/api/notifications?limit=8", { cache: "no-store" });
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

    const unreadItems = useMemo(() => items.filter((item) => !item.is_read).length, [items]);

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
        <div className="relative">
            <button
                type="button"
                onClick={() => {
                    setIsOpen((previous) => !previous);
                    void loadNotifications();
                }}
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-[color:var(--color-border)] hover:bg-[color:var(--color-surface-muted)]"
                aria-label="Open notifications"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 ? (
                    <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[color:var(--color-danger)] px-1 text-[11px] font-semibold text-white">
                        {unreadCount}
                    </span>
                ) : null}
            </button>

            {isOpen ? (
                <div className="absolute right-0 z-50 mt-3 w-[22rem] rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_24px_48px_rgba(15,23,42,0.12)]">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-semibold text-slate-900">การแจ้งเตือน</p>
                            <p className="text-xs text-slate-500">ยังไม่ได้อ่าน {unreadItems} รายการ</p>
                        </div>
                        <button
                            type="button"
                            onClick={markAllAsRead}
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                        >
                            <CheckCheck className="h-3.5 w-3.5" />
                            อ่านทั้งหมด
                        </button>
                    </div>

                    <div className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
                        {isLoading ? (
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                                กำลังโหลดการแจ้งเตือน...
                            </div>
                        ) : items.length > 0 ? (
                            items.map((item) => {
                                const content = (
                                    <>
                                        <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                                        <p className="mt-1 text-sm leading-6 text-slate-600">{item.body}</p>
                                        <p className="mt-2 text-[11px] text-slate-400">{formatRelativeDate(item.created_at)}</p>
                                    </>
                                );

                                return item.action_url ? (
                                    <Link
                                        key={item.id}
                                        href={item.action_url}
                                        onClick={() => {
                                            void markAsRead(item.id);
                                            setIsOpen(false);
                                        }}
                                        className={`block rounded-2xl border px-4 py-3 transition ${
                                            item.is_read
                                                ? "border-slate-200 bg-white hover:bg-slate-50"
                                                : "border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] hover:bg-[color:var(--color-background-muted)]"
                                        }`}
                                    >
                                        {content}
                                    </Link>
                                ) : (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => void markAsRead(item.id)}
                                        className={`block w-full rounded-2xl border px-4 py-3 text-left transition ${
                                            item.is_read
                                                ? "border-slate-200 bg-white hover:bg-slate-50"
                                                : "border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] hover:bg-[color:var(--color-background-muted)]"
                                        }`}
                                    >
                                        {content}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                                ยังไม่มีการแจ้งเตือนใหม่
                            </div>
                        )}
                    </div>

                    <div className="mt-4 border-t border-slate-200 pt-4 text-right">
                        <Link
                            href="/dashboard/notifications"
                            onClick={() => setIsOpen(false)}
                            className="brand-link text-sm font-semibold"
                        >
                            ดูทั้งหมด
                        </Link>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
