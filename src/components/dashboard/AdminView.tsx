import { createClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/GlassCard";
import { BentoGrid, BentoItem } from "@/components/ui/BentoGrid";

export default async function AdminView() {
    const supabase = await createClient();

    // Fetch equipment data
    const { data: equipment } = await supabase
        .from("equipment")
        .select("*")
        .order("id");

    const total = equipment?.length || 0;
    const available = equipment?.filter(e => e.status === "available").length || 0;
    const borrowed = equipment?.filter(e => e.status === "borrowed").length || 0;
    const maintenance = equipment?.filter(e => ["under_maintenance", "pending_repair_approval"].includes(e.status)).length || 0;

    const statusLabels: Record<string, { text: string; color: string }> = {
        available: { text: "ว่าง", color: "chip-success" },
        borrowed: { text: "ถูกยืม", color: "bg-indigo-500/20 text-indigo-300" },
        under_maintenance: { text: "ซ่อมบำรุง", color: "chip-warning" },
        pending_repair_approval: { text: "รออนุมัติซ่อม", color: "chip-danger" },
    };

    return (
        <div className="space-y-8 fade-in">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">ภาพรวมระบบ (Admin)</h1>
            </div>

            {/* Summary Cards */}
            <BentoGrid className="grid-cols-2 lg:grid-cols-4">
                <BentoItem className="bg-gradient-to-br from-blue-500/20 to-blue-600/20">
                    <p className="text-sm text-white/70">อุปกรณ์ทั้งหมด</p>
                    <p className="text-4xl font-bold mt-2">{total}</p>
                </BentoItem>
                <BentoItem className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20">
                    <p className="text-sm text-white/70">ว่าง</p>
                    <p className="text-4xl font-bold mt-2">{available}</p>
                </BentoItem>
                <BentoItem className="bg-gradient-to-br from-indigo-500/20 to-indigo-600/20">
                    <p className="text-sm text-white/70">กำลังใช้งาน</p>
                    <p className="text-4xl font-bold mt-2">{borrowed}</p>
                </BentoItem>
                <BentoItem className="bg-gradient-to-br from-amber-500/20 to-amber-600/20">
                    <p className="text-sm text-white/70">รอ/กำลังซ่อม</p>
                    <p className="text-4xl font-bold mt-2">{maintenance}</p>
                </BentoItem>
            </BentoGrid>

            {/* Equipment List */}
            <GlassCard>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">รายการอุปกรณ์ทั้งหมด</h2>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="ค้นหา..."
                            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {equipment?.map((item) => {
                        const status = statusLabels[item.status] || { text: "N/A", color: "bg-gray-500/20" };
                        return (
                            <div
                                key={item.id}
                                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold">{item.name}</p>
                                        <p className="text-sm text-white/60">S/N: {item.serial}</p>
                                        <p className="text-xs text-white/40 mt-1">{item.type}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full ${status.color}`}>
                                        {status.text}
                                    </span>
                                </div>
                            </div>
                        );
                    })}

                    {(!equipment || equipment.length === 0) && (
                        <div className="col-span-full text-center py-12 text-white/50">
                            ไม่พบอุปกรณ์ในระบบ
                        </div>
                    )}
                </div>
            </GlassCard>
        </div>
    );
}
