import { requirePageRole } from "@/lib/auth";
import ReportsView from "@/components/dashboard/ReportsView";

export default async function ReportsPage() {
    await requirePageRole("admin", "approver");
    return <ReportsView />;
}
