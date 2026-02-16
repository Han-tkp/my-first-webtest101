import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useRealtime<T>(
    table: string,
    onInsert?: (payload: T) => void,
    onUpdate?: (payload: T) => void,
    onDelete?: (payload: { id: string }) => void
) {
    const channelRef = useRef<RealtimeChannel | null>(null);

    useEffect(() => {
        const supabase = createClient();

        const channel = supabase
            .channel(`${table}_changes`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table },
                (payload) => {
                    if (onInsert) onInsert(payload.new as T);
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table },
                (payload) => {
                    if (onUpdate) onUpdate(payload.new as T);
                }
            )
            .on(
                'postgres_changes',
                { event: 'DELETE', schema: 'public', table },
                (payload) => {
                    if (onDelete) onDelete(payload.old as { id: string });
                }
            )
            .subscribe();

        channelRef.current = channel;

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
            }
        };
    }, [table, onInsert, onUpdate, onDelete]);
}
