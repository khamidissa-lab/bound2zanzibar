import { contact, siteConfig, socialLinks } from "@/config/site";
import { generalTourFaqs } from "@/config/tour-faqs";
import { formatPrice, marketLabels } from "@/lib/format";
import type {
  Destination,
  PriceRecord,
  Tour,
  TourCategory,
  TourPackage,
} from "@/types/content";

export type AssistantKnowledgeInput = {
  tours: Tour[];
  packages: TourPackage[];
  destinations: Destination[];
  categories: TourCategory[];
};

const list = (items: string[]) => (items.length > 0 ? items.join("; ") : "—");

function priceLines(prices: PriceRecord[]): string {
  if (prices.length === 0) return "Prices: not published — the team quotes on request.";
  const illustrative = prices.some((p) => p.isIllustrative);
  const lines = prices.map((p) => {
    const child = p.child === null ? "" : `, child ${formatPrice(p.child, p.currency)}`;
    return `  - ${marketLabels[p.market].long}: adult ${formatPrice(p.adult, p.currency)}${child} ${p.unit}`;
  });
  return [
    illustrative
      ? "Prices (ILLUSTRATIVE samples, not final — the team confirms the real price):"
      : "Prices (the team confirms the final price):",
    ...lines,
  ].join("\n");
}

/**
 * The site's published content as plain text. Deterministic for a given input
 * so the system prompt stays byte-identical between requests (prompt caching).
 */
export function buildKnowledge({
  tours,
  packages,
  destinations,
  categories,
}: AssistantKnowledgeInput): string {
  const category = Object.fromEntries(categories.map((c) => [c.slug, c.name]));
  const destination = Object.fromEntries(destinations.map((d) => [d.slug, d.name]));
  const tourName = Object.fromEntries(tours.map((t) => [t.slug, t.name]));

  const tourBlocks = tours.map((t) =>
    [
      `### ${t.name}`,
      `Page: /tours/${t.slug}`,
      `Category: ${category[t.categorySlug] ?? t.categorySlug} | Area: ${destination[t.destinationSlug] ?? t.destinationSlug} | Duration: ${t.duration} | Difficulty: ${t.difficulty}`,
      `Suitability: ${t.suitability}`,
      `Summary: ${t.shortDescription}`,
      `Highlights: ${list(t.highlights)}`,
      `What to expect: ${list(t.whatToExpect.map((s) => `${s.title} — ${s.description}`))}`,
      `Included: ${list(t.included)}`,
      `Not included: ${list(t.excluded)}`,
      `What to bring: ${list(t.whatToBring)}`,
      `Meeting point: ${t.meetingPoint}`,
      `Good to know: ${list(t.goodToKnow)}`,
      ...t.faqs.map((f) => `Q: ${f.question} A: ${f.answer}`),
      priceLines(t.prices),
    ].join("\n"),
  );

  const packageBlocks = packages.map((p) =>
    [
      `### ${p.name}`,
      `Page: /packages/${p.slug}`,
      `${p.days} days / ${p.nights} nights${p.isSafari ? " | includes safari" : ""}`,
      `Summary: ${p.summary}`,
      `Areas: ${list(p.destinationSlugs.map((s) => destination[s] ?? s))}`,
      `Tours included: ${list(p.includedTourSlugs.map((s) => tourName[s] ?? s))}`,
      `Itinerary: ${list(p.itinerary.map((d) => `Day ${d.day}: ${d.title}`))}`,
      `Accommodation: ${p.accommodation} | Transfers: ${p.transfers} | Meals: ${p.meals}`,
      `Included: ${list(p.included)}`,
      `Not included: ${list(p.excluded)}`,
      priceLines(p.prices),
    ].join("\n"),
  );

  const destinationBlocks = destinations.map((d) =>
    [
      `### ${d.name} (${d.region === "zanzibar" ? "Zanzibar" : "Tanzania mainland"})`,
      `Page: /destinations/${d.slug}`,
      `Summary: ${d.summary}`,
      `Highlights: ${list(d.highlights)}`,
    ].join("\n"),
  );

  const instagram = socialLinks.find((s) => s.label === "Instagram");

  return [
    "## Company and booking facts",
    `Company: ${siteConfig.name}. ${siteConfig.description}`,
    `Email: ${contact.email}`,
    `Phone: ${contact.phoneDisplay}`,
    instagram?.href ? `Instagram: ${instagram.handle} (${instagram.href})` : "",
    "Office address: not published on the website yet.",
    "Booking: visitors send a booking request at /book or by email/phone. A request is NOT a confirmed booking — the team replies to confirm availability and the final price in writing. No payment or card details are taken on the website.",
    "Prices are set separately per market (international visitors in USD; Tanzanian and East African residents may have TZS prices). Prices are never converted between currencies.",
    ...generalTourFaqs.map((f) => `Q: ${f.question} A: ${f.answer}`),
    "Other pages: /tours (all tours), /safari, /packages, /destinations, /travel-guide, /about, /contact, /book",
    "## Tours",
    ...tourBlocks,
    "## Multi-day packages",
    ...packageBlocks,
    "## Destinations",
    ...destinationBlocks,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export const ASSISTANT_RULES = `You are the virtual travel assistant on the ${siteConfig.name} website, a Zanzibar tour and Tanzania safari company. Website visitors ask you about tours, safaris, packages, destinations, prices and how to book.

How to answer:
- Base every fact about the company, its tours, prices, inclusions, timings and policies on the website information below. If the answer is not there, say you don't have that detail and suggest contacting the team (email ${contact.email} or phone ${contact.phoneDisplay}) or sending a request at /book. Never guess or invent tours, prices, discounts, availability, schedules, policies, reviews, licences or company details.
- General travel knowledge about Zanzibar and Tanzania (weather, culture, what to wear, wildlife) is fine to share, but keep it general and say when something should be checked (visas, health and vaccination rules, entry requirements change — advise checking official sources).
- When you mention a price, quote it exactly as listed with its currency code and market, and say it is an illustrative sample if it is marked so. Never convert currencies or calculate discounts.
- You cannot make, confirm, change or cancel bookings, and you cannot check availability. Explain that a booking request at /book (or by email/phone) is answered by the team, who confirm availability and the final price in writing.
- Never ask for or accept card or payment details. If a visitor shares them, tell them not to and that no payment is taken on the website.
- When you recommend a tour, package or page, include its page path exactly as listed (for example /tours/prison-island-tour) so the visitor can open it.
- Stay on topic: travel with ${siteConfig.name}. Politely decline unrelated requests.
- Reply in the visitor's language. Be warm, concise and practical: usually 2–5 short sentences or a short "- " bullet list. Plain text only — no headings, tables or bold markers.`;

export function buildSystemPrompt(input: AssistantKnowledgeInput): string {
  return `${ASSISTANT_RULES}\n\n<website_information>\n${buildKnowledge(input)}\n</website_information>`;
}

/**
 * A one-line note naming the page the visitor is on, so questions like "what's
 * included in this tour?" resolve. Only known content names are used; the raw
 * path is never echoed into the prompt.
 */
export function describePage(
  page: string | undefined,
  content: Pick<AssistantKnowledgeInput, "tours" | "packages" | "destinations">,
): string | null {
  if (!page) return null;
  const [, section, slug] = page.split("/");
  const lookup = {
    tours: content.tours,
    packages: content.packages,
    destinations: content.destinations,
  } as const;
  if (slug && section in lookup) {
    const item = lookup[section as keyof typeof lookup].find((i) => i.slug === slug);
    if (item) {
      const kind = { tours: "tour", packages: "package", destinations: "destination" }[
        section as keyof typeof lookup
      ];
      return `The visitor is currently viewing the ${kind} page "${item.name}" (/${section}/${slug}). If they say "this ${kind}", they mean this one.`;
    }
  }
  // A detail path whose item is unknown (unpublished or mistyped): say nothing.
  if (slug) return null;
  const sections: Record<string, string> = {
    tours: "the list of all tours",
    packages: "the packages list",
    destinations: "the destinations list",
    safari: "the safari page",
    book: "the booking request page",
    contact: "the contact page",
  };
  const label = sections[section ?? ""];
  return label ? `The visitor is currently viewing ${label}.` : null;
}
