import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = await createClient();

    // Get repair to find equipment ID
    const { data: repair } = await supabase
        .from('repairs')
        .select('equipment_id')
        .eq('id', params.id)
        .single();

    const { error } = await supabase
        .from('repairs')
        .update({ status: 'repair_rejected' })
        .eq('id', params.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Set equipment back to available if rejected? Or maybe it stays as is?
    // Usually if repair is rejected, equipment might be returned to available or broken state
    // Let's assume available for now
    if (repair?.equipment_id) {
        await supabase
            .from('equipment')
            .update({ status: 'available' })
            .eq('id', repair.equipment_id);
    }

    redirect('/dashboard/approvals');
}
