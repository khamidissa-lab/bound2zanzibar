import type { Enums } from "@/lib/supabase/database.types";
import type { MediaImage, PriceRecord } from "@/types/content";

/*
 * Pure aggregation for the admin dashboard. Every figure is derived from the
 * records passed in — nothing is hard-coded — so the same model powers the
 * real dashboard (database rows) and the development preview.
 */

export type BookingStatus = Enums<"booking_status">;

export type BookingLite = {
  reference: string;
  status: BookingStatus;
  preferredDate: string; // YYYY-MM-DD
  createdAt: string; // ISO timestamp
  adults: number;
  children: number;
  customerName: string;
  itemKind: "tour" | "package";
  itemName: string;
  destinationName: string | null;
};

/** A payment staff recorded after checking it arrived (never converted). */
export type PaymentLite = {
  amount: number;
  currency: string;
  paidOn: string; // YYYY-MM-DD
};

export type StatusEventLite = {
  reference: string;
  toStatus: BookingStatus;
  fromStatus: BookingStatus | null;
  changedBy: string | null; // display name, if known
  createdAt: string;
};

export type InquiryLite = {
  name: string;
  subject: string | null;
  status: Enums<"inquiry_status">;
  createdAt: string;
};

export type FeaturedItem = {
  kind: "tour" | "package";
  name: string;
  slug: string;
  meta: string; // e.g. duration or "4 days / 3 nights"
  image: MediaImage;
  prices: PriceRecord[];
};

export type DashboardInput = {
  bookings: BookingLite[];
  events: StatusEventLite[];
  inquiries: InquiryLite[];
  payments: PaymentLite[];
  /** Published tours with their destination, for the content view. */
  publishedTours: { destinationName: string | null }[];
  content: {
    publishedTours: number;
    draftTours: number;
    publishedPackages: number;
    destinations: number;
  };
  featured: FeaturedItem[];
};

export const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  paid: "Paid",
  completed: "Completed",
  cancelled: "Cancelled",
  rejected: "Rejected",
};

const TIME_ZONE = "Africa/Dar_es_Salaam";

/** Calendar date (YYYY-MM-DD) in Zanzibar for an instant. */
export function zanzibarDate(instant: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(instant);
}

function lastMonths(today: string, count: number): { key: string; label: string }[] {
  const [y, m] = today.split("-").map(Number);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(Date.UTC(y, m - 1 - (count - 1 - i), 1));
    return {
      key: d.toISOString().slice(0, 7),
      label: new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "UTC" }).format(
        d,
      ),
    };
  });
}

function ranked(counts: Map<string, number>, limit: number) {
  const total = [...counts.values()].reduce((a, b) => a + b, 0);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([name, count]) => ({ name, count, share: total ? count / total : 0 }));
}

const ACTIVE: BookingStatus[] = ["pending", "confirmed", "paid"];

/**
 * Verified payments summed per currency (currencies are never mixed or
 * converted), all time and for one month (YYYY-MM). Most-used currency first.
 */
export function revenueByCurrency(payments: PaymentLite[], month: string) {
  const totals = new Map<string, { total: number; month: number; count: number }>();
  for (const p of payments) {
    const row = totals.get(p.currency) ?? { total: 0, month: 0, count: 0 };
    row.total += p.amount;
    row.count += 1;
    if (p.paidOn.slice(0, 7) === month) row.month += p.amount;
    totals.set(p.currency, row);
  }
  return [...totals.entries()]
    .map(([currency, row]) => ({
      currency,
      total: Math.round(row.total * 100) / 100,
      month: Math.round(row.month * 100) / 100,
      payments: row.count,
    }))
    .sort((a, b) => b.payments - a.payments || a.currency.localeCompare(b.currency));
}

/** Tours ranked by booking requests (cancelled and rejected ones excluded). */
export function popularTours(bookings: BookingLite[], limit: number) {
  const counts = new Map<string, number>();
  for (const b of bookings) {
    if (b.itemKind !== "tour" || b.status === "cancelled" || b.status === "rejected")
      continue;
    counts.set(b.itemName, (counts.get(b.itemName) ?? 0) + 1);
  }
  return ranked(counts, limit);
}

export function buildDashboard(input: DashboardInput, now: Date) {
  const today = zanzibarDate(now);
  const thisMonth = today.slice(0, 7);
  const { bookings } = input;

  const statusCounts = new Map<BookingStatus, number>();
  for (const b of bookings)
    statusCounts.set(b.status, (statusCounts.get(b.status) ?? 0) + 1);
  const statusBars = (Object.keys(STATUS_LABELS) as BookingStatus[])
    .map((status) => ({
      status,
      label: STATUS_LABELS[status],
      count: statusCounts.get(status) ?? 0,
    }))
    .sort((a, b) => b.count - a.count);

  const months = lastMonths(today, 8);
  const perMonth = new Map(months.map((m) => [m.key, 0]));
  for (const b of bookings) {
    const key = zanzibarDate(new Date(b.createdAt)).slice(0, 7);
    if (perMonth.has(key)) perMonth.set(key, (perMonth.get(key) ?? 0) + 1);
  }
  const monthly = months.map((m) => ({ ...m, count: perMonth.get(m.key) ?? 0 }));

  const calendar = new Map<string, number>();
  for (const b of bookings) {
    if (!ACTIVE.includes(b.status) && b.status !== "completed") continue;
    calendar.set(b.preferredDate, (calendar.get(b.preferredDate) ?? 0) + 1);
  }

  const upcoming = bookings
    .filter((b) => ACTIVE.includes(b.status) && b.preferredDate >= today)
    .sort((a, b) => a.preferredDate.localeCompare(b.preferredDate))
    .slice(0, 5);

  const recent = [...bookings]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);

  // Top destinations: by booking requests once there are any, else by tours.
  const byBooking = new Map<string, number>();
  for (const b of bookings) {
    if (b.destinationName)
      byBooking.set(b.destinationName, (byBooking.get(b.destinationName) ?? 0) + 1);
  }
  const byTours = new Map<string, number>();
  for (const t of input.publishedTours) {
    if (t.destinationName)
      byTours.set(t.destinationName, (byTours.get(t.destinationName) ?? 0) + 1);
  }
  const topDestinations =
    byBooking.size > 0
      ? { basis: "bookings" as const, rows: ranked(byBooking, 4) }
      : { basis: "tours" as const, rows: ranked(byTours, 4) };

  return {
    today,
    totals: {
      bookings: bookings.length,
      pending: statusCounts.get("pending") ?? 0,
      // "Paid" bookings are confirmed bookings whose payment has arrived.
      confirmed: (statusCounts.get("confirmed") ?? 0) + (statusCounts.get("paid") ?? 0),
      completed: statusCounts.get("completed") ?? 0,
      upcomingConfirmed: bookings.filter(
        (b) =>
          (b.status === "confirmed" || b.status === "paid") && b.preferredDate >= today,
      ).length,
      requestsThisMonth: monthly.at(-1)?.count ?? 0,
      newInquiries: input.inquiries.filter((i) => i.status === "new").length,
      travellersUpcoming: upcoming.reduce((sum, b) => sum + b.adults + b.children, 0),
    },
    content: input.content,
    thisMonth,
    statusBars,
    monthly,
    calendar: [...calendar.entries()].map(([date, count]) => ({ date, count })),
    upcoming,
    recent,
    topDestinations,
    popularTours: popularTours(bookings, 5),
    revenue: revenueByCurrency(input.payments, thisMonth),
    activity: [...input.events]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 6),
    inquiries: [...input.inquiries]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 4),
    featured: input.featured.slice(0, 3),
  };
}

export type DashboardView = ReturnType<typeof buildDashboard>;
