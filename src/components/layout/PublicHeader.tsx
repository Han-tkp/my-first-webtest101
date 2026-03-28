"use client";

import Link from "next/link";
import { useState } from "react";
import { Activity, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function PublicHeader() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 border-b border-[color:var(--color-border)]/80 bg-[color:var(--color-surface)]/92 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                <div className="flex min-w-0 items-center gap-4">
                    <div className="brand-fill flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
                        <Activity className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-base font-semibold text-[color:var(--color-foreground)]">VBDC 12.4</p>
                        <p className="truncate text-sm text-[color:var(--color-foreground-muted)]">
                            ระบบบริหารการยืม คืน และซ่อมบำรุงอุปกรณ์สำหรับงานสาธารณสุข
                        </p>
                    </div>
                </div>

                <nav className="hidden items-center gap-3 md:flex">
                    <Link href="/login">
                        <Button variant="glass" size="sm">
                            เข้าสู่ระบบ
                        </Button>
                    </Link>
                    <Link href="/register">
                        <Button variant="primary" size="sm">
                            ลงทะเบียนใช้งาน
                        </Button>
                    </Link>
                </nav>

                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-foreground)] transition hover:bg-[color:var(--color-surface-muted)] md:hidden"
                    aria-label="Open navigation menu"
                >
                    <Menu className="h-5 w-5" />
                </button>
            </div>

            {isOpen ? (
                <div className="fixed inset-0 z-[60] bg-[rgba(22,50,70,0.28)] backdrop-blur-sm md:hidden">
                    <div className="ml-auto flex h-full w-full max-w-sm flex-col bg-[color:var(--color-surface)] shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[color:var(--color-border)] px-5 py-4">
                            <div>
                                <p className="font-semibold text-[color:var(--color-foreground)]">เมนูหลัก</p>
                                <p className="text-sm text-[color:var(--color-foreground-muted)]">เข้าสู่ระบบหรือเปิดบัญชีผู้ใช้งานใหม่</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-foreground)] transition hover:bg-[color:var(--color-surface-muted)]"
                                aria-label="Close navigation menu"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex flex-1 flex-col gap-3 px-5 py-5">
                            <Link href="/login" onClick={() => setIsOpen(false)}>
                                <Button variant="glass" size="lg" className="w-full justify-center">
                                    เข้าสู่ระบบ
                                </Button>
                            </Link>
                            <Link href="/register" onClick={() => setIsOpen(false)}>
                                <Button variant="primary" size="lg" className="w-full justify-center">
                                    ลงทะเบียนใช้งาน
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            ) : null}
        </header>
    );
}
