import type { Metadata } from "next";

import { AccessDenied } from "@/components/admin/admin-states";
import { BookingList } from "@/components/admin/bookings/booking-list";
import { can } from "@/lib/auth/permissions";
import { requireStaffPage } from "@/lib/auth/session";
import { bookingQuery, parseBookingParams } from "@/lib/booking/filters";
import { countByStatus, listBookings, PAGE_SIZE } from "@/services/bookings";

export const metadata: Metadata = { title: "Bookings" };

export default async function AdminBookingsPage({
  searchParams,
}: PageProps<"/admin/bookings">) {
  const { staff, allowed } = await requireStaffPage("bookings.manage", "/admin/bookings");
  if (!allowed) return <AccessDenied />;

  const { filters, page } = parseBookingParams(await searchParams);
  const [{ rows, total }, counts] = await Promise.all([
    listBookings(filters, page),
    countByStatus(filters),
  ]);

  return (
    <BookingList
      basePath="/admin/bookings"
      filters={filters}
      page={page}
      pageSize={PAGE_SIZE}
      rows={rows}
      total={total}
      counts={counts}
      exportHref={
        can(staff.role, "bookings.export")
          ? `/admin/bookings/export${bookingQuery(filters)}`
          : undefined
      }
    />
  );
}
