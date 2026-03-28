"use client";

import Image from "next/image";

interface EquipmentImageProps {
    src?: string | null;
    alt: string;
    className?: string;
    imageClassName?: string;
    labelClassName?: string;
    sizes?: string;
}

export function EquipmentImage({
    src,
    alt,
    className = "",
    imageClassName = "",
    labelClassName = "",
    sizes = "160px",
}: EquipmentImageProps) {
    return (
        <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
            {src ? (
                <Image src={src} alt={alt} fill sizes={sizes} className={imageClassName || "object-cover"} />
            ) : (
                <div className={`flex h-full w-full items-center justify-center text-sm font-medium text-slate-400 ${labelClassName}`}>
                    No image
                </div>
            )}
        </div>
    );
}
