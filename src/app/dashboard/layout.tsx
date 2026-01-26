import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Get user profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    const roleLabels: Record<string, string> = {
        admin: "ผู้ดูแลระบบ",
        approver: "ผู้อนุมัติ",
        technician: "ช่างเทคนิค",
        user: "ผู้ใช้ทั่วไป",
    };

    // Define tabs based on role
    const allTabs = [
        { id: "equipment", label: "หน้าหลัก", href: "/dashboard", roles: ["admin", "user", "technician", "approver"] },
        { id: "borrow", label: "ยืมอุปกรณ์", href: "/dashboard/borrow", roles: ["admin", "user"] },
        { id: "history", label: "ประวัติการยืม", href: "/dashboard/history", roles: ["admin", "user"] },
        { id: "technician", label: "ส่วนงานช่าง", href: "/dashboard/technician", roles: ["admin", "technician"] },
        { id: "approvals", label: "จัดการคำขอ", href: "/dashboard/approvals", roles: ["admin", "approver"] },
        { id: "reports", label: "รายงาน", href: "/dashboard/reports", roles: ["admin", "approver"] },
    ];

    const visibleTabs = allTabs.filter(tab => tab.roles.includes(profile?.role || "user"));

    return (
        <div className="min-h-screen bg-gradient-dark">
            {/* Header */}
            <header className="sticky top-0 z-50 glass">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <span className="text-2xl">🔄</span>
                        </div>
                        <div>
                            <p className="font-bold text-lg">Yonchuw</p>
                            <p className="text-white/70 text-xs">Dashboard</p>
                        </div>
                    </Link>

                    <div className="flex items-center gap-4">
                        {/* User Info */}
                        <div className="hidden sm:flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-sm font-medium">{profile?.full_name}</p>
                                <p className="text-xs text-white/60">{roleLabels[profile?.role || "user"]}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <span className="text-lg">👤</span>
                            </div>
                        </div>

                        {/* Logout */}
                        <form action="/api/auth/logout" method="POST">
                            <Button variant="glass" size="sm" type="submit">
                                ออกจากระบบ
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Tabs */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
                    <nav className="flex gap-2 overflow-x-auto">
                        {visibleTabs.map((tab) => (
                            <Link
                                key={tab.id}
                                href={tab.href}
                                className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all hover:bg-white/10"
                            >
                                {tab.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
