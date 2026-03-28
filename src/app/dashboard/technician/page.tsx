import { requirePageRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { TechnicianClient } from "@/components/dashboard/TechnicianClient";

export default async function TechnicianPage() {
    await requirePageRole("admin", "technician");
    const supabase = await createClient();

    const { data: deliveryQueue } = await supabase
        .from("borrows")
        .select("id, user_name, borrow_date, due_date, equipment_ids")
        .eq("status", "pending_delivery")
        .order("borrow_date", { ascending: true });

    const { data: returnQueue } = await supabase
        .from("borrows")
        .select("id, user_name, borrow_date, due_date, equipment_ids")
        .eq("status", "borrowed")
        .order("due_date", { ascending: true });

    const { data: activeRepairs } = await supabase
        .from("repairs")
        .select("id, equipment_id, equipment_name, damage_description, request_date")
        .eq("status", "repair_approved")
        .order("request_date", { ascending: false });

    const allEquipmentIds = new Set<number>();
    deliveryQueue?.forEach((borrow) => borrow.equipment_ids?.forEach((id: number) => allEquipmentIds.add(id)));
    returnQueue?.forEach((borrow) => borrow.equipment_ids?.forEach((id: number) => allEquipmentIds.add(id)));
    activeRepairs?.forEach((repair) => {
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

    const { data: allEquipmentItems } = await supabase
        .from("equipment")
        .select("id, name, serial")
        .order("name", { ascending: true });

    return (
        <TechnicianClient
            deliveryQueue={deliveryQueue || []}
            returnQueue={returnQueue || []}
            activeRepairs={activeRepairs || []}
            equipmentMap={equipmentMap}
            allEquipment={allEquipmentItems || []}
        />
    );
}
