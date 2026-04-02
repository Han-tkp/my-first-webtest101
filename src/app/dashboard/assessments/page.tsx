import { requirePageRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AssessmentsClient } from "@/components/dashboard/AssessmentsClient";

export default async function AssessmentsPage() {
    await requirePageRole("admin", "technician");
    const supabase = await createClient();

    // Fetch all assessments with equipment details
    const { data: assessments } = await supabase
        .from("assessments")
        .select(`
            *,
            equipment:equipment_id (
                id,
                name,
                type,
                serial,
                brand,
                model,
                purchase_year,
                image_url
            )
        `)
        .order("assessment_date", { ascending: false });

    // Fetch all equipment for the dropdown
    const { data: allEquipment } = await supabase
        .from("equipment")
        .select("id, name, type, serial, brand, model, purchase_year, image_url")
        .order("name", { ascending: true });

    return (
        <AssessmentsClient
            assessments={assessments || []}
            allEquipment={allEquipment || []}
        />
    );
}
