import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET all borrows
export async function GET(request: Request) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    let query = supabase
        .from('borrows')
        .select('*')
        .order('created_at', { ascending: false });

    if (userId) {
        query = query.eq('user_id', userId);
    }

    if (status) {
        query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

// POST new borrow request
export async function POST(request: Request) {
    const supabase = await createClient();
    const body = await request.json();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

    const borrowData = {
        ...body,
        user_id: user.id,
        user_name: profile?.full_name || user.email,
        status: 'pending_borrow_approval'
    };

    const { data, error } = await supabase
        .from('borrows')
        .insert([borrowData])
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update equipment status to reserved
    if (body.equipment_ids && Array.isArray(body.equipment_ids)) {
        await supabase
            .from('equipment')
            .update({ status: 'reserved' })
            .in('id', body.equipment_ids);
    }

    return NextResponse.json(data, { status: 201 });
}
