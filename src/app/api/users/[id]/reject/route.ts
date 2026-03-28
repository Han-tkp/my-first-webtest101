import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkApiRole } from '@/lib/auth';
import { notifyUserStatusChanged } from '@/lib/notifications';

export async function POST(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { error: authError } = await checkApiRole('admin', 'approver');
    if (authError) return NextResponse.json({ error: authError.message }, { status: authError.status });

    const { id } = await params;
    const supabase = await createClient();

    const { error } = await supabase
        .from('profiles')
        .update({ status: 'suspended' })
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Notify user that their account was suspended
    notifyUserStatusChanged(id, 'suspended').catch(console.error);

    return NextResponse.json({ success: true });
}
