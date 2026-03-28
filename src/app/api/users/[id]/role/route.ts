import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkApiRole, type Role } from "@/lib/auth";
import { notifyUserRoleChanged } from "@/lib/notifications";

const ALLOWED_ROLES: Role[] = ["admin", "approver", "technician", "user"];

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { error: authError } = await checkApiRole("admin");
    if (authError) return NextResponse.json({ error: authError.message }, { status: authError.status });

    const { id } = await params;
    const body = await request.json();
    const role = body?.role as Role | undefined;

    if (!role || !ALLOWED_ROLES.includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", id)
        .select("id, role")
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    notifyUserRoleChanged(id, role).catch(console.error);

    return NextResponse.json(data);
}
