import type { Metadata } from "next";

import { AccessDenied, AdminComingSoon } from "@/components/admin/admin-states";
import { requireStaffPage } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Bookings" };

export default async function Page() {
  const { allowed } = await requireStaffPage("bookings.manage", "/admin/bookings");
  if (!allowed) return <AccessDenied />;
  return (
    <AdminComingSoon
      title="Bookings"
      description="Review booking requests, filter by status and date, update status and export to CSV."
      phase="Phase 6"
    />
  );
}
