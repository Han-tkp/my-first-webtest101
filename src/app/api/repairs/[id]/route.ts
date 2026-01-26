import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// PUT update repair
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = await createClient();
    const body = await request.json();

    const { data, error } = await supabase
        .from('repairs')
        .update(body)
        .eq('id', params.id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update equipment status based on repair status
    if (body.status && data.equipment_id) {
        let equipmentStatus = 'under_maintenance';

        if (body.status === 'completed') {
            equipmentStatus = 'available';
        } else if (body.status === 'repair_rejected') {
            equipmentStatus = 'available';
        }

        await supabase
            .from('equipment')
            .update({ status: equipmentStatus })
            .eq('id', data.equipment_id);
    }

    return NextResponse.json(data);
}
