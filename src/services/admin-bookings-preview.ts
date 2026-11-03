import "server-only";

import type { BookingListFilters } from "@/lib/booking/filters";
import { BOOKING_STATUSES, type BookingStatus } from "@/lib/booking/status";
import { getPackages, getTours } from "@/services/content";

import { zanzibarDate } from "./admin-dashboard-model";
import type { BookingDetail, BookingEvent } from "./bookings";

/*
 * DEVELOPMENT PREVIEW ONLY. Deterministic EXAMPLE bookings (guest names and
 * emails are obviously fake) so the booking screens can be reviewed before a
 * database is connected. Never used on the live site.
 */

const STATUS_CYCLE: BookingStatus[] = [
  "pending",
  "pending",
  "confirmed",
  "pending",
  "completed",
  "confirmed",
  "rejected",
  "pending",
  "cancelled",
  "confirmed",
  "pending",
  "completed",
  "pending",
  "confirmed",
];

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export async function previewBookings(now: Date): Promise<BookingDetail[]> {
  const [tours, packages] = await Promise.all([getTours(), getPackages()]);
  const today = zanzibarDate(now);
  return STATUS_CYCLE.map((status, i) => {
    const pkg = i % 4 === 3 ? packages[i % packages.length] : null;
    const tour = pkg ? null : tours[(i * 5) % tours.length];
    const market = i % 3 === 0 ? "resident" : "international";
    const currency = market === "resident" ? "TZS" : "USD";
    const price = (pkg ?? tour)!.prices.find(
      (p) => p.market === market && p.currency === currency,
    );
    const adults = 1 + (i % 4);
    const children = i % 3 === 1 ? 1 : 0;
    const created = new Date(now.getTime() - (i * 19 + 3) * 3600_000);
    return {
      id: `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`,
      // Valid format, recognisable as an example: BTZ-YYMM-EEEE000A …
      reference: `BTZ-${today.slice(2, 4)}${today.slice(5, 7)}-EEEE${i
        .toString(16)
        .toUpperCase()
        .padStart(4, "0")}`,
      status,
      item_type: pkg ? "package" : "tour",
      customer_name: `Example guest ${String(i + 1).padStart(2, "0")}`,
      email: `guest${String(i + 1).padStart(2, "0")}@example.com`,
      phone: `+255 700 000 0${String(i + 1).padStart(2, "0")}`,
      market,
      currency,
      preferred_date: addDays(today, 3 + i * 4),
      adults,
      children,
      quoted_total: price ? price.adult * adults + (price.child ?? 0) * children : null,
      created_at: created.toISOString(),
      tour: tour ? { name: tour.name, slug: tour.slug } : null,
      package: pkg ? { name: pkg.name, slug: pkg.slug } : null,
      pickup_location: i % 2 === 0 ? "Example hotel, Stone Town" : null,
      message:
        i % 3 === 0
          ? "EXAMPLE message: we are celebrating an anniversary — could we have a private boat?"
          : null,
      internal_notes: status === "confirmed" ? "EXAMPLE note: confirmed by phone." : null,
      source: "website",
      updated_at: created.toISOString(),
    } satisfies BookingDetail;
  });
}

/** Same filtering rules as the database query, applied in memory. */
export function filterPreview(rows: BookingDetail[], f: BookingListFilters) {
  const q = f.q?.toLowerCase();
  return rows.filter(
    (b) =>
      (!f.status || b.status === f.status) &&
      (!f.type || b.item_type === f.type) &&
      (!f.from || b.preferred_date >= f.from) &&
      (!f.to || b.preferred_date <= f.to) &&
      (!q ||
        [b.reference, b.customer_name, b.email, b.phone].some((v) =>
          v.toLowerCase().includes(q),
        )),
  );
}

export function previewCounts(rows: BookingDetail[], f: BookingListFilters) {
  return Object.fromEntries(
    BOOKING_STATUSES.map((s) => [s, filterPreview(rows, { ...f, status: s }).length]),
  ) as Record<BookingStatus, number>;
}

export function previewEvents(b: BookingDetail): BookingEvent[] {
  const events: BookingEvent[] = [
    {
      from_status: null,
      to_status: "pending",
      changed_by: null,
      created_at: b.created_at,
    },
  ];
  if (b.status !== "pending") {
    events.unshift({
      from_status: "pending",
      to_status: b.status === "completed" ? "confirmed" : b.status,
      changed_by: "Example staff member",
      created_at: new Date(Date.parse(b.created_at) + 2 * 3600_000).toISOString(),
    });
  }
  if (b.status === "completed") {
    events.unshift({
      from_status: "confirmed",
      to_status: "completed",
      changed_by: "Example staff member",
      created_at: new Date(Date.parse(b.created_at) + 30 * 3600_000).toISOString(),
    });
  }
  return events;
}
