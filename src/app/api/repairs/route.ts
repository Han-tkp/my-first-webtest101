import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkApiRole } from '@/lib/auth';
import { notifyRepairStatus } from '@/lib/notifications';
import { consumeRateLimit } from "@/lib/rate-limit";

// GET all repairs - admin, approver, technician
export async function GET(request: Request) {
    const { error: authError } = await checkApiRole('admin', 'approver', 'technician');
    if (authError) return NextResponse.json({ error: authError.message }, { status: authError.status });

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabase
        .from('repairs')
        .select('*')
        .order('created_at', { ascending: false });

    if (status) {
        query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

// POST new repair request - admin or technician
export async function POST(request: Request) {
    const { profile, error: authError } = await checkApiRole('admin', 'technician');
    if (authError) return NextResponse.json({ error: authError.message }, { status: authError.status });

    const repairRateLimit = await consumeRateLimit({
        action: "repairs.create",
        scope: profile!.id,
        limit: 10,
        windowSeconds: 5 * 60,
        blockSeconds: 10 * 60,
    });

    if (!repairRateLimit.allowed) {
        return NextResponse.json(
            { error: "Too many repair requests. Please try again later." },
            {
                status: 429,
                headers: {
                    "Retry-After": String(repairRateLimit.retryAfter),
                },
            },
        );
    }

    const supabase = await createClient();
    const body = await request.json();

    // Get equipment name
    const { data: equipment } = await supabase
        .from('equipment')
        .select('name')
        .eq('id', body.equipment_id)
        .single();

    const repairData = {
        equipment_id: body.equipment_id,
        damage_description: typeof body.damage_description === 'string' ? body.damage_description.trim() : '',
        request_date: new Date().toISOString().split('T')[0],
        equipment_name: equipment?.name,
        status: 'pending_repair_approval',
    };

    const { data, error } = await supabase
        .from('repairs')
        .insert([repairData])
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update equipment status
    await supabase
        .from('equipment')
        .update({ status: 'pending_repair_approval' })
        .eq('id', body.equipment_id);

    notifyRepairStatus({
        repairId: data.id,
        equipment_name: repairData.equipment_name,
        damage_description: repairData.damage_description,
        status: 'pending_repair_approval',
    }).catch(console.error);

    return NextResponse.json(data, { status: 201 });
}
