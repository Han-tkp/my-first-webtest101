/**
 * Supabase Configuration
 * Centralized environment variable management with validation
 */



export const supabaseConfig = {
    get url() {
        const val = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (!val) console.warn("[Config] Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
        return val || "";
    },
    get publishableKey() {
        const val = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
        if (!val) console.warn("[Config] Missing environment variable: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY");
        return val || "";
    },
    get serviceRoleKey() {
        const val = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!val && typeof window === "undefined") console.warn("[Config] Missing environment variable: SUPABASE_SERVICE_ROLE_KEY");
        return val || "";
    },
    get siteUrl() {
        return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    },
    get emailFrom() {
        return process.env.EMAIL_FROM;
    },
    get resendApiKey() {
        return process.env.RESEND_API_KEY;
    },
} as const;

export function validateSupabaseConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const isServer = typeof window === "undefined";
    
    if (!supabaseConfig.url) errors.push("NEXT_PUBLIC_SUPABASE_URL");
    if (!supabaseConfig.publishableKey) errors.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY");

    if (isServer && !supabaseConfig.serviceRoleKey) {
        errors.push("SUPABASE_SERVICE_ROLE_KEY");
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Check if Supabase is properly configured
 * Use this before attempting Supabase operations
 */
export function isSupabaseConfigured(): boolean {
    const { valid } = validateSupabaseConfig();
    const urlOk = supabaseConfig.url !== "" && supabaseConfig.url.length > 10;
    const keyOk = supabaseConfig.publishableKey !== "" && supabaseConfig.publishableKey.length > 10;
    
    // Log configuration status once (helpful for debugging)
    if (typeof window !== 'undefined' && !sessionStorage.getItem('supabaseConfigChecked')) {
        console.log('[Supabase Config]', {
            valid,
            urlOk,
            keyOk,
            url: supabaseConfig.url.substring(0, 30) + '...',
            hasServiceKey: supabaseConfig.serviceRoleKey !== "" && supabaseConfig.serviceRoleKey.length > 10,
        });
        sessionStorage.setItem('supabaseConfigChecked', 'true');
    }
    
    return valid && urlOk && keyOk;
}
