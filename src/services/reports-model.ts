import type { Enums } from "@/lib/supabase/database.types";

import {
  revenueByCurrency,
  STATUS_LABELS,
  zanzibarDate,
  type BookingStatus,
  type PaymentLite,
} from "./admin-dashboard-model";

/*
 * Pure aggregation for the admin Reports page. Every figure comes from the
 * records passed in. Money is always grouped by currency and never converted.
 */

export const REPORT_RANGES = {
  "30d": { label: "Last 30 days", days: 30 },
  "90d": { label: "Last 90 days", days: 90 },
  "12m": { label: "Last 12 months", days: 365 },
  all: { label: "All time", days: null },
} as const;
export type ReportRange = keyof typeof REPORT_RANGES;

export function parseRange(value: unknown): ReportRange {
  return typeof value === "string" && value in REPORT_RANGES
    ? (value as ReportRange)
    : "90d";
}

export type ReportBooking = {
  status: BookingStatus;
  createdAt: string; // ISO timestamp
  market: Enums<"market">;
  currency: string;
  quotedTotal: number | null;
  itemKind: "tour" | "package";
  itemName: string;
  destinationName: string | null;
  travellers: number;
};

export type ReportInput = {
  bookings: ReportBooking[];
  payments: PaymentLite[];
  inquiries: { createdAt: string }[];
  journeys: { createdAt: string }[];
};

/** Bookings that went ahead (or are going ahead). */
const WON: BookingStatus[] = ["confirmed", "paid", "completed"];
const LOST: BookingStatus[] = ["cancelled", "rejected"];

function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function rank(counts: Map<string, number>, limit: number) {
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

function bump(map: Map<string, number>, key: string, by = 1) {
  map.set(key, (map.get(key) ?? 0) + by);
}

const monthLabel = (key: string) =>
  new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${key}-01T00:00:00Z`));

export type MonthRow = {
  key: string; // YYYY-MM
  label: string;
  requests: number;
  won: number;
  lost: number;
  travellers: number;
  revenue: Record<string, number>; // currency → verified payments
};

export function buildReport(input: ReportInput, range: ReportRange, now: Date) {
  const today = zanzibarDate(now);
  const days = REPORT_RANGES[range].days;
  // Inclusive start date in Zanzibar time; null means everything.
  const from = days === null ? null : addDays(today, -(days - 1));
  const inRange = (date: string) => from === null || date >= from;
  const dayOf = (iso: string) => zanzibarDate(new Date(iso));

  const bookings = input.bookings.filter((b) => inRange(dayOf(b.createdAt)));
  const payments = input.payments.filter((p) => inRange(p.paidOn));

  const status = new Map<string, number>();
  const market = new Map<string, number>();
  const tours = new Map<string, number>();
  const packages = new Map<string, number>();
  const destinations = new Map<string, number>();
  const months = new Map<string, MonthRow>();
  const monthRow = (key: string) => {
    let row = months.get(key);
    if (!row) {
      row = {
        key,
        label: monthLabel(key),
        requests: 0,
        won: 0,
        lost: 0,
        travellers: 0,
        revenue: {},
      };
      months.set(key, row);
    }
    return row;
  };
  // Estimated value of bookings that went ahead, from the quote at request.
  const wonValue = new Map<string, number>();

  let won = 0;
  let lost = 0;
  let travellers = 0;
  for (const b of bookings) {
    bump(status, b.status);
    bump(market, b.market);
    travellers += b.travellers;
    const row = monthRow(dayOf(b.createdAt).slice(0, 7));
    row.requests += 1;
    row.travellers += b.travellers;
    if (WON.includes(b.status)) {
      won += 1;
      row.won += 1;
      if (b.quotedTotal !== null) bump(wonValue, b.currency, b.quotedTotal);
    }
    if (LOST.includes(b.status)) {
      lost += 1;
      row.lost += 1;
      continue; // Lost requests don't count towards popularity.
    }
    bump(b.itemKind === "tour" ? tours : packages, b.itemName);
    if (b.destinationName) bump(destinations, b.destinationName);
  }
  for (const p of payments) {
    const row = monthRow(p.paidOn.slice(0, 7));
    row.revenue[p.currency] = (row.revenue[p.currency] ?? 0) + p.amount;
  }

  const decided = won + lost;
  const statusRows = (Object.keys(STATUS_LABELS) as BookingStatus[]).map((s) => ({
    status: s,
    label: STATUS_LABELS[s],
    count: status.get(s) ?? 0,
  }));

  return {
    range,
    rangeLabel: REPORT_RANGES[range].label,
    from,
    today,
    summary: {
      requests: bookings.length,
      travellers,
      won,
      lost,
      pending: status.get("pending") ?? 0,
      /** Share of decided requests that went ahead; null until any are decided. */
      successRate: decided === 0 ? null : won / decided,
      enquiries: input.inquiries.filter((i) => inRange(dayOf(i.createdAt))).length,
      journeys: input.journeys.filter((j) => inRange(dayOf(j.createdAt))).length,
    },
    statusRows,
    markets: rank(market, 3),
    topTours: rank(tours, 8),
    topPackages: rank(packages, 5),
    topDestinations: rank(destinations, 6),
    // All-time column is the whole range here; "month" is the current month.
    revenue: revenueByCurrency(payments, today.slice(0, 7)),
    wonValue: [...wonValue.entries()]
      .map(([currency, total]) => ({ currency, total: Math.round(total * 100) / 100 }))
      .sort((a, b) => a.currency.localeCompare(b.currency)),
    months: [...months.values()]
      .map((m) => ({
        ...m,
        revenue: Object.fromEntries(
          Object.entries(m.revenue).map(([c, v]) => [c, Math.round(v * 100) / 100]),
        ),
      }))
      .sort((a, b) => b.key.localeCompare(a.key)),
    currencies: [...new Set(payments.map((p) => p.currency))].sort(),
  };
}

export type ReportView = ReturnType<typeof buildReport>;
