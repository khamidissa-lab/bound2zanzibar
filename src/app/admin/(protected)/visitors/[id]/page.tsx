import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarCheck,
  Eye,
  Inbox,
  Mail,
  MessageCircle,
  MousePointerClick,
  Phone,
  Send,
} from "lucide-react";

import { AccessDenied } from "@/components/admin/admin-states";
import {
  DeleteNoteButton,
  EraseVisitorButton,
  LeadStatusForm,
  NoteForm,
  TaskActions,
  TaskForm,
} from "@/components/admin/visitors/lead-controls";
import { dateTime, LeadBadge, LiveBadge, Panel } from "@/components/admin/visitors/ui";
import { buttonVariants } from "@/components/ui/button";
import { whatsappLink } from "@/config/site";
import { can } from "@/lib/auth/permissions";
import { requireStaffPage } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import {
  countryFlag,
  countryName,
  EVENT_LABELS,
  formatDuration,
  liveStatus,
  NOTE_KIND_LABELS,
  visitorLabel,
  type NoteKind,
} from "@/lib/visitors/admin";
import { isVisitorId } from "@/lib/visitors/tracking";
import { getVisitor, listAssignees, type VisitorEvent } from "@/services/visitors";

export const metadata: Metadata = { title: "Visitor" };

const EVENT_ICONS: Record<string, typeof Eye> = {
  page_view: Eye,
  booking_click: MousePointerClick,
  whatsapp_click: MessageCircle,
  contact_click: Mail,
  booking_started: CalendarCheck,
  booking_submitted: Send,
  enquiry_submitted: Inbox,
  journey_submitted: Send,
  newsletter_subscribed: Mail,
};
const SUBMITTED = new Set([
  "booking_submitted",
  "enquiry_submitted",
  "journey_submitted",
  "newsletter_subscribed",
]);

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm text-ocean-deep">{children}</dd>
    </div>
  );
}

export default async function VisitorPage({ params }: PageProps<"/admin/visitors/[id]">) {
  const { id } = await params;
  const { allowed, staff } = await requireStaffPage(
    "visitors.view",
    `/admin/visitors/${id}`,
  );
  if (!allowed) return <AccessDenied />;
  if (!isVisitorId(id)) notFound();

  const [detail, assignees] = await Promise.all([getVisitor(id), listAssignees()]);
  if (!detail) notFound();
  const { visitor: v, sessions, events, identities, notes, tasks, itemNames } = detail;

  const latest = sessions[0];
  const status = latest ? liveStatus(latest) : "left";
  const totalSeconds = sessions.reduce(
    (s, x) =>
      s + (new Date(x.last_seen_at).getTime() - new Date(x.started_at).getTime()) / 1000,
    0,
  );
  const itemName = (e: Pick<VisitorEvent, "item_type" | "item_slug">) =>
    e.item_type && e.item_slug
      ? (itemNames[`${e.item_type}:${e.item_slug}`] ?? e.item_slug)
      : null;

  // Interests: tours and packages viewed, most viewed first.
  const interest = new Map<
    string,
    { name: string; type: string; views: number; last: string }
  >();
  for (const e of events) {
    if (
      e.type !== "page_view" ||
      !(e.item_type === "tour" || e.item_type === "package") ||
      !e.item_slug
    )
      continue;
    const key = `${e.item_type}:${e.item_slug}`;
    const row = interest.get(key) ?? {
      name: itemName(e) ?? e.item_slug,
      type: e.item_type,
      views: 0,
      last: e.occurred_at,
    };
    row.views += 1;
    interest.set(key, row);
  }
  const interests = [...interest.entries()].sort((a, b) => b[1].views - a[1].views);
  const emails = identities.filter((i) => i.kind === "email");
  const phones = identities.filter((i) => i.kind === "phone");
  const assigneeName = (uid: string | null) =>
    assignees.find((a) => a.id === uid)?.full_name;

  // Timeline grouped by visit (newest first).
  const bySession = new Map<string, VisitorEvent[]>();
  for (const e of events) {
    const key = e.session_id ?? "none";
    bySession.set(key, [...(bySession.get(key) ?? []), e]);
  }

  return (
    <div className="max-w-6xl space-y-6">
      <Link
        href="/admin/visitors"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-ocean-deep"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All visitors
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl text-ocean-deep">{visitorLabel(v)}</h1>
            <LiveBadge status={status} />
            <LeadBadge status={v.lead_status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-mono">V-{v.short_id}</span> ·{" "}
            {v.email ? "Identified visitor" : "Anonymous visitor"} · lead score{" "}
            {v.lead_score}
          </p>
        </div>
        {v.email || v.phone ? (
          <div className="flex flex-wrap gap-2">
            {v.email ? (
              <a href={`mailto:${v.email}`} className={buttonVariants({ size: "sm" })}>
                <Mail aria-hidden="true" data-icon="inline-start" />
                Email
              </a>
            ) : null}
            {v.phone ? (
              <>
                <a
                  href={`tel:${v.phone.replace(/[^\d+]/g, "")}`}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  <Phone aria-hidden="true" data-icon="inline-start" />
                  Call
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
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <Panel title="Visitor details">
            <dl className="grid gap-4 sm:grid-cols-3">
              <Fact label="Name">{v.name ?? "—"}</Fact>
              <Fact label="Email">
                {emails.length
                  ? emails.map((e) => (
                      <span key={e.id} className="block break-all">
                        {e.value}
                      </span>
                    ))
                  : "—"}
              </Fact>
              <Fact label="Phone">
                {phones.length
                  ? phones.map((p) => (
                      <span key={p.id} className="block">
                        {p.value}
                      </span>
                    ))
                  : "—"}
              </Fact>
              <Fact label="Country">
                <span aria-hidden="true">{countryFlag(v.country)} </span>
                {countryName(v.country)}
                {v.city ? (
                  <span className="block text-xs text-muted-foreground">
                    {[v.city, v.region].filter(Boolean).join(", ")}
                  </span>
                ) : null}
              </Fact>
              <Fact label="Device">
                <span className="capitalize">{v.device}</span>
                <span className="block text-xs text-muted-foreground">
                  {[v.browser, v.os].filter(Boolean).join(" · ")}
                </span>
              </Fact>
              <Fact label="Visits">
                {v.visit_count} · {v.page_views} pages · {formatDuration(totalSeconds)} in
                total
              </Fact>
              <Fact label="First visit">{dateTime(v.first_seen_at)}</Fact>
              <Fact label="Last visit">{dateTime(v.last_seen_at)}</Fact>
              <Fact label="Newsletter">
                {detail.subscribed ? "Subscribed" : "Not subscribed"}
              </Fact>
            </dl>
            {emails.length ? (
              <p className="mt-4 text-xs text-muted-foreground">
                Contact details were typed in by the visitor (
                {[...new Set(identities.map((i) => i.source))].join(", ")} form).
              </p>
            ) : null}
            {detail.otherDevices.length ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Same email seen on other devices:{" "}
                {detail.otherDevices.map((o, i) => (
                  <span key={o.id}>
                    {i > 0 ? ", " : ""}
                    <Link
                      href={`/admin/visitors/${o.id}`}
                      className="font-mono text-turquoise-deep hover:underline"
                    >
                      V-{o.short_id}
                    </Link>{" "}
                    ({o.device})
                  </span>
                ))}
              </p>
            ) : null}
          </Panel>

          <Panel
            title="Tours and packages viewed"
            description="What this visitor is interested in"
          >
            {interests.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No tour or package pages viewed yet.
              </p>
            ) : (
              <ul className="divide-y text-sm">
                {interests.map(([key, r]) => (
                  <li key={key} className="flex items-center justify-between gap-3 py-2">
                    <span className="min-w-0 truncate text-ocean-deep">
                      {r.name}
                      <span className="ms-2 text-xs text-muted-foreground">{r.type}</span>
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {r.views} {r.views === 1 ? "view" : "views"} · last{" "}
                      {dateTime(r.last)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel
            title="Bookings and enquiries"
            description="Matched by the email address the visitor gave"
          >
            {detail.bookings.length + detail.enquiries.length + detail.journeys.length ===
            0 ? (
              <p className="text-sm text-muted-foreground">
                {emails.length
                  ? "Nothing sent with this email yet."
                  : "Appears once the visitor sends a booking request or enquiry."}
              </p>
            ) : (
              <ul className="divide-y text-sm">
                {detail.bookings.map((b) => (
                  <li
                    key={b.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-2"
                  >
                    <Link
                      href={`/admin/bookings/${b.reference}`}
                      className="font-mono text-turquoise-deep hover:underline"
                    >
                      {b.reference}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      Booking request · {b.status} · {dateTime(b.created_at)}
                    </span>
                  </li>
                ))}
                {detail.journeys.map((j) => (
                  <li
                    key={j.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-2"
                  >
                    <Link
                      href={`/admin/journeys/${j.reference}`}
                      className="font-mono text-turquoise-deep hover:underline"
                    >
                      {j.reference}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      Custom trip request · {j.status} · {dateTime(j.created_at)}
                    </span>
                  </li>
                ))}
                {detail.enquiries.map((q) => (
                  <li
                    key={q.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-2"
                  >
                    <Link
                      href="/admin/enquiries"
                      className="text-turquoise-deep hover:underline"
                    >
                      {q.subject || "Enquiry"}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      Enquiry · {q.status} · {dateTime(q.created_at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Activity timeline" description="Newest first, grouped by visit">
            {sessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity recorded.</p>
            ) : (
              <ol className="space-y-6">
                {sessions.map((s) => {
                  const list = bySession.get(s.id) ?? [];
                  const seconds =
                    (new Date(s.last_seen_at).getTime() -
                      new Date(s.started_at).getTime()) /
                    1000;
                  return (
                    <li key={s.id}>
                      <p className="text-xs font-medium text-ocean-deep">
                        Visit on {dateTime(s.started_at)} · {formatDuration(seconds)} ·{" "}
                        {s.page_views} pages
                        {s.referrer_host ? (
                          <span className="font-normal text-muted-foreground">
                            {" "}
                            · from {s.referrer_host}
                          </span>
                        ) : null}
                        {s.utm_source ? (
                          <span className="font-normal text-muted-foreground">
                            {" "}
                            · campaign {s.utm_source}
                          </span>
                        ) : null}
                      </p>
                      <ol className="mt-2 space-y-1.5 border-s ps-4">
                        {list.map((e) => {
                          const Icon = EVENT_ICONS[e.type] ?? Eye;
                          const name = itemName(e);
                          return (
                            <li key={e.id} className="flex items-start gap-2 text-sm">
                              <Icon
                                className={cn(
                                  "mt-0.5 size-3.5 shrink-0",
                                  SUBMITTED.has(e.type)
                                    ? "text-turquoise-deep"
                                    : "text-muted-foreground",
                                )}
                                aria-hidden="true"
                              />
                              <span className="min-w-0 flex-1">
                                <span
                                  className={cn(SUBMITTED.has(e.type) && "font-medium")}
                                >
                                  {EVENT_LABELS[e.type] ?? e.type}
                                </span>{" "}
                                {e.type === "page_view" ? (
                                  <span className="text-ocean-deep">
                                    {name ?? e.title?.split(" | ")[0] ?? e.path}
                                  </span>
                                ) : name ? (
                                  <span className="text-ocean-deep">— {name}</span>
                                ) : null}
                                {e.label && e.type !== "whatsapp_click" ? (
                                  <span className="ms-1 font-mono text-xs text-muted-foreground">
                                    {e.label}
                                  </span>
                                ) : null}
                                {e.type === "page_view" ? (
                                  <span className="block truncate font-mono text-xs text-muted-foreground">
                                    {e.path}
                                  </span>
                                ) : null}
                              </span>
                              <time
                                dateTime={e.occurred_at}
                                className="shrink-0 text-xs text-muted-foreground tabular-nums"
                              >
                                {new Intl.DateTimeFormat("en-GB", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  timeZone: "Africa/Dar_es_Salaam",
                                }).format(new Date(e.occurred_at))}
                              </time>
                            </li>
                          );
                        })}
                      </ol>
                    </li>
                  );
                })}
              </ol>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Lead">
            <LeadStatusForm
              visitorId={v.id}
              status={v.lead_status}
              manual={v.lead_status_manual}
              assignedTo={v.assigned_to}
              assignees={assignees}
            />
          </Panel>

          <Panel title="Follow-ups">
            {tasks.length ? (
              <ul className="mb-4 divide-y text-sm">
                {tasks.map((t) => (
                  <li key={t.id} className="flex items-start justify-between gap-2 py-2">
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "text-ocean-deep",
                          t.done_at && "text-muted-foreground line-through",
                        )}
                      >
                        {t.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t.due_date ? `Due ${t.due_date}` : "No due date"}
                        {assigneeName(t.assigned_to)
                          ? ` · ${assigneeName(t.assigned_to)}`
                          : ""}
                      </p>
                    </div>
                    <TaskActions id={t.id} done={Boolean(t.done_at)} />
                  </li>
                ))}
              </ul>
            ) : null}
            <TaskForm visitorId={v.id} assignees={assignees} />
          </Panel>

          <Panel title="Notes and contact history" description="Only visible to staff">
            <NoteForm visitorId={v.id} />
            {notes.length ? (
              <ul className="mt-4 space-y-3">
                {notes.map((n) => (
                  <li key={n.id} className="rounded-lg bg-muted/50 p-3 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-ocean-deep">
                          {NOTE_KIND_LABELS[n.kind as NoteKind] ?? n.kind}
                        </span>
                        {" · "}
                        {n.author_name ?? "Staff"} · {dateTime(n.created_at)}
                      </p>
                      {n.author_id === staff.id || can(staff.role, "visitors.delete") ? (
                        <DeleteNoteButton id={n.id} />
                      ) : null}
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-ocean-deep">{n.body}</p>
                  </li>
                ))}
              </ul>
            ) : null}
          </Panel>

          {can(staff.role, "visitors.delete") ? (
            <Panel
              title="Privacy"
              description="For a visitor who asks to be forgotten. Bookings and enquiries are kept."
            >
              <EraseVisitorButton id={v.id} />
            </Panel>
          ) : null}
        </div>
      </div>
    </div>
  );
}
