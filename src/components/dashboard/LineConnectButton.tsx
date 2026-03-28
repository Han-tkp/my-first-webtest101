// src/components/dashboard/LineConnectButton.tsx
"use client";

import { useState, useEffect } from 'react';
import { MessageCircle, CheckCircle2, Loader2 } from "lucide-react";

export function LineConnectButton() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'connected' | 'unlinked'>('idle');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        setStatus('loading');
        try {
            const res = await fetch('/api/line/status');
            const data = await res.json();
            setStatus(data.connected ? 'connected' : 'unlinked');
        } catch (err) {
            console.error(err);
            setStatus('unlinked');
        }
    };

    const handleLink = async () => {
        setActionLoading(true);
        try {
            const res = await fetch('/api/line/link', { method: 'POST' });
            const data = await res.json();
            if (data.url) {
                window.open(data.url, '_blank');
                // Start polling or just inform user
                alert('เปิดแอป LINE เพื่อยืนยันการเชื่อมต่อ (ส่งข้อความรหัสที่ปรากฏในช่องแชท)');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnlink = async () => {
        if (!confirm('คุณต้องการยกเลิกการเชื่อมต่อ LINE ใช่หรือไม่?')) return;
        setActionLoading(true);
        try {
            const res = await fetch('/api/line/unlink', { method: 'POST' });
            if (res.ok) {
                setStatus('unlinked');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    if (status === 'loading') {
        return (
            <div className="flex items-center gap-2 p-4 animate-pulse">
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                <span className="text-sm text-slate-500">กำลังตรวจสอบสถานะ...</span>
            </div>
        );
    }

    if (status === 'connected') {
        return (
            <div className="rounded-3xl border border-emerald-100 bg-emerald-50/50 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                            <MessageCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                เชื่อมต่อ LINE สำเร็จ
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            </h3>
                            <p className="text-sm text-slate-500">คุณจะได้รับการแจ้งเตือนผ่าน LINE OA</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleUnlink}
                        disabled={actionLoading}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition"
                    >
                        {actionLoading ? '...' : 'ยกเลิกการเชื่อมต่อ'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-200 text-slate-500">
                        <MessageCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900">รับแจ้งเตือนผ่าน LINE</h3>
                        <p className="text-sm text-slate-500">เชื่อมต่อบัญชีเพื่อรับข่าวสารและสถานะอุปกรณ์</p>
                    </div>
                </div>
                <button
                    onClick={handleLink}
                    disabled={actionLoading}
                    className="action-success px-6 py-2.5 text-sm flex items-center gap-2 disabled:opacity-50"
                >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                    เปิดรับการแจ้งเตือน LINE
                </button>
            </div>
        </div>
    );
}
