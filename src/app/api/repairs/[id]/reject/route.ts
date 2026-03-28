import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkApiRole } from '@/lib/auth';
import { notifyRepairStatus } from '@/lib/notifications';

// POST reject repair - admin or approver
export async function POST(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { error: authError } = await checkApiRole('admin', 'approver');
    if (authError) return NextResponse.json({ error: authError.message }, { status: authError.status });

    const { id } = await params;
    const supabase = await createClient();

    // Get repair to find equipment ID and details
    const { data: repair } = await supabase
        .from('repairs')
        .select('equipment_id, equipment_name, damage_description')
        .eq('id', id)
        .single();

    const { error } = await supabase
        .from('repairs')
        .update({ status: 'repair_rejected' })
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (repair?.equipment_id) {
        await supabase
            .from('equipment')
            .update({ status: 'available' })
            .eq('id', repair.equipment_id);
    }

    // Notify admins about rejected repair
    if (repair) {
        notifyRepairStatus({
            repairId: Number(id),
            equipment_name: repair.equipment_name,
            damage_description: repair.damage_description,
            status: 'repair_rejected',
        }).catch(console.error);
    }

    return NextResponse.json({ success: true });
}
