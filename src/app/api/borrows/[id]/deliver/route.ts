import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkApiRole } from '@/lib/auth';
import { notifyBorrowStatusChanged } from '@/lib/notifications';
import { buildInspectionChecklist } from '@/lib/equipment-inspection';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { profile, error: authError } = await checkApiRole('admin', 'technician');
    if (authError) return NextResponse.json({ error: authError.message }, { status: authError.status });

    const { id } = await params;
    const supabase = await createClient();
    const formData = await request.formData();
    const preDeliveryChecklist = buildInspectionChecklist(formData, 'pre_');

    const { data: borrow } = await supabase
        .from('borrows')
        .select('user_id, equipment_ids, status')
        .eq('id', id)
        .single();

    if (!borrow) {
        return NextResponse.json({ error: 'ไม่พบรายการยืม' }, { status: 404 });
    }

    if (borrow.status !== 'pending_delivery') {
        return NextResponse.json({ error: 'รายการยืมนี้ไม่อยู่ในสถานะรอส่งมอบ' }, { status: 409 });
    }

    const { error } = await supabase
        .from('borrows')
        .update({
            status: 'borrowed',
            pre_delivery_checklist: preDeliveryChecklist,
            pre_delivery_checked_at: new Date().toISOString().split('T')[0],
            pre_delivery_checked_by: profile?.full_name || 'เจ้าหน้าที่',
        })
        .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (borrow?.equipment_ids && borrow.equipment_ids.length > 0) {
        const { error: equipmentError } = await supabase
            .from('equipment')
            .update({ status: 'borrowed' })
            .in('id', borrow.equipment_ids);

        if (equipmentError) {
            return NextResponse.json({ error: equipmentError.message }, { status: 500 });
        }
    }

    if (borrow?.user_id) {
        notifyBorrowStatusChanged(borrow.user_id, 'borrowed', borrow.equipment_ids || [], Number(id)).catch(console.error);
    }

    return NextResponse.json({ success: true });
}
