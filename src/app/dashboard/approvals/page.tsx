import { requirePageRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ApprovalsClient } from "@/components/dashboard/ApprovalsClient";

export default async function ApprovalsPage() {
    await requirePageRole("admin", "approver");
    const supabase = await createClient();

    const { data: pendingUsers } = await supabase
        .from("profiles")
        .select("id, full_name, agency, email, phone, created_at")
        .eq("status", "pending_approval")
        .order("created_at", { ascending: false });

    const { data: pendingBorrows } = await supabase
        .from("borrows")
        .select("id, user_name, purpose, borrow_date, due_date, notes, contact_name, contact_phone, equipment_ids")
        .eq("status", "pending_borrow_approval")
        .order("created_at", { ascending: false });

    const { data: pendingRepairs } = await supabase
        .from("repairs")
        .select("id, equipment_id, equipment_name, damage_description, request_date")
        .eq("status", "pending_repair_approval")
        .order("request_date", { ascending: false });

    const allEquipmentIds = new Set<number>();
    pendingBorrows?.forEach((borrow) => borrow.equipment_ids?.forEach((id: number) => allEquipmentIds.add(id)));
    pendingRepairs?.forEach((repair) => {
        if (repair.equipment_id) allEquipmentIds.add(repair.equipment_id);
    });

    const equipmentMap: Record<number, { name: string; image_url: string | null; serial: string }> = {};
    if (allEquipmentIds.size > 0) {
        const { data: equipment } = await supabase
            .from("equipment")
            .select("id, name, image_url, serial")
            .in("id", Array.from(allEquipmentIds));

        equipment?.forEach((item) => {
            equipmentMap[item.id] = { name: item.name, image_url: item.image_url, serial: item.serial };
        });
    }

    return (
        <ApprovalsClient
            pendingUsers={pendingUsers || []}
            pendingBorrows={pendingBorrows || []}
            pendingRepairs={pendingRepairs || []}
            equipmentMap={equipmentMap}
        />
    );
}
