import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { supabaseConfig, isSupabaseConfigured } from "./config";

export async function createAdminClient() {
    if (!isSupabaseConfigured()) {
        console.error("[Supabase] Admin client not configured. Please check environment variables.");
        return null as unknown as ReturnType<typeof createSupabaseClient>;
    }
    
    return createSupabaseClient(supabaseConfig.url, supabaseConfig.serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
