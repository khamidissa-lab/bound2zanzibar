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
import { formatReceived } from "@/lib/booking/format";
import {
  ENQUIRY_STATUS_LABELS,
  ENQUIRY_STATUSES,
  type EnquiryStatus,
} from "@/lib/enquiry/request";
import { cn } from "@/lib/utils";
import type { Enquiry, EnquiryFilters } from "@/services/enquiries";

import { EnquiryStatusForm } from "./enquiry-status-form";

const BADGE: Record<EnquiryStatus, string> = {
  new: "bg-gold/15 text-ocean-deep ring-gold/50",
  in_progress: "bg-turquoise-soft text-ocean-deep ring-turquoise/50",
  closed: "bg-muted text-muted-foreground ring-border",
};

export function EnquiryStatusBadge({ status }: { status: EnquiryStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        BADGE[status],
      )}
    >
      {ENQUIRY_STATUS_LABELS[status]}
    </span>
  );
}

function query(f: EnquiryFilters, page = 1) {
  const p = new URLSearchParams();
  if (f.status) p.set("status", f.status);
  if (f.q) p.set("q", f.q);
  if (page > 1) p.set("page", String(page));
  const s = p.toString();
  return s ? `?${s}` : "";
}

/** Reads list filters from search params, dropping anything invalid. */
export function parseEnquiryParams(
  params: Record<string, string | string[] | undefined>,
) {
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const status = first(params.status);
  const page = Number.parseInt(first(params.page), 10);
  return {
    filters: {
      status: (ENQUIRY_STATUSES as readonly string[]).includes(status)
        ? (status as EnquiryStatus)
        : undefined,
      q: first(params.q).trim().slice(0, 100) || undefined,
    } satisfies EnquiryFilters,
    page: Number.isFinite(page) && page > 0 ? Math.min(page, 10_000) : 1,
  };
}

export function EnquiryList({
  basePath,
  filters,
  page,
  pageSize,
  rows,
  total,
  counts,
}: {
  basePath: string;
  filters: EnquiryFilters;
  page: number;
  pageSize: number;
  rows: Enquiry[];
  total: number;
  counts: Record<EnquiryStatus, number>;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const all = ENQUIRY_STATUSES.reduce((n, s) => n + counts[s], 0);
  const tabs = [
    { label: "All", status: undefined, count: all },
    ...ENQUIRY_STATUSES.map((s) => ({
      label: ENQUIRY_STATUS_LABELS[s],
      status: s,
      count: counts[s],
    })),
  ];

  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-3xl text-ocean-deep">Enquiries</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Messages from the website&apos;s contact form. Reply by email or WhatsApp, then
        update the status.
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
        <label htmlFor="enquiry-q" className="sr-only">
          Search enquiries
        </label>
        <Input
          id="enquiry-q"
          name="q"
          defaultValue={filters.q}
          placeholder="Search name, email or subject"
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
            {filters.q || filters.status ? "No enquiries match." : "No enquiries yet."}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {filters.q || filters.status
              ? "Try another status or search."
              : "Messages sent from the contact page will appear here."}
          </p>
        </div>
      ) : (
        <>
          <ul className="mt-6 divide-y overflow-hidden rounded-2xl border bg-card">
            {rows.map((row) => (
              <li key={row.id}>
                <Link
                  href={`${basePath}/${row.id}`}
                  className="flex flex-col gap-1 px-4 py-3 hover:bg-sand-soft/60 sm:flex-row sm:items-center sm:gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2">
                      <span
                        className={cn(
                          "truncate text-ocean-deep",
                          row.status === "new" && "font-semibold",
                        )}
                      >
                        {row.subject || "(no subject)"}
                      </span>
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {row.name} · {row.message}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                    {formatReceived(row.created_at)}
                    <EnquiryStatusBadge status={row.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <p>
              {total} enquir{total === 1 ? "y" : "ies"} · page {page} of {pages}
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

export function EnquiryDetail({
  backHref,
  enquiry,
  preview = false,
}: {
  backHref: string;
  enquiry: Enquiry;
  preview?: boolean;
}) {
  const replySubject = `Re: ${enquiry.subject || "Your enquiry to Bound to Zanzibar"}`;
  return (
    <div className="max-w-5xl">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm text-turquoise-deep hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All enquiries
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl text-ocean-deep sm:text-3xl">
          {enquiry.subject || "(no subject)"}
        </h1>
        <EnquiryStatusBadge status={enquiry.status} />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        From {enquiry.name} · received {formatReceived(enquiry.created_at)}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          <section className="rounded-2xl border bg-card p-5 sm:p-6">
            <h2 className="font-display text-lg text-ocean-deep">Message</h2>
            <p className="mt-3 text-sm whitespace-pre-wrap text-ocean-deep">
              {enquiry.message}
            </p>
          </section>
          <section className="rounded-2xl border bg-card p-5 sm:p-6">
            <h2 className="font-display text-lg text-ocean-deep">Reply</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={`mailto:${enquiry.email}?subject=${encodeURIComponent(replySubject)}`}
                className={buttonVariants()}
              >
                <Mail aria-hidden="true" data-icon="inline-start" />
                Email {enquiry.email}
              </a>
              {enquiry.phone ? (
                <>
                  <a
                    href={whatsappLink(
                      `Hello ${enquiry.name}, this is Bound to Zanzibar replying to your message.`,
                      enquiry.phone,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({ variant: "outline" })}
                  >
                    <MessageCircle aria-hidden="true" data-icon="inline-start" />
                    WhatsApp
                  </a>
                  <a
                    href={`tel:${enquiry.phone.replace(/[^\d+]/g, "")}`}
                    className={buttonVariants({ variant: "outline" })}
                  >
                    <Phone aria-hidden="true" data-icon="inline-start" />
                    {enquiry.phone}
                  </a>
                </>
              ) : null}
            </div>
          </section>
        </div>
        <section className="self-start rounded-2xl border bg-card p-5 sm:p-6">
          <h2 className="font-display text-lg text-ocean-deep">Status</h2>
          <div className="mt-3">
            <EnquiryStatusForm
              enquiryId={enquiry.id}
              status={enquiry.status}
              internalNotes={enquiry.internal_notes ?? ""}
              disabled={preview}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
