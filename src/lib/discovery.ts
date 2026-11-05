import type {
  Currency,
  Difficulty,
  Market,
  PriceRecord,
  Tour,
  TourLength,
  TravelStyle,
} from "@/types/content";

/** Same list and order as the database check (private.valid_travel_styles). */
export const TRAVEL_STYLES: readonly TravelStyle[] = [
  "luxury",
  "adventure",
  "romantic",
  "family",
  "cultural",
  "relaxation",
  "wildlife",
];

export const TOUR_LENGTHS: readonly TourLength[] = [
  "hours",
  "half_day",
  "full_day",
  "multi_day",
];

export const DIFFICULTIES: readonly Difficulty[] = ["easy", "moderate", "challenging"];

export const isTravelStyle = (v: string): v is TravelStyle =>
  (TRAVEL_STYLES as readonly string[]).includes(v);
export const isTourLength = (v: string): v is TourLength =>
  (TOUR_LENGTHS as readonly string[]).includes(v);
export const isDifficulty = (v: string): v is Difficulty =>
  (DIFFICULTIES as readonly string[]).includes(v);

/** Drops anything the app doesn't know, keeping the canonical order. */
export const toTravelStyles = (values: readonly string[]): TravelStyle[] =>
  TRAVEL_STYLES.filter((s) => values.includes(s));

/*
 * Budget bands per person, per currency. Prices are never converted between
 * currencies, so each currency has its own bands. `max` is inclusive.
 */
export type BudgetBand = { id: string; min: number; max: number | null };

export const BUDGET_BANDS: Record<Currency, BudgetBand[]> = {
  USD: [
    { id: "1", min: 0, max: 50 },
    { id: "2", min: 50, max: 150 },
    { id: "3", min: 150, max: 400 },
    { id: "4", min: 400, max: null },
  ],
  TZS: [
    { id: "1", min: 0, max: 125_000 },
    { id: "2", min: 125_000, max: 375_000 },
    { id: "3", min: 375_000, max: 1_000_000 },
    { id: "4", min: 1_000_000, max: null },
  ],
};

export type FromPrice = { amount: number; currency: Currency };

/**
 * The adult price shown for a market (as on the price display), or null when
 * none is set ("price on request"). Never falls back to another market.
 */
export function fromPrice(prices: PriceRecord[], market: Market): FromPrice | null {
  const price = prices.find((p) => p.market === market);
  return price ? { amount: price.adult, currency: price.currency } : null;
}

/** The currency most prices use for a market, for labelling budget bands. */
export function marketCurrency(
  items: { prices: PriceRecord[] }[],
  market: Market,
): Currency {
  const counts = new Map<Currency, number>();
  for (const item of items) {
    const price = fromPrice(item.prices, market);
    if (price) counts.set(price.currency, (counts.get(price.currency) ?? 0) + 1);
  }
  return [...counts].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "USD";
}

/** A band id applies in each price's own currency; unpriced trips never match. */
export function inBudget(price: FromPrice | null, bandId: string): boolean {
  if (!bandId) return true;
  if (!price) return false;
  const band = BUDGET_BANDS[price.currency]?.find((b) => b.id === bandId);
  if (!band) return false;
  return price.amount >= band.min && (band.max === null || price.amount <= band.max);
}

export type TourFilters = {
  query: string;
  category: string;
  destination: string;
  length: TourLength | "";
  style: TravelStyle | "";
  difficulty: Difficulty | "";
  budget: string;
};

export const EMPTY_FILTERS: TourFilters = {
  query: "",
  category: "",
  destination: "",
  length: "",
  style: "",
  difficulty: "",
  budget: "",
};

/** Reads filters from URL search params, ignoring unknown values. */
export function filtersFromParams(get: (key: string) => string | null): TourFilters {
  const length = get("length") ?? "";
  const style = get("style") ?? "";
  const difficulty = get("level") ?? "";
  return {
    query: get("q") ?? "",
    category: get("category") ?? "",
    destination: get("destination") ?? "",
    length: isTourLength(length) ? length : "",
    style: isTravelStyle(style) ? style : "",
    difficulty: isDifficulty(difficulty) ? difficulty : "",
    budget: get("budget") ?? "",
  };
}

/** URL parameter name for each filter. */
export const FILTER_PARAMS: Record<keyof TourFilters, string> = {
  query: "q",
  category: "category",
  destination: "destination",
  length: "length",
  style: "style",
  difficulty: "level",
  budget: "budget",
};

function matchesQuery(tour: Tour, query: string) {
  if (!query) return true;
  const haystack = [tour.name, tour.shortDescription, ...tour.highlights]
    .join(" ")
    .toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

export function filterTours(tours: Tour[], f: TourFilters, market: Market): Tour[] {
  return tours.filter(
    (tour) =>
      (!f.category || tour.categorySlug === f.category) &&
      (!f.destination || tour.destinationSlug === f.destination) &&
      (!f.length || tour.length === f.length) &&
      (!f.style || tour.travelStyles.includes(f.style)) &&
      (!f.difficulty || tour.difficulty === f.difficulty) &&
      inBudget(fromPrice(tour.prices, market), f.budget) &&
      matchesQuery(tour, f.query),
  );
}
