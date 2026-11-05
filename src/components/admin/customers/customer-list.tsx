import Link from "next/link";
import { ChevronLeft, ChevronRight, Mail, Search, Users } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import type { Customer } from "@/lib/customers";

const dateFmt = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Dar_es_Salaam",
  }).format(new Date(iso));

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "?"
  );
}

export function CustomerList({
  basePath,
  bookingsPath,
  q,
  page,
  pageSize,
  rows,
  total,
  summary,
}: {
  basePath: string;
  /** Bookings list to search for a customer's email. */
  bookingsPath: string;
  q: string;
  page: number;
  pageSize: number;
  rows: Customer[];
  total: number;
  summary: { customers: number; withBookings: number; returning: number };
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const href = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (p > 1) params.set("page", String(p));
    const s = params.toString();
    return s ? `${basePath}?${s}` : basePath;
  };
  const tiles = [
    {
      label: "Customers",
      value: summary.customers,
      hint: "People who booked or enquired",
    },
    {
      label: "With booking requests",
      value: summary.withBookings,
      hint: "At least one request",
    },
    { label: "Returning", value: summary.returning, hint: "More than one contact" },
  ];

  return (
    <div className="max-w-6xl">
      <div>
        <h1 className="font-display text-3xl text-ocean-deep">Customers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Everyone who has sent a booking request or an enquiry, grouped by email address.
        </p>
      </div>

      <ul className="mt-6 grid gap-4 sm:grid-cols-3">
        {tiles.map((t) => (
          <li key={t.label} className="rounded-xl border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground">{t.label}</p>
            <p className="mt-1 text-3xl font-semibold text-ocean-deep tabular-nums">
              {t.value.toLocaleString("en-US")}
            </p>
            <p className="text-xs text-muted-foreground">{t.hint}</p>
          </li>
        ))}
      </ul>

      <form
        action={basePath}
        method="get"
        role="search"
        aria-label="Search customers"
        className="mt-6 flex gap-2"
      >
        <label className="relative flex-1">
          <span className="sr-only">Search by name, email or phone</span>
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search by name, email or phone"
            className="h-10 w-full rounded-lg border border-input bg-card pr-3 pl-9 text-sm outline-none focus-visible:border-turquoise-deep focus-visible:ring-2 focus-visible:ring-turquoise-deep/25"
          />
        </label>
        <button type="submit" className={buttonVariants({ className: "h-10" })}>
          Search
        </button>
      </form>

      {rows.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed bg-card px-6 py-14 text-center">
          <Users className="mx-auto size-6 text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 font-medium text-ocean-deep">
            {q ? "No customers match your search." : "No customers yet."}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {q
              ? "Try a different name, email or phone number."
              : "People appear here when they send a booking request or an enquiry."}
          </p>
        </div>
      ) : (
        <>
          <div
            className="mt-6 overflow-x-auto rounded-xl border bg-card"
            tabIndex={0}
            role="region"
            aria-label="Customers (scrolls sideways)"
          >
            <table className="w-full min-w-[46rem] text-sm">
              <thead className="border-b bg-muted/60 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 text-right font-medium">Requests</th>
                  <th className="px-4 py-3 text-right font-medium">Enquiries</th>
                  <th className="px-4 py-3 font-medium">Last contact</th>
                  <th className="px-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((c) => (
                  <tr key={c.email} className="hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden="true"
                          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-turquoise-soft text-xs font-semibold text-ocean-deep"
                        >
                          {initials(c.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ocean-deep">{c.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {c.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {c.bookings}
                      {c.confirmedBookings > 0 ? (
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({c.confirmedBookings} confirmed)
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{c.enquiries}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {dateFmt(c.lastContact)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {c.bookings > 0 ? (
                          <Link
                            href={`${bookingsPath}?q=${encodeURIComponent(c.email)}`}
                            className={buttonVariants({ variant: "outline", size: "sm" })}
                          >
                            Bookings
                            <span className="sr-only"> for {c.name}</span>
                          </Link>
                        ) : null}
                        <a
                          href={`mailto:${c.email}`}
                          aria-label={`Email ${c.name}`}
                          className={buttonVariants({
                            variant: "ghost",
                            size: "icon-sm",
                          })}
                        >
                          <Mail aria-hidden="true" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <p>
              {total} customer{total === 1 ? "" : "s"} · page {page} of {pages}
            </p>
            <div className="flex gap-2">
              {page > 1 ? (
                <Link
                  href={href(page - 1)}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  <ChevronLeft aria-hidden="true" data-icon="inline-start" />
                  Previous
                </Link>
              ) : null}
              {page < pages ? (
                <Link
                  href={href(page + 1)}
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

/** Reads `q` and `page` from search params. */
export function parseCustomerParams(
  params: Record<string, string | string[] | undefined>,
) {
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const q = first(params.q).trim().slice(0, 100);
  const page = Number.parseInt(first(params.page), 10);
  return { q, page: Number.isFinite(page) && page > 0 ? Math.min(page, 10_000) : 1 };
}

/** Headline numbers for the tiles. */
export function customerSummary(all: Customer[]) {
  return {
    customers: all.length,
    withBookings: all.filter((c) => c.bookings > 0).length,
    returning: all.filter((c) => c.bookings + c.enquiries > 1).length,
  };
}
