import { HistoryClient } from "@/components/dashboard/HistoryClient";
import { requirePageRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function HistoryPage() {
    const profile = await requirePageRole("admin", "user");
    const supabase = await createClient();

    const { data: borrows } = await supabase
        .from("borrows")
        .select("id, borrow_date, due_date, actual_return_date, purpose, status, equipment_ids, late_return_reason")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false });

    const allEquipmentIds = new Set<number>();
    borrows?.forEach((borrow) => borrow.equipment_ids?.forEach((id: number) => allEquipmentIds.add(id)));

    const equipmentMap: Record<number, { name: string; image_url: string | null; serial: string; type: string }> = {};
    if (allEquipmentIds.size > 0) {
        const { data: equipment } = await supabase
            .from("equipment")
            .select("id, name, image_url, serial, type")
            .in("id", Array.from(allEquipmentIds));

        equipment?.forEach((item) => {
            equipmentMap[item.id] = { name: item.name, image_url: item.image_url, serial: item.serial, type: item.type };
        });
    }

    const statusLabels: Record<string, { text: string; className: string }> = {
        pending_borrow_approval: {
            text: "รออนุมัติ",
            className: "border border-amber-100 bg-amber-50 text-amber-700",
        },
        pending_delivery: {
            text: "รอส่งมอบ",
            className: "border border-sky-100 bg-sky-50 text-sky-700",
        },
        borrowed: {
            text: "กำลังใช้งาน",
            className: "border border-indigo-100 bg-indigo-50 text-indigo-700",
        },
        rejected: {
            text: "ไม่อนุมัติ",
            className: "border border-rose-100 bg-rose-50 text-rose-700",
        },
        cancelled: {
            text: "ยกเลิก",
            className: "border border-slate-200 bg-slate-100 text-slate-700",
        },
        returned_early: {
            text: "คืนก่อนกำหนด",
            className: "border border-emerald-100 bg-emerald-50 text-emerald-700",
        },
        returned_late: {
            text: "คืนล่าช้า",
            className: "border border-orange-100 bg-orange-50 text-orange-700",
        },
        returned: {
            text: "คืนแล้ว",
            className: "border border-emerald-100 bg-emerald-50 text-emerald-700",
        },
        returned_damaged: {
            text: "คืนพร้อมแจ้งชำรุด",
            className: "border border-rose-100 bg-rose-50 text-rose-700",
        },
    };

    return <HistoryClient borrows={borrows || []} equipmentMap={equipmentMap} statusLabels={statusLabels} />;
}
