import { CheckCheck } from "lucide-react";
import ApprovalsPage from "@/app/dashboard/approvals/page";

export default async function ApproverView() {
    return (
        <div className="space-y-6 fade-in">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-2">
                    <p className="section-kicker">Approval Center</p>
                    <h1 className="text-3xl font-semibold text-slate-900">ศูนย์อนุมัติคำขอ</h1>
                    <p className="max-w-2xl text-sm leading-7 text-slate-600">
                        ตรวจสอบบัญชีผู้ใช้ใหม่ คำขอยืม และคำขอซ่อมจากหน้าเดียวในรูปแบบที่อ่านง่ายและเหมาะกับงานราชการ
                    </p>
                </div>

                <div className="tone-success inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
                    <CheckCheck className="h-4 w-4" />
                    พร้อมตรวจสอบคำขอ
                </div>
            </div>

            <ApprovalsPage />
        </div>
    );
}
