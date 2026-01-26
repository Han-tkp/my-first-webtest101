import { createClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/GlassCard";
import TechnicianPage from "@/app/dashboard/technician/page"; // Reuse existing tech page logic

export default async function TechnicianView() {
    // We can reuse the existing Technician Page component since it already has the logic we want
    // But we'll wrap it differently or just import its contents.
    // For cleaner architecture, let's just use the existing page content as a component.
    // However, TechnicianPage is an async component page.

    // Let's refetch data specific for "My Work Queue" summary here if we want a dashboard feel,
    // OR just render the full technician page which is already designed as a dashboard.

    return (
        <div className="space-y-6 fade-in">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">ส่วนงานช่าง (Technician)</h1>
                <span className="text-sm text-white/50 bg-white/10 px-3 py-1 rounded-full">
                    พร้อมปฏิบัติงาน
                </span>
            </div>

            {/* Reuse the existing technician dashboard layout */}
            <TechnicianPage />
        </div>
    );
}
