import "server-only";

import {
  getDestinations,
  getNameLookups,
  getPackages,
  getTours,
} from "@/services/content";

import type {
  BookingLite,
  BookingStatus,
  DashboardInput,
  InquiryLite,
  StatusEventLite,
} from "./admin-dashboard-model";
import { zanzibarDate } from "./admin-dashboard-model";
import { loadFeatured } from "./admin-dashboard";
import type { ReportBooking, ReportInput } from "./reports-model";

/*
 * DEVELOPMENT PREVIEW ONLY. Content figures come from the real (sample)
 * content layer. Booking data is either empty (the honest default) or, when
 * requested, deterministic EXAMPLE records clearly labelled as such in the UI,
 * so the charts can be reviewed before any real bookings exist.
 */

/** Small deterministic PRNG so example data is stable between reloads. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function exampleBookings(
  now: Date,
  items: { name: string; destinationName: string | null }[],
): BookingLite[] {
  const rand = seeded(20261102);
  const today = zanzibarDate(now);
  const out: BookingLite[] = [];
  for (let i = 0; i < 64; i++) {
    const createdDaysAgo = Math.floor(rand() * 230);
    const created = addDays(today, -createdDaysAgo);
    const leadDays = 5 + Math.floor(rand() * 60);
    const preferred = addDays(created, leadDays);
    const past = preferred < today;
    const r = rand();
    const status: BookingStatus = past
      ? r < 0.7
        ? "completed"
        : r < 0.85
          ? "cancelled"
          : "rejected"
      : r < 0.5
        ? "pending"
        : r < 0.9
          ? "confirmed"
          : "cancelled";
    const item = items[Math.floor(rand() * items.length)];
    out.push({
      reference: `EXAMPLE-${String(i + 1).padStart(3, "0")}`,
      status,
      preferredDate: preferred,
      createdAt: `${created}T${String(8 + Math.floor(rand() * 10)).padStart(2, "0")}:00:00+03:00`,
      adults: 1 + Math.floor(rand() * 4),
      children: rand() < 0.3 ? 1 + Math.floor(rand() * 2) : 0,
      customerName: `Example Guest ${String.fromCharCode(65 + (i % 26))}${i >= 26 ? Math.floor(i / 26) : ""}`,
      itemKind: "tour",
      itemName: item.name,
      destinationName: item.destinationName,
    });
  }
  return out;
}

export async function loadPreviewDashboardInput(
  now: Date,
  withExampleBookings: boolean,
): Promise<DashboardInput> {
  const [tours, packages, destinations, lookups, featured] = await Promise.all([
    getTours(),
    getPackages(),
    getDestinations(),
    getNameLookups(),
    loadFeatured(),
  ]);
  const publishedTours = tours.map((t) => ({
    destinationName: lookups.destinations[t.destinationSlug] ?? null,
  }));

  const input: DashboardInput = {
    bookings: [],
    events: [],
    inquiries: [],
    payments: [],
    publishedTours,
    content: {
      publishedTours: tours.length,
      draftTours: 0,
      publishedPackages: packages.length,
      destinations: destinations.length,
    },
    featured,
  };
  if (!withExampleBookings) return input;

  const items = tours.map((t) => ({
    name: t.name,
    destinationName: lookups.destinations[t.destinationSlug] ?? null,
  }));
  input.bookings = exampleBookings(now, items);
  // EXAMPLE payments: one per completed example booking, in US dollars.
  input.payments = input.bookings
    .filter((b) => b.status === "completed")
    .map((b, i) => ({
      amount: 60 + ((i * 37) % 9) * 25,
      currency: "USD",
      paidOn: b.preferredDate,
    }));
  input.events = input.bookings
    .filter((b) => b.status !== "pending")
    .slice(0, 8)
    .map((b, i): StatusEventLite => ({
      reference: b.reference,
      fromStatus: "pending",
      toStatus: b.status,
      changedBy: "Example Staff",
      createdAt: new Date(now.getTime() - (i + 1) * 5 * 3600_000).toISOString(),
    }));
  input.inquiries = [
    "Honeymoon package question",
    "Group of 12 — Safari Blue",
    "Airport pickup?",
  ].map((subject, i): InquiryLite => ({
    name: `Example Visitor ${i + 1}`,
    subject,
    status: i < 2 ? "new" : "in_progress",
    createdAt: new Date(now.getTime() - (i + 1) * 7 * 3600_000).toISOString(),
  }));
  return input;
}

/**
 * DEVELOPMENT PREVIEW ONLY: report input built from the same EXAMPLE
 * bookings and payments as the dashboard preview.
 */
export async function loadPreviewReportInput(now: Date): Promise<ReportInput> {
  const input = await loadPreviewDashboardInput(now, true);
  const markets = ["international", "east_african", "resident"] as const;
  return {
    bookings: input.bookings.map((b, i): ReportBooking => {
      const market = markets[i % 3];
      const travellers = b.adults + b.children;
      return {
        status: b.status,
        createdAt: b.createdAt,
        market,
        currency: market === "resident" ? "TZS" : "USD",
        quotedTotal: market === "resident" ? travellers * 150000 : travellers * 90,
        itemKind: b.itemKind,
        itemName: b.itemName,
        destinationName: b.destinationName,
        travellers,
      };
    }),
    payments: input.payments,
    inquiries: input.inquiries.map((q) => ({ createdAt: q.createdAt })),
    journeys: [],
  };
}
