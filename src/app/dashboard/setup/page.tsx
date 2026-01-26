"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function SetupRolePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [currentRole, setCurrentRole] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            setUser(user);
            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();
            setCurrentRole(profile?.role || "user");
        }
    };

    const updateRole = async (newRole: string) => {
        setIsLoading(true);
        setMessage("");

        try {
            const supabase = createClient();

            // Direct update for testing purpose (Enable RLS bypass policy temporarily if needed, 
            // but for now user can update own profile if we allowed it in policy.
            // Wait, previous policy: "Users can update their own profile" is ON)

            // Note: Normally we restrict role update, but RLS in 001_initial.sql says:
            // "Users can update their own profile" FOR UPDATE USING (auth.uid() = id);
            // This normally allows updating ALL fields unless columns are restricted in Supabase dashboard (Column Privileges).
            // Default Supabase policy allows updating all columns if not specified otherwise.

            const { error } = await supabase
                .from("profiles")
                .update({ role: newRole, status: 'active' })
                .eq("id", user.id);

            if (error) throw error;

            setMessage(`✅ เปลี่ยน Role เป็น "${newRole}" สำเร็จ! กำลังรีโหลด...`);
            setCurrentRole(newRole);

            setTimeout(() => {
                window.location.href = "/dashboard"; // Hard refresh to update layout
            }, 1000);

        } catch (err: any) {
            setMessage(`❌ เกิดข้อผิดพลาด: ${err.message}. (คุณอาจต้องแก้ผ่าน SQL Editor)`);
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return <div className="p-8 text-white">Loading...</div>;

    return (
        <div className="max-w-md mx-auto fade-in pt-10">
            <GlassCard>
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold">🛠️ Setup Role (Testing)</h1>
                    <p className="text-white/60 mt-2">
                        อีเมล: {user.email}<br />
                        Role ปัจจุบัน: <span className="text-yellow-400 font-bold">{currentRole}</span>
                    </p>
                </div>

                <div className="space-y-3">
                    <p className="text-sm text-center mb-4">เลือก Role ที่ต้องการเป็น:</p>

                    <Button
                        onClick={() => updateRole("admin")}
                        className="w-full bg-red-500 hover:bg-red-600"
                        isLoading={isLoading}
                    >
                        Admin (ผู้ดูแลระบบ)
                    </Button>

                    <Button
                        onClick={() => updateRole("approver")}
                        className="w-full bg-orange-500 hover:bg-orange-600"
                        isLoading={isLoading}
                    >
                        Approver (ผู้อนุมัติ)
                    </Button>

                    <Button
                        onClick={() => updateRole("technician")}
                        className="w-full bg-blue-500 hover:bg-blue-600"
                        isLoading={isLoading}
                    >
                        Technician (ช่างเทคนิค)
                    </Button>

                    <Button
                        onClick={() => updateRole("user")}
                        className="w-full bg-gray-500 hover:bg-gray-600"
                        isLoading={isLoading}
                    >
                        User (ผู้ใช้ทั่วไป)
                    </Button>
                </div>

                {message && (
                    <div className="mt-4 p-3 rounded bg-white/10 text-center text-sm font-medium animate-pulse">
                        {message}
                    </div>
                )}
            </GlassCard>
        </div>
    );
}
