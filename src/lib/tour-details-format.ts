import type { Faq, TourStep } from "@/types/content";

/*
 * Plain-text formats for editing a tour's "More details" in the admin.
 *
 * What to expect — one step per line, "Title: description":
 *   Meet your guide: Pickup from your hotel.
 *   Darajani market
 *
 * FAQs — question on the first line, answer below; blank line between FAQs:
 *   Is it suitable for children?
 *   Yes, the pace is relaxed.
 */

export function parseSteps(text: string): TourStep[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const colon = line.indexOf(":");
      if (colon < 0) return { title: line, description: "" };
      return {
        title: line.slice(0, colon).trim(),
        description: line.slice(colon + 1).trim(),
      };
    })
    .filter((step) => step.title !== "");
}

export function serializeSteps(steps: TourStep[]): string {
  return steps
    .map((s) => (s.description ? `${s.title}: ${s.description}` : s.title))
    .join("\n");
}

export function parseFaqs(text: string): Faq[] {
  return text
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((block) =>
      block
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean),
    )
    .filter((lines) => lines.length > 0)
    .map(([question, ...answer]) => ({ question, answer: answer.join(" ") }));
}

export function serializeFaqs(faqs: Faq[]): string {
  return faqs.map((f) => `${f.question}\n${f.answer}`).join("\n\n");
}
