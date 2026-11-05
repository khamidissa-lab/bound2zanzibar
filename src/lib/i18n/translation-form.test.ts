import { describe, expect, it } from "vitest";

import { fieldKind, formToFields, listToText } from "./translation-form";

const source = {
  name: "Stone Town City Tour",
  description: ["First paragraph.", "Second paragraph."],
  highlights: ["Carved doors", "Darajani market"],
  faqs: [{ question: "Is it hot?", answer: "Often." }],
  itinerary: [
    { day: 1, title: "Arrival", description: "Land.", overnight: null, meals: [] },
  ],
  seoTitle: "",
};

describe("fieldKind / listToText", () => {
  it("chooses an editor for each value", () => {
    expect(fieldKind("name", source.name)).toBe("text");
    expect(fieldKind("description", source.description)).toBe("paragraphs");
    expect(fieldKind("highlights", source.highlights)).toBe("list");
    expect(fieldKind("faqs", source.faqs)).toBe("items");
    expect(fieldKind("x", "a".repeat(200))).toBe("longText");
  });

  it("joins paragraphs with blank lines and lists with new lines", () => {
    expect(listToText("description", source.description)).toBe(
      "First paragraph.\n\nSecond paragraph.",
    );
    expect(listToText("highlights", source.highlights)).toBe(
      "Carved doors\nDarajani market",
    );
  });
});

describe("formToFields", () => {
  it("builds the translation and leaves empty fields to English", () => {
    const fields = formToFields(source, {
      "f.name": " Visite de Stone Town ",
      "f.description": "Premier.\n\nDeuxième.",
      "f.highlights": "Portes sculptées\n\nMarché de Darajani\n",
      "f.faqs.0.question": "Fait-il chaud ?",
      "f.faqs.0.answer": "",
      "f.seoTitle": "",
    });
    expect(fields).toEqual({
      name: "Visite de Stone Town",
      description: ["Premier.", "Deuxième."],
      highlights: ["Portes sculptées", "Marché de Darajani"],
      // An empty answer keeps the English answer inside a translated FAQ.
      faqs: [{ question: "Fait-il chaud ?", answer: "Often." }],
    });
  });

  it("keeps day numbers and nulls in itinerary days", () => {
    const fields = formToFields(source, { "f.itinerary.0.title": "Arrivée" });
    expect(fields.itinerary).toEqual([
      { day: 1, title: "Arrivée", description: "Land.", overnight: null, meals: [] },
    ]);
  });

  it("returns nothing when the form is empty", () => {
    expect(formToFields(source, {})).toEqual({});
  });
});
