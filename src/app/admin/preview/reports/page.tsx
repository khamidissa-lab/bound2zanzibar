import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { FlaskConical } from "lucide-react";

import { AdminFrame } from "@/components/admin/admin-frame";
import { ReportsView } from "@/components/admin/reports/reports-view";
import { loadPreviewReportInput } from "@/services/admin-dashboard-preview";
import { buildReport, parseRange } from "@/services/reports-model";

export const metadata: Metadata = { title: "Reports preview" };

/**
 * DEVELOPMENT-ONLY preview of the Reports page with clearly labelled EXAMPLE
 * data, so the layout can be reviewed without signing in. 404 in production.
 */
export default function ReportsPreviewPage({
  searchParams,
}: PageProps<"/admin/preview/reports">) {
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
  searchParams: PageProps<"/admin/preview/reports">["searchParams"];
}) {
  await connection();
  const now = new Date();
  const view = buildReport(
    await loadPreviewReportInput(now),
    parseRange((await searchParams).range),
    now,
  );
  return (
    <AdminFrame staff={{ fullName: "Preview User", role: "super_admin" }} preview>
      <div
        role="note"
        className="mb-6 flex items-center gap-3 rounded-2xl border border-dashed border-gold bg-gold/10 px-4 py-3 text-sm text-ocean-deep"
      >
        <FlaskConical className="size-4 shrink-0 text-gold-deep" aria-hidden="true" />
        <span>
          <strong>Development preview</strong> — not available on the live site.{" "}
          <strong>All figures are EXAMPLE DATA for design review only.</strong> The period
          links go to the real Reports page.
        </span>
      </div>
      <ReportsView view={view} canExport={false} />
    </AdminFrame>
  );
}
