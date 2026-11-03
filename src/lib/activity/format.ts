/**
 * Turns activity log rows (written by the database, see
 * supabase/migrations/…_activity_log.sql) into readable sentences.
 * Pure functions, shared by the admin page, its preview and the tests.
 */
import { formatPrice, marketLabels } from "@/lib/format";
import type { Currency, Market } from "@/types/content";

export type ActivityEntry = {
  id: number;
  occurred_at: string;
  actor_id: string | null;
  actor_name: string | null;
  actor_role: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  entity_label: string | null;
  changed_fields: string[];
  details: unknown;
};

export const ACTIVITY_AREAS = {
  content: {
    label: "Content",
    entities: [
      "tours",
      "packages",
      "destinations",
      "tour_categories",
      "blog_posts",
      "testimonials",
    ],
  },
  prices: { label: "Prices", entities: ["tour_prices", "package_prices"] },
  bookings: { label: "Bookings & enquiries", entities: ["bookings", "inquiries"] },
  staff: { label: "Staff & settings", entities: ["profiles", "site_settings"] },
  account: { label: "Sign-ins", entities: ["account"] },
} as const;

export type ActivityArea = keyof typeof ACTIVITY_AREAS;

export function isActivityArea(value: string): value is ActivityArea {
  return Object.hasOwn(ACTIVITY_AREAS, value);
}

const ENTITY_NAMES: Record<string, string> = {
  tours: "tour",
  packages: "package",
  destinations: "destination",
  tour_categories: "tour category",
  blog_posts: "guide article",
  testimonials: "review",
  site_settings: "setting",
  profiles: "staff account",
  bookings: "booking",
  inquiries: "enquiry",
  tour_prices: "tour",
  package_prices: "package",
};

const FIELD_NAMES: Record<string, string> = {
  is_active: "active",
  is_featured: "featured",
  is_approved: "approved",
  is_public: "public",
  is_sample: "sample flag",
  cover_image_path: "cover image",
  cover_image_alt: "cover image description",
  seo_title: "SEO title",
  seo_description: "SEO description",
  full_name: "name",
  internal_notes: "internal notes",
  customer_display_name: "guest name",
  category_id: "category",
  destination_id: "destination",
};

export function fieldName(field: string): string {
  return FIELD_NAMES[field] ?? field.replace(/_/g, " ");
}

const EVENT_TITLES: Record<string, string> = {
  signed_in: "Signed in",
  signed_out: "Signed out",
  password_changed: "Changed their password",
  bookings_exported: "Exported bookings to CSV",
};

/** One-line summary, e.g. `Edited tour "Safari Blue"`. */
export function activityTitle(entry: ActivityEntry): string {
  const event = EVENT_TITLES[entry.action];
  if (event) return event;

  const noun = ENTITY_NAMES[entry.entity] ?? entry.entity.replace(/_/g, " ");
  const name = entry.entity_label ? ` "${entry.entity_label}"` : "";
  if (entry.entity === "tour_prices" || entry.entity === "package_prices") {
    return `Changed prices for ${noun}${name}`;
  }
  const verb =
    entry.action === "created"
      ? "Created"
      : entry.action === "deleted"
        ? "Deleted"
        : "Edited";
  return `${verb} ${noun}${name}`;
}

/** Admin page for the changed item, when it still exists and has one. */
export function activityHref(entry: ActivityEntry): string | null {
  if (entry.action === "deleted" || !entry.entity_id) return null;
  const id = encodeURIComponent(entry.entity_id);
  switch (entry.entity) {
    case "tours":
    case "tour_prices":
      return `/admin/tours/${id}`;
    case "packages":
    case "package_prices":
      return `/admin/packages/${id}`;
    case "destinations":
      return `/admin/destinations/${id}`;
    case "blog_posts":
      return `/admin/travel-guide/${id}`;
    case "tour_categories":
      return "/admin/tours/categories";
    case "bookings":
      return entry.entity_label
        ? `/admin/bookings/${encodeURIComponent(entry.entity_label)}`
        : null;
    case "inquiries":
      return `/admin/enquiries/${id}`;
    case "profiles":
      return "/admin/staff";
    default:
      return null;
  }
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "empty";
  if (typeof value === "boolean") return value ? "yes" : "no";
  if (Array.isArray(value))
    return value.length ? value.map(formatValue).join(", ") : "none";
  if (typeof value === "object") return JSON.stringify(value);
  const text = String(value);
  // Enum values such as "in_progress" or "content_editor".
  if (/^[a-z]+(_[a-z]+)+$/.test(text)) return text.replace(/_/g, " ");
  return text;
}

type PriceRow = {
  market: string;
  customer_type: string;
  currency: string;
  amount: number;
  is_active: boolean;
};

function isPriceRows(value: unknown): value is PriceRow[] {
  return (
    Array.isArray(value) &&
    value.every(
      (p) =>
        p &&
        typeof p === "object" &&
        typeof p.market === "string" &&
        typeof p.customer_type === "string" &&
        typeof p.currency === "string" &&
        typeof p.amount === "number",
    )
  );
}

function priceKey(p: PriceRow) {
  return `${p.market}|${p.customer_type}|${p.currency}`;
}

function priceName(p: PriceRow) {
  const market = marketLabels[p.market as Market]?.short ?? p.market;
  return `${market} · ${p.customer_type}`;
}

function priceAmount(p: PriceRow) {
  const amount = formatPrice(p.amount, p.currency as Currency);
  return p.is_active === false ? `${amount} (hidden)` : amount;
}

/** Before/after lines for a price save: changed, added and removed prices. */
export function priceChanges(before: PriceRow[], after: PriceRow[]): string[] {
  const old = new Map(before.map((p) => [priceKey(p), p]));
  const lines: string[] = [];
  for (const p of after) {
    const prev = old.get(priceKey(p));
    old.delete(priceKey(p));
    if (!prev) lines.push(`${priceName(p)}: added at ${priceAmount(p)}`);
    else if (priceAmount(prev) !== priceAmount(p)) {
      lines.push(`${priceName(p)}: ${priceAmount(prev)} → ${priceAmount(p)}`);
    }
  }
  for (const p of old.values())
    lines.push(`${priceName(p)}: removed (was ${priceAmount(p)})`);
  return lines;
}

/** Detail lines shown under the summary. */
export function activityChanges(entry: ActivityEntry): string[] {
  const details =
    entry.details && typeof entry.details === "object"
      ? (entry.details as Record<string, unknown>)
      : {};

  if (entry.entity === "tour_prices" || entry.entity === "package_prices") {
    const { before, after } = details;
    return isPriceRows(before) && isPriceRows(after) ? priceChanges(before, after) : [];
  }
  if (entry.action === "bookings_exported") {
    const rows = typeof details.rows === "number" ? details.rows : null;
    const status = typeof details.status === "string" ? details.status : null;
    return [
      rows === null ? null : `${rows} booking${rows === 1 ? "" : "s"}`,
      status ? `status: ${formatValue(status)}` : null,
    ].filter((line): line is string => line !== null);
  }
  if (entry.action !== "updated") return [];

  const lines: string[] = [];
  const withoutValues: string[] = [];
  for (const field of entry.changed_fields) {
    const change = details[field] as { from?: unknown; to?: unknown } | undefined;
    if (change && typeof change === "object" && "to" in change) {
      lines.push(
        `${fieldName(field)}: ${formatValue(change.from)} → ${formatValue(change.to)}`,
      );
    } else {
      withoutValues.push(fieldName(field));
    }
  }
  if (withoutValues.length) lines.push(`Changed ${withoutValues.join(", ")}`);
  return lines;
}
