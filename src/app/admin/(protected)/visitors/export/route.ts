import { can } from "@/lib/auth/permissions";
import { getStaffAccess } from "@/lib/auth/session";
import { toCsv, type CsvColumn } from "@/lib/csv";
import { countryName, eatDate, LEAD_LABELS } from "@/lib/visitors/admin";
import { logStaffEvent } from "@/services/activity";
import { exportVisitors, parseVisitorFilters, type Visitor } from "@/services/visitors";

const iso = (v: string) =>
  new Date(v).toISOString().replace("T", " ").slice(0, 16) + " UTC";

const columns: CsvColumn<Visitor>[] = [
  { header: "Visitor ID", value: (v) => `V-${v.short_id}` },
  { header: "Name", value: (v) => v.name },
  { header: "Email", value: (v) => v.email },
  { header: "Phone", value: (v) => v.phone },
  { header: "Country", value: (v) => countryName(v.country) },
  { header: "City", value: (v) => v.city },
  { header: "Device", value: (v) => v.device },
  { header: "Browser", value: (v) => v.browser },
  { header: "OS", value: (v) => v.os },
  { header: "First visit", value: (v) => iso(v.first_seen_at) },
  { header: "Last visit", value: (v) => iso(v.last_seen_at) },
  { header: "Visits", value: (v) => v.visit_count },
  { header: "Pages viewed", value: (v) => v.page_views },
  {
    header: "Lead stage",
    value: (v) => (v.lead_status ? LEAD_LABELS[v.lead_status] : ""),
  },
  { header: "Lead score", value: (v) => v.lead_score },
];

/**
 * CSV of the visitors matching the list filters. Admins only; the query
 * still runs under RLS, and each export is recorded in the activity log.
 */
export async function GET(request: Request) {
  const access = await getStaffAccess();
  if (access.kind !== "ok") return new Response("Not signed in", { status: 401 });
  if (!can(access.staff.role, "visitors.export")) {
    return new Response("You don't have permission to export visitors.", { status: 403 });
  }
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const rows = await exportVisitors(parseVisitorFilters(params));
  await logStaffEvent("visitors_exported", { rows: rows.length });

  return new Response(toCsv(rows, columns), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="visitors-${eatDate(Date.now())}.csv"`,
      "Cache-Control": "no-store, private",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
