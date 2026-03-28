import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkApiRole } from '@/lib/auth';

// GET single borrow - any authenticated active user
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { error: authError } = await checkApiRole('admin', 'approver', 'technician', 'user');
    if (authError) return NextResponse.json({ error: authError.message }, { status: authError.status });

    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('borrows')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(data);
}

// PUT update borrow - admin only (specific actions use dedicated routes)
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { error: authError } = await checkApiRole('admin');
    if (authError) return NextResponse.json({ error: authError.message }, { status: authError.status });

    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const allowedFields = ['status', 'notes', 'due_date', 'purpose', 'contact_name', 'contact_phone', 'late_return_reason'];
    const updatePayload = Object.fromEntries(
        Object.entries(body).filter(([k]) => allowedFields.includes(k))
    );

    if (Object.keys(updatePayload).length === 0) {
        return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('borrows')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update equipment status based on borrow status
    if (updatePayload.status && data.equipment_ids) {
        let equipmentStatus = 'available';

        switch (updatePayload.status) {
            case 'pending_delivery':
                equipmentStatus = 'reserved';
                break;
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
