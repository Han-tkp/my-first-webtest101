import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminView from "@/components/dashboard/AdminView";
import UserView from "@/components/dashboard/UserView";
import TechnicianView from "@/components/dashboard/TechnicianView";
import ApproverView from "@/components/dashboard/ApproverView";

export default async function DashboardPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    // Get user profile to determine role
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    const role = profile?.role || "user";

    // Role Dispatcher
    switch (role) {
        case "admin":
            return <AdminView />;
        case "technician":
            return <TechnicianView />;
        case "approver":
            return <ApproverView />;
        case "user":
        default:
            return <UserView userId={user.id} />;
    }
}
