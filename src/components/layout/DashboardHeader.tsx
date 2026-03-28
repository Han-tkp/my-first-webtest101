"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Activity, LogOut, Menu, ShieldCheck, UserRound, X } from "lucide-react";
import { NotificationsMenu } from "@/components/layout/NotificationsMenu";
import { Button } from "@/components/ui/Button";

interface DashboardTab {
    id: string;
    label: string;
    href: string;
}

interface DashboardHeaderProps {
    fullName: string;
    agency: string;
    roleLabel: string;
    tabs: DashboardTab[];
}

/* ──────────────────────────────────────────────
   Mobile Sidebar — rendered via Portal to <body>
   so it sits above everything and is never
   clipped by header overflow / stacking context.
   ────────────────────────────────────────────── */
function MobileSidebar({
    isOpen,
    onClose,
    fullName,
    agency,
    roleLabel,
    tabs,
    tabClass,
}: {
    isOpen: boolean;
    onClose: () => void;
    fullName: string;
    agency: string;
    roleLabel: string;
    tabs: DashboardTab[];
    tabClass: (href: string) => string;
}) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Lock body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0"
            style={{ zIndex: 9999 }}
        >
            {/* Dark backdrop */}
            <div
                className="absolute inset-0"
                style={{ backgroundColor: "rgba(0, 0, 0, 0.45)", backdropFilter: "blur(4px)" }}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Sidebar panel — right edge, full height */}
            <aside
                className="absolute top-0 right-0 bottom-0 flex flex-col shadow-2xl"
                style={{
                    width: "288px",
                    backgroundColor: "#fffaf2",
                }}
            >
                {/* Header with user info */}
                <div
                    className="flex items-center justify-between px-4 py-3"
                    style={{ borderBottom: "1px solid #d8ccb9" }}
                >
                    <div className="min-w-0">
                        <p className="text-sm font-semibold" style={{ color: "#172532" }}>{fullName}</p>
                        <p className="text-xs" style={{ color: "#5f6d78" }}>{agency}</p>
                        <span className="chip chip-success mt-1 inline-block" style={{ fontSize: "11px" }}>{roleLabel}</span>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100"
                        aria-label="Close dashboard menu"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Navigation links */}
                <div className="flex-1 overflow-y-auto px-3 py-3">
                    <nav className="space-y-1">
                        {tabs.map((tab) => (
                            <Link
                                key={tab.id}
                                href={tab.href}
                                onClick={onClose}
                                className={`block rounded-xl px-3 py-2.5 text-sm font-medium transition ${tabClass(tab.href)}`}
                            >
                                {tab.label}
                            </Link>
                        ))}
                        <Link
                            href="/dashboard/notifications"
                            onClick={onClose}
                            className={`block rounded-xl px-3 py-2.5 text-sm font-medium transition ${tabClass("/dashboard/notifications")}`}
                        >
                            การแจ้งเตือน
                        </Link>
                    </nav>
                </div>

                {/* Logout */}
                <div className="px-3 py-3" style={{ borderTop: "1px solid #d8ccb9" }}>
                    <form action="/api/auth/logout" method="POST">
                        <Button variant="glass" size="sm" type="submit" className="w-full justify-center">
                            <LogOut className="h-4 w-4" />
                            ออกจากระบบ
                        </Button>
                    </form>
                </div>
            </aside>
        </div>,
        document.body,
    );
}

/* ──────────────────────────────────────────────
   Dashboard Header
   ────────────────────────────────────────────── */
export function DashboardHeader({
    fullName,
    agency,
    roleLabel,
    tabs,
}: DashboardHeaderProps) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    // Close sidebar on route change
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    const tabClass = (href: string) => {
        const isActive = pathname === href;
        return isActive ? "brand-tab-active" : "brand-tab-idle";
    };

    return (
        <>
            <header className="sticky top-0 z-50 border-b border-(--color-border)/85 bg-(--color-surface)/94 backdrop-blur-xl">
                <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                            <Link
                                href="/dashboard"
                                className="brand-fill flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                            >
                                <Activity className="h-5 w-5" />
                            </Link>

                            <div className="min-w-0">
                                <Link href="/dashboard" className="block text-base font-semibold text-(--color-foreground)">
                                    VBDC 12.4
                                </Link>
                                <p className="hidden text-xs text-(--color-foreground-muted) sm:block">
                                    ระบบบริหารการยืม คืน และซ่อมบำรุงอุปกรณ์สำหรับงานสาธารณสุข
                                </p>
                            </div>
                        </div>

                        {/* Desktop right-side actions */}
                        <div className="hidden items-center gap-2 lg:flex">
                            <NotificationsMenu />
                            <div className="flex items-center gap-2.5 rounded-xl border border-(--color-border) bg-(--color-surface-muted) px-3 py-2">
                                <div className="brand-fill-soft flex h-8 w-8 items-center justify-center rounded-full">
                                    <UserRound className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold leading-tight text-(--color-foreground)">{fullName}</p>
                                    <p className="text-xs text-(--color-foreground-muted)">{agency}</p>
                                </div>
                                <div className="hidden h-6 w-px bg-(--color-border) xl:block" />
                                <div className="hidden items-center gap-1.5 xl:flex">
                                    <ShieldCheck className="h-3.5 w-3.5 text-(--color-primary)" />
                                    <span className="text-xs font-medium text-(--color-foreground-muted)">{roleLabel}</span>
                                </div>
                            </div>

                            <form action="/api/auth/logout" method="POST">
                                <Button variant="glass" size="sm" type="submit">
                                    <LogOut className="h-4 w-4" />
                                    ออกจากระบบ
                                </Button>
                            </form>
                        </div>

                        {/* Mobile hamburger */}
                        <button
                            type="button"
                            onClick={() => setIsOpen(true)}
                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-(--color-border) bg-(--color-surface) text-(--color-foreground) transition hover:bg-(--color-surface-muted) lg:hidden"
                            aria-label="Open dashboard menu"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Desktop tabs */}
                    <nav className="mt-3 hidden gap-1.5 overflow-x-auto pb-0.5 lg:flex">
                        {tabs.map((tab) => (
                            <Link
                                key={tab.id}
                                href={tab.href}
                                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${tabClass(tab.href)}`}
                            >
                                {tab.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            </header>

            {/* Mobile sidebar — portalled to document.body */}
            <MobileSidebar
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                fullName={fullName}
                agency={agency}
                roleLabel={roleLabel}
                tabs={tabs}
                tabClass={tabClass}
            />
        </>
    );
}
