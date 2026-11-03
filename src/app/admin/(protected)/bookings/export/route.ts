import { can } from "@/lib/auth/permissions";
import { getStaffAccess } from "@/lib/auth/session";
import { parseBookingParams } from "@/lib/booking/filters";
import { formatReceived } from "@/lib/booking/format";
import { toCsv, type CsvColumn } from "@/lib/csv";
import { zanzibarDate, STATUS_LABELS } from "@/services/admin-dashboard-model";
import { logStaffEvent } from "@/services/activity";
import { exportBookings, type BookingDetail } from "@/services/bookings";

const columns: CsvColumn<BookingDetail>[] = [
  { header: "Reference", value: (b) => b.reference },
  { header: "Status", value: (b) => STATUS_LABELS[b.status] },
  { header: "Received", value: (b) => formatReceived(b.created_at) },
  { header: "Type", value: (b) => b.item_type },
  { header: "Tour or package", value: (b) => b.tour?.name ?? b.package?.name ?? "" },
  { header: "Preferred date", value: (b) => b.preferred_date },
  { header: "Adults", value: (b) => b.adults },
  { header: "Children", value: (b) => b.children },
  { header: "Customer", value: (b) => b.customer_name },
  { header: "Email", value: (b) => b.email },
  { header: "Phone", value: (b) => b.phone },
  { header: "Market", value: (b) => b.market },
  { header: "Currency", value: (b) => b.currency },
  { header: "Estimate at request", value: (b) => b.quoted_total },
  { header: "Pickup", value: (b) => b.pickup_location },
  { header: "Message", value: (b) => b.message },
  { header: "Internal notes", value: (b) => b.internal_notes },
];

/**
 * CSV download of the bookings matching the list filters. Restricted to roles
 * with "bookings.export"; the query itself still runs under RLS.
 */
export async function GET(request: Request) {
  const access = await getStaffAccess();
  if (access.kind !== "ok") {
    return new Response("Not signed in", { status: 401 });
  }
  if (!can(access.staff.role, "bookings.export")) {
    return new Response("You don't have permission to export bookings.", { status: 403 });
  }

  const { filters } = parseBookingParams(new URL(request.url).searchParams);
  const rows = await exportBookings(filters);
  const filename = `bookings-${zanzibarDate(new Date())}.csv`;
  // Exports contain customer contact details, so each one is recorded.
  // Only the count and status filter are logged, never the search text.
  await logStaffEvent("bookings_exported", {
    rows: rows.length,
    ...(filters.status ? { status: filters.status } : {}),
  });

  return new Response(toCsv(rows, columns), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store, private",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
