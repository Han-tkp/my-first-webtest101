import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET single equipment
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('id', params.id)
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(data);
}

// PUT update equipment
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = await createClient();
    const body = await request.json();

    const { data, error } = await supabase
        .from('equipment')
        .update(body)
        .eq('id', params.id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

// DELETE equipment
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', params.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
