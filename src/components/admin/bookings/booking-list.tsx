import Link from "next/link";
import { ChevronLeft, ChevronRight, Download, Search } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { bookingQuery, type BookingListFilters } from "@/lib/booking/filters";
import { formatReceived, guestsLabel, itemName } from "@/lib/booking/format";
import { BOOKING_STATUSES, type BookingStatus } from "@/lib/booking/status";
import { formatDate, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { STATUS_LABELS } from "@/services/admin-dashboard-model";
import type { BookingListRow } from "@/services/bookings";
import type { Currency } from "@/types/content";

import { BookingStatusBadge } from "./booking-badge";

const selectClass =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-turquoise-deep focus-visible:ring-2 focus-visible:ring-turquoise-deep/25";

export function BookingList({
  basePath,
  filters,
  page,
  pageSize,
  rows,
  total,
  counts,
  exportHref,
}: {
  /** "/admin/bookings" (or the preview route). Detail links are `${basePath}/${reference}`. */
  basePath: string;
  filters: BookingListFilters;
  page: number;
  pageSize: number;
  rows: BookingListRow[];
  total: number;
  counts: Record<BookingStatus, number>;
  /** Present only for staff allowed to export. */
  exportHref?: string;
}) {
  const allCount = BOOKING_STATUSES.reduce((n, s) => n + counts[s], 0);
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const filtered = Boolean(filters.q || filters.type || filters.from || filters.to);

  const tabs: { label: string; status?: BookingStatus; count: number }[] = [
    { label: "All", count: allCount },
    ...BOOKING_STATUSES.map((s) => ({
      label: STATUS_LABELS[s],
      status: s,
      count: counts[s],
    })),
  ];

  return (
    <div className="max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-ocean-deep">Bookings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Booking requests from the website. A request is only confirmed once you change
            its status and confirm with the customer.
          </p>
        </div>
        {exportHref ? (
          <a href={exportHref} className={buttonVariants({ variant: "outline" })}>
            <Download aria-hidden="true" data-icon="inline-start" />
            Export CSV
          </a>
        ) : null}
      </div>

      <nav aria-label="Filter by status" className="-mx-1 mt-6 overflow-x-auto px-1">
        <ul className="flex min-w-max gap-1 border-b">
          {tabs.map((tab) => {
            const active = filters.status === tab.status;
            return (
              <li key={tab.label}>
                <Link
                  href={`${basePath}${bookingQuery({ ...filters, status: tab.status })}`}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative inline-flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground hover:text-ocean-deep",
                    active &&
                      "font-medium text-ocean-deep after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-turquoise-deep",
                  )}
                >
                  {tab.label}
                  <span className="rounded-full bg-sand-soft px-2 py-0.5 text-xs text-ocean-deep tabular-nums">
                    {tab.count}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <form
        action={basePath}
        method="get"
        role="search"
        className="mt-4 grid gap-3 rounded-2xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))_auto] lg:items-end"
      >
        {filters.status ? (
          <input type="hidden" name="status" value={filters.status} />
        ) : null}
        <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
          <Label htmlFor="booking-q">Search</Label>
          <Input
            id="booking-q"
            name="q"
            defaultValue={filters.q}
            placeholder="Reference, name, email or phone"
            className="h-10 bg-background"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="booking-type">Type</Label>
          <select
            id="booking-type"
            name="type"
            defaultValue={filters.type ?? ""}
            className={selectClass}
          >
            <option value="">Tours and packages</option>
            <option value="tour">Tours</option>
            <option value="package">Packages</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="booking-from">Travel date from</Label>
          <Input
            id="booking-from"
            name="from"
            type="date"
            defaultValue={filters.from}
            className="h-10 bg-background"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="booking-to">Travel date to</Label>
          <Input
            id="booking-to"
            name="to"
            type="date"
            defaultValue={filters.to}
            className="h-10 bg-background"
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className={buttonVariants({ className: "h-10" })}>
            <Search aria-hidden="true" data-icon="inline-start" />
            Apply
          </button>
          {filtered ? (
            <Link
              href={`${basePath}${bookingQuery({ status: filters.status })}`}
              className={buttonVariants({ variant: "ghost", className: "h-10" })}
            >
              Clear
            </Link>
          ) : null}
        </div>
      </form>

      {rows.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed bg-card px-6 py-12 text-center">
          <p className="font-medium text-ocean-deep">
            {filtered || filters.status
              ? "No bookings match these filters."
              : "No booking requests yet."}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered || filters.status
              ? "Try a different status, search or date range."
              : "Requests sent from the website's booking form will appear here."}
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-2xl border bg-card">
            <table className="w-full min-w-[52rem] text-sm">
              <caption className="sr-only">
                Booking requests, newest first. Page {page} of {pages}.
              </caption>
              <thead className="border-b text-left text-xs text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Reference
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Customer
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Trip
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Travel date
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Guests
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    Estimate
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((row) => (
                  <tr key={row.id} className="align-top hover:bg-sand-soft/60">
                    <td className="px-4 py-3">
                      <Link
                        href={`${basePath}/${row.reference}`}
                        className="font-mono text-xs font-semibold text-ocean-deep hover:underline"
                      >
                        {row.reference}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        Received {formatReceived(row.created_at)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ocean-deep">{row.customer_name}</p>
                      <p className="max-w-[14rem] truncate text-xs text-muted-foreground">
                        {row.email}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="max-w-[16rem] text-ocean-deep">{itemName(row)}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {row.item_type}
                      </p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatDate(row.preferred_date)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {guestsLabel(row.adults, row.children)}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap tabular-nums">
                      {row.quoted_total !== null ? (
                        formatPrice(row.quoted_total, row.currency as Currency)
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <BookingStatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <p>
              {total} booking{total === 1 ? "" : "s"} · page {page} of {pages}
            </p>
            <div className="flex gap-2">
              {page > 1 ? (
                <Link
                  href={`${basePath}${bookingQuery(filters, page - 1)}`}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  <ChevronLeft aria-hidden="true" data-icon="inline-start" />
                  Previous
                </Link>
              ) : null}
              {page < pages ? (
                <Link
                  href={`${basePath}${bookingQuery(filters, page + 1)}`}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Next
                  <ChevronRight aria-hidden="true" data-icon="inline-end" />
                </Link>
              ) : null}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
