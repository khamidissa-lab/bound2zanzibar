import type { ReactNode } from "react";
import Link from "next/link";
import { Download } from "lucide-react";

import { formatDate, formatMoney, marketLabels } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  REPORT_RANGES,
  type ReportRange,
  type ReportView,
} from "@/services/reports-model";
import type { Market } from "@/types/content";

function Card({
  title,
  note,
  children,
  className,
}: {
  title: string;
  note?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn("rounded-xl border bg-card p-5", className)}
      aria-label={title}
    >
      <h2 className="mb-4 font-sans text-base font-semibold text-ocean-deep">{title}</h2>
      {children}
      {note ? <p className="mt-3 text-xs text-muted-foreground">{note}</p> : null}
    </section>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl leading-tight font-semibold text-ocean-deep tabular-nums">
        {value}
      </p>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

/** Ranked horizontal bars in one hue, value at the end of each row. */
function Ranked({
  rows,
  unit,
}: {
  rows: { name: string; count: number }[];
  unit: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.name}>
          <div className="mb-1 flex justify-between gap-3 text-sm">
            <span className="text-ocean-deep">{row.name}</span>
            <span className="shrink-0 whitespace-nowrap text-muted-foreground tabular-nums">
              {row.count.toLocaleString("en-US")} {unit}
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-sand-soft">
            <div
              className="h-2.5 rounded-full bg-turquoise-deep"
              style={{
                width: `${row.count === 0 ? 0 : Math.max(3, (row.count / max) * 100)}%`,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

const num = (n: number) => n.toLocaleString("en-US");

export function ReportsView({
  view,
  canExport,
}: {
  view: ReportView;
  canExport: boolean;
}) {
  const s = view.summary;
  const period = view.from
    ? `${formatDate(view.from)} – ${formatDate(view.today)}`
    : `Everything up to ${formatDate(view.today)}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Reports</h1>
          <p className="text-muted-foreground">
            Booking requests, verified payments and enquiries · {period}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <nav
            aria-label="Report period"
            className="grid w-full grid-cols-2 rounded-lg border bg-card p-1 text-center sm:inline-flex sm:w-auto"
          >
            {(Object.keys(REPORT_RANGES) as ReportRange[]).map((key) => (
              <Link
                key={key}
                href={`/admin/reports?range=${key}`}
                aria-current={view.range === key ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium text-ocean-deep/75 hover:text-ocean-deep",
                  view.range === key && "bg-ocean-deep text-white hover:text-white",
                )}
              >
                {REPORT_RANGES[key].label}
              </Link>
            ))}
          </nav>
          {canExport ? (
            <a
              href={`/admin/reports/export?range=${view.range}`}
              className="inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm font-medium text-ocean-deep hover:bg-sand-soft"
            >
              <Download className="size-4" aria-hidden="true" />
              Download CSV
            </a>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Booking requests"
          value={num(s.requests)}
          hint={`${num(s.travellers)} travellers`}
        />
        <Stat label="Went ahead" value={num(s.won)} hint="Confirmed, paid or completed" />
        <Stat
          label="Success rate"
          value={s.successRate === null ? "—" : `${Math.round(s.successRate * 100)}%`}
          hint={
            s.successRate === null
              ? "No requests decided yet"
              : `Of ${num(s.won + s.lost)} decided · ${num(s.pending)} still pending`
          }
        />
        <Stat
          label="Enquiries"
          value={num(s.enquiries + s.journeys)}
          hint={`${num(s.enquiries)} contact · ${num(s.journeys)} custom trips`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card
          title="Revenue from verified payments"
          note="Payments staff recorded after checking they arrived. Each currency is totalled separately and never converted."
        >
          {view.revenue.length === 0 ? (
            <Empty>No payments recorded in this period.</Empty>
          ) : (
            <ul className="divide-y">
              {view.revenue.map((r) => (
                <li
                  key={r.currency}
                  className="flex items-baseline justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <span className="font-display text-3xl text-ocean-deep tabular-nums">
                    {formatMoney(r.total, r.currency)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {num(r.payments)} {r.payments === 1 ? "payment" : "payments"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="Value of bookings that went ahead"
          note="Estimates shown to the customer when they sent the request; the final price may differ."
        >
          {view.wonValue.length === 0 ? (
            <Empty>No confirmed bookings with an estimate in this period.</Empty>
          ) : (
            <ul className="divide-y">
              {view.wonValue.map((r) => (
                <li key={r.currency} className="py-3 first:pt-0 last:pb-0">
                  <span className="font-display text-3xl text-ocean-deep tabular-nums">
                    {formatMoney(r.total, r.currency)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Requests by status">
          {s.requests === 0 ? (
            <Empty>No booking requests in this period.</Empty>
          ) : (
            <Ranked
              unit=""
              rows={view.statusRows.map((r) => ({ name: r.label, count: r.count }))}
            />
          )}
        </Card>
        <Card title="Requests by market">
          {view.markets.length === 0 ? (
            <Empty>No booking requests in this period.</Empty>
          ) : (
            <Ranked
              unit=""
              rows={view.markets.map((m) => ({
                name: marketLabels[m.name as Market]?.long ?? m.name,
                count: m.count,
              }))}
            />
          )}
        </Card>
        <Card
          title="Top destinations"
          note="Tour requests, not counting cancelled or rejected ones."
        >
          {view.topDestinations.length === 0 ? (
            <Empty>No destination data in this period.</Empty>
          ) : (
            <Ranked unit="" rows={view.topDestinations} />
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card
          title="Most requested tours"
          note="Not counting cancelled or rejected requests."
        >
          {view.topTours.length === 0 ? (
            <Empty>No tour requests in this period.</Empty>
          ) : (
            <Ranked unit="requests" rows={view.topTours} />
          )}
        </Card>
        <Card
          title="Most requested packages"
          note="Not counting cancelled or rejected requests."
        >
          {view.topPackages.length === 0 ? (
            <Empty>No package requests in this period.</Empty>
          ) : (
            <Ranked unit="requests" rows={view.topPackages} />
          )}
        </Card>
      </div>

      <Card title="Month by month">
        {view.months.length === 0 ? (
          <Empty>Nothing to show for this period yet.</Empty>
        ) : (
          <div
            className="overflow-x-auto"
            tabIndex={0}
            role="region"
            aria-label="Month by month (scrolls sideways)"
          >
            <table className="w-full min-w-[40rem] text-sm">
              <thead className="bg-sand-soft text-left text-xs text-muted-foreground">
                <tr>
                  <th scope="col" className="rounded-l-lg px-3 py-2 font-medium">
                    Month
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">
                    Requests
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">
                    Went ahead
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">
                    Cancelled or rejected
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">
                    Travellers
                  </th>
                  {view.currencies.map((c, i) => (
                    <th
                      key={c}
                      scope="col"
                      className={cn(
                        "px-3 py-2 text-right font-medium",
                        i === view.currencies.length - 1 && "rounded-r-lg",
                      )}
                    >
                      Paid ({c})
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {view.months.map((m) => (
                  <tr key={m.key}>
                    <th
                      scope="row"
                      className="px-3 py-2.5 text-left font-medium text-ocean-deep"
                    >
                      {m.label}
                    </th>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {num(m.requests)}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{num(m.won)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{num(m.lost)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {num(m.travellers)}
                    </td>
                    {view.currencies.map((c) => (
                      <td key={c} className="px-3 py-2.5 text-right tabular-nums">
                        {m.revenue[c] ? formatMoney(m.revenue[c], c) : "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          Requests are counted in the month they arrived; payments in the month they were
          paid.
        </p>
      </Card>
    </div>
  );
}
