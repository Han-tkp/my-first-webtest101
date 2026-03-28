"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";

export function CancelBorrowButton({ borrowId }: { borrowId: number }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleCancel = async () => {
        if (!confirm("คุณต้องการยกเลิกคำขอยืมนี้ใช่หรือไม่?")) return;

        setIsLoading(true);
        const response = await fetch(`/api/borrows/${borrowId}/cancel`, { method: "POST" });

        if (!response.ok) {
            const result = await response.json().catch(() => ({ error: "ไม่สามารถยกเลิกได้" }));
            alert(result.error || "ไม่สามารถยกเลิกได้");
        } else {
            router.refresh();
        }
        setIsLoading(false);
    };

    return (
        <button
            onClick={handleCancel}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-xs font-medium text-rose-600 transition hover:text-rose-800 disabled:opacity-50"
        >
            <XCircle className="h-3.5 w-3.5" />
            {isLoading ? "กำลังยกเลิก..." : "ยกเลิกคำขอ"}
        </button>
    );
}
