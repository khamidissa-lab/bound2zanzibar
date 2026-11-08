import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarCheck,
  Eye,
  Inbox,
  MousePointerClick,
  Radio,
  Repeat,
  Target,
  UserCheck,
  UserRound,
  Users,
} from "lucide-react";

import { AccessDenied } from "@/components/admin/admin-states";
import { TrendChart } from "@/components/admin/visitors/trend-chart";
import {
  BarList,
  Panel,
  RangeFilter,
  StatTile,
  VisitorsHeader,
} from "@/components/admin/visitors/ui";
import { requireStaffPage } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import {
  bucketKeys,
  bucketLabel,
  countryFlag,
  countryName,
  formatDuration,
  parseRange,
  type Bucket,
} from "@/lib/visitors/admin";
import { getVisitorAnalytics } from "@/services/visitors";

export const metadata: Metadata = { title: "Visitor analytics" };

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const pct = (part: number, whole: number) =>
  whole > 0 ? `${((part / whole) * 100).toFixed(part / whole < 0.1 ? 1 : 0)}%` : "—";
const DEVICE_LABELS: Record<string, string> = {
  mobile: "Mobile",
  tablet: "Tablet",
  desktop: "Desktop",
};

export default async function VisitorAnalyticsPage({
  searchParams,
}: PageProps<"/admin/visitors/analytics">) {
  const { allowed } = await requireStaffPage(
    "visitors.view",
    "/admin/visitors/analytics",
  );
  if (!allowed) return <AccessDenied />;

  const params = await searchParams;
  const range = parseRange({
    range: first(params.range),
    from: first(params.from),
    to: first(params.to),
    bucket: first(params.bucket),
  });
  const a = await getVisitorAnalytics(range.from, range.to, range.bucket);

  const byBucket = new Map(a.series.map((s) => [s.bucket, s.visitors]));
  const series = bucketKeys(range.startDate, range.endDate, range.bucket).map((key) => ({
    key,
    label: bucketLabel(key, range.bucket),
    count: byBucket.get(key) ?? 0,
  }));
  const query = new URLSearchParams();
  for (const k of ["range", "from", "to"] as const) {
    const v = first(params[k]);
    if (v) query.set(k, v);
  }
  const bucketHref = (b: Bucket) => {
    const q = new URLSearchParams(query);
    q.set("bucket", b);
    return `/admin/visitors/analytics?${q}`;
  };
  const anonymous = a.unique_visitors - a.identified_visitors;

  return (
    <div className="max-w-6xl space-y-6">
      <VisitorsHeader
        title="Visitor analytics"
        description={`${range.label} · Zanzibar time. Visitor numbers count people who accepted visitor statistics; anonymous page views from everyone else are shown separately.`}
      />
      <RangeFilter basePath="/admin/visitors/analytics" range={range} />

      <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        <StatTile
          label="Visitors"
          value={a.unique_visitors}
          icon={Users}
          hint={`${a.visits.toLocaleString("en-US")} visits`}
        />
        <StatTile
          label="Active right now"
          value={a.active_now}
          icon={Radio}
          href="/admin/visitors/live"
          hint="Open live view"
        />
        <StatTile
          label="New visitors"
          value={a.new_visitors}
          icon={UserRound}
          hint="First visit in this period"
        />
        <StatTile
          label="Returning visitors"
          value={a.returning_visitors}
          icon={Repeat}
          hint="Came back after an earlier visit"
        />
        <StatTile
          label="Identified visitors"
          value={a.identified_visitors}
          icon={UserCheck}
          hint="Shared their email"
          href="/admin/visitors?type=identified"
        />
        <StatTile
          label="Anonymous visitors"
          value={anonymous}
          hint="No contact details yet"
        />
        <StatTile
          label="Page views"
          value={a.page_views + a.anonymous_page_views}
          icon={Eye}
          hint={`${a.anonymous_page_views.toLocaleString("en-US")} without consent · avg visit ${formatDuration(a.avg_visit_seconds)}`}
        />
        <StatTile
          label="Enquiries"
          value={a.enquiries}
          icon={Inbox}
          hint="Contact + custom trip requests"
        />
        <StatTile
          label="Booking attempts"
          value={a.booking_attempts}
          icon={MousePointerClick}
          hint="Started a booking form"
        />
        <StatTile
          label="Booking requests"
          value={a.booking_requests}
          icon={CalendarCheck}
          hint={`${a.completed_bookings} confirmed or paid`}
        />
        <StatTile
          label="Potential customers"
          value={a.potential_customers}
          icon={Target}
          href="/admin/visitors/leads"
          hint="Visitors classified as leads"
        />
        <StatTile
          label="Booking conversion"
          value={pct(a.booking_requests, a.unique_visitors)}
          hint="Booking requests ÷ visitors"
        />
      </ul>

      <Panel
        title="Visitors over time"
        description="Unique visitors per period"
        action={
          <nav aria-label="Group by">
            <ul className="flex rounded-lg border p-0.5 text-xs">
              {(["day", "week", "month"] as const).map((b) => (
                <li key={b}>
                  <Link
                    href={bucketHref(b)}
                    aria-current={range.bucket === b ? "page" : undefined}
                    className={cn(
                      "block rounded-md px-2.5 py-1 text-muted-foreground hover:text-ocean-deep",
                      range.bucket === b && "bg-ocean-deep text-white hover:text-white",
                    )}
                  >
                    {b === "day" ? "Daily" : b === "week" ? "Weekly" : "Monthly"}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        }
      >
        <TrendChart
          data={series}
          noun="visitor"
          emptyText="No tracked visitors in this period yet."
        />
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="Visitors by country"
          description="Approximate, from the visitor's network"
        >
          <BarList
            empty="No visitors in this period."
            rows={a.countries.map((c) => ({
              key: c.key,
              label: (
                <>
                  <span aria-hidden="true">{countryFlag(c.key)} </span>
                  {countryName(c.key)}
                </>
              ),
              count: c.count,
              href: c.key !== "ZZ" ? `/admin/visitors?country=${c.key}` : undefined,
            }))}
          />
        </Panel>
        <Panel title="Visitors by device">
          <BarList
            empty="No visitors in this period."
            rows={a.devices.map((d) => ({
              key: d.key,
              label: DEVICE_LABELS[d.key] ?? d.key,
              count: d.count,
              sub: pct(d.count, a.unique_visitors),
              href: `/admin/visitors?device=${d.key}`,
            }))}
          />
        </Panel>
        <Panel
          title="Most viewed Zanzibar tours"
          description="Page views (unique visitors)"
        >
          <BarList
            valueLabel="views"
            empty="No tour pages viewed in this period."
            rows={a.top_tours.map((t) => ({
              key: t.slug,
              label: t.name,
              count: t.views,
              sub: `${t.visitors} ${t.visitors === 1 ? "visitor" : "visitors"}`,
            }))}
          />
        </Panel>
        <Panel
          title="Most viewed Tanzania safaris"
          description="Safari tours and safari packages"
        >
          <BarList
            valueLabel="views"
            empty="No safari pages viewed in this period."
            rows={a.top_safaris.map((t) => ({
              key: `${t.type}:${t.slug}`,
              label: t.name,
              count: t.views,
              sub: `${t.type === "package" ? "package · " : ""}${t.visitors} ${t.visitors === 1 ? "visitor" : "visitors"}`,
            }))}
          />
        </Panel>
      </div>
    </div>
  );
}
