import { describe, expect, it } from "vitest";

import { groupByCircuit } from "./safari-circuits";

describe("groupByCircuit", () => {
  it("groups listed safaris in the owner's order and keeps unlisted ones", () => {
    const groups = groupByCircuit([
      { slug: "mikumi-day-safari" },
      { slug: "a-new-safari" },
      { slug: "tarangire-national-park-safari" },
      { slug: "serengeti-national-park-safari" },
    ]);
    expect(groups.map((g) => [g.id, g.tours.map((t) => t.slug)])).toEqual([
      ["northern", ["serengeti-national-park-safari", "tarangire-national-park-safari"]],
      ["southern", ["mikumi-day-safari"]],
      ["more", ["a-new-safari"]],
    ]);
  });

  it("returns no groups for no tours", () => {
    expect(groupByCircuit([])).toEqual([]);
  });
});
