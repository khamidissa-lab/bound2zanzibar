import { describe, expect, it } from "vitest";

import type { PriceRecord, TourOption } from "@/types/content";

import { buildQuote } from "./quote";

const price: PriceRecord = {
  market: "resident",
  currency: "TZS",
  adult: 50000,
  child: 30000,
  unit: "per person",
  isIllustrative: true,
};
const lunch: TourOption = {
  id: "1",
  name: "Lunch",
  description: "",
  pricing: "per_person",
  prices: [{ market: "resident", currency: "TZS", amount: 10000 }],
};
const transfer: TourOption = {
  id: "2",
  name: "Private transfer",
  description: "",
  pricing: "per_booking",
  prices: [{ market: "international", currency: "USD", amount: 30 }],
};

describe("buildQuote", () => {
  it("matches the database quote for travellers and per-person options", () => {
    const quote = buildQuote({
      price,
      adults: 2,
      children: 1,
      options: [lunch],
      market: "resident",
    });
    // Same figure as supabase/tests/options-payments.test.ts.
    expect(quote.total).toBe(160000);
    expect(quote.lines.map((l) => l.total)).toEqual([100000, 30000, 30000]);
  });

  it("counts a per-booking option once", () => {
    const usd: PriceRecord = {
      ...price,
      market: "international",
      currency: "USD",
      adult: 40,
      child: null,
    };
    const quote = buildQuote({
      price: usd,
      adults: 3,
      children: 0,
      options: [transfer],
      market: "international",
    });
    expect(quote.total).toBe(150);
  });

  it("leaves the total to staff when a chosen option or child has no price", () => {
    expect(
      buildQuote({
        price,
        adults: 1,
        children: 0,
        options: [transfer],
        market: "resident",
      }).total,
    ).toBeNull();
    expect(
      buildQuote({
        price: { ...price, child: null },
        adults: 1,
        children: 1,
        options: [],
        market: "resident",
      }).total,
    ).toBeNull();
  });
});
