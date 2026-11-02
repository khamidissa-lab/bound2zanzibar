import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";

import { AdminFrame } from "@/components/admin/admin-frame";
import { getStaffAccess } from "@/lib/auth/session";

/**
 * Admin shell. The session is read inside <Suspense> (required with Cache
 * Components). This check controls the shell only: Next.js renders layouts
 * and pages in parallel, so every page ALSO verifies access itself via
 * requireStaffPage(), and RLS protects the data underneath.
 */
export default function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<AdminShellSkeleton />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}

async function AdminShell({ children }: { children: ReactNode }) {
  const access = await getStaffAccess();
  if (access.kind === "unconfigured" || access.kind === "signed_out") {
    redirect("/admin/login");
  }
  if (access.kind === "no_access") redirect("/admin/no-access");

  return <AdminFrame staff={access.staff}>{children}</AdminFrame>;
}

function AdminShellSkeleton() {
  return (
    <div className="flex flex-1 bg-[#F3F5F4]" aria-busy="true" aria-label="Loading admin">
      <div className="hidden w-64 shrink-0 border-r bg-card lg:block" />
      <div className="flex-1 p-8">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}
