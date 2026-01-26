import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = await createClient();
    const formData = await request.formData();
    const cost = formData.get('cost');

    // Update repair status
    const { data: repair, error } = await supabase
        .from('repairs')
        .update({
            status: 'completed',
            cost: cost ? parseFloat(cost.toString()) : 0,
            repair_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', params.id)
        .select('equipment_id')
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

    redirect('/dashboard/technician');
}
