import { can } from "@/lib/auth/permissions";
import { getStaffAccess } from "@/lib/auth/session";
import { toCsv, type CsvColumn } from "@/lib/csv";
import { eatDate } from "@/lib/visitors/admin";
import { logStaffEvent } from "@/services/activity";
import { listSubscribers, type Subscriber } from "@/services/visitors";

const columns: CsvColumn<Subscriber>[] = [
  { header: "Email", value: (s) => s.email },
  { header: "Language", value: (s) => s.locale },
  { header: "Subscribed", value: (s) => s.subscribed_at.slice(0, 10) },
];

/** Active newsletter subscribers (they ticked the consent box). Admins only. */
export async function GET() {
  const access = await getStaffAccess();
  if (access.kind !== "ok") return new Response("Not signed in", { status: 401 });
  if (!can(access.staff.role, "visitors.export")) {
    return new Response("You don't have permission to export subscribers.", {
      status: 403,
    });
  }
  const rows = (await listSubscribers()).filter((s) => !s.unsubscribed_at);
  await logStaffEvent("subscribers_exported", { rows: rows.length });
  return new Response(toCsv(rows, columns), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="newsletter-${eatDate(Date.now())}.csv"`,
      "Cache-Control": "no-store, private",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
