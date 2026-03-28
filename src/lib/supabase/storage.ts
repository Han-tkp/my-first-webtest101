const BUCKET_NAME = "equipment-images";

export async function uploadImage(file: File, folder: string = "equipment"): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        console.error("Upload error:", await response.text());
        return null;
    }

    const payload = await response.json();
    return typeof payload.url === "string" ? payload.url : null;
}

export async function deleteImage(url: string): Promise<boolean> {
    const response = await fetch("/api/uploads", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, bucket: BUCKET_NAME }),
    });

    return response.ok;
}
