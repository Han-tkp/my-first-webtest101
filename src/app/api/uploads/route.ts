import { NextResponse } from "next/server";
import { checkApiRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const BUCKET_NAME = "equipment-images";

function buildFilePath(originalName: string, folder: string) {
    const extension = originalName.includes(".") ? originalName.split(".").pop() : "bin";
    return `${folder}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
}

function extractStoragePath(url: string) {
    const marker = `${BUCKET_NAME}/`;
    const index = url.indexOf(marker);
    if (index < 0) return null;
    return url.slice(index + marker.length);
}

export async function POST(request: Request) {
    const { error: authError } = await checkApiRole("admin");
    if (authError) {
        return NextResponse.json({ error: authError.message }, { status: authError.status });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const folder = String(formData.get("folder") || "equipment").trim() || "equipment";

    if (!(file instanceof File)) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const filePath = buildFilePath(file.name, folder);
    const buffer = Buffer.from(await file.arrayBuffer());
    const supabase = await createClient();

    const { error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
    });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
    return NextResponse.json({ url: data.publicUrl }, { status: 201 });
}

export async function DELETE(request: Request) {
    const { error: authError } = await checkApiRole("admin");
    if (authError) {
        return NextResponse.json({ error: authError.message }, { status: authError.status });
    }

    const body = await request.json().catch(() => ({}));
    const url = String(body?.url || "");
    const path = extractStoragePath(url);

    if (!path) {
        return NextResponse.json({ error: "Invalid storage URL" }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}
