/**
 * Turns a content item's English fields into an editable translation form
 * and back. The English source decides the shape, so a saved translation
 * always matches what the website expects. Pure, for tests and the admin.
 */

export type FieldKind = "text" | "longText" | "list" | "paragraphs" | "items";

/** Admin labels for translatable fields. */
export const FIELD_LABELS: Record<string, string> = {
  name: "Name",
  title: "Title",
  shortDescription: "Short description",
  summary: "Summary",
  excerpt: "Excerpt",
  description: "Description",
  duration: "Duration",
  highlights: "Highlights",
  included: "Included",
  excluded: "Not included",
  whatToBring: "What to bring",
  meetingPoint: "Meeting point & pickup",
  suitability: "Suitability",
  whatToExpect: "What to expect (steps)",
  goodToKnow: "Good to know",
  faqs: "Tour FAQs",
  accommodation: "Accommodation",
  transfers: "Transfers",
  meals: "Meals",
  terms: "Terms",
  itinerary: "Day-by-day itinerary",
  sections: "Article sections",
  coverImageAlt: "Cover photo description (alt text)",
  seoTitle: "Search engine title",
  seoDescription: "Search engine description",
  // Sub-fields of steps, FAQs, itinerary days and sections.
  question: "Question",
  answer: "Answer",
  heading: "Heading",
  paragraphs: "Paragraphs",
  overnight: "Overnight",
};

/** Lists of paragraphs are edited with blank lines between them. */
const PARAGRAPH_KEYS = new Set(["description", "paragraphs"]);

export function fieldKind(key: string, value: unknown): FieldKind {
  if (Array.isArray(value)) {
    if (value.length > 0 && typeof value[0] === "object") return "items";
    return PARAGRAPH_KEYS.has(key) ? "paragraphs" : "list";
  }
  return typeof value === "string" && value.length > 120 ? "longText" : "text";
}

/** Text shown in a textarea for a list value. */
export function listToText(key: string, value: unknown): string {
  if (!Array.isArray(value)) return typeof value === "string" ? value : "";
  return value.join(PARAGRAPH_KEYS.has(key) ? "\n\n" : "\n");
}

function textToList(key: string, text: string): string[] {
  return text
    .split(PARAGRAPH_KEYS.has(key) ? /\n\s*\n/ : /\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Form field name for a value: f.name, f.faqs.0.question, … */
export const formName = (...path: (string | number)[]) => ["f", ...path].join(".");

/**
 * Builds the translation to save from submitted form values. Empty answers
 * are left out so the website falls back to English for them; inside steps,
 * FAQs and itinerary days an empty text keeps the English text.
 */
export function formToFields(
  source: Record<string, unknown>,
  values: Record<string, string>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, src] of Object.entries(source)) {
    const kind = fieldKind(key, src);
    if (kind === "items" && Array.isArray(src)) {
      const items = src.map((item, i) => {
        const result: Record<string, unknown> = {};
        for (const [sub, subSrc] of Object.entries(item as Record<string, unknown>)) {
          const raw = values[formName(key, i, sub)];
          if (typeof subSrc === "string") {
            result[sub] = raw?.trim() || subSrc;
          } else if (Array.isArray(subSrc)) {
            const list = textToList(sub, raw ?? "");
            result[sub] = list.length > 0 ? list : subSrc;
          } else {
            result[sub] = subSrc; // numbers (day) and nulls stay as they are
          }
        }
        return result;
      });
      const anyTranslated = src.some((item, i) =>
        Object.entries(item as Record<string, unknown>).some(
          ([sub, subSrc]) =>
            typeof subSrc !== "number" &&
            subSrc !== null &&
            (values[formName(key, i, sub)] ?? "").trim() !== "",
        ),
      );
      if (anyTranslated) out[key] = items;
    } else if (kind === "list" || kind === "paragraphs") {
      const list = textToList(key, values[formName(key)] ?? "");
      if (list.length > 0) out[key] = list;
    } else {
      const text = (values[formName(key)] ?? "").trim();
      if (text) out[key] = text;
    }
  }
  return out;
}
