import { redirect } from "next/navigation";
import { createClient, createAuthServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type Role = "admin" | "approver" | "technician" | "user";
export type Status = "pending_approval" | "active" | "suspended";

export interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    role: Role;
    status: Status;
    agency?: string;
    phone?: string;
}

export async function getAuthUser(): Promise<UserProfile | null> {
    if (!isSupabaseConfigured()) {
        console.warn("[Auth] Supabase not configured");
        return null;
    }

    const authClient = await createAuthServerClient();
    if (!authClient) return null;

    const {
        data: { user },
    } = await authClient.auth.getUser();
    const userId = user?.id;

    if (!userId) return null;

    const supabase = await createClient();
    if (!supabase) return null;

    const { data: profile } = await supabase
        .from("profiles")
        .select("id, email, full_name, role, status, agency, phone")
        .eq("id", userId)
        .single();

    if (!profile) return null;

    return profile as UserProfile;
}

export async function requireRole(...allowedRoles: Role[]): Promise<UserProfile> {
    const profile = await getAuthUser();

    if (!profile) {
        throw new Error("UNAUTHORIZED");
    }

    if (profile.status !== "active") {
        throw new Error("INACTIVE");
    }

    if (!allowedRoles.includes(profile.role)) {
        throw new Error("FORBIDDEN");
    }

    return profile;
}

export async function requirePageRole(...allowedRoles: Role[]): Promise<UserProfile> {
    const profile = await getAuthUser();

    if (!profile) {
        redirect("/login");
    }

    if (profile.status === "pending_approval") {
        redirect("/pending");
    }

    if (profile.status === "suspended") {
        redirect("/suspended");
    }

    if (!allowedRoles.includes(profile.role)) {
        redirect("/dashboard");
    }

    return profile;
}

export async function checkApiRole(...allowedRoles: Role[]) {
    const profile = await getAuthUser();

    if (!profile) {
        return { profile: null, error: { message: "Unauthorized", status: 401 } };
    }

    if (profile.status !== "active") {
        return { profile: null, error: { message: "Account not active", status: 403 } };
    }

    if (!allowedRoles.includes(profile.role)) {
        return { profile: null, error: { message: "Forbidden", status: 403 } };
    }

    return { profile, error: null };
}
