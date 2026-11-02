import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { FlaskConical } from "lucide-react";

import { AdminFrame } from "@/components/admin/admin-frame";
import { DashboardView } from "@/components/admin/dashboard/dashboard-view";
import { buildDashboard } from "@/services/admin-dashboard-model";
import { loadPreviewDashboardInput } from "@/services/admin-dashboard-preview";

export const metadata: Metadata = { title: "Dashboard preview" };

/**
 * DEVELOPMENT-ONLY preview of the admin dashboard, so the design can be
 * reviewed before Supabase is connected. Returns 404 in production builds.
 * Content figures come from the site's sample content; booking figures are
 * empty unless "example bookings" is switched on (clearly labelled fake data).
 */
export default function DashboardPreviewPage({
  searchParams,
}: PageProps<"/admin/preview">) {
  if (process.env.NODE_ENV !== "development") notFound();
  return (
    <Suspense
      fallback={<div className="flex-1 p-8 text-muted-foreground">Loading preview…</div>}
    >
      <Preview searchParams={searchParams} />
    </Suspense>
  );
}

async function Preview({
  searchParams,
}: {
  searchParams: PageProps<"/admin/preview">["searchParams"];
}) {
  await connection();
  const example = (await searchParams).example === "1";
  const now = new Date();
  const view = buildDashboard(await loadPreviewDashboardInput(now, example), now);

  return (
    <AdminFrame staff={{ fullName: "Preview User", role: "super_admin" }} preview>
      <div
        role="note"
        className="mb-6 flex flex-col items-start gap-3 rounded-2xl border border-dashed border-gold bg-gold/10 px-4 py-3 text-sm text-ocean-deep sm:flex-row sm:items-center"
      >
        <FlaskConical
          className="hidden size-4 shrink-0 text-gold-deep sm:block"
          aria-hidden="true"
        />
        <span className="flex-1">
          <strong>Development preview</strong> — not available on the live site. Content
          figures use the site&apos;s sample tours.{" "}
          {example ? (
            <strong>
              Booking figures below are EXAMPLE DATA for design review only.
            </strong>
          ) : (
            "There are no booking requests yet, so booking widgets show their empty states."
          )}
        </span>
        <Link
          href={example ? "/admin/preview" : "/admin/preview?example=1"}
          className="rounded-full bg-ocean-deep px-3 py-1.5 text-xs font-medium text-white hover:bg-ocean"
        >
          {example ? "Hide example bookings" : "Show example bookings"}
        </Link>
      </div>
      <DashboardView
        view={view}
        staffName="Preview User"
        role="super_admin"
        now={now}
        editLinks={false}
      />
    </AdminFrame>
  );
}
