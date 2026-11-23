import { describe, expect, it } from "vitest";

import { hasExampleContent } from "./sample-content";

const real = { isSample: false, prices: [{ isIllustrative: false }] };

describe("hasExampleContent", () => {
  it("is false once every item and price is confirmed", () => {
    expect(hasExampleContent([real, real])).toBe(false);
    expect(hasExampleContent([{ isSample: false }])).toBe(false);
    expect(hasExampleContent([])).toBe(false);
  });

  it("is true while any item is sample content", () => {
    expect(hasExampleContent([real, { isSample: true }])).toBe(true);
  });

  it("is true while any price is an example", () => {
    expect(
      hasExampleContent([
        real,
        {
          isSample: false,
          prices: [{ isIllustrative: false }, { isIllustrative: true }],
        },
      ]),
    ).toBe(true);
  });
});
