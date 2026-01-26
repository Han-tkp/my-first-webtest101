import { createClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/GlassCard";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default async function UserView({ userId }: { userId: string }) {
    const supabase = await createClient();

    // Get active borrows for this user
    const { data: myBorrows } = await supabase
        .from("borrows")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

    const activeBorrows = myBorrows?.filter(b =>
        ['pending_borrow_approval', 'pending_delivery', 'borrowed'].includes(b.status)
    ) || [];

    const statusLabels: Record<string, { text: string; color: string }> = {
        pending_borrow_approval: { text: "รออนุมัติ", color: "text-yellow-400 bg-yellow-400/10" },
        pending_delivery: { text: "รอรับของ", color: "text-blue-400 bg-blue-400/10" },
        borrowed: { text: "กำลังยืม", color: "text-green-400 bg-green-400/10" },
        returned: { text: "คืนแล้ว", color: "text-gray-400 bg-gray-400/10" },
        rejected: { text: "ไม่อนุมัติ", color: "text-red-400 bg-red-400/10" },
    };

    return (
        <div className="space-y-6 fade-in">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">สวัสดี! ยินดีต้อนรับ</h1>
                <Link href="/dashboard/borrow">
                    <Button variant="primary" className="shadow-lg shadow-indigo-500/20">
                        + ยืมอุปกรณ์ใหม่
                    </Button>
                </Link>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Active Status Card */}
                <GlassCard className="lg:col-span-2">
                    <h3 className="text-lg font-bold mb-4">รายการที่กำลังดำเนินการ</h3>
                    <div className="space-y-3">
                        {activeBorrows.length > 0 ? (
                            activeBorrows.map((borrow) => {
                                const status = statusLabels[borrow.status] || { text: borrow.status, color: "text-gray-400" };
                                return (
                                    <div key={borrow.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold">คำขอยืม #{borrow.id}</p>
                                            <p className="text-sm text-white/60">
                                                วันที่ต้องการใช้: {new Date(borrow.borrow_date).toLocaleDateString('th-TH')}
                                            </p>
                                        </div>
                                        <span className={`text-xs px-3 py-1 rounded-full ${status.color} font-medium`}>
                                            {status.text}
                                        </span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-8 text-white/40">
                                <p>ไม่มีรายการที่กำลังดำเนินการ</p>
                                <Link href="/dashboard/borrow" className="text-indigo-400 text-sm hover:underline mt-2 inline-block">
                                    เริ่มยืมอุปกรณ์เลย
                                </Link>
                            </div>
                        )}
                    </div>
                </GlassCard>

                {/* Quick Actions / Tips */}
                <GlassCard>
                    <h3 className="text-lg font-bold mb-4">เมนูลัด</h3>
                    <div className="space-y-2">
                        <Link href="/dashboard/borrow" className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition flex items-center gap-3">
                            <span className="text-xl">📅</span>
                            <span className="text-sm">จองอุปกรณ์ล่วงหน้า</span>
                        </Link>
                        <Link href="/dashboard/history" className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition flex items-center gap-3">
                            <span className="text-xl">📜</span>
                            <span className="text-sm">ประวัติการยืมทั้งหมด</span>
                        </Link>
                        <div className="mt-4 p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                            <h4 className="font-semibold text-indigo-300 mb-1">เกร็ดความรู้</h4>
                            <p className="text-xs text-indigo-200/70">
                                ควรจองอุปกรณ์ล่วงหน้าอย่างน้อย 3 วัน เพื่อให้เจ้าหน้าที่เตรียมเครื่องให้พร้อมใช้งาน
                            </p>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
