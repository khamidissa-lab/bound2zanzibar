import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import {
  ActivityList,
  parseActivityParams,
} from "@/components/admin/activity/activity-list";
import { AdminFrame } from "@/components/admin/admin-frame";
import { PreviewNote } from "@/components/admin/bookings/preview-note";
import { ACTIVITY_AREAS } from "@/lib/activity/format";
import { PREVIEW_ACTORS, previewActivity } from "@/services/admin-activity-preview";

export const metadata: Metadata = { title: "Activity log preview" };

const PAGE_SIZE = 10;

/** DEVELOPMENT-ONLY preview of the activity log with example data. */
export default function ActivityPreviewPage({
  searchParams,
}: PageProps<"/admin/preview/activity">) {
  if (process.env.NODE_ENV !== "development") notFound();
  return (
    <Suspense fallback={<div className="flex-1 p-8 text-muted-foreground">Loading…</div>}>
      <Preview searchParams={searchParams} />
    </Suspense>
  );
}

async function Preview({
  searchParams,
}: {
  searchParams: PageProps<"/admin/preview/activity">["searchParams"];
}) {
  await connection();
  const { filters, page } = parseActivityParams(await searchParams);
  const matching = previewActivity(new Date()).filter(
    (e) =>
      (!filters.area ||
        (ACTIVITY_AREAS[filters.area].entities as readonly string[]).includes(
          e.entity,
        )) &&
      (!filters.actor || e.actor_id === filters.actor),
  );

  return (
    <AdminFrame staff={{ fullName: "Preview User", role: "super_admin" }} preview>
      <PreviewNote />
      <ActivityList
        basePath="/admin/preview/activity"
        filters={filters}
        page={page}
        pageSize={PAGE_SIZE}
        rows={matching.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)}
        total={matching.length}
        actors={PREVIEW_ACTORS}
      />
    </AdminFrame>
  );
}
