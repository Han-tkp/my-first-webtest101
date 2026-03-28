import { NextRequest, NextResponse } from "next/server";
import { createAuthServerClient } from "@/lib/supabase/auth-server";

export async function POST(request: NextRequest) {
    const supabase = await createAuthServerClient();
    await supabase.auth.signOut();

    return NextResponse.redirect(new URL("/", request.url));
}
