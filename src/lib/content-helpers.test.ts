import { describe, expect, it } from "vitest";

import { parseArticleMarkup, serializeArticleMarkup } from "./article-markup";
import { mediaUrl, storageFileName } from "./media";
import { slugify } from "./slug";

describe("slugify", () => {
  it.each([
    ["Safari Blue — Menai Bay!", "safari-blue-menai-bay"],
    ["Nungwi & Kendwa", "nungwi-and-kendwa"],
    ["  Jozani   Forest  ", "jozani-forest"],
    ["Café Zanzibar", "cafe-zanzibar"],
    ["!!!", ""],
  ])("%s → %s", (input, expected) => {
    expect(slugify(input)).toBe(expected);
  });
});

describe("article markup", () => {
  const markup = `Intro paragraph
continues here.

## Seasons
Dry season.

Rainy season.

## Packing
Hat.`;

  it("parses headings and paragraphs", () => {
    expect(parseArticleMarkup(markup)).toEqual([
      { heading: "", paragraphs: ["Intro paragraph continues here."] },
      { heading: "Seasons", paragraphs: ["Dry season.", "Rainy season."] },
      { heading: "Packing", paragraphs: ["Hat."] },
    ]);
  });

  it("round-trips through serialize", () => {
    const sections = parseArticleMarkup(markup);
    expect(parseArticleMarkup(serializeArticleMarkup(sections))).toEqual(sections);
  });

  it("treats HTML as plain text", () => {
    expect(parseArticleMarkup("## <b>Hi</b>\n<script>x</script>")).toEqual([
      { heading: "<b>Hi</b>", paragraphs: ["<script>x</script>"] },
    ]);
  });
});

describe("media helpers", () => {
  it("builds safe storage names", () => {
    expect(storageFileName("Stone Town Doors (1).JPG", "abc123")).toBe(
      "abc123-stone-town-doors-1.jpg",
    );
    expect(storageFileName("../../etc/passwd", "x")).toBe("x-passwd");
    expect(storageFileName("C:\\photos\\Beach.webp", "x")).toBe("x-beach.webp");
  });

  it("returns null without a path", () => {
    expect(mediaUrl(null)).toBeNull();
  });
});
