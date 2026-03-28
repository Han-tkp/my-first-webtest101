import AdminView from "@/components/dashboard/AdminView";
import ApproverView from "@/components/dashboard/ApproverView";
import TechnicianView from "@/components/dashboard/TechnicianView";
import UserView from "@/components/dashboard/UserView";
import { requirePageRole } from "@/lib/auth";

export default async function DashboardPage() {
    const profile = await requirePageRole("admin", "approver", "technician", "user");

    switch (profile.role) {
        case "admin":
            return <AdminView />;
        case "technician":
            return <TechnicianView />;
        case "approver":
            return <ApproverView />;
        case "user":
        default:
            return <UserView userId={profile.id} />;
    }
}
