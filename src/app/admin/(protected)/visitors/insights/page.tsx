import type { Metadata } from "next";
import Link from "next/link";
import { Download, Mail } from "lucide-react";

import { AccessDenied } from "@/components/admin/admin-states";
import {
  BarList,
  dateTime,
  Panel,
  RangeFilter,
  VisitorsHeader,
} from "@/components/admin/visitors/ui";
import { buttonVariants } from "@/components/ui/button";
import { can } from "@/lib/auth/permissions";
import { requireStaffPage } from "@/lib/auth/session";
import { LEAD_LABELS, LEAD_STATUSES, parseRange } from "@/lib/visitors/admin";
import { getVisitorAnalytics, listSubscribers } from "@/services/visitors";

export const metadata: Metadata = { title: "Customer insights" };

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
/** A file download, so a plain link (not client navigation). */
const SUBSCRIBERS_CSV = "/admin/visitors/newsletter/export";

export default async function CustomerInsightsPage({
  searchParams,
}: PageProps<"/admin/visitors/insights">) {
  const { allowed, staff } = await requireStaffPage(
    "visitors.view",
    "/admin/visitors/insights",
  );
  if (!allowed) return <AccessDenied />;

  const params = await searchParams;
  const range = parseRange({
    range: first(params.range),
    from: first(params.from),
    to: first(params.to),
  });
  const [a, subscribers] = await Promise.all([
    getVisitorAnalytics(range.from, range.to, range.bucket),
    listSubscribers(),
  ]);
  const active = subscribers.filter((s) => !s.unsubscribed_at);

  const f = a.funnel;
  const steps = [
    { label: "Visited the website", value: f.visitors },
    { label: "Viewed a tour or package", value: f.viewed_item },
    { label: "Clicked Book, WhatsApp or Contact", value: f.clicked },
    { label: "Started a booking form", value: f.started },
    { label: "Sent a request or enquiry", value: f.submitted },
    { label: "Has a confirmed booking", value: f.completed },
  ];
  const base = Math.max(1, f.visitors);

  return (
    <div className="max-w-6xl space-y-6">
      <VisitorsHeader
        title="Customer insights"
        description={`${range.label}: how visitors move from browsing to booking, where they come from, and who asked to hear from you.`}
      />
      <RangeFilter basePath="/admin/visitors/insights" range={range} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="From visit to booking"
          description="Unique visitors reaching each step"
        >
          <ol className="space-y-3">
            {steps.map((s, i) => (
              <li key={s.label}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-ocean-deep">
                    <span className="me-2 text-xs text-muted-foreground tabular-nums">
                      {i + 1}.
                    </span>
                    {s.label}
                  </span>
                  <span className="font-medium text-ocean-deep tabular-nums">
                    {s.value.toLocaleString("en-US")}
                    <span className="ms-1.5 text-xs font-normal text-muted-foreground">
                      {f.visitors > 0 ? `${Math.round((s.value / base) * 100)}%` : ""}
                    </span>
                  </span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-muted" aria-hidden="true">
                  <div
                    className="h-full rounded-full bg-turquoise-deep"
                    style={{ width: `${Math.max(1, (s.value / base) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ol>
        </Panel>

        <Panel
          title="Potential customers by stage"
          description="Visitors seen in this period"
          action={
            <Link
              href="/admin/visitors/leads"
              className="text-sm font-medium text-turquoise-deep hover:underline"
            >
              Open leads
            </Link>
          }
        >
          <BarList
            empty="No leads in this period yet."
            rows={LEAD_STATUSES.filter((s) => (a.leads[s] ?? 0) > 0).map((s) => ({
              key: s,
              label: LEAD_LABELS[s],
              count: a.leads[s] ?? 0,
              href: `/admin/visitors/leads?status=${s}`,
            }))}
          />
        </Panel>

        <Panel
          title="Where visitors come from"
          description="Website that sent them (first page of each visit)"
        >
          <BarList
            valueLabel="visits"
            empty="No visits in this period."
            rows={a.referrers.map((r) => ({
              key: r.key,
              label: r.key === "direct" ? "Direct, bookmarks or apps" : r.key,
              count: r.count,
            }))}
          />
        </Panel>

        <Panel title="Landing pages" description="First page of each visit">
          <BarList
            valueLabel="visits"
            empty="No visits in this period."
            rows={a.landing_pages.map((r) => ({
              key: r.key,
              label: <span className="font-mono text-xs">{r.key}</span>,
              count: r.count,
            }))}
          />
        </Panel>

        <Panel title="Browsers">
          <BarList
            empty="No visitors in this period."
            rows={a.browsers.map((r) => ({ key: r.key, label: r.key, count: r.count }))}
          />
        </Panel>

        <Panel
          title="Newsletter subscribers"
          description={`${active.length} subscribed (all time). Only email people who ticked the consent box here.`}
          action={
            can(staff?.role, "visitors.export") && active.length > 0 ? (
              <a
                href={SUBSCRIBERS_CSV}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <Download aria-hidden="true" data-icon="inline-start" />
                Export CSV
              </a>
            ) : null
          }
        >
          {active.length === 0 ? (
            <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
              Nobody has subscribed yet. The sign-up form is in the website footer.
            </p>
          ) : (
            <ul className="divide-y text-sm">
              {active.slice(0, 8).map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 py-2">
                  <a
                    href={`mailto:${s.email}`}
                    className="inline-flex min-w-0 items-center gap-2 text-ocean-deep hover:text-turquoise-deep"
                  >
                    <Mail
                      className="size-3.5 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <span className="truncate">{s.email}</span>
                  </a>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {s.locale.toUpperCase()} · {dateTime(s.subscribed_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
