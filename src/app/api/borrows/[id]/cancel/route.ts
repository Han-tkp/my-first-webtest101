import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { checkApiRole } from "@/lib/auth";

// POST — Cancel a pending borrow (user who created it or admin)
export async function POST(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const { error: authError, profile } = await checkApiRole("admin", "approver", "technician", "user");
    if (authError || !profile) return NextResponse.json({ error: authError?.message || "Unauthorized" }, { status: authError?.status || 401 });

    const { id } = await params;
    const supabase = await createClient();

    // Get the borrow request
    const { data: borrow, error: fetchError } = await supabase
        .from("borrows")
        .select("id, user_id, status, equipment_ids")
        .eq("id", id)
        .single();

    if (fetchError || !borrow) {
        return NextResponse.json({ error: "ไม่พบรายการยืม" }, { status: 404 });
    }

    // Only the requester or admin can cancel
    if (profile.role !== "admin" && borrow.user_id !== profile.id) {
        return NextResponse.json({ error: "คุณไม่มีสิทธิ์ยกเลิกรายการนี้" }, { status: 403 });
    }

    // Can only cancel pending requests
    if (borrow.status !== "pending_borrow_approval") {
        return NextResponse.json(
            { error: "ไม่สามารถยกเลิกได้ สถานะปัจจุบันไม่อนุญาตให้ยกเลิก" },
            { status: 400 },
        );
    }

    // Update borrow status
    const { error: updateError } = await supabase
        .from("borrows")
        .update({ status: "cancelled" })
        .eq("id", id);

    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Restore equipment to available
    if (borrow.equipment_ids && Array.isArray(borrow.equipment_ids)) {
        for (const equipId of borrow.equipment_ids) {
            await supabase
                .from("equipment")
                .update({ status: "available" })
                .eq("id", equipId)
                .in("status", ["reserved"]);
        }
    }

    return NextResponse.json({ success: true, message: "ยกเลิกคำขอยืมเรียบร้อยแล้ว" });
}
