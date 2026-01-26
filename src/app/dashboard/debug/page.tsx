import { createClient } from "@/lib/supabase/server";

export default async function DebugRolePage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

    return (
        <div className="p-8 text-white bg-black/50 rounded-xl max-w-2xl mx-auto mt-10">
            <h1 className="text-2xl font-bold mb-4 text-red-400">🕵️ Debug User Role</h1>

            <div className="space-y-4">
                <div>
                    <h2 className="font-semibold text-gray-400">Auth User Info (From Supabase Auth):</h2>
                    <pre className="mt-2 p-4 bg-black/50 rounded text-sm overflow-auto">
                        {JSON.stringify(user, null, 2)}
                    </pre>
                </div>

                <div className="border-t border-white/10 pt-4">
                    <h2 className="font-semibold text-gray-400">Profile Info (From Database 'profiles' table):</h2>
                    {profile ? (
                        <div className="mt-2 space-y-2">
                            <p><strong>ID:</strong> {profile.id}</p>
                            <p><strong>Email:</strong> {profile.email}</p>
                            <p><strong>Full Name:</strong> {profile.full_name}</p>
                            <p><strong>Role:</strong> <span className="text-xl font-bold text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">{profile.role}</span></p>
                            <p><strong>Status:</strong> {profile.status}</p>
                        </div>
                    ) : (
                        <p className="text-red-500 mt-2">❌ ไม่พบข้อมูลในตาราง profiles! (อาจยังไม่ได้สมัครสมาชิกหรือ Migration ผิดพลาด)</p>
                    )}
                </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/10 text-sm text-gray-400">
                <p>ถ้า <strong>Role</strong> ไม่ถูกต้อง กรุณารัน SQL Script <code>003_fix_roles.sql</code> ใน Supabase SQL Editor</p>
            </div>
        </div>
    );
}
