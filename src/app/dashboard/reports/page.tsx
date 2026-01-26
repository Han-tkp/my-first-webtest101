import { createClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/GlassCard";
import { BentoGrid, BentoItem } from "@/components/ui/BentoGrid";

export default async function ReportsPage() {
    const supabase = await createClient();

    // Get summary data
    const { data: equipment } = await supabase.from("equipment").select("*");
    const { data: borrows } = await supabase.from("borrows").select("*");
    const { data: repairs } = await supabase.from("repairs").select("*");

    const totalEquipment = equipment?.length || 0;
    const totalBorrows = borrows?.length || 0;
    const totalRepairs = repairs?.length || 0;
    const completedRepairs = repairs?.filter(r => r.status === "completed") || [];
    const totalRepairCost = completedRepairs.reduce((sum, r) => sum + (Number(r.cost) || 0), 0);

    // Monthly stats
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyBorrows = borrows?.filter(b => b.borrow_date?.startsWith(currentMonth)).length || 0;
    const monthlyRepairs = repairs?.filter(r => r.request_date?.startsWith(currentMonth)).length || 0;

    return (
        <div className="space-y-8 fade-in">
            {/* Summary Cards */}
            <BentoGrid className="grid-cols-2 lg:grid-cols-4">
                <BentoItem className="bg-gradient-to-br from-blue-500/20 to-blue-600/20">
                    <p className="text-sm text-white/70">อุปกรณ์ทั้งหมด</p>
                    <p className="text-4xl font-bold mt-2">{totalEquipment}</p>
                </BentoItem>
                <BentoItem className="bg-gradient-to-br from-indigo-500/20 to-indigo-600/20">
                    <p className="text-sm text-white/70">การยืม (เดือนนี้)</p>
                    <p className="text-4xl font-bold mt-2">{monthlyBorrows}</p>
                </BentoItem>
                <BentoItem className="bg-gradient-to-br from-amber-500/20 to-amber-600/20">
                    <p className="text-sm text-white/70">การซ่อม (เดือนนี้)</p>
                    <p className="text-4xl font-bold mt-2">{monthlyRepairs}</p>
                </BentoItem>
                <BentoItem className="bg-gradient-to-br from-rose-500/20 to-rose-600/20">
                    <p className="text-sm text-white/70">ค่าซ่อมรวม</p>
                    <p className="text-4xl font-bold mt-2">{totalRepairCost.toLocaleString()}.-</p>
                </BentoItem>
            </BentoGrid>

            {/* Stats Overview */}
            <div className="grid lg:grid-cols-2 gap-6">
                <GlassCard>
                    <h3 className="text-lg font-bold mb-4">สรุปการยืม</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                            <span>ยืมทั้งหมด</span>
                            <span className="font-bold">{totalBorrows}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                            <span>กำลังยืม</span>
                            <span className="font-bold text-blue-400">
                                {borrows?.filter(b => b.status === "borrowed").length || 0}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                            <span>คืนแล้ว</span>
                            <span className="font-bold text-green-400">
                                {borrows?.filter(b => b.status?.startsWith("returned")).length || 0}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                            <span>คืนช้า</span>
                            <span className="font-bold text-orange-400">
                                {borrows?.filter(b => b.status === "returned_late").length || 0}
                            </span>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard>
                    <h3 className="text-lg font-bold mb-4">สรุปการซ่อม</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                            <span>ซ่อมทั้งหมด</span>
                            <span className="font-bold">{totalRepairs}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                            <span>รออนุมัติ</span>
                            <span className="font-bold text-yellow-400">
                                {repairs?.filter(r => r.status === "pending_repair_approval").length || 0}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                            <span>กำลังซ่อม</span>
                            <span className="font-bold text-blue-400">
                                {repairs?.filter(r => r.status === "repair_approved").length || 0}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                            <span>ซ่อมเสร็จ</span>
                            <span className="font-bold text-green-400">
                                {completedRepairs.length}
                            </span>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Export Section */}
            <GlassCard>
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">ส่งออกรายงาน</h3>
                    <button className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition">
                        Export CSV
                    </button>
                </div>
                <p className="text-sm text-white/60 mt-2">
                    ดาวน์โหลดรายงานสรุปการยืมและการซ่อมในรูปแบบ CSV
                </p>
            </GlassCard>
        </div>
    );
}
