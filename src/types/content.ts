/**
 * Domain content types. These mirror the planned Supabase schema
 * (docs/DATABASE_SCHEMA.md) so the sample data layer can later be replaced by
 * database reads in `src/services` without touching components.
 */

export type PublishStatus = "draft" | "published" | "archived";

export type Market = "resident" | "east_african" | "international";
export type Currency = "TZS" | "USD";

/** Visual theme for generated placeholder art until real photography exists. */
export type SceneTheme = "ocean" | "sunset" | "town" | "forest" | "spice" | "savanna";

export type MediaImage = {
  /** `null` until licensed photography is supplied; a placeholder is rendered. */
  src: string | null;
  alt: string;
  theme: SceneTheme;
};

export type PriceRecord = {
  market: Market;
  currency: Currency;
  adult: number;
  /** `null` when a child price does not apply or is not configured. */
  child: number | null;
  /** Unit wording, e.g. "per person". */
  unit: string;
  /** True until the owner approves real prices. */
  isIllustrative: boolean;
};

export type Seo = {
  title: string;
  description: string;
};

export type TourCategory = {
  /** Database id (absent for built-in sample data). */
  id?: string;
  slug: string;
  name: string;
  description: string;
};

export type Difficulty = "easy" | "moderate" | "challenging";

/** How long a tour takes, for filtering ("duration" holds the exact wording). */
export type TourLength = "hours" | "half_day" | "full_day" | "multi_day";

export type TravelStyle =
  "luxury" | "adventure" | "romantic" | "family" | "cultural" | "relaxation" | "wildlife";

export type Tour = {
  /** Database id (absent for built-in sample data). */
  id?: string;
  /** Set when shown in a language whose text was machine translated. */
  machineTranslated?: boolean;
  slug: string;
  name: string;
  shortDescription: string;
  description: string[];
  categorySlug: string;
  destinationSlug: string;
  /** Human-readable, e.g. "Half day (approx. 3–4 hours)". */
  duration: string;
  /** `null` until staff set it; such tours only appear when length isn't filtered. */
  length: TourLength | null;
  travelStyles: TravelStyle[];
  highlights: string[];
  included: string[];
  excluded: string[];
  whatToBring: string[];
  meetingPoint: string;
  difficulty: Difficulty;
  suitability: string;
  /** "More details": the experience step by step. */
  whatToExpect: TourStep[];
  /** "More details": practical notes (timing, tides, dress, health). */
  goodToKnow: string[];
  /** Tour-specific questions; general booking FAQs are added by the page. */
  faqs: Faq[];
  /** Optional priced extras, chosen on the booking form. */
  options: TourOption[];
  coverImage: MediaImage;
  gallery: MediaImage[];
  prices: PriceRecord[];
  featured: boolean;
  status: PublishStatus;
  seo: Seo;
  isSample: boolean;
};

export type OptionPricing = "per_person" | "per_booking";

/** A priced extra a visitor can add when booking a tour. */
export type TourOption = {
  id: string;
  name: string;
  description: string;
  pricing: OptionPricing;
  /** One per market and currency; never converted. */
  prices: { market: Market; currency: Currency; amount: number }[];
};

export type TourStep = {
  title: string;
  description: string;
};

export type Faq = {
  question: string;
  answer: string;
};

export type DestinationRegion = "zanzibar" | "mainland";

export type Destination = {
  /** Database id (absent for built-in sample data). */
  id?: string;
  /** Set when shown in a language whose text was machine translated. */
  machineTranslated?: boolean;
  slug: string;
  name: string;
  region: DestinationRegion;
  summary: string;
  description: string[];
  highlights: string[];
  coverImage: MediaImage;
  featured: boolean;
  status: PublishStatus;
  seo: Seo;
  isSample: boolean;
};

export type ItineraryDay = {
  day: number;
  title: string;
  description: string;
  overnight: string | null;
  meals: string[];
};

export type TourPackage = {
  /** Database id (absent for built-in sample data). */
  id?: string;
  /** Set when shown in a language whose text was machine translated. */
  machineTranslated?: boolean;
  slug: string;
  name: string;
  summary: string;
  description: string[];
  days: number;
  nights: number;
  destinationSlugs: string[];
  includedTourSlugs: string[];
  itinerary: ItineraryDay[];
  accommodation: string;
  transfers: string;
  meals: string;
  included: string[];
  excluded: string[];
  terms: string[];
  coverImage: MediaImage;
  prices: PriceRecord[];
  featured: boolean;
  isSafari: boolean;
  travelStyles: TravelStyle[];
  status: PublishStatus;
  seo: Seo;
  isSample: boolean;
};

export type ArticleSection = {
  heading: string;
  paragraphs: string[];
};

export type Article = {
  /** Database id (absent for built-in sample data). */
  id?: string;
  /** Set when shown in a language whose text was machine translated. */
  machineTranslated?: boolean;
  slug: string;
  title: string;
  excerpt: string;
  /** ISO date (YYYY-MM-DD). */
  publishedOn: string;
  readingMinutes: number;
  tags: string[];
  coverImage: MediaImage;
  sections: ArticleSection[];
  status: PublishStatus;
  seo: Seo;
  isSample: boolean;
};
