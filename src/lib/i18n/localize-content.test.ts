import { describe, expect, it } from "vitest";

import { samplePackages } from "@/data/sample/packages";
import { sampleTours } from "@/data/sample/tours";

import { localizePackage, localizeTour, sourceFields } from "./localize-content";

const tour = sampleTours[0];
const pkg = samplePackages[0];

describe("localizeTour", () => {
  it("returns the English tour when there is no translation", () => {
    expect(localizeTour(tour)).toBe(tour);
  });

  it("applies translated fields and flags machine translations", () => {
    const fr = localizeTour(tour, {
      isMachine: true,
      fields: {
        name: "Visite de Stone Town",
        highlights: ["Portes sculptées"],
        faqs: [{ question: "Q ?", answer: "R." }],
      },
    });
    expect(fr.name).toBe("Visite de Stone Town");
    expect(fr.highlights).toEqual(["Portes sculptées"]);
    expect(fr.faqs).toEqual([{ question: "Q ?", answer: "R." }]);
    expect(fr.seo.title).toBe("Visite de Stone Town");
    expect(fr.machineTranslated).toBe(true);
    // Untranslated fields and business data stay as they are.
    expect(fr.shortDescription).toBe(tour.shortDescription);
    expect(fr.prices).toBe(tour.prices);
    expect(fr.slug).toBe(tour.slug);
  });

  it("keeps English for empty or malformed values", () => {
    const fr = localizeTour(tour, {
      isMachine: false,
      fields: { name: "  ", highlights: [1, 2], whatToExpect: [{ title: "x" }] },
    });
    expect(fr.name).toBe(tour.name);
    expect(fr.highlights).toEqual(tour.highlights);
    expect(fr.whatToExpect).toEqual(tour.whatToExpect);
  });

  it("round-trips its own source fields", () => {
    const same = localizeTour(tour, {
      isMachine: false,
      fields: sourceFields("tours", tour),
    });
    expect({ ...same, machineTranslated: undefined }).toEqual({
      ...tour,
      machineTranslated: undefined,
    });
  });
});

describe("localizePackage", () => {
  it("translates itinerary days by day number and keeps the rest", () => {
    const fr = localizePackage(pkg, {
      isMachine: true,
      fields: { itinerary: [{ day: 2, title: "Jour deux", description: "Texte." }] },
    });
    expect(fr.itinerary[1]).toMatchObject({
      day: 2,
      title: "Jour deux",
      description: "Texte.",
    });
    expect(fr.itinerary[0]).toEqual(pkg.itinerary[0]);
    expect(fr.days).toBe(pkg.days);
  });
});
