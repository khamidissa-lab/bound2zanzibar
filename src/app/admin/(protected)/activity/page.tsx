import type { Metadata } from "next";

import {
  ActivityList,
  parseActivityParams,
} from "@/components/admin/activity/activity-list";
import { AccessDenied } from "@/components/admin/admin-states";
import { requireStaffPage } from "@/lib/auth/session";
import {
  ACTIVITY_PAGE_SIZE,
  listActivity,
  listActivityActors,
} from "@/services/activity";

export const metadata: Metadata = { title: "Activity log" };

export default async function AdminActivityPage({
  searchParams,
}: PageProps<"/admin/activity">) {
  const { allowed } = await requireStaffPage("activity.view", "/admin/activity");
  if (!allowed) return <AccessDenied />;

  const { filters, page } = parseActivityParams(await searchParams);
  const [{ rows, total }, actors] = await Promise.all([
    listActivity(filters, page),
    listActivityActors(),
  ]);

  return (
    <ActivityList
      basePath="/admin/activity"
      filters={filters}
      page={page}
      pageSize={ACTIVITY_PAGE_SIZE}
      rows={rows}
      total={total}
      actors={actors}
    />
  );
}
