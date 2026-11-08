import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, Mail, MessageCircle, Phone, Search } from "lucide-react";

import { AccessDenied } from "@/components/admin/admin-states";
import {
  EmptyState,
  LeadBadge,
  Panel,
  VisitorsHeader,
} from "@/components/admin/visitors/ui";
import { buttonVariants } from "@/components/ui/button";
import { whatsappLink } from "@/config/site";
import { requireStaffPage } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import {
  countryFlag,
  countryName,
  formatAgo,
  isLeadStatus,
  LEAD_DESCRIPTIONS,
  LEAD_LABELS,
  LEAD_STATUSES,
  renderClock,
  visitorLabel,
} from "@/lib/visitors/admin";
import { countLeadsByStatus, listLeads, listOpenTasks } from "@/services/visitors";

export const metadata: Metadata = { title: "Potential customers" };

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const dueLabel = (date: string, today: string) =>
  date < today ? `overdue (${date})` : date === today ? "due today" : `due ${date}`;

export default async function LeadsPage({
  searchParams,
}: PageProps<"/admin/visitors/leads">) {
  const { allowed } = await requireStaffPage("visitors.view", "/admin/visitors/leads");
  if (!allowed) return <AccessDenied />;

  const params = await searchParams;
  const status = isLeadStatus(first(params.status))
    ? (first(params.status) as never)
    : "";
  const q = first(params.q).trim().slice(0, 100);
  const [leads, counts, tasks] = await Promise.all([
    listLeads(status, q),
    countLeadsByStatus(),
    listOpenTasks(),
  ]);
  const { now, today } = renderClock();
  const total = Object.values(counts).reduce((s, n) => s + n, 0);

  return (
    <div className="max-w-6xl space-y-6">
      <VisitorsHeader
        title="Potential customers"
        description="Visitors whose behaviour shows interest in booking, classified automatically and kept up to date. Open a lead to add notes, follow-ups and the contact history. Nothing is ever sent to visitors automatically."
      />

      <nav aria-label="Lead stage" className="-mx-1 overflow-x-auto px-1">
        <ul className="flex min-w-max gap-1 border-b">
          {[
            { key: "", label: "All leads", count: total },
            ...LEAD_STATUSES.map((s) => ({
              key: s,
              label: LEAD_LABELS[s],
              count: counts[s],
            })),
          ].map((tab) => (
            <li key={tab.key || "all"}>
              <Link
                href={
                  tab.key
                    ? `/admin/visitors/leads?status=${tab.key}`
                    : "/admin/visitors/leads"
                }
                aria-current={status === tab.key ? "page" : undefined}
                title={
                  tab.key
                    ? LEAD_DESCRIPTIONS[tab.key as keyof typeof LEAD_DESCRIPTIONS]
                    : undefined
                }
                className={cn(
                  "relative inline-flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground hover:text-ocean-deep",
                  status === tab.key &&
                    "font-medium text-ocean-deep after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-turquoise-deep",
                )}
              >
                {tab.label}
                <span className="rounded-full bg-sand-soft px-2 py-0.5 text-xs text-ocean-deep tabular-nums">
                  {tab.count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {status ? (
        <p className="-mt-3 text-xs text-muted-foreground">
          {LEAD_DESCRIPTIONS[status as keyof typeof LEAD_DESCRIPTIONS]}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          <form
            action="/admin/visitors/leads"
            method="get"
            role="search"
            aria-label="Search leads"
            className="flex gap-2"
          >
            {status ? <input type="hidden" name="status" value={status} /> : null}
            <label className="relative flex-1">
              <span className="sr-only">Search by name, email, phone or visitor ID</span>
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Name, email, phone or ID"
                className="h-10 w-full rounded-lg border border-input bg-card pr-3 pl-9 text-sm outline-none focus-visible:border-turquoise-deep focus-visible:ring-2 focus-visible:ring-turquoise-deep/25"
              />
            </label>
            <button type="submit" className={buttonVariants({ className: "h-10" })}>
              Search
            </button>
          </form>

          {leads.length === 0 ? (
            <EmptyState
              title={q || status ? "No leads match." : "No potential customers yet."}
            >
              Visitors become leads automatically when they view a tour several times,
              look at several safaris, start a booking, or send an enquiry.
            </EmptyState>
          ) : (
            <ul className="space-y-3">
              {leads.map((v) => (
                <li key={v.id} className="rounded-xl border bg-card p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/admin/visitors/${v.id}`}
                          className="font-medium text-ocean-deep hover:text-turquoise-deep hover:underline"
                        >
                          {visitorLabel(v)}
                        </Link>
                        <LeadBadge status={v.lead_status} />
                        {v.lead_status_manual ? (
                          <span className="text-xs text-muted-foreground">
                            set by staff
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        <span className="font-mono">V-{v.short_id}</span>
                        {" · "}
                        <span aria-hidden="true">{countryFlag(v.country)} </span>
                        {countryName(v.country)} · {v.device} · {v.visit_count}{" "}
                        {v.visit_count === 1 ? "visit" : "visits"}, {v.page_views} pages ·
                        last seen {formatAgo(v.last_seen_at, now)}
                      </p>
                      {v.open_tasks > 0 ? (
                        <p
                          className={cn(
                            "mt-1 inline-flex items-center gap-1 text-xs",
                            v.next_due && v.next_due <= today
                              ? "font-medium text-rose-700"
                              : "text-muted-foreground",
                          )}
                        >
                          <CalendarClock className="size-3.5" aria-hidden="true" />
                          {v.open_tasks} open follow-up{v.open_tasks === 1 ? "" : "s"}
                          {v.next_due ? ` · ${dueLabel(v.next_due, today)}` : ""}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xl font-semibold text-ocean-deep tabular-nums">
                          {v.lead_score}
                        </p>
                        <p className="text-[0.68rem] text-muted-foreground uppercase">
                          score
                        </p>
                      </div>
                    </div>
                  </div>
                  {v.email || v.phone ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {v.email ? (
                        <a
                          href={`mailto:${v.email}`}
                          className={buttonVariants({ variant: "outline", size: "sm" })}
                        >
                          <Mail aria-hidden="true" data-icon="inline-start" />
                          {v.email}
                        </a>
                      ) : null}
                      {v.phone ? (
                        <>
                          <a
                            href={`tel:${v.phone.replace(/[^\d+]/g, "")}`}
                            className={buttonVariants({ variant: "outline", size: "sm" })}
                          >
                            <Phone aria-hidden="true" data-icon="inline-start" />
                            {v.phone}
                          </a>
                          <a
                            href={whatsappLink(undefined, v.phone.replace(/\D/g, ""))}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={buttonVariants({ variant: "outline", size: "sm" })}
                          >
                            <MessageCircle aria-hidden="true" data-icon="inline-start" />
                            WhatsApp
                          </a>
                        </>
                      ) : null}
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-muted-foreground">
                      No contact details yet — they haven’t sent us a form.
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <Panel title="Open follow-ups" description="Soonest due first">
          {tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No open follow-ups. Add one from a lead’s page.
            </p>
          ) : (
            <ul className="divide-y text-sm">
              {tasks.map((t) => (
                <li key={t.id} className="py-2.5">
                  <Link
                    href={`/admin/visitors/${t.visitor.id}`}
                    className="font-medium text-ocean-deep hover:text-turquoise-deep hover:underline"
                  >
                    {t.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {visitorLabel(t.visitor)}
                    {t.due_date ? (
                      <span
                        className={cn(t.due_date <= today && "font-medium text-rose-700")}
                      >
                        {" "}
                        · {dueLabel(t.due_date, today)}
                      </span>
                    ) : null}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
