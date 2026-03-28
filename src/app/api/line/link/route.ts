// src/app/api/line/link/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate link token
    const token = crypto.randomBytes(32).toString('hex');
    const { error } = await supabase.from('line_link_tokens').insert({
        user_id: user.id,
        token,
    });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const botId = process.env.LINE_BOT_BASIC_ID;
    const linkUrl = `https://line.me/R/oaMessage/${botId}/?${token}`;

    return NextResponse.json({ url: linkUrl });
}
