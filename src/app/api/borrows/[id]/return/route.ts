import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkApiRole } from '@/lib/auth';
import { notifyBorrowStatusChanged, notifyRepairStatus } from '@/lib/notifications';
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
    const condition = formData.get('condition') as string;
    const today = new Date().toISOString().split('T')[0]!;
    const postReturnChecklist = buildInspectionChecklist(formData, 'post_');

    const { data: currentBorrow, error: currentBorrowError } = await supabase
        .from('borrows')
        .select('due_date, status')
        .eq('id', id)
        .single();

    if (currentBorrowError) return NextResponse.json({ error: currentBorrowError.message }, { status: 500 });

    if (!currentBorrow) {
        return NextResponse.json({ error: 'ไม่พบรายการยืม' }, { status: 404 });
    }

    if (currentBorrow.status !== 'borrowed') {
        return NextResponse.json({ error: 'สามารถรับคืนได้เฉพาะรายการที่อยู่ระหว่างยืมเท่านั้น' }, { status: 409 });
    }

    let status = 'returned';
    let equipmentStatus = 'available';

    // Determine the return status based on condition and date
    if (condition === 'damaged') {
        status = 'returned_damaged';
        equipmentStatus = 'pending_repair_approval'; // Directly move to pending repair
    } else if (currentBorrow?.due_date) {
        if (today < currentBorrow.due_date) {
            status = 'returned_early';
        } else if (today > currentBorrow.due_date) {
            status = 'returned_late';
        }
    }

    // Update the borrow record
    const { data: borrow, error: borrowError } = await supabase
        .from('borrows')
        .update({
            status,
            actual_return_date: today,
            post_return_checklist: {
                ...postReturnChecklist,
                condition,
            },
            post_return_checked_at: today,
            post_return_checked_by: profile?.full_name || 'เจ้าหน้าที่',
        })
        .eq('id', id)
        .select('user_id, equipment_ids')
        .single();

    if (borrowError) return NextResponse.json({ error: borrowError.message }, { status: 500 });

    // Handle equipment status updates and repair requests
    if (borrow?.equipment_ids && borrow.equipment_ids.length > 0) {
        // Update all equipment to the target status (available or pending_repair_approval)
        await supabase
            .from('equipment')
            .update({ status: equipmentStatus })
            .in('id', borrow.equipment_ids);

        // If damaged, automatically create repair requests
        if (condition === 'damaged') {
            const { data: equipmentDetails } = await supabase
                .from('equipment')
                .select('id, name')
                .in('id', borrow.equipment_ids);

            const repairInserts = (equipmentDetails || []).map((equip) => ({
                equipment_id: equip.id,
                equipment_name: equip.name || `อุปกรณ์ #${equip.id}`,
                damage_description: 'ตรวจพบความเสียหายหลังการคืน (สร้างอัตโนมัติ)',
                status: 'pending_repair_approval',
                request_date: today,
            }));

            if (repairInserts.length > 0) {
                await supabase.from('repairs').insert(repairInserts);
                
                // Notify admins about the new repair requests
                for (const repair of repairInserts) {
                    notifyRepairStatus({
                        equipment_name: repair.equipment_name,
                        damage_description: repair.damage_description,
                        status: 'pending_repair_approval',
                    }).catch(console.error);
                }
            }
        }
    }

    // Notify borrower about the return confirmation
    if (borrow?.user_id) {
        notifyBorrowStatusChanged(borrow.user_id, status, borrow.equipment_ids || [], Number(id)).catch(console.error);
    }

    return NextResponse.json({ success: true });
}
