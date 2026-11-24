import { describe, expect, it } from "vitest";

import { describeError, fieldErrors } from "./auth";
import { articleSchema, packageSchema, pricesSchema, tourSchema } from "./content";

const baseTour = {
  name: "Spice Farm Tour",
  slug: "",
  categoryId: "",
  destinationId: "",
  shortDescription: "Short",
  description: "Long",
  durationText: "Half day",
  highlights: "Cloves\n\n  Nutmeg  \n",
  inclusions: "",
  exclusions: "",
  whatToBring: "",
  meetingPoint: "",
  difficulty: "",
  suitability: "",
  whatToExpect: "Meet: Pickup from your hotel.\nFarm walk",
  goodToKnow: "Wear closed shoes.",
  faqs: "Is it for kids?\nYes.",
  coverImagePath: "",
  coverImageAlt: "",
  status: "draft",
  sortOrder: "0",
  seoTitle: "",
  seoDescription: "",
};

describe("tourSchema", () => {
  it("derives the slug, splits lines and nulls empty optionals", () => {
    const parsed = tourSchema.parse(baseTour);
    expect(parsed.slug).toBe("spice-farm-tour");
    expect(parsed.highlights).toEqual(["Cloves", "Nutmeg"]);
    expect(parsed.categoryId).toBeNull();
    expect(parsed.difficulty).toBeNull();
    expect(parsed.isFeatured).toBe(false);
    expect(parsed.coverImagePath).toBeNull();
  });

  it("rejects bad slugs, unknown statuses and path traversal", () => {
    const result = tourSchema.safeParse({
      ...baseTour,
      slug: "Bad Slug",
      status: "deleted",
      coverImagePath: "../secret.jpg",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = fieldErrors(result.error);
      expect(Object.keys(errors).sort()).toEqual(["coverImagePath", "status"]);
    }
    expect(tourSchema.safeParse({ ...baseTour, slug: "Bad Slug" }).success).toBe(false);
  });

  it("reads trip length and travel styles, in the standard order", () => {
    const parsed = tourSchema.parse({
      ...baseTour,
      length: "half_day",
      travelStyles: ["wildlife", "family"],
    });
    expect(parsed.length).toBe("half_day");
    expect(parsed.travelStyles).toEqual(["family", "wildlife"]);
    // Unset length and no ticked styles are allowed.
    const empty = tourSchema.parse({ ...baseTour, length: "" });
    expect(empty.length).toBeNull();
    expect(empty.travelStyles).toEqual([]);
  });

  it("rejects an unknown length or style", () => {
    expect(tourSchema.safeParse({ ...baseTour, length: "weekend" }).success).toBe(false);
    expect(tourSchema.safeParse({ ...baseTour, travelStyles: ["spa"] }).success).toBe(
      false,
    );
  });
});

describe("packageSchema", () => {
  const basePackage = {
    name: "Island Week",
    slug: "island-week",
    shortDescription: "",
    description: "",
    days: "7",
    nights: "6",
    accommodationDescription: "",
    transfersDescription: "",
    mealsDescription: "",
    inclusions: "",
    exclusions: "",
    terms: "",
    coverImagePath: "",
    coverImageAlt: "",
    status: "published",
    sortOrder: "1",
    itinerary: JSON.stringify([
      { title: "Arrive", description: "", meals: [], overnight: "Stone Town" },
    ]),
    tourIds: [],
    destinationIds: [],
    seoTitle: "",
    seoDescription: "",
  };

  it("parses itinerary JSON and numbers", () => {
    const parsed = packageSchema.parse(basePackage);
    expect(parsed.days).toBe(7);
    expect(parsed.itinerary).toHaveLength(1);
  });

  it("rejects nights greater than days and malformed itinerary", () => {
    expect(packageSchema.safeParse({ ...basePackage, nights: "8" }).success).toBe(false);
    expect(packageSchema.safeParse({ ...basePackage, itinerary: "{oops" }).success).toBe(
      false,
    );
    expect(
      packageSchema.safeParse({
        ...basePackage,
        itinerary: JSON.stringify([
          { title: "", description: "", meals: [], overnight: "" },
        ]),
      }).success,
    ).toBe(false);
  });
});

describe("pricesSchema", () => {
  const row = {
    market: "resident",
    customerType: "adult",
    currency: "tzs",
    amount: "50000",
    unitLabel: "per person",
    isIllustrative: false,
    isActive: true,
  };

  it("normalises currency and amount", () => {
    const parsed = pricesSchema.parse({ prices: JSON.stringify([row]) });
    expect(parsed.prices[0]).toMatchObject({ currency: "TZS", amount: 50000 });
  });

  it("rejects duplicates, negatives and unknown markets", () => {
    expect(pricesSchema.safeParse({ prices: JSON.stringify([row, row]) }).success).toBe(
      false,
    );
    expect(
      pricesSchema.safeParse({ prices: JSON.stringify([{ ...row, amount: "-1" }]) })
        .success,
    ).toBe(false);
    expect(
      pricesSchema.safeParse({ prices: JSON.stringify([{ ...row, market: "vip" }]) })
        .success,
    ).toBe(false);
  });
  it("accepts thousands separators like 40,000 and 40 000", () => {
    for (const amount of ["40,000", "40 000", " 40000 "]) {
      const parsed = pricesSchema.parse({ prices: JSON.stringify([{ ...row, amount }]) });
      expect(parsed.prices[0].amount).toBe(40000);
    }
  });

  it("names the row and the problem instead of a generic message", () => {
    const second = { ...row, market: "international", currency: "USD" };
    const empty = pricesSchema.safeParse({
      prices: JSON.stringify([row, { ...second, amount: "" }]),
    });
    expect(empty.success).toBe(false);
    if (!empty.success)
      expect(describeError(empty.error)).toBe("Row 2: Enter an amount.");
    const words = pricesSchema.safeParse({
      prices: JSON.stringify([{ ...row, amount: "forty" }]),
    });
    if (!words.success) {
      expect(describeError(words.error)).toBe(
        "Row 1: Enter the amount as a number, for example 40000.",
      );
    }
    expect(words.success).toBe(false);
  });
});

describe("articleSchema", () => {
  it("parses markup body and tags", () => {
    const parsed = articleSchema.parse({
      title: "Best Time to Visit",
      slug: "",
      excerpt: "",
      body: "## When\nAny time.",
      tags: "Planning, Seasons,",
      category: "travel-tips",
      authorName: "",
      readingMinutes: "",
      coverImagePath: "",
      coverImageAlt: "",
      status: "draft",
      seoTitle: "",
      seoDescription: "",
    });
    expect(parsed.slug).toBe("best-time-to-visit");
    expect(parsed.body).toEqual([{ heading: "When", paragraphs: ["Any time."] }]);
    expect(parsed.tags).toEqual(["Planning", "Seasons"]);
    expect(parsed.readingMinutes).toBeNull();
    expect(parsed.isFeatured).toBe(false);
    expect(parsed.authorName).toBeNull();
    expect(parsed.tourIds).toEqual([]);
  });

  it("rejects an unknown category", () => {
    const result = articleSchema.safeParse({
      title: "A",
      body: "Text",
      category: "news",
      status: "draft",
    });
    expect(result.success).toBe(false);
  });
});
