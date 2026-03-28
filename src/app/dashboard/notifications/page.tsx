import { requirePageRole } from "@/lib/auth";
import { NotificationsCenter } from "@/components/dashboard/NotificationsCenter";

export default async function NotificationsPage() {
    await requirePageRole("admin", "approver", "technician", "user");
    return <NotificationsCenter />;
}
