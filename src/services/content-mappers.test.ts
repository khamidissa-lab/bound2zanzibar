import { describe, expect, it } from "vitest";

import { groupPrices, parseArticleBody, splitParagraphs } from "./content-mappers";

const price = (
  market: "resident" | "international" | "east_african",
  customer_type: "adult" | "child" | "group",
  amount: number,
  extra: Partial<{ currency: string; is_active: boolean; is_illustrative: boolean }> = {},
) => ({
  market,
  customer_type,
  amount,
  currency: market === "international" ? "USD" : "TZS",
  unit_label: "per person",
  is_illustrative: false,
  is_active: true,
  ...extra,
});

describe("groupPrices", () => {
  it("combines adult and child rows per market and currency", () => {
    expect(
      groupPrices([
        price("resident", "child", 30000),
        price("resident", "adult", 50000),
        price("international", "adult", 25, { is_illustrative: true }),
      ]),
    ).toEqual([
      {
        market: "international",
        currency: "USD",
        adult: 25,
        child: null,
        unit: "per person",
        isIllustrative: true,
      },
      {
        market: "resident",
        currency: "TZS",
        adult: 50000,
        child: 30000,
        unit: "per person",
        isIllustrative: false,
      },
    ]);
  });

  it("drops inactive rows, group rows and markets without an adult price", () => {
    expect(
      groupPrices([
        price("resident", "adult", 1, { is_active: false }),
        price("resident", "child", 1),
        price("international", "group", 100),
      ]),
    ).toEqual([]);
  });
});

describe("splitParagraphs", () => {
  it("splits on blank lines", () => {
    expect(splitParagraphs("One\nline\n\n  \nTwo\r\n\r\nThree")).toEqual([
      "One\nline",
      "Two",
      "Three",
    ]);
    expect(splitParagraphs(null)).toEqual([]);
  });
});

describe("parseArticleBody", () => {
  it("keeps only well-formed sections", () => {
    expect(
      parseArticleBody([
        { heading: "Ok", paragraphs: ["a", "", 3] },
        { heading: 1, paragraphs: [] },
        "junk",
      ]),
    ).toEqual([{ heading: "Ok", paragraphs: ["a"] }]);
    expect(parseArticleBody({})).toEqual([]);
  });
});
