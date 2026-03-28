import { Wrench } from "lucide-react";
import TechnicianPage from "@/app/dashboard/technician/page";

export default async function TechnicianView() {
    return (
        <div className="space-y-6 fade-in">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-2">
                    <p className="section-kicker">Technician Workspace</p>
                    <h1 className="text-3xl font-semibold text-slate-900">ศูนย์ปฏิบัติงานช่าง</h1>
                    <p className="max-w-2xl text-sm leading-7 text-slate-600">
                        จัดการการส่งมอบ ตรวจสภาพหลังคืน และบันทึกงานซ่อมบำรุงในรูปแบบที่ชัดเจนต่อการติดตาม
                    </p>
                </div>

                <div className="tone-info inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
                    <Wrench className="h-4 w-4" />
                    สถานะพร้อมปฏิบัติงาน
                </div>
            </div>

            <TechnicianPage />
        </div>
    );
}
