import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { AdminFrame } from "@/components/admin/admin-frame";
import { BookingDetailView } from "@/components/admin/bookings/booking-detail";
import { PreviewNote } from "@/components/admin/bookings/preview-note";
import { previewBookings, previewEvents } from "@/services/admin-bookings-preview";

export const metadata: Metadata = { title: "Booking preview" };

/** DEVELOPMENT-ONLY preview of a booking detail page with example data. */
export default function BookingPreviewPage({
  params,
}: PageProps<"/admin/preview/bookings/[reference]">) {
  if (process.env.NODE_ENV !== "development") notFound();
  return (
    <Suspense fallback={<div className="flex-1 p-8 text-muted-foreground">Loading…</div>}>
      <Preview params={params} />
    </Suspense>
  );
}

async function Preview({
  params,
}: {
  params: PageProps<"/admin/preview/bookings/[reference]">["params"];
}) {
  await connection();
  const { reference } = await params;
  const booking = (await previewBookings(new Date())).find(
    (b) => b.reference === reference,
  );
  if (!booking) notFound();

  return (
    <AdminFrame staff={{ fullName: "Preview User", role: "super_admin" }} preview>
      <PreviewNote />
      <BookingDetailView
        backHref="/admin/preview/bookings"
        booking={booking}
        events={previewEvents(booking)}
        canEdit
        preview
      />
    </AdminFrame>
  );
}
