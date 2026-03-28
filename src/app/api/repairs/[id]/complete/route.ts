import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkApiRole } from '@/lib/auth';
import { notifyRepairStatus } from '@/lib/notifications';
import { buildRepairItems } from '@/lib/equipment-inspection';

// POST complete repair - admin or technician
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { profile, error: authError } = await checkApiRole('admin', 'technician');
    if (authError) return NextResponse.json({ error: authError.message }, { status: authError.status });

    const { id } = await params;
    const supabase = await createClient();
    const formData = await request.formData();
    const cost = formData.get('cost');
    const rawCost = cost ? parseFloat(cost.toString()) : 0;
    const parsedCost = Number.isFinite(rawCost) && rawCost >= 0 ? rawCost : 0;
    const repairItems = buildRepairItems(formData);
    const repairLocation = String(formData.get('repair_location') || '').trim();
    const repairRecommendation = String(formData.get('repair_recommendation') || '').trim();
    const repairNotes = String(formData.get('repair_notes') || '').trim();
    const repairerName = String(formData.get('repairer_name') || profile?.full_name || '').trim();
    const receiverName = String(formData.get('receiver_name') || '').trim();

    // Update repair status
    const { data: repair, error } = await supabase
        .from('repairs')
        .update({
            status: 'completed',
            cost: parsedCost,
            repair_location: repairLocation,
            repair_items: repairItems,
            repair_recommendation: repairRecommendation,
            repairer_name: repairerName,
            receiver_name: receiverName,
            repair_notes: repairNotes,
            repair_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', id)
        .select('equipment_id, equipment_name, damage_description')
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Set equipment back to available
    if (repair?.equipment_id) {
        await supabase
            .from('equipment')
            .update({ status: 'available' })
            .eq('id', repair.equipment_id);
    }

    // Notify admins about completed repair
    if (repair) {
        notifyRepairStatus({
            repairId: Number(id),
            equipment_name: repair.equipment_name,
            damage_description: repair.damage_description,
            status: 'completed',
            cost: parsedCost,
        }).catch(console.error);
    }

    return NextResponse.json({ success: true });
}
