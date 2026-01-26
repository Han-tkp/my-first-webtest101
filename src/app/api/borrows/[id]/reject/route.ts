import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = await createClient();

    // Get borrow to find equipment IDs
    const { data: borrow } = await supabase
        .from('borrows')
        .select('equipment_ids')
        .eq('id', params.id)
        .single();

    const { error } = await supabase
        .from('borrows')
        .update({ status: 'rejected' })
        .eq('id', params.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Release equipment
    if (borrow?.equipment_ids && borrow.equipment_ids.length > 0) {
        await supabase
            .from('equipment')
            .update({ status: 'available' })
            .in('id', borrow.equipment_ids);
    }

    redirect('/dashboard/approvals');
}
