import { createClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/GlassCard";
import ApprovalsPage from "@/app/dashboard/approvals/page"; // Reuse existing approvals page

export default async function ApproverView() {
    return (
        <div className="space-y-6 fade-in">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">ศูนย์อนุมัติ (Approval Center)</h1>
                <span className="text-sm text-white/50 bg-white/10 px-3 py-1 rounded-full">
                    รอตรวจสอบ
                </span>
            </div>

            {/* Reuse the existing approvals dashboard layout */}
            <ApprovalsPage />
        </div>
    );
}
