// src/app/dashboard/settings/page.tsx
import { LineConnectButton } from '@/components/dashboard/LineConnectButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { Settings, UserCircle, BellRing, ShieldCheck } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="space-y-8 fade-in">
            <div className="flex flex-col gap-2">
                <p className="section-kicker">Manage Your Account</p>
                <h1 className="text-3xl font-semibold text-slate-900">ตั้งค่าการใช้งาน</h1>
                <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
                    จัดการข้อมูลส่วนตัว ความเป็นส่วนตัว และช่องทางการรับการแจ้งเตือนจากระบบ เพื่อให้คุณไม่พลาดทุกสถานะอุปกรณ์
                </p>
            </div>

            <div className="grid gap-6">
                <GlassCard className="bg-white">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                            <BellRing className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">การแจ้งเตือน</h2>
                            <p className="text-sm text-slate-500">ช่องทางและรูปแบบการรับข้อมูล</p>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <LineConnectButton />
                        
                        <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6 opacity-60">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400">
                                        <BellRing className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">Push Notification (เบราว์เซอร์)</h3>
                                        <p className="text-sm text-slate-500">เปิดรับการแจ้งเตือนแบบพุชในเบราว์เซอร์</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Coming Soon</span>
                            </div>
                        </div>
                    </div>
                </GlassCard>

                <div className="grid gap-6 md:grid-cols-2">
                    <GlassCard className="bg-white">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                                <UserCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">ข้อมูลส่วนตัว</h2>
                                <p className="text-xs text-slate-500">ชื่อ-นามสกุล และประวัติการทำงาน</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 italic">กรุณาติดต่อผู้ดูแลระบบเพื่อแก้ไขข้อมูลพื้นฐาน</p>
                    </GlassCard>

                    <GlassCard className="bg-white">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">ความปลอดภัย</h2>
                                <p className="text-xs text-slate-500">รหัสผ่านและการเข้าถึง</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 italic">ฟังก์ชันการเปลี่ยนรหัสผ่านกำลังอยู่ระหว่างการพัฒนา</p>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
