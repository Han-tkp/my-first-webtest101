import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkApiRole } from '@/lib/auth';
import { notifyBorrowStatusChanged } from '@/lib/notifications';

export async function POST(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { error: authError } = await checkApiRole('admin', 'approver');
    if (authError) return NextResponse.json({ error: authError.message }, { status: authError.status });

    const { id } = await params;
    const supabase = await createClient();

    const { data: borrow } = await supabase
        .from('borrows')
        .select('user_id, equipment_ids, status')
        .eq('id', id)
        .single();

    if (!borrow) {
        return NextResponse.json({ error: 'ไม่พบรายการยืม' }, { status: 404 });
    }

    if (borrow.status !== 'pending_borrow_approval') {
        return NextResponse.json({ error: 'สามารถปฏิเสธได้เฉพาะรายการที่รออนุมัติเท่านั้น' }, { status: 409 });
    }

    const { error } = await supabase
        .from('borrows')
        .update({ status: 'rejected' })
        .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (borrow?.equipment_ids && borrow.equipment_ids.length > 0) {
        await supabase
            .from('equipment')
            .update({ status: 'available' })
            .in('id', borrow.equipment_ids);
    }

    if (borrow?.user_id) {
        notifyBorrowStatusChanged(borrow.user_id, 'rejected', borrow.equipment_ids || [], Number(id)).catch(console.error);
    }

    return NextResponse.json({ success: true });
}
