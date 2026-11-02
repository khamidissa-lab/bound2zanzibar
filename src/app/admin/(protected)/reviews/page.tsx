import type { Metadata } from "next";

import { AccessDenied, AdminComingSoon } from "@/components/admin/admin-states";
import { requireStaffPage } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Reviews" };

export default async function Page() {
  const { allowed } = await requireStaffPage("content.manage", "/admin/reviews");
  if (!allowed) return <AccessDenied />;
  return (
    <AdminComingSoon
      title="Reviews"
      description="Moderate guest reviews. Only approved, genuine reviews appear on the website."
      phase="Phase 5"
    />
  );
}
