import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = await createClient();

    // Verify admin/approver role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!['admin', 'approver'].includes(profile?.role || '')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabase
        .from('profiles')
        .update({ status: 'active', role: 'user' }) // Default role after approval
        .eq('id', params.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    redirect('/dashboard/approvals');
}
