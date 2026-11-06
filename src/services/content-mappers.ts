import { toTravelStyles } from "@/lib/discovery";
import { mediaUrl, themeForCategory } from "@/lib/media";
import type { Tables } from "@/lib/supabase/database.types";
import type {
  Article,
  ArticleSection,
  Currency,
  Destination,
  Faq,
  MediaImage,
  PriceRecord,
  SceneTheme,
  Tour,
  TourCategory,
  TourPackage,
  TourStep,
} from "@/types/content";

/**
 * Pure mappers from database rows (with embedded relations) to the domain
 * types the public pages render. Kept free of I/O so they are unit-tested.
 */

type PriceRow = Pick<
  Tables<"tour_prices">,
  | "market"
  | "customer_type"
  | "currency"
  | "amount"
  | "unit_label"
  | "is_illustrative"
  | "is_active"
>;

export type TourRow = Tables<"tours"> & {
  category: Pick<Tables<"tour_categories">, "slug" | "name"> | null;
  destination: Pick<Tables<"destinations">, "slug" | "name" | "region"> | null;
  tour_prices: PriceRow[];
  tour_images: Pick<Tables<"tour_images">, "storage_path" | "alt_text" | "sort_order">[];
  tour_options?: (Pick<
    Tables<"tour_options">,
    "id" | "name" | "description" | "pricing" | "sort_order" | "is_active"
  > & {
    tour_option_prices: Pick<
      Tables<"tour_option_prices">,
      "market" | "currency" | "amount"
    >[];
  })[];
};

export type PackageRow = Tables<"packages"> & {
  package_prices: PriceRow[];
  package_itinerary_days: Pick<
    Tables<"package_itinerary_days">,
    "day_number" | "title" | "description" | "meals" | "overnight"
  >[];
  package_tours: { tour: { slug: string } | null }[];
  package_destinations: { sort_order: number; destination: { slug: string } | null }[];
};

const MARKET_ORDER = { international: 0, resident: 1, east_african: 2 } as const;

/** Paragraphs are stored as one text field separated by blank lines. */
export function splitParagraphs(text: string | null | undefined): string[] {
  return (text ?? "")
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Collapses per-customer-type rows into one record per market + currency. */
export function groupPrices(rows: PriceRow[], defaultUnit = "per person"): PriceRecord[] {
  const groups = new Map<string, PriceRecord>();
  for (const row of rows) {
    if (!row.is_active || row.customer_type === "group") continue;
    const key = `${row.market}:${row.currency}`;
    const existing = groups.get(key) ?? {
      market: row.market,
      currency: row.currency as Currency,
      adult: Number.NaN,
      child: null,
      unit: row.unit_label || defaultUnit,
      isIllustrative: false,
    };
    if (row.customer_type === "adult") existing.adult = Number(row.amount);
    if (row.customer_type === "child") existing.child = Number(row.amount);
    existing.isIllustrative ||= row.is_illustrative;
    groups.set(key, existing);
  }
  return [...groups.values()]
    .filter((p) => Number.isFinite(p.adult))
    .sort((a, b) => MARKET_ORDER[a.market] - MARKET_ORDER[b.market]);
}

function image(
  path: string | null,
  alt: string | null,
  fallbackAlt: string,
  theme: SceneTheme,
): MediaImage {
  return { src: mediaUrl(path), alt: alt?.trim() || fallbackAlt, theme };
}

const nonEmptyString = (v: unknown): v is string =>
  typeof v === "string" && v.trim() !== "";

/** Accepts only well-formed `{ title, description }` steps. */
export function parseTourSteps(value: unknown): TourStep[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((step): TourStep[] => {
    if (typeof step !== "object" || step === null) return [];
    const { title, description } = step as Record<string, unknown>;
    if (!nonEmptyString(title)) return [];
    return [{ title, description: typeof description === "string" ? description : "" }];
  });
}

/** Accepts only well-formed `{ question, answer }` pairs. */
export function parseFaqs(value: unknown): Faq[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((faq): Faq[] => {
    if (typeof faq !== "object" || faq === null) return [];
    const { question, answer } = faq as Record<string, unknown>;
    return nonEmptyString(question) && nonEmptyString(answer)
      ? [{ question, answer }]
      : [];
  });
}

export function mapCategory(row: Tables<"tour_categories">): TourCategory {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? "",
  };
}

export function mapTour(row: TourRow): Tour {
  const theme = themeForCategory(row.category?.slug);
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description,
    description: splitParagraphs(row.description),
    categorySlug: row.category?.slug ?? "",
    destinationSlug: row.destination?.slug ?? "",
    duration: row.duration_text,
    length: row.length,
    travelStyles: toTravelStyles(row.travel_styles),
    highlights: row.highlights,
    included: row.inclusions,
    excluded: row.exclusions,
    whatToBring: row.what_to_bring,
    meetingPoint: row.meeting_point ?? "",
    difficulty: row.difficulty ?? "easy",
    suitability: row.suitability ?? "",
    whatToExpect: parseTourSteps(row.what_to_expect),
    goodToKnow: row.good_to_know,
    faqs: parseFaqs(row.faqs),
    options: [...(row.tour_options ?? [])]
      .filter((o) => o.is_active)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((o) => ({
        id: o.id,
        name: o.name,
        description: o.description ?? "",
        pricing: o.pricing,
        prices: o.tour_option_prices.map((p) => ({
          market: p.market,
          currency: p.currency as Currency,
          amount: Number(p.amount),
        })),
      })),
    coverImage: image(row.cover_image_path, row.cover_image_alt, row.name, theme),
    gallery: [...row.tour_images]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => image(img.storage_path, img.alt_text, row.name, theme)),
    prices: groupPrices(row.tour_prices),
    featured: row.is_featured,
    status: row.status,
    seo: {
      title: row.seo_title || row.name,
      description: row.seo_description || row.short_description,
    },
    isSample: row.is_sample,
  };
}

export function mapDestination(row: Tables<"destinations">): Destination {
  const theme: SceneTheme = row.region === "mainland" ? "savanna" : "ocean";
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    region: row.region,
    summary: row.short_description,
    description: splitParagraphs(row.description),
    highlights: row.highlights,
    coverImage: image(row.cover_image_path, row.cover_image_alt, row.name, theme),
    featured: row.is_featured,
    status: row.status,
    seo: {
      title: row.seo_title || row.name,
      description: row.seo_description || row.short_description,
    },
    isSample: row.is_sample,
  };
}

export function mapPackage(row: PackageRow): TourPackage {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    summary: row.short_description,
    description: splitParagraphs(row.description),
    days: row.days,
    nights: row.nights,
    destinationSlugs: [...row.package_destinations]
      .sort((a, b) => a.sort_order - b.sort_order)
      .flatMap((d) => (d.destination ? [d.destination.slug] : [])),
    includedTourSlugs: row.package_tours.flatMap((t) => (t.tour ? [t.tour.slug] : [])),
    itinerary: [...row.package_itinerary_days]
      .sort((a, b) => a.day_number - b.day_number)
      .map((d) => ({
        day: d.day_number,
        title: d.title,
        description: d.description,
        overnight: d.overnight,
        meals: d.meals,
      })),
    accommodation: row.accommodation_description,
    transfers: row.transfers_description,
    meals: row.meals_description,
    included: row.inclusions,
    excluded: row.exclusions,
    terms: row.terms,
    coverImage: image(
      row.cover_image_path,
      row.cover_image_alt,
      row.name,
      row.is_safari ? "savanna" : "ocean",
    ),
    prices: groupPrices(row.package_prices, "per person sharing"),
    featured: row.is_featured,
    isSafari: row.is_safari,
    travelStyles: toTravelStyles(row.travel_styles),
    status: row.status,
    seo: {
      title: row.seo_title || row.name,
      description: row.seo_description || row.short_description,
    },
    isSample: row.is_sample,
  };
}

/** Accepts only well-formed `{ heading, paragraphs[] }` sections. */
export function parseArticleBody(body: unknown): ArticleSection[] {
  if (!Array.isArray(body)) return [];
  return body.flatMap((section): ArticleSection[] => {
    if (typeof section !== "object" || section === null) return [];
    const { heading, paragraphs } = section as Record<string, unknown>;
    if (typeof heading !== "string" || !Array.isArray(paragraphs)) return [];
    const texts = paragraphs.filter(
      (p): p is string => typeof p === "string" && p.trim() !== "",
    );
    return [{ heading, paragraphs: texts }];
  });
}

export function mapArticle(row: Tables<"blog_posts">): Article {
  const sections = parseArticleBody(row.body);
  const words = sections
    .flatMap((s) => s.paragraphs)
    .join(" ")
    .split(/\s+/).length;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    publishedOn: (row.published_at ?? row.created_at).slice(0, 10),
    readingMinutes: row.reading_minutes ?? Math.max(1, Math.round(words / 200)),
    tags: row.tags,
    coverImage: image(row.cover_image_path, row.cover_image_alt, row.title, "ocean"),
    sections,
    status: row.status,
    seo: {
      title: row.seo_title || row.title,
      description: row.seo_description || row.excerpt,
    },
    isSample: row.is_sample,
  };
}
