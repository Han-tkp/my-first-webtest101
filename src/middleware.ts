import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseConfig, isSupabaseConfigured } from "@/lib/supabase/config";

export type MiddlewareProfile = {
    status: "pending_approval" | "active" | "suspended";
    role: "admin" | "approver" | "technician" | "user";
};

type RouteRoleGuard = {
    prefix: string;
    roles: MiddlewareProfile["role"][];
};

const ROUTE_ROLE_GUARDS: RouteRoleGuard[] = [
    { prefix: "/dashboard/setup", roles: ["admin"] },
    { prefix: "/dashboard/debug", roles: ["admin"] },
    { prefix: "/dashboard/approvals", roles: ["admin", "approver"] },
    { prefix: "/dashboard/reports", roles: ["admin", "approver"] },
    { prefix: "/dashboard/technician", roles: ["admin", "technician"] },
    { prefix: "/dashboard/borrow", roles: ["admin", "user"] },
    { prefix: "/dashboard/history", roles: ["admin", "user"] },
    { prefix: "/dashboard/settings", roles: ["admin", "approver", "technician", "user"] },
];

const PUBLIC_PATHS = ["/login", "/register"];
const PROTECTED_PATH_PREFIXES = ["/dashboard"];

function createDbClient() {
    if (!isSupabaseConfigured()) return null;
    return createSupabaseClient(supabaseConfig.url, supabaseConfig.serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

async function getProfile(
    userId: string,
    requestSupabase: ReturnType<typeof createServerClient>,
): Promise<MiddlewareProfile | null> {
    const db = createDbClient();

    if (db) {
        try {
            const { data } = await db
                .from("profiles")
                .select("status, role")
                .eq("id", userId)
                .maybeSingle();

            if (data) {
                return data as MiddlewareProfile;
            }
        } catch {
            // Fall through to request supabase
        }
    }

    try {
        const { data } = await requestSupabase
            .from("profiles")
            .select("status, role")
            .eq("id", userId)
            .maybeSingle();

        return (data as MiddlewareProfile | null) ?? null;
    } catch {
        return null;
    }
}

function createSupabaseMiddlewareClient(request: NextRequest) {
    const response = NextResponse.next({ request });

    if (!isSupabaseConfigured()) {
        console.warn("[Middleware] Supabase not configured, allowing public access");
        return { supabase: null, response };
    }

    const supabase = createServerClient(
        supabaseConfig.url,
        supabaseConfig.publishableKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value);
                        response.cookies.set(name, value, options);
                    });
                },
            },
        },
    );

    return { supabase, response };
}

function redirectUnauthorized(request: NextRequest, path: string = "/login") {
    return NextResponse.redirect(new URL(path, request.url));
}

function shouldHandlePath(pathname: string): boolean {
    return (
        PROTECTED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
        PUBLIC_PATHS.includes(pathname)
    );
}

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    if (!shouldHandlePath(pathname)) {
        return NextResponse.next();
    }

    const { supabase, response } = createSupabaseMiddlewareClient(request);

    // If Supabase is not configured, allow access but log warning
    if (!supabase) {
        if (pathname.startsWith("/dashboard")) {
            return redirectUnauthorized(request);
        }
        return response;
    }

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Handle dashboard routes
    if (pathname.startsWith("/dashboard")) {
        if (!user) {
            return redirectUnauthorized(request);
        }

        const profile = await getProfile(user.id, supabase);

        if (!profile) {
            return redirectUnauthorized(request);
        }

        if (profile.status === "pending_approval") {
            return redirectUnauthorized(request, "/pending");
        }

        if (profile.status === "suspended") {
            return redirectUnauthorized(request, "/suspended");
        }

        const matchedGuard = ROUTE_ROLE_GUARDS.find((guard) =>
            pathname.startsWith(guard.prefix),
        );

        if (matchedGuard && !matchedGuard.roles.includes(profile.role)) {
            return redirectUnauthorized(request, "/dashboard");
        }
    }

    // Handle auth routes (login/register)
    if (PUBLIC_PATHS.includes(pathname)) {
        if (!user) {
            return response;
        }

        const profile = await getProfile(user.id, supabase);

        if (!profile) {
            return response;
        }

        const redirectPaths: Record<MiddlewareProfile["status"], string> = {
            active: "/dashboard",
            pending_approval: "/pending",
            suspended: "/suspended",
        };

        return redirectUnauthorized(request, redirectPaths[profile.status]);
    }

    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
