import { describe, expect, it } from "vitest";

import {
  buildDashboard,
  type BookingLite,
  type DashboardInput,
  zanzibarDate,
} from "./admin-dashboard-model";

const NOW = new Date("2026-11-02T09:00:00Z"); // 12:00 in Zanzibar

const booking = (over: Partial<BookingLite>): BookingLite => ({
  reference: "BTZ-1",
  status: "pending",
  preferredDate: "2026-11-10",
  createdAt: "2026-11-01T08:00:00Z",
  adults: 2,
  children: 0,
  customerName: "Guest",
  itemKind: "tour",
  itemName: "Stone Town City Tour",
  destinationName: "Stone Town",
  ...over,
});

const base: DashboardInput = {
  bookings: [],
  events: [],
  inquiries: [],
  payments: [],
  publishedTours: [
    { destinationName: "Stone Town" },
    { destinationName: "Stone Town" },
    { destinationName: "Mnemba Atoll" },
    { destinationName: null },
  ],
  content: { publishedTours: 4, draftTours: 1, publishedPackages: 2, destinations: 3 },
  featured: [],
};

describe("buildDashboard", () => {
  it("uses Zanzibar's date, not UTC", () => {
    expect(zanzibarDate(new Date("2026-11-01T22:30:00Z"))).toBe("2026-11-02");
  });

  it("returns honest zeros and a tours-based ranking when there are no bookings", () => {
    const view = buildDashboard(base, NOW);
    expect(view.totals).toMatchObject({ bookings: 0, pending: 0, upcomingConfirmed: 0 });
    expect(view.monthly).toHaveLength(8);
    expect(view.monthly.at(-1)).toMatchObject({ key: "2026-11", label: "Nov", count: 0 });
    expect(view.monthly[0].key).toBe("2026-04");
    expect(view.topDestinations.basis).toBe("tours");
    expect(view.topDestinations.rows[0]).toEqual({
      name: "Stone Town",
      count: 2,
      share: 2 / 3,
    });
    expect(view.upcoming).toEqual([]);
  });

  it("aggregates bookings by status, month, date and destination", () => {
    const view = buildDashboard(
      {
        ...base,
        bookings: [
          booking({ reference: "A", status: "pending", preferredDate: "2026-11-20" }),
          booking({
            reference: "B",
            status: "confirmed",
            preferredDate: "2026-11-05",
            adults: 3,
            children: 1,
          }),
          booking({
            reference: "C",
            status: "confirmed",
            preferredDate: "2026-10-01",
            createdAt: "2026-09-15T10:00:00Z",
          }),
          booking({
            reference: "D",
            status: "cancelled",
            preferredDate: "2026-11-05",
            destinationName: "Mnemba Atoll",
          }),
        ],
        inquiries: [
          { name: "X", subject: null, status: "new", createdAt: "2026-11-01T00:00:00Z" },
          {
            name: "Y",
            subject: null,
            status: "closed",
            createdAt: "2026-10-01T00:00:00Z",
          },
        ],
      },
      NOW,
    );
    expect(view.totals).toMatchObject({
      bookings: 4,
      pending: 1,
      upcomingConfirmed: 1,
      requestsThisMonth: 3,
      newInquiries: 1,
      travellersUpcoming: 2 + 4,
    });
    expect(view.statusBars[0]).toMatchObject({ status: "confirmed", count: 2 });
    expect(view.monthly.find((m) => m.key === "2026-09")?.count).toBe(1);
    // Cancelled requests don't appear on the calendar.
    expect(view.calendar.find((d) => d.date === "2026-11-05")?.count).toBe(1);
    // Upcoming: active, from today, soonest first.
    expect(view.upcoming.map((b) => b.reference)).toEqual(["B", "A"]);
    expect(view.recent[0].reference).toBe("A");
    expect(view.topDestinations.basis).toBe("bookings");
    expect(view.topDestinations.rows[0]).toMatchObject({ name: "Stone Town", count: 3 });
    expect(view.totals).toMatchObject({ confirmed: 2, completed: 0 });
  });

  it("ranks popular tours without cancelled, rejected or package requests", () => {
    const view = buildDashboard(
      {
        ...base,
        bookings: [
          booking({ reference: "A", itemName: "Safari Blue" }),
          booking({ reference: "B", itemName: "Safari Blue", status: "completed" }),
          booking({ reference: "C", itemName: "Spice Farm", status: "paid" }),
          booking({ reference: "D", itemName: "Spice Farm", status: "cancelled" }),
          booking({ reference: "E", itemName: "Spice Farm", status: "rejected" }),
          booking({ reference: "F", itemName: "Honeymoon Escape", itemKind: "package" }),
        ],
      },
      NOW,
    );
    expect(view.popularTours.map((t) => [t.name, t.count])).toEqual([
      ["Safari Blue", 2],
      ["Spice Farm", 1],
    ]);
    // A paid booking counts as confirmed.
    expect(view.totals).toMatchObject({ confirmed: 1, completed: 1 });
  });

  it("sums verified payments per currency without converting", () => {
    const view = buildDashboard(
      {
        ...base,
        payments: [
          { amount: 120, currency: "USD", paidOn: "2026-11-01" },
          { amount: 80.5, currency: "USD", paidOn: "2026-10-20" },
          { amount: 250000, currency: "TZS", paidOn: "2026-11-02" },
        ],
      },
      NOW,
    );
    expect(view.revenue).toEqual([
      { currency: "USD", total: 200.5, month: 120, payments: 2 },
      { currency: "TZS", total: 250000, month: 250000, payments: 1 },
    ]);
  });
});
