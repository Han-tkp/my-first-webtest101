import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkApiRole } from '@/lib/auth';

// PUT update repair - admin or technician
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { error: authError } = await checkApiRole('admin', 'technician');
    if (authError) return NextResponse.json({ error: authError.message }, { status: authError.status });

    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const allowedFields = ['status', 'damage_description', 'cost', 'repair_location', 'repair_items', 'repair_recommendation', 'repairer_name', 'receiver_name', 'repair_notes', 'repair_date'];
    const updatePayload = Object.fromEntries(
        Object.entries(body).filter(([k]) => allowedFields.includes(k))
    );

    if (Object.keys(updatePayload).length === 0) {
        return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('repairs')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update equipment status based on repair status
    if (updatePayload.status && data.equipment_id) {
        let equipmentStatus = 'under_maintenance';

        if (updatePayload.status === 'completed') {
            equipmentStatus = 'available';
        } else if (updatePayload.status === 'repair_rejected') {
            equipmentStatus = 'available';
        }

        await supabase
            .from('equipment')
            .update({ status: equipmentStatus })
            .eq('id', data.equipment_id);
    }

    return NextResponse.json(data);
}

// DELETE repair — admin only
export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { error: authError } = await checkApiRole('admin');
    if (authError) return NextResponse.json({ error: authError.message }, { status: authError.status });

    const { id } = await params;
    const supabase = await createClient();

    // Get repair to find equipment_id before deleting
    const { data: repair } = await supabase
        .from('repairs')
        .select('equipment_id, status')
        .eq('id', id)
        .single();

    if (!repair) {
        return NextResponse.json({ error: 'ไม่พบรายการซ่อม' }, { status: 404 });
    }

    const { error } = await supabase.from('repairs').delete().eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Restore equipment to available if it was under maintenance
    if (repair.equipment_id && ['pending_repair_approval', 'under_maintenance', 'repairing'].includes(repair.status)) {
        await supabase
            .from('equipment')
            .update({ status: 'available' })
            .eq('id', repair.equipment_id);
    }

    return NextResponse.json({ success: true });
}
