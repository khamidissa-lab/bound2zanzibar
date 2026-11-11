import { describe, expect, it } from "vitest";

import { buildReport, parseRange, type ReportBooking } from "./reports-model";

const NOW = new Date("2026-11-10T09:00:00Z"); // 12:00 in Zanzibar

const booking = (over: Partial<ReportBooking>): ReportBooking => ({
  status: "pending",
  createdAt: "2026-11-05T08:00:00Z",
  market: "international",
  currency: "USD",
  quotedTotal: 100,
  itemKind: "tour",
  itemName: "Safari Blue",
  destinationName: "Fumba",
  travellers: 2,
  ...over,
});

describe("parseRange", () => {
  it("falls back to 90 days for unknown values", () => {
    expect(parseRange("12m")).toBe("12m");
    expect(parseRange("forever")).toBe("90d");
    expect(parseRange(undefined)).toBe("90d");
  });
});

describe("buildReport", () => {
  const input = {
    bookings: [
      booking({ status: "confirmed", quotedTotal: 300 }),
      booking({ status: "completed", currency: "TZS", quotedTotal: 500000 }),
      booking({ status: "cancelled", itemName: "Spice Farm" }),
      booking({ status: "pending", itemKind: "package", itemName: "Honeymoon" }),
      // Outside the last 30 days.
      booking({ status: "confirmed", createdAt: "2026-08-01T08:00:00Z" }),
    ],
    payments: [
      { amount: 150, currency: "USD", paidOn: "2026-11-06" },
      { amount: 50.25, currency: "USD", paidOn: "2026-10-20" },
      { amount: 400, currency: "USD", paidOn: "2026-07-01" },
    ],
    inquiries: [
      { createdAt: "2026-11-01T10:00:00Z" },
      { createdAt: "2026-01-01T10:00:00Z" },
    ],
    journeys: [{ createdAt: "2026-11-09T10:00:00Z" }],
  };

  it("counts only records inside the range", () => {
    const r = buildReport(input, "30d", NOW);
    expect(r.from).toBe("2026-10-12");
    expect(r.summary).toMatchObject({
      requests: 4,
      travellers: 8,
      won: 2,
      lost: 1,
      pending: 1,
      enquiries: 1,
      journeys: 1,
    });
    expect(r.summary.successRate).toBeCloseTo(2 / 3);
    expect(r.revenue).toEqual([
      { currency: "USD", total: 200.25, month: 150, payments: 2 },
    ]);
  });

  it("keeps currencies apart and ignores lost requests for popularity", () => {
    const r = buildReport(input, "30d", NOW);
    expect(r.wonValue).toEqual([
      { currency: "TZS", total: 500000 },
      { currency: "USD", total: 300 },
    ]);
    expect(r.topTours).toEqual([{ name: "Safari Blue", count: 2 }]);
    expect(r.topPackages).toEqual([{ name: "Honeymoon", count: 1 }]);
    expect(r.months.map((m) => m.key)).toEqual(["2026-11", "2026-10"]);
    expect(r.months[0]).toMatchObject({
      requests: 4,
      won: 2,
      lost: 1,
      revenue: { USD: 150 },
    });
  });

  it("includes everything for all time", () => {
    const r = buildReport(input, "all", NOW);
    expect(r.from).toBeNull();
    expect(r.summary.requests).toBe(5);
    expect(r.revenue[0].total).toBe(600.25);
  });

  it("has no success rate before any request is decided", () => {
    const r = buildReport({ ...input, bookings: [booking({})] }, "30d", NOW);
    expect(r.summary.successRate).toBeNull();
  });
});
