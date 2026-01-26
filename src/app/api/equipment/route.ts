import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET all equipment
export async function GET() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

// POST new equipment
export async function POST(request: Request) {
    const supabase = await createClient();
    const body = await request.json();

    const { data, error } = await supabase
        .from('equipment')
        .insert([body])
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
}
