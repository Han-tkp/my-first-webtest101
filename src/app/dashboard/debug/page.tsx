import { requirePageRole } from "@/lib/auth";
import { EmailTestPanel } from "@/components/dashboard/EmailTestPanel";
import { createAuthServerClient } from "@/lib/supabase/auth-server";
import Link from "next/link";

export default async function DebugRolePage() {
    const profile = await requirePageRole("admin");
    const supabase = await createAuthServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    return (
        <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-semibold text-slate-900">Debug User Session</h1>

            <div className="mt-6 space-y-6">
                <div>
                    <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Supabase Auth User
                    </h2>
                    <pre className="mt-3 overflow-auto rounded-2xl bg-slate-950 p-4 text-sm text-slate-100">
                        {JSON.stringify(user, null, 2)}
                    </pre>
                </div>

                <div className="border-t border-slate-200 pt-6">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Profile Record
                    </h2>
                    <div className="mt-3 space-y-2 text-sm text-slate-700">
                        <p><strong>ID:</strong> {profile.id}</p>
                        <p><strong>Email:</strong> {profile.email}</p>
                        <p><strong>Name:</strong> {profile.full_name}</p>
                        <p><strong>Role:</strong> {profile.role}</p>
                        <p><strong>Status:</strong> {profile.status}</p>
                        <p><strong>Agency:</strong> {profile.agency || "-"}</p>
                    </div>
                </div>

                <EmailTestPanel />

                <div className="border-t border-slate-200 pt-6">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Notification Deliveries
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">ดูสถานะการส่งแจ้งเตือนทั้ง email และ in-app รวมถึงรายการที่ล้มเหลว</p>
                    <Link
                        href="/dashboard/debug/deliveries"
                        className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-white"
                    >
                        ดูสถานะการส่งแจ้งเตือน
                    </Link>
                </div>
            </div>
        </div>
    );
}
