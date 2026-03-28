import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseConfig, isSupabaseConfigured } from "./config";

export async function createAuthServerClient() {
    if (!isSupabaseConfigured()) {
        console.error("[Supabase] Auth server client not configured. Please check environment variables.");
        return null as unknown as ReturnType<typeof createServerClient>;
    }
    
    const cookieStore = await cookies();

    return createServerClient(supabaseConfig.url, supabaseConfig.publishableKey, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        cookieStore.set(name, value, options);
                    });
                } catch {
                    // Server Components may not allow mutating cookies; reads still work.
                }
            },
        },
    });
}
