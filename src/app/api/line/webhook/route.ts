// src/app/api/line/webhook/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendLineMessage, verifyLineSignature } from '@/lib/line';

export async function POST(req: Request) {
    const body = await req.text();
    const signature = req.headers.get('x-line-signature') || '';

    if (!verifyLineSignature(body, signature)) {
        return new Response('Invalid signature', { status: 401 });
    }

    const { events } = JSON.parse(body);

    for (const event of events) {
        if (event.type === 'message' && event.message.type === 'text') {
            const token = event.message.text.trim();
            const lineUserId = event.source.userId;

            // Simple token validation
            if (token.length > 20) {
                const supabase = await createClient();
                const { data, error } = await supabase
                    .from('line_link_tokens')
                    .select('user_id')
                    .eq('token', token)
                    .gt('expires_at', new Date().toISOString())
                    .single();

                if (data && !error) {
                    // Link user
                    await supabase
                        .from('profiles')
                        .update({ line_user_id: lineUserId })
                        .eq('id', data.user_id);

                    // Delete token
                    await supabase.from('line_link_tokens').delete().eq('token', token);

                    await sendLineMessage(
                        lineUserId,
                        '🎉 เชื่อมต่อบัญชีสำเร็จ! คุณจะได้รับการแจ้งเตือนผ่านช่องทางนี้'
                    );
                }
            }
        }
    }

    return NextResponse.json({ success: true });
}
