import type { Metadata } from "next";

import { AccessDenied, AdminComingSoon } from "@/components/admin/admin-states";
import { requireStaffPage } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Enquiries" };

export default async function Page() {
  const { allowed } = await requireStaffPage("bookings.manage", "/admin/enquiries");
  if (!allowed) return <AccessDenied />;
  return (
    <AdminComingSoon
      title="Enquiries"
      description="Read and respond to contact enquiries."
      phase="Phase 6"
    />
  );
}
