import { createClient } from "@/lib/supabase/server";

interface ConsumeRateLimitOptions {
    action: string;
    scope: string;
    limit: number;
    windowSeconds: number;
    blockSeconds?: number;
}

interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    retryAfter: number;
}

type RateLimitRow = {
    key: string;
    hits: number;
    window_started_at: string;
    blocked_until: string | null;
};

function buildKey(action: string, scope: string) {
    return `${action}:${scope}`;
}

export function getRequestIp(request: Request) {
    const forwardedFor = request.headers.get("x-forwarded-for");
    if (forwardedFor) {
        return forwardedFor.split(",")[0]?.trim() || "unknown";
    }

    const realIp = request.headers.get("x-real-ip");
    if (realIp) {
        return realIp.trim();
    }

    return "unknown";
}

export async function consumeRateLimit({
    action,
    scope,
    limit,
    windowSeconds,
    blockSeconds,
}: ConsumeRateLimitOptions): Promise<RateLimitResult> {
    const key = buildKey(action, scope);
    const now = new Date();
    const nowIso = now.toISOString();
    const windowStartThreshold = now.getTime() - windowSeconds * 1000;
    const blockForSeconds = blockSeconds ?? windowSeconds;

    try {
        const supabase = await createClient();
        const { data: existing } = await supabase
            .from("request_rate_limits")
            .select("key, hits, window_started_at, blocked_until")
            .eq("key", key)
            .maybeSingle();

        const row = (existing as RateLimitRow | null) ?? null;

        if (!row || new Date(row.window_started_at).getTime() <= windowStartThreshold) {
            await supabase.from("request_rate_limits").upsert(
                {
                    key,
                    action,
                    scope,
                    hits: 1,
                    window_started_at: nowIso,
                    blocked_until: null,
                },
                {
                    onConflict: "key",
                    ignoreDuplicates: false,
                },
            );

            return {
                allowed: true,
                remaining: Math.max(limit - 1, 0),
                retryAfter: 0,
            };
        }

        if (row.blocked_until && new Date(row.blocked_until).getTime() > now.getTime()) {
            return {
                allowed: false,
                remaining: 0,
                retryAfter: Math.max(
                    1,
                    Math.ceil((new Date(row.blocked_until).getTime() - now.getTime()) / 1000),
                ),
            };
        }

        const nextHits = row.hits + 1;

        if (nextHits > limit) {
            const blockedUntil = new Date(now.getTime() + blockForSeconds * 1000).toISOString();
            await supabase
                .from("request_rate_limits")
                .update({
                    hits: nextHits,
                    blocked_until: blockedUntil,
                })
                .eq("key", key);

            return {
                allowed: false,
                remaining: 0,
                retryAfter: blockForSeconds,
            };
        }

        await supabase
            .from("request_rate_limits")
            .update({
                hits: nextHits,
                blocked_until: null,
            })
            .eq("key", key);

        return {
            allowed: true,
            remaining: Math.max(limit - nextHits, 0),
            retryAfter: 0,
        };
    } catch (error) {
        console.error("[RateLimit] Failed to consume limit", { action, scope, error });
        return {
            allowed: true,
            remaining: Math.max(limit - 1, 0),
            retryAfter: 0,
        };
    }
}
