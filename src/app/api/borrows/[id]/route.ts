import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET single borrow
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('borrows')
        .select('*')
        .eq('id', params.id)
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(data);
}

// PUT update borrow (for status changes, approvals, etc.)
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = await createClient();
    const body = await request.json();

    const { data, error } = await supabase
        .from('borrows')
        .update(body)
        .eq('id', params.id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update equipment status based on borrow status
    if (body.status && data.equipment_ids) {
        let equipmentStatus = 'available';

        switch (body.status) {
            case 'pending_delivery':
            case 'borrowed':
                equipmentStatus = 'borrowed';
                break;
            case 'returned':
            case 'returned_early':
            case 'returned_late':
                equipmentStatus = 'available';
                break;
            case 'returned_damaged':
                equipmentStatus = 'under_maintenance';
                break;
            case 'rejected':
            case 'cancelled':
                equipmentStatus = 'available';
                break;
        }

        await supabase
            .from('equipment')
            .update({ status: equipmentStatus })
            .in('id', data.equipment_ids);
    }

    return NextResponse.json(data);
}
