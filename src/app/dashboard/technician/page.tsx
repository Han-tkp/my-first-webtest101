import { createClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/GlassCard";

export default async function TechnicianPage() {
    const supabase = await createClient();

    // Queue for delivery (approved borrows waiting for equipment inspection)
    const { data: deliveryQueue } = await supabase
        .from("borrows")
        .select("*")
        .eq("status", "pending_delivery");

    // Queue for return inspection
    const { data: returnQueue } = await supabase
        .from("borrows")
        .select("*")
        .eq("status", "borrowed");

    // Active repairs
    const { data: activeRepairs } = await supabase
        .from("repairs")
        .select("*")
        .eq("status", "repair_approved");

    return (
        <div className="grid lg:grid-cols-3 gap-6 fade-in">
            {/* Delivery Queue */}
            <GlassCard>
                <h3 className="text-lg font-bold mb-4">รายการรอส่งมอบ</h3>
                <div className="space-y-3">
                    {deliveryQueue && deliveryQueue.length > 0 ? (
                        deliveryQueue.map((borrow) => (
                            <div key={borrow.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <p className="font-semibold">ส่งมอบให้ {borrow.user_name}</p>
                                <p className="text-sm text-white/60 mt-1">
                                    {Array.isArray(borrow.equipment_ids) ? borrow.equipment_ids.length : 0} เครื่อง
                                </p>
                                <form action={`/api/borrows/${borrow.id}/deliver`} method="POST">
                                    <button className="mt-3 w-full px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition">
                                        ยืนยันการส่งมอบ
                                    </button>
                                </form>
                            </div>
                        ))
                    ) : (
                        <p className="text-white/50 text-sm">ไม่มีรายการรอส่งมอบ</p>
                    )}
                </div>
            </GlassCard>

            {/* Return Queue */}
            <GlassCard>
                <h3 className="text-lg font-bold mb-4">รายการรอตรวจสภาพ (หลังคืน)</h3>
                <div className="space-y-3">
                    {returnQueue && returnQueue.length > 0 ? (
                        returnQueue.map((borrow) => {
                            const isLate = new Date() > new Date(borrow.due_date);
                            return (
                                <div
                                    key={borrow.id}
                                    className={`p-4 rounded-xl border ${isLate
                                        ? "bg-red-500/10 border-red-500/30"
                                        : "bg-white/5 border-white/10"
                                        }`}
                                >
                                    <p className="font-semibold">{borrow.user_name} คืนเครื่อง</p>
                                    <p className="text-sm text-white/60 mt-1">
                                        กำหนดคืน: {borrow.due_date}
                                    </p>
                                    {isLate && (
                                        <p className="text-xs text-red-400 font-semibold mt-1">คืนล่าช้า!</p>
                                    )}
                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                        <form action={`/api/borrows/${borrow.id}/return`} method="POST">
                                            <input type="hidden" name="condition" value="normal" />
                                            <button className="w-full px-2 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium transition">
                                                ปกติ
                                            </button>
                                        </form>
                                        <form action={`/api/borrows/${borrow.id}/return`} method="POST">
                                            <input type="hidden" name="condition" value="damaged" />
                                            <button className="w-full px-2 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-medium transition">
                                                ชำรุด
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-white/50 text-sm">ไม่มีรายการรอตรวจสภาพ</p>
                    )}
                </div>
            </GlassCard>

            {/* Active Repairs */}
            <GlassCard>
                <h3 className="text-lg font-bold mb-4">รายการซ่อมบำรุง</h3>
                <div className="space-y-3">
                    {activeRepairs && activeRepairs.length > 0 ? (
                        activeRepairs.map((repair) => (
                            <div key={repair.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <p className="font-semibold">{repair.equipment_name}</p>
                                <p className="text-sm text-white/60 mt-1">อาการ: {repair.damage_description}</p>
                                <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300">
                                    กำลังซ่อม
                                </span>
                                <form action={`/api/repairs/${repair.id}/complete`} method="POST" className="mt-3">
                                    <div className="mb-2">
                                        <input
                                            name="cost"
                                            type="number"
                                            placeholder="ค่าซ่อม (บาท)"
                                            className="w-full bg-black/20 text-white text-xs px-2 py-1 rounded border border-white/10"
                                        />
                                    </div>
                                    <button className="w-full px-3 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition">
                                        บันทึกซ่อมเสร็จ
                                    </button>
                                </form>
                            </div>
                        ))
                    ) : (
                        <p className="text-white/50 text-sm">ไม่มีรายการซ่อมปัจจุบัน</p>
                    )}
                </div>
            </GlassCard>
        </div>
    );
}
