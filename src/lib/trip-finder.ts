import type {
  DestinationRegion,
  Market,
  Tour,
  TourPackage,
  TravelStyle,
} from "@/types/content";

import { fromPrice, inBudget, isSafariTour } from "./discovery";

/*
 * Trip finder: ranks the existing published tours and packages against a
 * visitor's answers. It only recommends what is already on the site and
 * shows each item's own stored price; it never implies availability.
 */

export type Where = "zanzibar" | "mainland" | "both";
export type Days = "1" | "2-3" | "4-7" | "8+";

export const WHERE_OPTIONS: readonly Where[] = ["zanzibar", "mainland", "both"];
export const DAYS_OPTIONS: readonly Days[] = ["1", "2-3", "4-7", "8+"];

export type FinderAnswers = {
  where: Where | "";
  /** Tour category slugs the visitor is interested in. */
  interests: string[];
  days: Days | "";
  /** Budget band id (see BUDGET_BANDS), "" for no preference. */
  budget: string;
  adults: number;
  children: number;
  styles: TravelStyle[];
};

export const EMPTY_ANSWERS: FinderAnswers = {
  where: "",
  interests: [],
  days: "",
  budget: "",
  adults: 2,
  children: 0,
  styles: [],
};

/** Why an item was recommended, shown as short labels on each result. */
export type Reason =
  | { kind: "style"; style: TravelStyle }
  | { kind: "interest"; category: string }
  | { kind: "budget" }
  | { kind: "fits-days" }
  | { kind: "children" };

export type Recommendation<T> = { item: T; score: number; reasons: Reason[] };

type Regions = Set<DestinationRegion>;

/** Safaris are on the mainland; other tours follow their destination. */
export function tourRegions(
  tour: Tour,
  destinationRegion: Record<string, DestinationRegion>,
): Regions {
  if (isSafariTour(tour)) return new Set(["mainland"]);
  return new Set([destinationRegion[tour.destinationSlug] ?? "zanzibar"]);
}

/** Safari packages combine the mainland with Zanzibar. */
export function packageRegions(pkg: TourPackage): Regions {
  return new Set(pkg.isSafari ? ["zanzibar", "mainland"] : ["zanzibar"]);
}

/** "zanzibar" or "mainland" keeps items that stay within that region. */
function fitsWhere(regions: Regions, where: FinderAnswers["where"]): boolean {
  if (!where || where === "both") return true;
  return regions.size === 1 && regions.has(where);
}

const DAY_LIMITS: Record<Days, { min: number; max: number }> = {
  "1": { min: 1, max: 1 },
  "2-3": { min: 2, max: 3 },
  "4-7": { min: 4, max: 7 },
  "8+": { min: 8, max: 60 },
};

/** Day trips fit any stay; multi-day safaris need at least a few days. */
function tourFitsDays(tour: Tour, days: FinderAnswers["days"]): boolean {
  if (!days) return true;
  if (tour.length === "multi_day") return DAY_LIMITS[days].min >= 4;
  return true;
}

/** A package fits when it is no longer than the time available. */
function packageFitsDays(pkg: TourPackage, days: FinderAnswers["days"]): boolean {
  if (!days) return true;
  return pkg.days <= DAY_LIMITS[days].max;
}

function score(
  item: { travelStyles: TravelStyle[]; prices: Tour["prices"]; featured: boolean },
  answers: FinderAnswers,
  market: Market,
  extra: { interest?: string; childFriendly: boolean; challenging: boolean },
): { score: number; reasons: Reason[] } | null {
  const price = fromPrice(item.prices, market);
  // A chosen budget excludes trips priced outside it; trips priced on request stay.
  if (answers.budget && price && !inBudget(price, answers.budget)) return null;

  const reasons: Reason[] = [];
  let total = item.featured ? 1 : 0;
  for (const style of answers.styles) {
    if (item.travelStyles.includes(style)) {
      total += 3;
      reasons.push({ kind: "style", style });
    }
  }
  if (extra.interest) {
    total += 2;
    reasons.push({ kind: "interest", category: extra.interest });
  }
  if (answers.budget && price) {
    total += 1;
    reasons.push({ kind: "budget" });
  }
  if (!price) total -= 1;
  if (answers.children > 0) {
    if (extra.childFriendly) {
      total += 2;
      reasons.push({ kind: "children" });
    }
    if (extra.challenging) total -= 3;
  }
  return { score: total, reasons };
}

const byScore = <T>(a: Recommendation<T>, b: Recommendation<T>) => b.score - a.score;

export function recommendTours(
  tours: Tour[],
  answers: FinderAnswers,
  market: Market,
  destinationRegion: Record<string, DestinationRegion>,
  max = 6,
): Recommendation<Tour>[] {
  const results: Recommendation<Tour>[] = [];
  for (const tour of tours) {
    if (!fitsWhere(tourRegions(tour, destinationRegion), answers.where)) continue;
    if (!tourFitsDays(tour, answers.days)) continue;
    const interest = answers.interests.includes(tour.categorySlug)
      ? tour.categorySlug
      : undefined;
    const scored = score(tour, answers, market, {
      interest,
      childFriendly: tour.travelStyles.includes("family"),
      challenging: tour.difficulty === "challenging",
    });
    if (scored) results.push({ item: tour, ...scored });
  }
  results.sort(byScore);

  // Give each chosen interest its best two tours first, so one strong
  // category can't crowd out the others; then fill by score.
  const picked = new Set<Recommendation<Tour>>();
  for (const interest of answers.interests) {
    results
      .filter((r) => r.item.categorySlug === interest)
      .slice(0, PER_INTEREST)
      .forEach((r) => picked.size < max && picked.add(r));
  }
  for (const r of results) if (picked.size < max) picked.add(r);
  return [...picked].sort(byScore);
}

const PER_INTEREST = 2;

export function recommendPackages(
  packages: TourPackage[],
  answers: FinderAnswers,
  market: Market,
  max = 3,
): Recommendation<TourPackage>[] {
  // Packages only make sense for stays of a few days or more.
  if (answers.days === "1") return [];
  const results: Recommendation<TourPackage>[] = [];
  for (const pkg of packages) {
    if (!fitsWhere(packageRegions(pkg), answers.where)) continue;
    if (!packageFitsDays(pkg, answers.days)) continue;
    const scored = score(pkg, answers, market, {
      interest:
        pkg.isSafari && answers.interests.includes("safari") ? "safari" : undefined,
      childFriendly: pkg.travelStyles.includes("family"),
      challenging: false,
    });
    if (!scored) continue;
    if (answers.days) scored.reasons.push({ kind: "fits-days" });
    results.push({ item: pkg, ...scored });
  }
  return results.sort(byScore).slice(0, max);
}
