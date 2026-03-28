import { GlassCard } from "@/components/ui/GlassCard";
import { requirePageRole } from "@/lib/auth";

export default async function SetupRolePage() {
    const profile = await requirePageRole("admin");

    return (
        <div className="mx-auto max-w-3xl pt-10">
            <GlassCard className="bg-white">
                <div className="space-y-4">
                    <p className="section-kicker">Administrative Notice</p>
                    <h1 className="text-3xl font-semibold text-slate-900">ยกเลิกหน้าทดสอบการเปลี่ยนสิทธิ์แล้ว</h1>
                    <p className="text-sm leading-7 text-slate-600">
                        ระบบได้ย้ายไปใช้ Auth.js แทน Supabase Auth แล้ว การเปลี่ยนบทบาทผู้ใช้งานต้องทำผ่านหน้า
                        จัดการผู้ใช้งานในแดชบอร์ดผู้ดูแลระบบเท่านั้น เพื่อป้องกันการยกระดับสิทธิ์โดยตรงจาก browser
                    </p>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
                        ผู้ดูแลระบบที่เข้าสู่ระบบอยู่ตอนนี้: <strong>{profile.full_name}</strong> ({profile.email})
                    </div>
                </div>
            </GlassCard>
        </div>
    );
}
