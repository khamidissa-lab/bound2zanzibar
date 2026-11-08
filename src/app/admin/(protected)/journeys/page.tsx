import type { Metadata } from "next";

import { AccessDenied } from "@/components/admin/admin-states";
import {
  JourneyList,
  parseJourneyParams,
} from "@/components/admin/journeys/journey-views";
import { requireStaffPage } from "@/lib/auth/session";
import {
  countJourneysByStatus,
  JOURNEY_PAGE_SIZE,
  listJourneys,
} from "@/services/journeys";

export const metadata: Metadata = { title: "Journey requests" };

export default async function AdminJourneysPage({
  searchParams,
}: PageProps<"/admin/journeys">) {
  const { allowed } = await requireStaffPage("bookings.manage", "/admin/journeys");
  if (!allowed) return <AccessDenied />;

  const { filters, page } = parseJourneyParams(await searchParams);
  const [{ rows, total }, counts] = await Promise.all([
    listJourneys(filters, page),
    countJourneysByStatus(filters),
  ]);

  return (
    <JourneyList
      basePath="/admin/journeys"
      filters={filters}
      page={page}
      pageSize={JOURNEY_PAGE_SIZE}
      rows={rows}
      total={total}
      counts={counts}
    />
  );
}
