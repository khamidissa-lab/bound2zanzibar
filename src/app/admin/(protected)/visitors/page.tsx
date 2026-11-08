import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
} from "lucide-react";

import { AccessDenied } from "@/components/admin/admin-states";
import {
  dateTime,
  EmptyState,
  LeadBadge,
  VisitorsHeader,
} from "@/components/admin/visitors/ui";
import { buttonVariants } from "@/components/ui/button";
import { can } from "@/lib/auth/permissions";
import { requireStaffPage } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import {
  countryFlag,
  countryName,
  LEAD_LABELS,
  LEAD_STATUSES,
  visitorLabel,
} from "@/lib/visitors/admin";
import {
  listVisitorCountries,
  listVisitors,
  parseVisitorFilters,
  type Visitor,
  type VisitorFilters,
  type VisitorSort,
} from "@/services/visitors";

export const metadata: Metadata = { title: "Visitor activity" };

const PAGE_SIZE = 25;
const TYPE_LABELS = {
  all: "All visitors",
  identified: "Identified",
  anonymous: "Anonymous",
  returning: "Returning",
  leads: "Potential customers",
} as const;

function toQuery(f: VisitorFilters, patch: Partial<VisitorFilters> = {}) {
  const next = { ...f, ...patch };
  const q = new URLSearchParams();
  if (next.q) q.set("q", next.q);
  if (next.type !== "all") q.set("type", next.type);
  if (next.country) q.set("country", next.country);
  if (next.device) q.set("device", next.device);
  if (next.lead) q.set("lead", next.lead);
  if (next.sort !== "last_seen") q.set("sort", next.sort);
  if (next.dir !== "desc") q.set("dir", next.dir);
  if (next.page > 1) q.set("page", String(next.page));
  return q.toString();
}

function visitorType(v: Visitor) {
  if (v.email) return "Identified";
  if (v.visit_count > 1) return "Returning";
  return "New";
}

export default async function VisitorActivityPage({
  searchParams,
}: PageProps<"/admin/visitors">) {
  const { allowed, staff } = await requireStaffPage("visitors.view", "/admin/visitors");
  if (!allowed) return <AccessDenied />;

  const params = await searchParams;
  const filters = parseVisitorFilters(params);
  const [{ rows, total }, countries] = await Promise.all([
    listVisitors(filters, PAGE_SIZE),
    listVisitorCountries(),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const href = (patch: Partial<VisitorFilters>) => {
    const q = toQuery(filters, patch);
    return q ? `/admin/visitors?${q}` : "/admin/visitors";
  };
  const sortHeader = (label: string, sort: VisitorSort, className?: string) => {
    const active = filters.sort === sort;
    const dir = active && filters.dir === "desc" ? "asc" : "desc";
    const Icon = filters.dir === "asc" ? ArrowUp : ArrowDown;
    return (
      <th
        className={cn("px-4 py-3 font-medium", className)}
        aria-sort={
          active ? (filters.dir === "asc" ? "ascending" : "descending") : undefined
        }
      >
        <Link
          href={href({ sort, dir, page: 1 })}
          className="inline-flex items-center gap-1 hover:text-ocean-deep"
        >
          {label}
          {active ? <Icon className="size-3" aria-hidden="true" /> : null}
        </Link>
      </th>
    );
  };
  const exportQuery = toQuery(filters, { page: 1 });
  const select = "h-10 rounded-lg border border-input bg-card px-2 text-sm";

  return (
    <div className="max-w-6xl space-y-6">
      <VisitorsHeader
        title="Visitor activity"
        description="Every visitor who accepted visitor statistics. Contact details appear only when the visitor typed them into one of our forms."
      >
        {can(staff.role, "visitors.export") ? (
          <a
            href={`/admin/visitors/export${exportQuery ? `?${exportQuery}` : ""}`}
            className={buttonVariants({ variant: "outline" })}
          >
            <Download aria-hidden="true" data-icon="inline-start" />
            Export CSV
          </a>
        ) : null}
      </VisitorsHeader>

      {params.erased ? (
        <p
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
        >
          The visitor’s record and activity were erased.
        </p>
      ) : null}

      <form
        action="/admin/visitors"
        method="get"
        role="search"
        aria-label="Search visitors"
        className="flex flex-wrap gap-2"
      >
        <label className="relative min-w-56 flex-1">
          <span className="sr-only">
            Search by name, email, phone, city or visitor ID
          </span>
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            name="q"
            defaultValue={filters.q}
            placeholder="Name, email, phone, city or ID"
            className="h-10 w-full rounded-lg border border-input bg-card pr-3 pl-9 text-sm outline-none focus-visible:border-turquoise-deep focus-visible:ring-2 focus-visible:ring-turquoise-deep/25"
          />
        </label>
        <label>
          <span className="sr-only">Visitor type</span>
          <select name="type" defaultValue={filters.type} className={select}>
            {Object.entries(TYPE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Lead stage</span>
          <select name="lead" defaultValue={filters.lead} className={select}>
            <option value="">Any lead stage</option>
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {LEAD_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Country</span>
          <select name="country" defaultValue={filters.country} className={select}>
            <option value="">All countries</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {countryName(c)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Device</span>
          <select name="device" defaultValue={filters.device} className={select}>
            <option value="">All devices</option>
            <option value="mobile">Mobile</option>
            <option value="tablet">Tablet</option>
            <option value="desktop">Desktop</option>
          </select>
        </label>
        <input type="hidden" name="sort" value={filters.sort} />
        <input type="hidden" name="dir" value={filters.dir} />
        <button type="submit" className={buttonVariants({ className: "h-10" })}>
          Apply
        </button>
      </form>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {total.toLocaleString("en-US")} {total === 1 ? "visitor" : "visitors"}
      </p>

      {rows.length === 0 ? (
        <EmptyState title="No visitors match.">
          Try other filters. New visitors appear once they accept the cookie banner on the
          website.
        </EmptyState>
      ) : (
        <div
          className="overflow-x-auto rounded-xl border bg-card"
          tabIndex={0}
          role="region"
          aria-label="Visitors (scrolls sideways)"
        >
          <table className="w-full min-w-[68rem] text-sm">
            <thead className="border-b bg-muted/60 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Visitor ID</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Country</th>
                <th className="px-4 py-3 font-medium">Device</th>
                {sortHeader("First visit", "first_seen")}
                {sortHeader("Last visit", "last_seen")}
                {sortHeader("Visits", "visits", "text-right")}
                {sortHeader("Pages", "pages", "text-right")}
                <th className="px-4 py-3 font-medium">Visitor type</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((v) => (
                <tr key={v.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/visitors/${v.id}`}
                      className="font-mono text-turquoise-deep hover:underline"
                    >
                      V-{v.short_id}
                      <span className="sr-only"> — open {visitorLabel(v)}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-medium text-ocean-deep">
                    {v.name ?? (
                      <span className="font-normal text-muted-foreground">
                        Anonymous visitor
                      </span>
                    )}
                  </td>
                  <td className="max-w-52 truncate px-4 py-3">
                    {v.email ? (
                      <a
                        href={`mailto:${v.email}`}
                        className="hover:text-turquoise-deep hover:underline"
                      >
                        {v.email}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span aria-hidden="true">{countryFlag(v.country)} </span>
                    {countryName(v.country)}
                  </td>
                  <td className="px-4 py-3 capitalize">{v.device}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {dateTime(v.first_seen_at)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {dateTime(v.last_seen_at)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{v.visit_count}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{v.page_views}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">
                        {visitorType(v)}
                      </span>
                      <LeadBadge status={v.lead_status} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 ? (
        <nav
          aria-label="Pages"
          className="flex items-center justify-between gap-3 text-sm"
        >
          <p className="text-muted-foreground">
            Page {filters.page} of {pages}
          </p>
          <div className="flex gap-2">
            {filters.page > 1 ? (
              <Link
                href={href({ page: filters.page - 1 })}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <ChevronLeft aria-hidden="true" data-icon="inline-start" />
                Previous
              </Link>
            ) : null}
            {filters.page < pages ? (
              <Link
                href={href({ page: filters.page + 1 })}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Next
                <ChevronRight aria-hidden="true" data-icon="inline-end" />
              </Link>
            ) : null}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
