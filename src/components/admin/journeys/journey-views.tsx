import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Mail,
  MessageCircle,
  Phone,
  Search,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { whatsappLink } from "@/config/site";
import { formatReceived, guestsLabel } from "@/lib/booking/format";
import { formatDate, formatPrice } from "@/lib/format";
import {
  ACCOMMODATION_LABELS,
  JOURNEY_STATUS_LABELS,
  JOURNEY_STATUSES,
  type JourneyStatus,
} from "@/lib/journey/request";
import { cn } from "@/lib/utils";
import type { Journey, JourneyFilters } from "@/services/journeys";
import type { Currency } from "@/types/content";

import { JourneyStatusForm } from "./journey-status-form";

const BADGE: Record<JourneyStatus, string> = {
  new: "bg-gold/15 text-ocean-deep ring-gold/50",
  in_progress: "bg-turquoise-soft text-ocean-deep ring-turquoise/50",
  quoted: "bg-[#E1F4EA] text-[#11633A] ring-[#11633A]/30",
  closed: "bg-muted text-muted-foreground ring-border",
};

export function JourneyStatusBadge({ status }: { status: JourneyStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        BADGE[status],
      )}
    >
      {JOURNEY_STATUS_LABELS[status]}
    </span>
  );
}

function query(f: JourneyFilters, page = 1) {
  const p = new URLSearchParams();
  if (f.status) p.set("status", f.status);
  if (f.q) p.set("q", f.q);
  if (page > 1) p.set("page", String(page));
  const s = p.toString();
  return s ? `?${s}` : "";
}

/** Reads list filters from search params, dropping anything invalid. */
export function parseJourneyParams(
  params: Record<string, string | string[] | undefined>,
) {
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const status = first(params.status);
  const page = Number.parseInt(first(params.page), 10);
  return {
    filters: {
      status: (JOURNEY_STATUSES as readonly string[]).includes(status)
        ? (status as JourneyStatus)
        : undefined,
      q: first(params.q).trim().slice(0, 100) || undefined,
    } satisfies JourneyFilters,
    page: Number.isFinite(page) && page > 0 ? Math.min(page, 10_000) : 1,
  };
}

/** "12 Jan – 22 Jan 2027", one date, or "Dates not decided". */
function datesLabel(j: Journey) {
  const range = j.start_date
    ? j.end_date
      ? `${formatDate(j.start_date)} – ${formatDate(j.end_date)}`
      : `From ${formatDate(j.start_date)}`
    : "Dates not decided";
  return j.flexible_dates ? `${range} (flexible)` : range;
}

export function JourneyList({
  basePath,
  filters,
  page,
  pageSize,
  rows,
  total,
  counts,
}: {
  basePath: string;
  filters: JourneyFilters;
  page: number;
  pageSize: number;
  rows: Journey[];
  total: number;
  counts: Record<JourneyStatus, number>;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const all = JOURNEY_STATUSES.reduce((n, s) => n + counts[s], 0);
  const tabs = [
    { label: "All", status: undefined, count: all },
    ...JOURNEY_STATUSES.map((s) => ({
      label: JOURNEY_STATUS_LABELS[s],
      status: s,
      count: counts[s],
    })),
  ];

  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-3xl text-ocean-deep">Journey requests</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Custom trip requests from &ldquo;Design Your Zanzibar Journey&rdquo;. Reply with a
        personalised proposal, then update the status.
      </p>

      <nav aria-label="Filter by status" className="-mx-1 mt-6 overflow-x-auto px-1">
        <ul className="flex min-w-max gap-1 border-b">
          {tabs.map((tab) => {
            const active = filters.status === tab.status;
            return (
              <li key={tab.label}>
                <Link
                  href={`${basePath}${query({ ...filters, status: tab.status })}`}
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

      <form action={basePath} method="get" role="search" className="mt-4 flex gap-2">
        {filters.status ? (
          <input type="hidden" name="status" value={filters.status} />
        ) : null}
        <label htmlFor="journey-q" className="sr-only">
          Search journey requests
        </label>
        <Input
          id="journey-q"
          name="q"
          defaultValue={filters.q}
          placeholder="Search name, email or reference"
          className="h-10 max-w-sm bg-background"
        />
        <button type="submit" className={buttonVariants({ className: "h-10" })}>
          <Search aria-hidden="true" data-icon="inline-start" />
          Search
        </button>
      </form>

      {rows.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed bg-card px-6 py-12 text-center">
          <p className="font-medium text-ocean-deep">
            {filters.q || filters.status
              ? "No requests match."
              : "No journey requests yet."}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {filters.q || filters.status
              ? "Try another status or search."
              : "Requests sent from the Design Your Journey page will appear here."}
          </p>
        </div>
      ) : (
        <>
          <ul className="mt-6 divide-y overflow-hidden rounded-2xl border bg-card">
            {rows.map((row) => (
              <li key={row.id}>
                <Link
                  href={`${basePath}/${row.reference}`}
                  className="flex flex-col gap-1 px-4 py-3 hover:bg-sand-soft/60 sm:flex-row sm:items-center sm:gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "truncate text-ocean-deep",
                        row.status === "new" && "font-semibold",
                      )}
                    >
                      {row.customer_name}
                      <span className="ml-2 font-mono text-xs text-muted-foreground">
                        {row.reference}
                      </span>
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {datesLabel(row)} · {guestsLabel(row.adults, row.children)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                    {formatReceived(row.created_at)}
                    <JourneyStatusBadge status={row.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <p>
              {total} request{total === 1 ? "" : "s"} · page {page} of {pages}
            </p>
            <div className="flex gap-2">
              {page > 1 ? (
                <Link
                  href={`${basePath}${query(filters, page - 1)}`}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  <ChevronLeft aria-hidden="true" data-icon="inline-start" />
                  Previous
                </Link>
              ) : null}
              {page < pages ? (
                <Link
                  href={`${basePath}${query(filters, page + 1)}`}
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

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 py-2.5 sm:grid-cols-[10rem_minmax(0,1fr)]">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm break-words text-ocean-deep">{children}</dd>
    </div>
  );
}

export function JourneyDetail({
  backHref,
  journey,
  destinationNames,
  interestLabels,
}: {
  backHref: string;
  journey: Journey;
  /** Destination slug → name (unknown slugs are shown as-is). */
  destinationNames: Record<string, string>;
  /** Travel style or category slug → label. */
  interestLabels: Record<string, string>;
}) {
  const j = journey;
  const names = (slugs: string[], labels: Record<string, string>) =>
    slugs.length ? slugs.map((s) => labels[s] ?? s).join(", ") : "—";
  return (
    <div className="max-w-6xl">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm text-turquoise-deep hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All journey requests
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-mono text-2xl font-semibold tracking-wide text-ocean-deep sm:text-3xl">
          {j.reference}
        </h1>
        <JourneyStatusBadge status={j.status} />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        From {j.customer_name} · received {formatReceived(j.created_at)} · page language{" "}
        {j.locale.toUpperCase()}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          <section className="rounded-2xl border bg-card p-5 sm:p-6">
            <h2 className="font-display text-lg text-ocean-deep">Trip ideas</h2>
            <dl className="mt-2 divide-y">
              <Row label="Destinations">{names(j.destinations, destinationNames)}</Row>
              <Row label="Dates">{datesLabel(j)}</Row>
              <Row label="Guests">{guestsLabel(j.adults, j.children)}</Row>
              <Row label="Accommodation">{ACCOMMODATION_LABELS[j.accommodation]}</Row>
              <Row label="Budget per person">
                {j.budget_amount !== null && j.budget_currency
                  ? formatPrice(Number(j.budget_amount), j.budget_currency as Currency)
                  : "—"}
              </Row>
              <Row label="Interests">{names(j.interests, interestLabels)}</Row>
              <Row label="Special requirements">
                <span className="whitespace-pre-wrap">
                  {j.special_requirements || "—"}
                </span>
              </Row>
              <Row label="Their ideas">
                <span className="whitespace-pre-wrap">{j.message || "—"}</span>
              </Row>
            </dl>
          </section>
          <section className="rounded-2xl border bg-card p-5 sm:p-6">
            <h2 className="font-display text-lg text-ocean-deep">Customer</h2>
            <dl className="mt-2 divide-y">
              <Row label="Name">{j.customer_name}</Row>
              <Row label="Country">{j.country || "—"}</Row>
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={`mailto:${j.email}?subject=${encodeURIComponent(`Your Zanzibar journey ${j.reference}`)}`}
                className={buttonVariants()}
              >
                <Mail aria-hidden="true" data-icon="inline-start" />
                Email {j.email}
              </a>
              {j.phone ? (
                <>
                  <a
                    href={whatsappLink(
                      `Hello ${j.customer_name}, this is Bound to Zanzibar about your journey request ${j.reference}.`,
                      j.phone,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({ variant: "outline" })}
                  >
                    <MessageCircle aria-hidden="true" data-icon="inline-start" />
                    WhatsApp
                  </a>
                  <a
                    href={`tel:${j.phone.replace(/[^\d+]/g, "")}`}
                    className={buttonVariants({ variant: "outline" })}
                  >
                    <Phone aria-hidden="true" data-icon="inline-start" />
                    {j.phone}
                  </a>
                </>
              ) : null}
            </div>
          </section>
        </div>
        <section className="self-start rounded-2xl border bg-card p-5 sm:p-6">
          <h2 className="font-display text-lg text-ocean-deep">Status</h2>
          <div className="mt-3">
            <JourneyStatusForm
              journeyId={j.id}
              status={j.status}
              internalNotes={j.internal_notes ?? ""}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
