import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = await createClient();
    const formData = await request.formData();
    const condition = formData.get('condition') as string;

    let status = 'returned';
    let equipmentStatus = 'available';

    if (condition === 'damaged') {
        status = 'returned_damaged';
        equipmentStatus = 'under_maintenance'; // Needs repair

        // Auto-create repair ticket? 
        // Ideally yes, but maybe manual for now.
        // Let's just set equipment to under_maintenance.
    }

    // Update borrow status
    const { data: borrow, error: borrowError } = await supabase
        .from('borrows')
        .update({
            status: status,
            actual_return_date: new Date().toISOString().split('T')[0],
            post_return_checklist: { condition }
        })
        .eq('id', params.id)
        .select('equipment_ids')
        .single();

    if (borrowError) {
        return NextResponse.json({ error: borrowError.message }, { status: 500 });
    }

    // Update equipment status
    if (borrow?.equipment_ids && borrow.equipment_ids.length > 0) {
        await supabase
            .from('equipment')
            .update({ status: equipmentStatus })
            .in('id', borrow.equipment_ids);

        // If damaged, we should probably create a pending repair ticket automatically?
        // For simplicitly, let's assume the technician will manually create a repair ticket 
        // if they mark it as damaged. Or we can just leave it as under_maintenance.

        if (condition === 'damaged') {
            // Create repair tickets for each equipment? 
            // This might be too complex for this single action. 
            // Let's stick to status update.
        }
    }

    redirect('/dashboard/technician');
}
