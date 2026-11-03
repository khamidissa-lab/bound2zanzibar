import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AccessDenied } from "@/components/admin/admin-states";
import { BookingDetailView } from "@/components/admin/bookings/booking-detail";
import { requireStaffPage } from "@/lib/auth/session";
import { BOOKING_REFERENCE_RE } from "@/lib/booking/request";
import { getBooking } from "@/services/bookings";

export async function generateMetadata({
  params,
}: PageProps<"/admin/bookings/[reference]">): Promise<Metadata> {
  return { title: `Booking ${(await params).reference}` };
}

export default async function AdminBookingPage({
  params,
}: PageProps<"/admin/bookings/[reference]">) {
  const { reference } = await params;
  const { allowed } = await requireStaffPage(
    "bookings.manage",
    `/admin/bookings/${encodeURIComponent(reference)}`,
  );
  if (!allowed) return <AccessDenied />;
  if (!BOOKING_REFERENCE_RE.test(reference)) notFound();

  const result = await getBooking(reference);
  if (!result) notFound();

  return (
    <BookingDetailView
      backHref="/admin/bookings"
      booking={result.booking}
      events={result.events}
      canEdit
    />
  );
}
