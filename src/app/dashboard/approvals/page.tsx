import { createClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/GlassCard";

export default async function ApprovalsPage() {
    const supabase = await createClient();

    // Pending user approvals
    const { data: pendingUsers } = await supabase
        .from("profiles")
        .select("*")
        .eq("status", "pending_approval");

    // Pending borrow requests
    const { data: pendingBorrows } = await supabase
        .from("borrows")
        .select("*")
        .eq("status", "pending_borrow_approval");

    // Pending repair requests
    const { data: pendingRepairs } = await supabase
        .from("repairs")
        .select("*")
        .eq("status", "pending_repair_approval");

    return (
        <div className="grid lg:grid-cols-2 gap-6 fade-in">
            {/* User Approvals */}
            <GlassCard>
                <h3 className="text-lg font-bold mb-4">อนุมัติบัญชีผู้ใช้ใหม่</h3>
                <div className="space-y-3">
                    {pendingUsers && pendingUsers.length > 0 ? (
                        pendingUsers.map((user) => (
                            <div key={user.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <p className="font-semibold">{user.full_name}</p>
                                <p className="text-sm text-white/60">{user.agency}</p>
                                <p className="text-sm text-white/50">{user.email}</p>
                                <div className="mt-3 flex gap-2">
                                    <form action={`/api/users/${user.id}/approve`} method="POST">
                                        <button className="px-3 py-1 text-sm rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white">
                                            อนุมัติ
                                        </button>
                                    </form>
                                    <form action={`/api/users/${user.id}/reject`} method="POST">
                                        <button className="px-3 py-1 text-sm rounded-lg bg-red-500 hover:bg-red-600 text-white">
                                            ไม่อนุมัติ
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-white/50 text-sm">ไม่มีบัญชีรออนุมัติ</p>
                    )}
                </div>
            </GlassCard>

            {/* Borrow Approvals */}
            <GlassCard>
                <h3 className="text-lg font-bold mb-4">อนุมัติการยืม</h3>
                <div className="space-y-3">
                    {pendingBorrows && pendingBorrows.length > 0 ? (
                        pendingBorrows.map((borrow) => (
                            <div key={borrow.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <p>
                                    <span className="font-semibold">{borrow.user_name}</span> ขอยืม{" "}
                                    <span className="font-semibold">
                                        {Array.isArray(borrow.equipment_ids) ? borrow.equipment_ids.length : 0} เครื่อง
                                    </span>
                                </p>
                                <div className="mt-2 text-sm text-white/60 bg-white/5 p-2 rounded-lg">
                                    <p><strong>วันที่:</strong> {borrow.borrow_date} - {borrow.due_date}</p>
                                    <p><strong>วัตถุประสงค์:</strong> {borrow.purpose}</p>
                                    <p><strong>ผู้ประสานงาน:</strong> {borrow.contact_name} ({borrow.contact_phone})</p>
                                </div>
                                <div className="mt-3 flex gap-2">
                                    <form action={`/api/borrows/${borrow.id}/approve`} method="POST">
                                        <button className="px-3 py-1 text-sm rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white">
                                            อนุมัติ
                                        </button>
                                    </form>
                                    <form action={`/api/borrows/${borrow.id}/reject`} method="POST">
                                        <button className="px-3 py-1 text-sm rounded-lg bg-red-500 hover:bg-red-600 text-white">
                                            ไม่อนุมัติ
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-white/50 text-sm">ไม่มีคำขอยืมรออนุมัติ</p>
                    )}
                </div>
            </GlassCard>

            {/* Repair Approvals */}
            <GlassCard className="lg:col-span-2">
                <h3 className="text-lg font-bold mb-4">อนุมัติการซ่อม</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                    {pendingRepairs && pendingRepairs.length > 0 ? (
                        pendingRepairs.map((repair) => (
                            <div key={repair.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <p className="font-semibold">{repair.equipment_name}</p>
                                <p className="text-sm text-white/60 mt-1">อาการ: {repair.damage_description}</p>
                                <div className="mt-3 flex gap-2">
                                    <form action={`/api/repairs/${repair.id}/approve`} method="POST">
                                        <button className="px-3 py-1 text-sm rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white">
                                            อนุมัติ
                                        </button>
                                    </form>
                                    <form action={`/api/repairs/${repair.id}/reject`} method="POST">
                                        <button className="px-3 py-1 text-sm rounded-lg bg-red-500 hover:bg-red-600 text-white">
                                            ไม่อนุมัติ
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-white/50 text-sm col-span-2">ไม่มีคำขอซ่อมรออนุมัติ</p>
                    )}
                </div>
            </GlassCard>
        </div>
    );
}
