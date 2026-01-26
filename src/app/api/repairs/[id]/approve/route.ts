import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('repairs')
        .update({ status: 'repair_approved' })
        .eq('id', params.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    redirect('/dashboard/approvals');
}
