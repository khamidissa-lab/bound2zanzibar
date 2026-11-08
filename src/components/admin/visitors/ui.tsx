import type { ReactNode } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  LEAD_LABELS,
  LEAD_TONES,
  LIVE_LABELS,
  RANGE_KEYS,
  RANGE_LABELS,
  type DateRange,
  type LeadStatus,
  type LiveStatus,
} from "@/lib/visitors/admin";
import { cn } from "@/lib/utils";

/** Building blocks shared by the admin visitor pages. */

export function VisitorsHeader({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl text-ocean-deep">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

export function Panel({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      aria-label={title}
      className={cn("rounded-xl border bg-card p-5", className)}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-sans text-base font-semibold text-ocean-deep">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  href,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  href?: string;
}) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {Icon ? (
          <span className="flex size-7 items-center justify-center rounded-lg bg-turquoise-soft text-turquoise-deep">
            <Icon className="size-3.5" aria-hidden="true" />
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-2xl font-semibold text-ocean-deep tabular-nums sm:text-3xl">
        {typeof value === "number" ? value.toLocaleString("en-US") : value}
      </p>
      {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
    </>
  );
  return (
    <li className="rounded-xl border bg-card p-4">
      {href ? (
        <Link href={href} className="block rounded-md hover:opacity-80">
          {body}
        </Link>
      ) : (
        body
      )}
    </li>
  );
}

/**
 * Ranked horizontal bars. One hue (magnitude), values in text colour, the
 * label always visible, so it reads without colour.
 */
export function BarList({
  rows,
  empty,
  valueLabel = "visitors",
}: {
  rows: { key: string; label: ReactNode; count: number; href?: string; sub?: string }[];
  empty: string;
  valueLabel?: string;
}) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
        {empty}
      </p>
    );
  }
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <ol className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.key}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate text-ocean-deep">
              {r.href ? (
                <Link href={r.href} className="hover:text-turquoise-deep hover:underline">
                  {r.label}
                </Link>
              ) : (
                r.label
              )}
              {r.sub ? (
                <span className="ms-1.5 text-xs text-muted-foreground">{r.sub}</span>
              ) : null}
            </span>
            <span className="shrink-0 font-medium text-ocean-deep tabular-nums">
              {r.count.toLocaleString("en-US")}
              <span className="sr-only"> {valueLabel}</span>
            </span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-muted" aria-hidden="true">
            <div
              className="h-full rounded-full bg-turquoise-deep"
              style={{ width: `${Math.max(2, (r.count / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}

export function LeadBadge({ status }: { status: LeadStatus | null }) {
  if (!status) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        LEAD_TONES[status],
      )}
    >
      {LEAD_LABELS[status]}
    </span>
  );
}

const LIVE_TONES: Record<LiveStatus, string> = {
  online: "bg-emerald-500",
  idle: "bg-amber-400",
  left: "bg-slate-300",
};

export function LiveBadge({ status }: { status: LiveStatus }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap text-ocean-deep">
      <span
        aria-hidden="true"
        className={cn(
          "size-2 rounded-full",
          LIVE_TONES[status],
          status === "online" && "animate-pulse",
        )}
      />
      {LIVE_LABELS[status]}
    </span>
  );
}

export function EmptyState({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed bg-card px-6 py-14 text-center">
      <p className="font-medium text-ocean-deep">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{children}</p>
    </div>
  );
}

/** Today / Yesterday / 7 / 30 days links plus a custom date form (GET). */
export function RangeFilter({ basePath, range }: { basePath: string; range: DateRange }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <nav aria-label="Date range">
        <ul className="flex flex-wrap gap-1">
          {RANGE_KEYS.filter((k) => k !== "custom").map((k) => (
            <li key={k}>
              <Link
                href={`${basePath}?range=${k}`}
                aria-current={range.key === k ? "page" : undefined}
                className={cn(
                  buttonVariants({
                    variant: range.key === k ? "default" : "outline",
                    size: "sm",
                  }),
                )}
              >
                {RANGE_LABELS[k]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <form
        action={basePath}
        method="get"
        aria-label="Custom date range"
        className="flex flex-wrap items-center gap-1.5"
      >
        <input type="hidden" name="range" value="custom" />
        <label className="sr-only" htmlFor="range-from">
          From
        </label>
        <input
          id="range-from"
          type="date"
          name="from"
          defaultValue={range.startDate}
          className="h-8 rounded-lg border border-input bg-card px-2 text-sm"
        />
        <span aria-hidden="true" className="text-muted-foreground">
          –
        </span>
        <label className="sr-only" htmlFor="range-to">
          To
        </label>
        <input
          id="range-to"
          type="date"
          name="to"
          defaultValue={range.endDate}
          className="h-8 rounded-lg border border-input bg-card px-2 text-sm"
        />
        <button
          type="submit"
          className={buttonVariants({
            variant: range.key === "custom" ? "default" : "outline",
            size: "sm",
          })}
        >
          Apply
        </button>
      </form>
    </div>
  );
}

export const dateTime = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Dar_es_Salaam",
  }).format(new Date(iso));

export const timeOnly = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Dar_es_Salaam",
  }).format(new Date(iso));
