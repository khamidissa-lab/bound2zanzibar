import "server-only";

import type { Tables } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isLeadStatus, SESSION_WINDOW_MS, type LeadStatus } from "@/lib/visitors/admin";

/**
 * Admin reads of visitor data. Everything runs as the signed-in staff member,
 * so the database RLS (super admin, admin, booking staff) decides access.
 */

function failed(what: string, error: { message: string }): never {
  console.error(`[visitors] failed to ${what}: ${error.message}`);
  throw new Error(`Failed to ${what}`);
}

export type Visitor = Tables<"visitors">;
export type VisitorSession = Tables<"visitor_sessions">;
export type VisitorEvent = Tables<"visitor_events">;

// ---------------------------------------------------------------------------
// Live
// ---------------------------------------------------------------------------

export type LiveRow = VisitorSession & {
  visitor: Pick<
    Visitor,
    | "id"
    | "short_id"
    | "name"
    | "email"
    | "country"
    | "city"
    | "region"
    | "device"
    | "browser"
    | "os"
    | "visit_count"
    | "lead_status"
  >;
};

/** Sessions active in the last 30 minutes, most recent first. */
export async function listLiveSessions(): Promise<LiveRow[]> {
  const supabase = await createSupabaseServerClient();
  const since = new Date(Date.now() - SESSION_WINDOW_MS).toISOString();
  const { data, error } = await supabase
    .from("visitor_sessions")
    .select(
      "*, visitor:visitors!inner(id, short_id, name, email, country, city, region, device, browser, os, visit_count, lead_status)",
    )
    .gte("last_seen_at", since)
    .order("last_seen_at", { ascending: false })
    .limit(200);
  if (error) failed("load live visitors", error);
  return data as unknown as LiveRow[];
}

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

type Count = { key: string; count: number };
type ItemRow = {
  slug: string;
  name: string;
  views: number;
  visitors: number;
  type?: string;
};

export type VisitorAnalytics = {
  visits: number;
  unique_visitors: number;
  new_visitors: number;
  returning_visitors: number;
  identified_visitors: number;
  page_views: number;
  anonymous_page_views: number;
  avg_visit_seconds: number;
  enquiries: number;
  booking_attempts: number;
  booking_requests: number;
  completed_bookings: number;
  potential_customers: number;
  active_now: number;
  series: { bucket: string; visitors: number; visits: number }[];
  countries: Count[];
  devices: Count[];
  browsers: Count[];
  top_tours: ItemRow[];
  top_safaris: ItemRow[];
  landing_pages: Count[];
  referrers: Count[];
  funnel: {
    visitors: number;
    viewed_item: number;
    clicked: number;
    started: number;
    submitted: number;
    completed: number;
  };
  leads: Partial<Record<LeadStatus, number>>;
};

export async function getVisitorAnalytics(
  from: string,
  to: string,
  bucket: "day" | "week" | "month",
): Promise<VisitorAnalytics> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("visitor_analytics", {
    p_from: from,
    p_to: to,
    p_bucket: bucket,
  });
  if (error) failed("load visitor analytics", error);
  return data as unknown as VisitorAnalytics;
}

// ---------------------------------------------------------------------------
// Visitor list
// ---------------------------------------------------------------------------

export const VISITOR_TYPES = [
  "all",
  "identified",
  "anonymous",
  "returning",
  "leads",
] as const;
export type VisitorType = (typeof VISITOR_TYPES)[number];
export const VISITOR_SORTS = [
  "last_seen",
  "first_seen",
  "visits",
  "pages",
  "score",
] as const;
export type VisitorSort = (typeof VISITOR_SORTS)[number];

export type VisitorFilters = {
  q: string;
  type: VisitorType;
  country: string;
  device: string;
  lead: LeadStatus | "";
  sort: VisitorSort;
  dir: "asc" | "desc";
  page: number;
};

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export function parseVisitorFilters(
  params: Record<string, string | string[] | undefined>,
): VisitorFilters {
  const type = first(params.type);
  const sort = first(params.sort);
  const country = first(params.country).toUpperCase();
  const device = first(params.device);
  const lead = first(params.lead);
  return {
    q: first(params.q).trim().slice(0, 100),
    type: (VISITOR_TYPES as readonly string[]).includes(type)
      ? (type as VisitorType)
      : "all",
    country: /^[A-Z]{2}$/.test(country) ? country : "",
    device: ["mobile", "tablet", "desktop"].includes(device) ? device : "",
    lead: isLeadStatus(lead) ? lead : "",
    sort: (VISITOR_SORTS as readonly string[]).includes(sort)
      ? (sort as VisitorSort)
      : "last_seen",
    dir: first(params.dir) === "asc" ? "asc" : "desc",
    page: Math.max(1, Math.min(1000, Number.parseInt(first(params.page), 10) || 1)),
  };
}

const SORT_COLUMNS: Record<VisitorSort, string> = {
  last_seen: "last_seen_at",
  first_seen: "first_seen_at",
  visits: "visit_count",
  pages: "page_views",
  score: "lead_score",
};

/** Characters with meaning in PostgREST filters are dropped from searches. */
const searchTerm = (q: string) => q.replace(/[,()*%\\:"']/g, " ").trim();

function visitorQuery(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  filters: VisitorFilters,
  columns: string,
  count: boolean,
) {
  let query = supabase
    .from("visitors")
    .select(columns, count ? { count: "exact" } : undefined);
  const term = searchTerm(filters.q);
  if (term) {
    const like = `%${term}%`;
    query = query.or(
      `name.ilike.${like},email.ilike.${like},phone.ilike.${like},short_id.ilike.${like},city.ilike.${like}`,
    );
  }
  if (filters.type === "identified") query = query.not("email", "is", null);
  if (filters.type === "anonymous") query = query.is("email", null);
  if (filters.type === "returning") query = query.gt("visit_count", 1);
  if (filters.type === "leads") query = query.not("lead_status", "is", null);
  if (filters.lead) query = query.eq("lead_status", filters.lead);
  if (filters.country) query = query.eq("country", filters.country);
  if (filters.device) query = query.eq("device", filters.device);
  return query
    .order(SORT_COLUMNS[filters.sort], {
      ascending: filters.dir === "asc",
      nullsFirst: false,
    })
    .order("last_seen_at", { ascending: false });
}

export async function listVisitors(
  filters: VisitorFilters,
  pageSize: number,
): Promise<{ rows: Visitor[]; total: number }> {
  const from = (filters.page - 1) * pageSize;
  const { data, error, count } = await visitorQuery(
    await createSupabaseServerClient(),
    filters,
    "*",
    true,
  ).range(from, from + pageSize - 1);
  if (error) failed("load visitors", error);
  return { rows: data as unknown as Visitor[], total: count ?? 0 };
}

export async function exportVisitors(filters: VisitorFilters): Promise<Visitor[]> {
  const { data, error } = await visitorQuery(
    await createSupabaseServerClient(),
    filters,
    "*",
    false,
  ).limit(10_000);
  if (error) failed("export visitors", error);
  return data as unknown as Visitor[];
}

/** Countries that appear among visitors, for the filter menu. */
export async function listVisitorCountries(): Promise<string[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("visitors")
    .select("country")
    .not("country", "is", null)
    .order("last_seen_at", { ascending: false })
    .limit(2000);
  if (error) failed("load visitor countries", error);
  return [...new Set(data.map((r) => r.country as string))].sort();
}

// ---------------------------------------------------------------------------
// Leads
// ---------------------------------------------------------------------------

export type LeadTask = Tables<"lead_tasks">;
export type LeadRow = Visitor & { open_tasks: number; next_due: string | null };

export async function listLeads(status: LeadStatus | "", q: string): Promise<LeadRow[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("visitors")
    .select("*, lead_tasks(due_date, done_at)")
    .not("lead_status", "is", null)
    .order("lead_score", { ascending: false })
    .order("last_seen_at", { ascending: false })
    .limit(300);
  if (status) query = query.eq("lead_status", status);
  const term = searchTerm(q);
  if (term) {
    const like = `%${term}%`;
    query = query.or(
      `name.ilike.${like},email.ilike.${like},phone.ilike.${like},short_id.ilike.${like}`,
    );
  }
  const { data, error } = await query;
  if (error) failed("load leads", error);
  return (
    data as unknown as (Visitor & {
      lead_tasks: Pick<LeadTask, "due_date" | "done_at">[];
    })[]
  ).map(({ lead_tasks, ...v }) => {
    const open = lead_tasks.filter((t) => !t.done_at);
    const due = open
      .map((t) => t.due_date)
      .filter((d): d is string => !!d)
      .sort();
    return { ...v, open_tasks: open.length, next_due: due[0] ?? null };
  });
}

export async function countLeadsByStatus(): Promise<Record<LeadStatus, number>> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("visitors")
    .select("lead_status")
    .not("lead_status", "is", null)
    .limit(10_000);
  if (error) failed("count leads", error);
  const counts = {
    new_lead: 0,
    interested: 0,
    high_potential: 0,
    booking_started: 0,
    booking_completed: 0,
    follow_up: 0,
  } satisfies Record<LeadStatus, number>;
  for (const r of data) if (r.lead_status) counts[r.lead_status] += 1;
  return counts;
}

export type OpenTask = LeadTask & {
  visitor: Pick<Visitor, "id" | "short_id" | "name" | "email">;
};

export async function listOpenTasks(limit = 20): Promise<OpenTask[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("lead_tasks")
    .select("*, visitor:visitors!inner(id, short_id, name, email)")
    .is("done_at", null)
    .order("due_date", { ascending: true, nullsFirst: false })
    .limit(limit);
  if (error) failed("load follow-up tasks", error);
  return data as unknown as OpenTask[];
}

export async function listAssignees(): Promise<{ id: string; full_name: string }[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("lead_assignees");
  if (error) failed("load staff", error);
  return data ?? [];
}

// ---------------------------------------------------------------------------
// One visitor
// ---------------------------------------------------------------------------

export type VisitorDetail = {
  visitor: Visitor;
  sessions: VisitorSession[];
  events: VisitorEvent[];
  identities: Tables<"visitor_identities">[];
  notes: Tables<"lead_notes">[];
  tasks: LeadTask[];
  /** Tour / package names for the slugs in the timeline. */
  itemNames: Record<string, string>;
  bookings: Pick<
    Tables<"bookings">,
    "id" | "reference" | "status" | "created_at" | "preferred_date" | "item_type"
  >[];
  enquiries: Pick<Tables<"inquiries">, "id" | "subject" | "status" | "created_at">[];
  journeys: Pick<
    Tables<"journey_requests">,
    "id" | "reference" | "status" | "created_at"
  >[];
  subscribed: boolean;
  /** Other visitor records (devices) that used the same email. */
  otherDevices: Pick<Visitor, "id" | "short_id" | "device" | "last_seen_at">[];
};

export async function getVisitor(id: string): Promise<VisitorDetail | null> {
  const supabase = await createSupabaseServerClient();
  const { data: visitor, error } = await supabase
    .from("visitors")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) failed("load visitor", error);
  if (!visitor) return null;

  const [sessions, events, identities, notes, tasks] = await Promise.all([
    supabase
      .from("visitor_sessions")
      .select("*")
      .eq("visitor_id", id)
      .order("started_at", { ascending: false })
      .limit(50),
    supabase
      .from("visitor_events")
      .select("*")
      .eq("visitor_id", id)
      .order("occurred_at", { ascending: false })
      .limit(500),
    supabase
      .from("visitor_identities")
      .select("*")
      .eq("visitor_id", id)
      .order("created_at"),
    supabase
      .from("lead_notes")
      .select("*")
      .eq("visitor_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("lead_tasks")
      .select("*")
      .eq("visitor_id", id)
      .order("done_at", { ascending: true, nullsFirst: true })
      .order("due_date", { ascending: true, nullsFirst: false }),
  ]);
  for (const [what, r] of [
    ["sessions", sessions],
    ["events", events],
    ["identities", identities],
    ["notes", notes],
    ["tasks", tasks],
  ] as const) {
    if (r.error) failed(`load visitor ${what}`, r.error);
  }

  const emails = [
    ...new Set(
      (identities.data ?? []).filter((i) => i.kind === "email").map((i) => i.value),
    ),
  ];
  const slugs = (type: string) => [
    ...new Set(
      (events.data ?? [])
        .filter((e) => e.item_type === type && e.item_slug)
        .map((e) => e.item_slug as string),
    ),
  ];
  const tourSlugs = slugs("tour");
  const packageSlugs = slugs("package");

  const none = { data: [], error: null };
  const [tours, packages, bookings, enquiries, journeys, subscribers, others] =
    await Promise.all([
      tourSlugs.length
        ? supabase.from("tours").select("slug, name").in("slug", tourSlugs)
        : none,
      packageSlugs.length
        ? supabase.from("packages").select("slug, name").in("slug", packageSlugs)
        : none,
      emails.length
        ? supabase
            .from("bookings")
            .select("id, reference, status, created_at, preferred_date, item_type, email")
            // Booking requests store the email in lower case, like identities.
            .in("email", emails)
            .order("created_at", { ascending: false })
        : none,
      emails.length
        ? supabase
            .from("inquiries")
            .select("id, subject, status, created_at")
            .in("email", emails)
            .order("created_at", { ascending: false })
        : none,
      emails.length
        ? supabase
            .from("journey_requests")
            .select("id, reference, status, created_at")
            .in("email", emails)
            .order("created_at", { ascending: false })
        : none,
      emails.length
        ? supabase
            .from("newsletter_subscribers")
            .select("email, unsubscribed_at")
            .in("email", emails)
        : none,
      emails.length
        ? supabase
            .from("visitors")
            .select("id, short_id, device, last_seen_at")
            .in("email", emails)
            .neq("id", id)
            .limit(10)
        : none,
    ]);

  const itemNames: Record<string, string> = {};
  for (const t of (tours.data ?? []) as { slug: string; name: string }[])
    itemNames[`tour:${t.slug}`] = t.name;
  for (const p of (packages.data ?? []) as { slug: string; name: string }[])
    itemNames[`package:${p.slug}`] = p.name;

  return {
    visitor,
    sessions: sessions.data ?? [],
    events: events.data ?? [],
    identities: identities.data ?? [],
    notes: notes.data ?? [],
    tasks: tasks.data ?? [],
    itemNames,
    bookings: (bookings.data ?? []) as VisitorDetail["bookings"],
    enquiries: (enquiries.data ?? []) as VisitorDetail["enquiries"],
    journeys: (journeys.data ?? []) as VisitorDetail["journeys"],
    subscribed: ((subscribers.data ?? []) as { unsubscribed_at: string | null }[]).some(
      (s) => !s.unsubscribed_at,
    ),
    otherDevices: (others.data ?? []) as VisitorDetail["otherDevices"],
  };
}

// ---------------------------------------------------------------------------
// Newsletter
// ---------------------------------------------------------------------------

export type Subscriber = Tables<"newsletter_subscribers">;

export async function listSubscribers(limit = 5000): Promise<Subscriber[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("*")
    .order("subscribed_at", { ascending: false })
    .limit(limit);
  if (error) failed("load newsletter subscribers", error);
  return data;
}
