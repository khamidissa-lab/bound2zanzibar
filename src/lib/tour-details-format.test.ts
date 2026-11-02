import { describe, expect, it } from "vitest";

import { sampleTours } from "@/data/sample/tours";
import { parseFaqs as parseFaqRows, parseTourSteps } from "@/services/content-mappers";

import {
  parseFaqs,
  parseSteps,
  serializeFaqs,
  serializeSteps,
} from "./tour-details-format";

describe("steps format", () => {
  it("splits title and description on the first colon", () => {
    expect(
      parseSteps("Meet: Pickup at 8:30 if confirmed\n\n  Darajani market  "),
    ).toEqual([
      { title: "Meet", description: "Pickup at 8:30 if confirmed" },
      { title: "Darajani market", description: "" },
    ]);
  });

  it("ignores lines with an empty title", () => {
    expect(parseSteps(": no title")).toEqual([]);
  });

  it("round-trips every sample tour", () => {
    for (const tour of sampleTours) {
      expect(parseSteps(serializeSteps(tour.whatToExpect))).toEqual(tour.whatToExpect);
    }
  });
});

describe("FAQ format", () => {
  it("reads question/answer blocks", () => {
    expect(parseFaqs("Q one?\nAnswer one.\n\nQ two?\nLine A\nLine B")).toEqual([
      { question: "Q one?", answer: "Answer one." },
      { question: "Q two?", answer: "Line A Line B" },
    ]);
  });

  it("round-trips every sample tour", () => {
    for (const tour of sampleTours) {
      expect(parseFaqs(serializeFaqs(tour.faqs))).toEqual(tour.faqs);
    }
  });
});

describe("sample tours", () => {
  it("every tour has More details content", () => {
    expect(sampleTours.length).toBeGreaterThanOrEqual(25);
    for (const tour of sampleTours) {
      expect(tour.whatToExpect.length, tour.slug).toBeGreaterThan(0);
      expect(tour.goodToKnow.length, tour.slug).toBeGreaterThan(0);
      expect(tour.faqs.length, tour.slug).toBeGreaterThan(0);
    }
  });

  it("slugs are unique", () => {
    const slugs = sampleTours.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe("database JSON parsing", () => {
  it("keeps only well-formed steps and FAQs", () => {
    expect(
      parseTourSteps([
        { title: "A", description: "b" },
        { title: "" },
        "x",
        { title: 1 },
      ]),
    ).toEqual([{ title: "A", description: "b" }]);
    expect(
      parseFaqRows([{ question: "Q", answer: "A" }, { question: "Q" }, null]),
    ).toEqual([{ question: "Q", answer: "A" }]);
    expect(parseTourSteps({})).toEqual([]);
  });
});
