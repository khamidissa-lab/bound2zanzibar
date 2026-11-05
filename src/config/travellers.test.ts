import { describe, expect, it } from "vitest";

import { sampleTours } from "@/data/sample/tours";
import type { Tour, TravelStyle } from "@/types/content";

import { TRAVELLERS, TRAVELLER_TYPES, isTravellerType, suggestTours } from "./travellers";

const tour = (slug: string, travelStyles: TravelStyle[], featured = false): Tour => ({
  ...sampleTours[0],
  slug,
  travelStyles,
  featured,
});

describe("suggestTours", () => {
  const tours = [
    tour("a", ["romantic"]),
    tour("b", ["romantic", "wildlife"], true),
    tour("c", ["wildlife"]),
    tour("d", ["romantic"]),
    tour("e", ["family"]),
  ];
  const slugs = (styles: TravelStyle[], max: number) =>
    suggestTours(tours, styles, max).map((t) => t.slug);

  it("alternates styles, featured first, without repeats", () => {
    expect(slugs(["romantic", "wildlife"], 6)).toEqual(["b", "c", "a", "d"]);
  });

  it("stops at the maximum", () => {
    expect(slugs(["romantic", "wildlife"], 2)).toEqual(["b", "c"]);
  });

  it("returns nothing when no tour has the style", () => {
    expect(slugs(["luxury"], 6)).toEqual([]);
  });
});

describe("traveller config", () => {
  it("gives every type styles that match at least one sample tour", () => {
    for (const type of TRAVELLER_TYPES) {
      expect(suggestTours(sampleTours, TRAVELLERS[type].styles, 6).length, type).toBe(6);
    }
    expect(isTravellerType("family")).toBe(true);
    expect(isTravellerType("pirates")).toBe(false);
  });
});
