import { describe, expect, it } from "vitest";

import { samplePackages } from "@/data/sample/packages";
import { sampleTours } from "@/data/sample/tours";
import type { PriceRecord, Tour } from "@/types/content";

import {
  EMPTY_ANSWERS,
  type FinderAnswers,
  recommendPackages,
  recommendTours,
} from "./trip-finder";

const regions = { "stone-town": "zanzibar", "mikumi-national-park": "mainland" } as const;
const usd = (adult: number): PriceRecord[] => [
  {
    market: "international",
    currency: "USD",
    adult,
    child: null,
    unit: "per person",
    isIllustrative: true,
  },
];
const tour = (o: Partial<Tour>): Tour => ({
  ...sampleTours[0],
  destinationSlug: "stone-town",
  categorySlug: "culture-history",
  featured: false,
  ...o,
});

const tours = [
  tour({ slug: "beach", travelStyles: ["relaxation", "romantic"], prices: usd(40) }),
  tour({ slug: "kids", travelStyles: ["family"], prices: usd(30) }),
  tour({
    slug: "trek",
    travelStyles: ["adventure"],
    difficulty: "challenging",
    prices: usd(900),
    categorySlug: "safari",
    length: "multi_day",
    destinationSlug: "",
  }),
  tour({ slug: "on-request", travelStyles: ["romantic"], prices: [] }),
];
const run = (a: Partial<FinderAnswers>) =>
  recommendTours(tours, { ...EMPTY_ANSWERS, ...a }, "international", regions).map(
    (r) => r.item.slug,
  );

describe("recommendTours", () => {
  it("ranks matching travel styles first and explains why", () => {
    const [first] = recommendTours(
      tours,
      { ...EMPTY_ANSWERS, styles: ["romantic"] },
      "international",
      regions,
    );
    expect(first.item.slug).toBe("beach");
    expect(first.reasons).toContainEqual({ kind: "style", style: "romantic" });
  });

  it("keeps mainland safaris out of a Zanzibar-only trip, and vice versa", () => {
    expect(run({ where: "zanzibar" })).not.toContain("trek");
    expect(run({ where: "mainland" })).toEqual(["trek"]);
  });

  it("only suggests multi-day safaris when there are at least four days", () => {
    expect(run({ days: "2-3" })).not.toContain("trek");
    expect(run({ days: "4-7" })).toContain("trek");
  });

  it("drops trips priced outside the budget but keeps those priced on request", () => {
    const slugs = run({ budget: "1" });
    expect(slugs).not.toContain("trek");
    expect(slugs).toContain("on-request");
  });

  it("includes each chosen interest even when other tours score higher", () => {
    const slugs = recommendTours(
      tours,
      { ...EMPTY_ANSWERS, styles: ["romantic", "family"], interests: ["safari"] },
      "international",
      regions,
      2,
    ).map((r) => r.item.slug);
    expect(slugs).toContain("trek");
  });

  it("favours family trips and avoids challenging ones with children", () => {
    const slugs = run({ children: 2 });
    expect(slugs[0]).toBe("kids");
    expect(slugs.at(-1)).toBe("trek");
  });
});

describe("recommendPackages", () => {
  it("offers no packages for a single day, and respects the time available", () => {
    expect(
      recommendPackages(samplePackages, { ...EMPTY_ANSWERS, days: "1" }, "international"),
    ).toEqual([]);
    const shortStay = recommendPackages(
      samplePackages,
      { ...EMPTY_ANSWERS, days: "4-7" },
      "international",
    );
    expect(shortStay.every((r) => r.item.days <= 7)).toBe(true);
  });

  it("leaves safari combinations out of a Zanzibar-only trip", () => {
    const zanzibar = recommendPackages(
      samplePackages,
      { ...EMPTY_ANSWERS, where: "zanzibar" },
      "international",
    );
    expect(zanzibar.length).toBeGreaterThan(0);
    expect(zanzibar.every((r) => !r.item.isSafari)).toBe(true);
  });
});
