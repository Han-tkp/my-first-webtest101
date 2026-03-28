"use client";

import { useState, useRef } from "react";
import { uploadImage } from "@/lib/supabase/storage";
import Image from "next/image";

interface ImageUploadProps {
    currentImageUrl?: string | null;
    onImageUploaded: (url: string) => void;
    folder?: string;
    className?: string;
}

export function ImageUpload({
    currentImageUrl,
    onImageUploaded,
    folder = "equipment",
    className = "",
}: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        if (!file.type.startsWith("image/")) return;
        if (file.size > 5 * 1024 * 1024) {
            alert("ไฟล์ต้องมีขนาดไม่เกิน 5MB");
            return;
        }

        // Show local preview immediately
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(file);

        setIsUploading(true);
        const url = await uploadImage(file, folder);
        setIsUploading(false);

        if (url) {
            setPreview(url);
            onImageUploaded(url);
        } else {
            alert("อัปโหลดรูปภาพไม่สำเร็จ กรุณาลองใหม่");
            setPreview(currentImageUrl || null);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    return (
        <div className={className}>
            <div
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all overflow-hidden
                    ${dragActive
                        ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary-soft)]"
                        : "border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] hover:border-[color:var(--color-primary)]/40 hover:bg-[color:var(--color-surface)]"
                    }
                    ${preview ? "h-48" : "h-36"}
                `}
            >
                {preview ? (
                    <div className="relative w-full h-full">
                        <Image
                            src={preview}
                            alt="Preview"
                            fill
                            className="object-cover rounded-xl"
                            unoptimized={preview.startsWith("data:")}
                        />
                        {isUploading && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl">
                                <div className="flex items-center gap-2 text-white text-sm">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    กำลังอัปโหลด...
                                </div>
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setPreview(null);
                                onImageUploaded("");
                            }}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-red-500/80 flex items-center justify-center text-white text-sm transition"
                        >
                            ×
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-[color:var(--color-foreground-muted)]">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm">คลิกหรือลากรูปมาวาง</p>
                        <p className="text-xs text-[color:var(--color-foreground-muted)]/60">PNG, JPG ไม่เกิน 5MB</p>
                    </div>
                )}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
            />
        </div>
    );
}
