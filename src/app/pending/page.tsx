import { Clock3, FileClock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";

export default function PendingPage() {
    return (
        <div className="min-h-screen bg-gradient-dark px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center justify-center">
                <GlassCard className="w-full max-w-2xl bg-white p-8 text-center sm:p-10">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-amber-700">
                        <Clock3 className="h-9 w-9" />
                    </div>
                    <p className="section-kicker mt-6">Pending Approval</p>
                    <h1 className="mt-3 text-3xl font-semibold text-slate-900">บัญชีของคุณอยู่ระหว่างการตรวจสอบ</h1>
                    <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-slate-600">
                        ขณะนี้ผู้รับผิดชอบกำลังตรวจสอบข้อมูลการลงทะเบียน เมื่ออนุมัติแล้ว
                        คุณจะสามารถเข้าสู่แดชบอร์ดและใช้งานระบบได้ตามสิทธิ์ที่กำหนด
                    </p>

                    <div className="mx-auto mt-8 max-w-xl rounded-3xl border border-slate-200 bg-slate-50 p-5 text-left">
                        <div className="flex items-start gap-3">
                            <div className="brand-fill-soft flex h-11 w-11 items-center justify-center rounded-2xl">
                                <FileClock className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-900">สิ่งที่ควรทำระหว่างรออนุมัติ</p>
                                <p className="mt-2 text-sm leading-7 text-slate-600">
                                    หากข้อมูลหน่วยงานหรือเบอร์ติดต่อไม่ถูกต้อง กรุณาประสานผู้ดูแลระบบเพื่อแก้ไขก่อนใช้งานจริง
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
