import { createBrowserClient } from "@supabase/ssr";
import { supabaseConfig, isSupabaseConfigured } from "./config";

export function createClient() {
    if (!isSupabaseConfigured()) {
        console.error("[Supabase] Client not configured. Please check environment variables.");
        // Return a mock client that will fail gracefully
        return null as unknown as ReturnType<typeof createBrowserClient>;
    }
    
    return createBrowserClient(supabaseConfig.url, supabaseConfig.publishableKey);
}
