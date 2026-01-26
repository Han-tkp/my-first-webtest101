import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET all repairs
export async function GET(request: Request) {
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

// POST new repair request
export async function POST(request: Request) {
    const supabase = await createClient();
    const body = await request.json();

    // Get equipment name
    const { data: equipment } = await supabase
        .from('equipment')
        .select('name')
        .eq('id', body.equipment_id)
        .single();

    const repairData = {
        ...body,
        equipment_name: equipment?.name,
        status: 'pending_repair_approval'
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

    return NextResponse.json(data, { status: 201 });
}
