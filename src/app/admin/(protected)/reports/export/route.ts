import { can } from "@/lib/auth/permissions";
import { getStaffAccess } from "@/lib/auth/session";
import { toCsv, type CsvColumn } from "@/lib/csv";
import { loadReportInput } from "@/services/reports";
import { buildReport, parseRange, type MonthRow } from "@/services/reports-model";

/**
 * Monthly report as CSV. Totals only: no customer names or contact details.
 * Restricted to roles that may export bookings; queries still run under RLS.
 */
export async function GET(request: Request) {
  const access = await getStaffAccess();
  if (access.kind !== "ok") return new Response("Not signed in", { status: 401 });
  if (!can(access.staff.role, "bookings.export")) {
    return new Response("You don't have permission to export reports.", { status: 403 });
  }

  const range = parseRange(new URL(request.url).searchParams.get("range"));
  const view = buildReport(await loadReportInput(), range, new Date());
  const columns: CsvColumn<MonthRow>[] = [
    { header: "Month", value: (m) => m.key },
    { header: "Booking requests", value: (m) => m.requests },
    { header: "Confirmed, paid or completed", value: (m) => m.won },
    { header: "Cancelled or rejected", value: (m) => m.lost },
    { header: "Travellers", value: (m) => m.travellers },
    // One column per currency; amounts are never converted.
    ...view.currencies.map((currency): CsvColumn<MonthRow> => ({
      header: `Verified payments (${currency})`,
      value: (m) => m.revenue[currency] ?? 0,
    })),
  ];

  return new Response(toCsv(view.months, columns), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="report-${range}-${view.today}.csv"`,
      "Cache-Control": "no-store, private",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
