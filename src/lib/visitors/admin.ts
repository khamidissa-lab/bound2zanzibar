import type { Enums } from "@/lib/supabase/database.types";

/** Labels, live status and date ranges for the admin visitor pages. */

export type LeadStatus = Enums<"lead_status">;

export const LEAD_STATUSES = [
  "new_lead",
  "interested",
  "high_potential",
  "booking_started",
  "booking_completed",
  "follow_up",
] as const satisfies readonly LeadStatus[];

export const LEAD_LABELS: Record<LeadStatus, string> = {
  new_lead: "New lead",
  interested: "Interested",
  high_potential: "High potential",
  booking_started: "Booking started",
  booking_completed: "Booking completed",
  follow_up: "Follow-up required",
};

export const LEAD_DESCRIPTIONS: Record<LeadStatus, string> = {
  new_lead: "Shared an email (e.g. newsletter) without other signals yet.",
  interested: "Viewed a tour twice, several tours, or clicked Book, WhatsApp or Contact.",
  high_potential:
    "Viewed one tour 3+ times, 3+ safaris, or kept coming back to look at tours.",
  booking_started: "Started a booking form but hasn't sent it.",
  booking_completed: "Has a confirmed, paid or completed booking.",
  follow_up: "Sent a booking request, enquiry or custom trip request — reply to them.",
};

export const LEAD_TONES: Record<LeadStatus, string> = {
  new_lead: "bg-sand-soft text-ocean-deep",
  interested: "bg-turquoise-soft text-turquoise-deep",
  high_potential: "bg-gold/25 text-ocean-deep",
  booking_started: "bg-amber-100 text-amber-900",
  booking_completed: "bg-emerald-100 text-emerald-900",
  follow_up: "bg-rose-100 text-rose-900",
};

export const isLeadStatus = (v: string | undefined | null): v is LeadStatus =>
  (LEAD_STATUSES as readonly string[]).includes(v ?? "");

export const NOTE_KINDS = ["note", "call", "email", "whatsapp", "meeting"] as const;
export type NoteKind = (typeof NOTE_KINDS)[number];
export const NOTE_KIND_LABELS: Record<NoteKind, string> = {
  note: "Note",
  call: "Phone call",
  email: "Email",
  whatsapp: "WhatsApp",
  meeting: "Meeting",
};

export const EVENT_LABELS: Record<string, string> = {
  page_view: "Viewed",
  booking_click: "Clicked Book",
  whatsapp_click: "Clicked WhatsApp",
  contact_click: "Clicked Contact",
  booking_started: "Started a booking form",
  booking_submitted: "Sent a booking request",
  enquiry_submitted: "Sent an enquiry",
  journey_submitted: "Sent a custom trip request",
  newsletter_subscribed: "Subscribed to the newsletter",
};

// ---------------------------------------------------------------------------
// Live status
// ---------------------------------------------------------------------------

export type LiveStatus = "online" | "idle" | "left";

/** Heartbeats arrive every 30 s while the page is visible. */
export const ONLINE_WINDOW_MS = 90_000;
export const SESSION_WINDOW_MS = 30 * 60_000;

export function liveStatus(
  session: { last_seen_at: string; ended_at: string | null; visible: boolean },
  now = Date.now(),
): LiveStatus {
  const age = now - new Date(session.last_seen_at).getTime();
  if (session.ended_at || age > SESSION_WINDOW_MS) return "left";
  if (session.visible && age <= ONLINE_WINDOW_MS) return "online";
  return "idle";
}

export const LIVE_LABELS: Record<LiveStatus, string> = {
  online: "Online",
  idle: "Idle",
  left: "Left",
};

/** "4 min 05 s", "1 h 12 min". */
export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ${String(s % 60).padStart(2, "0")} s`;
  return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")} min`;
}

export function formatAgo(iso: string, now = Date.now()): string {
  const s = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (s < 10) return "just now";
  if (s < 60) return `${s} s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h} h ago`;
  return `${Math.floor(h / 24)} days ago`;
}

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
export function countryName(code: string | null | undefined): string {
  if (!code || code === "ZZ") return "Unknown";
  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}

/** Flag emoji from a two-letter country code. */
export function countryFlag(code: string | null | undefined): string {
  if (!code || !/^[A-Z]{2}$/.test(code) || code === "ZZ") return "";
  return String.fromCodePoint(...[...code].map((c) => 0x1f1a5 + c.charCodeAt(0)));
}

/** The current time for a server render (one read per request). */
export function renderClock(): { now: number; today: string } {
  const now = Date.now();
  return { now, today: eatDate(now) };
}

export const visitorLabel = (v: { name: string | null; email: string | null }) =>
  v.name || v.email || "Anonymous visitor";

// ---------------------------------------------------------------------------
// Date ranges (Zanzibar time, UTC+3 all year)
// ---------------------------------------------------------------------------

export const RANGE_KEYS = ["today", "yesterday", "7d", "30d", "custom"] as const;
export type RangeKey = (typeof RANGE_KEYS)[number];
export const RANGE_LABELS: Record<RangeKey, string> = {
  today: "Today",
  yesterday: "Yesterday",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  custom: "Custom range",
};
export type Bucket = "day" | "week" | "month";

const OFFSET_MS = 3 * 60 * 60_000;
const DAY_MS = 24 * 60 * 60_000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Zanzibar calendar date (YYYY-MM-DD) of an instant. */
export const eatDate = (instant: number) =>
  new Date(instant + OFFSET_MS).toISOString().slice(0, 10);
/** Midnight in Zanzibar of a calendar date, as an instant. */
const eatMidnight = (date: string) => Date.parse(`${date}T00:00:00Z`) - OFFSET_MS;

export type DateRange = {
  key: RangeKey;
  from: string;
  to: string;
  /** Inclusive calendar dates for display and the custom form. */
  startDate: string;
  endDate: string;
  bucket: Bucket;
  label: string;
};

export function parseRange(
  params: { range?: string; from?: string; to?: string; bucket?: string },
  now = Date.now(),
): DateRange {
  const today = eatDate(now);
  const key: RangeKey = (RANGE_KEYS as readonly string[]).includes(params.range ?? "")
    ? (params.range as RangeKey)
    : "7d";
  let start = today;
  let end = today;
  if (key === "yesterday") start = end = eatDate(now - DAY_MS);
  if (key === "7d") start = eatDate(now - 6 * DAY_MS);
  if (key === "30d") start = eatDate(now - 29 * DAY_MS);
  if (key === "custom") {
    const f = DATE_RE.test(params.from ?? "") ? params.from! : eatDate(now - 6 * DAY_MS);
    const t = DATE_RE.test(params.to ?? "") ? params.to! : today;
    [start, end] = f <= t ? [f, t] : [t, f];
    // At most about two years.
    if (eatMidnight(end) - eatMidnight(start) > 731 * DAY_MS)
      start = eatDate(eatMidnight(end) - 731 * DAY_MS + OFFSET_MS);
  }
  const days = Math.round((eatMidnight(end) - eatMidnight(start)) / DAY_MS) + 1;
  const requested = params.bucket as Bucket | undefined;
  const bucket: Bucket =
    requested === "day" || requested === "week" || requested === "month"
      ? requested
      : days > 120
        ? "month"
        : days > 45
          ? "week"
          : "day";
  const fmt = (d: string) =>
    new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    }).format(new Date(`${d}T00:00:00Z`));
  return {
    key,
    from: new Date(eatMidnight(start)).toISOString(),
    to: new Date(eatMidnight(end) + DAY_MS).toISOString(),
    startDate: start,
    endDate: end,
    bucket,
    label:
      key === "custom"
        ? start === end
          ? fmt(start)
          : `${fmt(start)} – ${fmt(end)}`
        : RANGE_LABELS[key],
  };
}

/** Every bucket start date between two calendar dates, so empty days show as 0. */
export function bucketKeys(startDate: string, endDate: string, bucket: Bucket): string[] {
  const keys: string[] = [];
  const d = new Date(`${startDate}T00:00:00Z`);
  if (bucket === "week") d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  if (bucket === "month") d.setUTCDate(1);
  const end = new Date(`${endDate}T00:00:00Z`);
  while (d <= end && keys.length < 800) {
    keys.push(d.toISOString().slice(0, 10));
    if (bucket === "day") d.setUTCDate(d.getUTCDate() + 1);
    else if (bucket === "week") d.setUTCDate(d.getUTCDate() + 7);
    else d.setUTCMonth(d.getUTCMonth() + 1);
  }
  return keys;
}

export function bucketLabel(key: string, bucket: Bucket): string {
  const d = new Date(`${key}T00:00:00Z`);
  const opts: Intl.DateTimeFormatOptions =
    bucket === "month"
      ? { month: "short", year: "2-digit", timeZone: "UTC" }
      : { day: "numeric", month: "short", timeZone: "UTC" };
  return new Intl.DateTimeFormat("en-GB", opts).format(d);
}
