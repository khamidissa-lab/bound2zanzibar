import { describe, expect, it } from "vitest";

import { sampleTours } from "@/data/sample/tours";
import type { PriceRecord, Tour } from "@/types/content";

import {
  EMPTY_FILTERS,
  filterTours,
  filtersFromParams,
  fromPrice,
  inBudget,
  marketCurrency,
  toTravelStyles,
} from "./discovery";

const price = (
  market: PriceRecord["market"],
  currency: PriceRecord["currency"],
  adult: number,
): PriceRecord => ({
  market,
  currency,
  adult,
  child: null,
  unit: "per person",
  isIllustrative: true,
});

const tour = (overrides: Partial<Tour>): Tour => ({ ...sampleTours[0], ...overrides });

describe("fromPrice", () => {
  it("uses the market's own price and never another market's", () => {
    const prices = [price("international", "USD", 40), price("resident", "TZS", 60000)];
    expect(fromPrice(prices, "resident")).toEqual({ amount: 60000, currency: "TZS" });
    expect(fromPrice(prices, "east_african")).toBeNull();
  });
});

describe("inBudget", () => {
  it("applies the band in the price's own currency", () => {
    expect(inBudget({ amount: 40, currency: "USD" }, "1")).toBe(true);
    expect(inBudget({ amount: 60, currency: "USD" }, "1")).toBe(false);
    expect(inBudget({ amount: 100_000, currency: "TZS" }, "1")).toBe(true);
    expect(inBudget({ amount: 5000, currency: "USD" }, "4")).toBe(true);
  });

  it("hides unpriced trips only when a budget is chosen", () => {
    expect(inBudget(null, "")).toBe(true);
    expect(inBudget(null, "2")).toBe(false);
  });
});

describe("filterTours", () => {
  const tours = [
    tour({
      slug: "a",
      length: "hours",
      travelStyles: ["romantic"],
      difficulty: "easy",
      prices: [price("international", "USD", 30)],
    }),
    tour({
      slug: "b",
      length: "multi_day",
      travelStyles: ["wildlife"],
      difficulty: "moderate",
      prices: [],
    }),
    tour({
      slug: "c",
      length: null,
      travelStyles: [],
      difficulty: "easy",
      prices: [price("international", "USD", 500)],
    }),
  ];
  const slugs = (f: Partial<typeof EMPTY_FILTERS>) =>
    filterTours(tours, { ...EMPTY_FILTERS, ...f }, "international").map((t) => t.slug);

  it("returns everything with no filters, including tours without a length", () => {
    expect(slugs({})).toEqual(["a", "b", "c"]);
  });

  it("filters by length, style, level and budget", () => {
    expect(slugs({ length: "multi_day" })).toEqual(["b"]);
    expect(slugs({ style: "romantic" })).toEqual(["a"]);
    expect(slugs({ difficulty: "easy" })).toEqual(["a", "c"]);
    expect(slugs({ budget: "4" })).toEqual(["c"]);
  });
});

describe("filtersFromParams", () => {
  it("ignores unknown values", () => {
    const params = new URLSearchParams(
      "length=forever&style=wildlife&level=extreme&q=dhow",
    );
    expect(filtersFromParams((k) => params.get(k))).toEqual({
      ...EMPTY_FILTERS,
      query: "dhow",
      style: "wildlife",
    });
  });
});

describe("marketCurrency", () => {
  it("picks the currency most prices use for the market", () => {
    const items = [
      { prices: [price("resident", "TZS", 1)] },
      { prices: [price("resident", "TZS", 2)] },
      { prices: [price("resident", "USD", 3)] },
    ];
    expect(marketCurrency(items, "resident")).toBe("TZS");
    expect(marketCurrency([], "resident")).toBe("USD");
  });
});

describe("sample data", () => {
  it("gives every sample tour a length and at least one known travel style", () => {
    for (const t of sampleTours) {
      expect(t.length, t.slug).not.toBeNull();
      expect(t.travelStyles.length, t.slug).toBeGreaterThan(0);
      expect(toTravelStyles(t.travelStyles)).toEqual(t.travelStyles);
    }
  });
});
