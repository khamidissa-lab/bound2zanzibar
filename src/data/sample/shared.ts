import type { MediaImage, PriceRecord, SceneTheme, Tour } from "@/types/content";

/**
 * Builds the two-market illustrative price records used by sample content.
 * Values are placeholders for layout only and must be replaced by
 * owner-approved prices (managed in the admin from Phase 5).
 */
export function illustrativePrices(
  usd: { adult: number; child: number | null },
  tzs: { adult: number; child: number | null },
  unit = "per person",
): PriceRecord[] {
  return [
    { market: "international", currency: "USD", ...usd, unit, isIllustrative: true },
    { market: "resident", currency: "TZS", ...tzs, unit, isIllustrative: true },
  ];
}

/** A tour without its "More details" content (merged in from tour-details.ts). */
export type TourBase = Omit<
  Tour,
  "whatToExpect" | "goodToKnow" | "faqs" | "length" | "travelStyles"
>;

/** Placeholder image (no photo yet) with a themed illustration. */
export const img = (alt: string, theme: SceneTheme): MediaImage => ({
  src: null,
  alt,
  theme,
});

export const standardExclusions = [
  "Personal expenses and tips",
  "Drinks unless stated",
  "Travel insurance",
];
