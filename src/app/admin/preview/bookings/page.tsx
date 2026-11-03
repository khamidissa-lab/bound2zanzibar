import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { AdminFrame } from "@/components/admin/admin-frame";
import { BookingList } from "@/components/admin/bookings/booking-list";
import { PreviewNote } from "@/components/admin/bookings/preview-note";
import { parseBookingParams } from "@/lib/booking/filters";
import {
  filterPreview,
  previewBookings,
  previewCounts,
} from "@/services/admin-bookings-preview";

export const metadata: Metadata = { title: "Bookings preview" };

const PAGE_SIZE = 10;

/** DEVELOPMENT-ONLY preview of the bookings list with example data. */
export default function BookingsPreviewPage({
  searchParams,
}: PageProps<"/admin/preview/bookings">) {
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
  searchParams: PageProps<"/admin/preview/bookings">["searchParams"];
}) {
  await connection();
  const { filters, page } = parseBookingParams(await searchParams);
  const all = await previewBookings(new Date());
  const matching = filterPreview(all, filters);

  return (
    <AdminFrame staff={{ fullName: "Preview User", role: "super_admin" }} preview>
      <PreviewNote />
      <BookingList
        basePath="/admin/preview/bookings"
        filters={filters}
        page={page}
        pageSize={PAGE_SIZE}
        rows={matching.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)}
        total={matching.length}
        counts={previewCounts(all, filters)}
      />
    </AdminFrame>
  );
}
