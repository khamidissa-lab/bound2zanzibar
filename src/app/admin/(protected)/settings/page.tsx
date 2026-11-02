import type { Metadata } from "next";

import { AccessDenied, AdminComingSoon } from "@/components/admin/admin-states";
import { requireStaffPage } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Site settings" };

export default async function Page() {
  const { allowed } = await requireStaffPage("settings.manage", "/admin/settings");
  if (!allowed) return <AccessDenied />;
  return (
    <AdminComingSoon
      title="Site settings"
      description="Contact details, social links and currency display options."
      phase="Phase 5"
    />
  );
}
