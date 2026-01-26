import { createClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/GlassCard";

export default async function HistoryPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: borrows } = await supabase
        .from("borrows")
        .select("*, equipment:equipment_ids")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

    const statusLabels: Record<string, { text: string; color: string }> = {
        pending_borrow_approval: { text: "รออนุมัติ", color: "bg-yellow-500/20 text-yellow-300" },
        pending_delivery: { text: "รอช่างตรวจ", color: "bg-cyan-500/20 text-cyan-300" },
        borrowed: { text: "ยืมอยู่", color: "bg-blue-500/20 text-blue-300" },
        rejected: { text: "ไม่อนุมัติ", color: "bg-red-500/20 text-red-300" },
        cancelled: { text: "ยกเลิก", color: "bg-gray-500/20 text-gray-300" },
        returned_early: { text: "คืนก่อนกำหนด", color: "bg-teal-500/20 text-teal-300" },
        returned_late: { text: "คืนล่าช้า", color: "bg-orange-500/20 text-orange-300" },
        returned: { text: "คืนแล้ว", color: "bg-green-500/20 text-green-300" },
        returned_damaged: { text: "คืน (ชำรุด)", color: "bg-orange-500/20 text-orange-300" },
    };

    return (
        <div className="fade-in">
            <GlassCard>
                <h2 className="text-xl font-bold mb-6">ประวัติการยืม-คืน</h2>

                <div className="space-y-4">
                    {borrows && borrows.length > 0 ? (
                        borrows.map((borrow) => {
                            const status = statusLabels[borrow.status] || { text: "N/A", color: "bg-gray-500/20" };
                            return (
                                <div
                                    key={borrow.id}
                                    className="p-4 rounded-xl bg-white/5 border border-white/10"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <span className="font-semibold">คำขอยืม #{borrow.id}</span>
                                            <span className="text-white/50 ml-2">
                                                ({Array.isArray(borrow.equipment_ids) ? borrow.equipment_ids.length : 0} เครื่อง)
                                            </span>
                                        </div>
                                        <span className={`text-xs px-3 py-1 rounded-full ${status.color}`}>
                                            {status.text}
                                        </span>
                                    </div>
                                    <div className="text-sm text-white/70 space-y-1">
                                        <p><span className="text-white/50">วัตถุประสงค์:</span> {borrow.purpose}</p>
                                        <p><span className="text-white/50">วันที่ยืม:</span> {borrow.borrow_date} | <span className="text-white/50">กำหนดคืน:</span> {borrow.due_date}</p>
                                        {borrow.actual_return_date && (
                                            <p><span className="text-white/50">วันที่คืน:</span> {borrow.actual_return_date}</p>
                                        )}
                                        {borrow.late_return_reason && (
                                            <p className="text-orange-300"><span className="text-white/50">เหตุผลคืนช้า:</span> {borrow.late_return_reason}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-12 text-white/50">
                            ไม่มีประวัติการยืม
                        </div>
                    )}
                </div>
            </GlassCard>
        </div>
    );
}
