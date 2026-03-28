import { Ban, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";

export default function SuspendedPage() {
    return (
        <div className="min-h-screen bg-gradient-dark px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center justify-center">
                <GlassCard className="w-full max-w-2xl bg-white p-8 text-center sm:p-10">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 text-rose-700">
                        <Ban className="h-9 w-9" />
                    </div>
                    <p className="section-kicker mt-6 text-rose-700">Account Suspended</p>
                    <h1 className="mt-3 text-3xl font-semibold text-slate-900">บัญชีถูกระงับการใช้งาน</h1>
                    <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-slate-600">
                        ระบบยังไม่อนุญาตให้เข้าใช้งานด้วยบัญชีนี้ กรุณาติดต่อผู้ดูแลระบบหรือผู้รับผิดชอบประจำหน่วยงาน
                        เพื่อขอตรวจสอบสถานะและแนวทางดำเนินการต่อ
                    </p>

                    <div className="mx-auto mt-8 max-w-xl rounded-3xl border border-rose-100 bg-rose-50 p-5 text-left">
                        <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-rose-700">
                                <ShieldAlert className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-900">ข้อแนะนำ</p>
                                <p className="mt-2 text-sm leading-7 text-slate-600">
                                    หากบัญชีถูกระงับจากข้อมูลไม่ครบถ้วนหรือสิทธิ์ไม่ตรงบทบาท ให้แจ้งผู้ดูแลระบบพร้อมชื่อหน่วยงานและอีเมลที่ใช้ลงทะเบียน
                                </p>
                            </div>
                        </div>
                    </div>

                    <form action="/api/auth/logout" method="POST" className="mt-8">
                        <Button variant="glass" size="lg" type="submit">
                            ออกจากระบบ
                        </Button>
                    </form>
                </GlassCard>
            </div>
        </div>
    );
}
