import type { Metadata } from "next";

import { AccessDenied } from "@/components/admin/admin-states";
import { ReportsView } from "@/components/admin/reports/reports-view";
import { can } from "@/lib/auth/permissions";
import { requireStaffPage } from "@/lib/auth/session";
import { loadReportInput } from "@/services/reports";
import { buildReport, parseRange } from "@/services/reports-model";

export const metadata: Metadata = { title: "Reports" };

export default async function ReportsPage({ searchParams }: PageProps<"/admin/reports">) {
  const { staff, allowed } = await requireStaffPage("bookings.manage", "/admin/reports");
  if (!allowed) return <AccessDenied />;

  const range = parseRange((await searchParams).range);
  const view = buildReport(await loadReportInput(), range, new Date());
  return <ReportsView view={view} canExport={can(staff.role, "bookings.export")} />;
}
