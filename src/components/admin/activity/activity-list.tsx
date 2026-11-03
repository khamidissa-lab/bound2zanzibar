import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  KeyRound,
  LogIn,
  LogOut,
  Pencil,
  Plus,
  Tag,
  Trash2,
  type LucideIcon,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  ACTIVITY_AREAS,
  activityChanges,
  activityHref,
  activityTitle,
  isActivityArea,
  type ActivityEntry,
} from "@/lib/activity/format";
import { ROLE_LABELS, type StaffRole } from "@/lib/auth/permissions";
import { cn } from "@/lib/utils";
import type { ActivityFilters } from "@/services/activity";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Reads list filters from search params, dropping anything invalid. */
export function parseActivityParams(
  params: Record<string, string | string[] | undefined>,
) {
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const area = first(params.area);
  const actor = first(params.actor);
  const page = Number.parseInt(first(params.page), 10);
  return {
    filters: {
      area: isActivityArea(area) ? area : undefined,
      actor: UUID_RE.test(actor) ? actor.toLowerCase() : undefined,
    } satisfies ActivityFilters,
    page: Number.isFinite(page) && page > 0 ? Math.min(page, 10_000) : 1,
  };
}

function query(f: ActivityFilters, page = 1) {
  const p = new URLSearchParams();
  if (f.area) p.set("area", f.area);
  if (f.actor) p.set("actor", f.actor);
  if (page > 1) p.set("page", String(page));
  const s = p.toString();
  return s ? `?${s}` : "";
}

/** Date and time in Zanzibar, e.g. "3 Nov 2026, 14:05". */
function formatWhen(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Dar_es_Salaam",
  }).format(new Date(iso));
}

function iconFor(entry: ActivityEntry): { icon: LucideIcon; tone: string } {
  if (entry.entity.endsWith("_prices"))
    return { icon: Tag, tone: "bg-gold/15 text-gold-deep" };
  switch (entry.action) {
    case "created":
      return { icon: Plus, tone: "bg-turquoise-soft text-turquoise-deep" };
    case "deleted":
      return { icon: Trash2, tone: "bg-destructive/10 text-destructive" };
    case "signed_in":
      return { icon: LogIn, tone: "bg-sand-soft text-ocean-deep" };
    case "signed_out":
      return { icon: LogOut, tone: "bg-sand-soft text-ocean-deep" };
    case "password_changed":
      return { icon: KeyRound, tone: "bg-sand-soft text-ocean-deep" };
    case "bookings_exported":
      return { icon: Download, tone: "bg-gold/15 text-gold-deep" };
    default:
      return { icon: Pencil, tone: "bg-sand-soft text-ocean-deep" };
  }
}

function actorLabel(entry: ActivityEntry) {
  if (!entry.actor_id && !entry.actor_name) return "Server";
  const name = entry.actor_name ?? "Removed account";
  const role = entry.actor_role ? ROLE_LABELS[entry.actor_role as StaffRole] : null;
  return role ? `${name} (${role})` : name;
}

export function ActivityList({
  basePath,
  filters,
  page,
  pageSize,
  rows,
  total,
  actors,
}: {
  basePath: string;
  filters: ActivityFilters;
  page: number;
  pageSize: number;
  rows: ActivityEntry[];
  total: number;
  actors: { id: string; name: string }[];
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const tabs = [
    { label: "All", area: undefined },
    ...Object.entries(ACTIVITY_AREAS).map(([area, { label }]) => ({
      label,
      area: area as keyof typeof ACTIVITY_AREAS,
    })),
  ];

  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-3xl text-ocean-deep">Activity log</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Every change staff make in the admin, plus sign-ins and booking exports. Entries
        are recorded by the database and can&apos;t be edited or deleted.
      </p>

      <nav aria-label="Filter by area" className="-mx-1 mt-6 overflow-x-auto px-1">
        <ul className="flex min-w-max gap-1 border-b">
          {tabs.map((tab) => {
            const active = filters.area === tab.area;
            return (
              <li key={tab.label}>
                <Link
                  href={`${basePath}${query({ ...filters, area: tab.area })}`}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative inline-flex items-center px-3 py-2.5 text-sm text-muted-foreground hover:text-ocean-deep",
                    active &&
                      "font-medium text-ocean-deep after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-turquoise-deep",
                  )}
                >
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {actors.length > 0 ? (
        <form
          action={basePath}
          method="get"
          className="mt-4 flex flex-wrap items-center gap-2"
        >
          {filters.area ? <input type="hidden" name="area" value={filters.area} /> : null}
          <label htmlFor="activity-actor" className="text-sm text-muted-foreground">
            Staff member
          </label>
          <select
            id="activity-actor"
            name="actor"
            defaultValue={filters.actor ?? ""}
            className="h-10 rounded-lg border bg-background px-3 text-sm"
          >
            <option value="">Everyone</option>
            {actors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className={buttonVariants({ variant: "outline", className: "h-10" })}
          >
            Show
          </button>
        </form>
      ) : null}

      {rows.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed bg-card px-6 py-12 text-center">
          <p className="font-medium text-ocean-deep">
            {filters.area || filters.actor ? "No activity matches." : "No activity yet."}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {filters.area || filters.actor
              ? "Try another area or staff member."
              : "Changes made in the admin will appear here."}
          </p>
        </div>
      ) : (
        <>
          <ol className="mt-6 divide-y overflow-hidden rounded-2xl border bg-card">
            {rows.map((entry) => {
              const { icon: Icon, tone } = iconFor(entry);
              const title = activityTitle(entry);
              const href = activityHref(entry);
              const changes = activityChanges(entry);
              return (
                <li key={entry.id} className="flex gap-3 px-4 py-3">
                  <span
                    className={cn(
                      "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
                      tone,
                    )}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-ocean-deep">
                      {href ? (
                        <Link href={href} className="font-medium hover:underline">
                          {title}
                        </Link>
                      ) : (
                        <span className="font-medium">{title}</span>
                      )}
                    </p>
                    {changes.length > 0 ? (
                      <ul className="mt-1 space-y-0.5 text-sm break-words text-muted-foreground">
                        {changes.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    ) : null}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {actorLabel(entry)} ·{" "}
                      <time dateTime={entry.occurred_at}>
                        {formatWhen(entry.occurred_at)}
                      </time>
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <p>
              {total} entr{total === 1 ? "y" : "ies"} · page {page} of {pages}
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
