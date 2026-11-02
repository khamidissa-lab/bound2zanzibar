import type { Metadata } from "next";

import { DashboardView } from "@/components/admin/dashboard/dashboard-view";
import { requireStaffPage } from "@/lib/auth/session";
import { loadDashboardInput } from "@/services/admin-dashboard";
import { buildDashboard } from "@/services/admin-dashboard-model";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const { staff } = await requireStaffPage("dashboard.view", "/admin");
  // Every figure is computed from database records the staff member may read.
  const now = new Date();
  const view = buildDashboard(await loadDashboardInput(staff.role), now);

  return (
    <DashboardView view={view} staffName={staff.fullName} role={staff.role} now={now} />
  );
}
