import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { getAuthUser } from "@/lib/auth";
import { syncRoleNotifications } from "@/lib/notifications";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const profile = await getAuthUser();

    if (!profile) {
        redirect("/login");
    }

    await syncRoleNotifications().catch(console.error);

    const roleLabels: Record<string, string> = {
        admin: "ผู้ดูแลระบบ",
        approver: "ผู้อนุมัติ",
        technician: "ช่างเทคนิค",
        user: "ผู้ใช้งานทั่วไป",
    };

    const allTabs = [
        { id: "dashboard", label: "หน้าหลัก", href: "/dashboard", roles: ["admin", "user", "technician", "approver"] },
        { id: "borrow", label: "ยืมอุปกรณ์", href: "/dashboard/borrow", roles: ["admin", "user"] },
        { id: "history", label: "ประวัติการยืม", href: "/dashboard/history", roles: ["admin", "user"] },
        { id: "technician", label: "งานช่าง", href: "/dashboard/technician", roles: ["admin", "technician"] },
        { id: "approvals", label: "ศูนย์อนุมัติ", href: "/dashboard/approvals", roles: ["admin", "approver"] },
        { id: "reports", label: "รายงาน", href: "/dashboard/reports", roles: ["admin", "approver"] },
    ];

    const visibleTabs = allTabs.filter((tab) => tab.roles.includes(profile.role));

    return (
        <div className="min-h-screen bg-gradient-dark">
            <DashboardHeader
                fullName={profile.full_name || profile.email || "ผู้ใช้งาน"}
                agency={profile.agency || "หน่วยงานภาครัฐ"}
                roleLabel={roleLabels[profile.role] || profile.role}
                tabs={visibleTabs}
            />

            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
    );
}
