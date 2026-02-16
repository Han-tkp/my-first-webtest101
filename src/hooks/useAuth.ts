import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types';

export function useAuth() {
    const [user, setUser] = useState<{ id: string; email: string | undefined } | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();

        // Get initial session
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
            if (user) {
                // Fetch profile
                supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()
                    .then(({ data }) => {
                        setProfile(data);
                        setIsLoading(false);
                    });
            } else {
                setIsLoading(false);
            }
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single()
                    .then(({ data }) => setProfile(data));
            } else {
                setProfile(null);
            }
            setIsLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return { user, profile, isLoading };
}
