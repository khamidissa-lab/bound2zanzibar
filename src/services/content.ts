import { sampleArticles } from "@/data/sample/articles";
import { sampleCategories } from "@/data/sample/categories";
import { sampleDestinations } from "@/data/sample/destinations";
import { samplePackages } from "@/data/sample/packages";
import { sampleTours } from "@/data/sample/tours";
import { DEFAULT_LOCALE, type Locale, type TranslatedLocale } from "@/i18n/config";
import {
  localizeArticle,
  localizeCategory,
  localizeDestination,
  localizePackage,
  localizeTour,
} from "@/lib/i18n/localize-content";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type {
  Article,
  Destination,
  TourCategory,
  TourPackage,
  Tour,
} from "@/types/content";

import {
  loadArticles,
  loadCategories,
  loadDestinations,
  loadPackages,
  loadTours,
  loadTranslations,
  type TranslationIndex,
} from "./content-db";

/**
 * Public content access used by every public page.
 *
 * Source: Supabase (published records, cached) once the project is
 * configured; until then, the clearly labelled sample data layer. Pages call
 * the same functions either way. Pass a language to get translated text
 * (falling back to English field by field); prices, slugs and other business
 * data are never translated.
 */

const isPublished = <T extends { status: string }>(item: T) =>
  item.status === "published";

const fromDatabase = () => isSupabaseConfigured();

async function translations(locale: Locale): Promise<TranslationIndex> {
  return locale === DEFAULT_LOCALE || !fromDatabase()
    ? {}
    : loadTranslations(locale as TranslatedLocale);
}

const tr = (index: TranslationIndex, entity: keyof TranslationIndex, id?: string) =>
  id ? index[entity]?.[id] : undefined;

async function allCategories(locale: Locale): Promise<TourCategory[]> {
  if (!fromDatabase()) return sampleCategories;
  const [items, index] = await Promise.all([loadCategories(), translations(locale)]);
  return items.map((c) => localizeCategory(c, tr(index, "tour_categories", c.id)));
}

async function allTours(locale: Locale): Promise<Tour[]> {
  if (!fromDatabase()) return sampleTours.filter(isPublished);
  const [items, index] = await Promise.all([loadTours(), translations(locale)]);
  return items.map((t) => localizeTour(t, tr(index, "tours", t.id)));
}

async function allDestinations(locale: Locale): Promise<Destination[]> {
  if (!fromDatabase()) return sampleDestinations.filter(isPublished);
  const [items, index] = await Promise.all([loadDestinations(), translations(locale)]);
  return items.map((d) => localizeDestination(d, tr(index, "destinations", d.id)));
}

async function allPackages(locale: Locale): Promise<TourPackage[]> {
  if (!fromDatabase()) return samplePackages.filter(isPublished);
  const [items, index] = await Promise.all([loadPackages(), translations(locale)]);
  return items.map((p) => localizePackage(p, tr(index, "packages", p.id)));
}

async function allArticles(locale: Locale): Promise<Article[]> {
  let articles: Article[];
  if (fromDatabase()) {
    const [items, index] = await Promise.all([loadArticles(), translations(locale)]);
    articles = items.map((a) => localizeArticle(a, tr(index, "blog_posts", a.id)));
  } else {
    articles = sampleArticles.filter(isPublished);
  }
  return articles.toSorted((a, b) => b.publishedOn.localeCompare(a.publishedOn));
}

export async function getCategories(
  locale: Locale = DEFAULT_LOCALE,
): Promise<TourCategory[]> {
  return allCategories(locale);
}

/** Slug → display name maps for labelling cards without extra queries. */
export async function getNameLookups(locale: Locale = DEFAULT_LOCALE): Promise<{
  categories: Record<string, string>;
  destinations: Record<string, string>;
}> {
  const [categories, destinations] = await Promise.all([
    allCategories(locale),
    allDestinations(locale),
  ]);
  return {
    categories: Object.fromEntries(categories.map((c) => [c.slug, c.name])),
    destinations: Object.fromEntries(destinations.map((d) => [d.slug, d.name])),
  };
}

export async function getTours(
  filter: { categorySlug?: string; destinationSlug?: string; featured?: boolean } = {},
  locale: Locale = DEFAULT_LOCALE,
): Promise<Tour[]> {
  return (await allTours(locale))
    .filter((t) => !filter.categorySlug || t.categorySlug === filter.categorySlug)
    .filter(
      (t) => !filter.destinationSlug || t.destinationSlug === filter.destinationSlug,
    )
    .filter((t) => filter.featured === undefined || t.featured === filter.featured);
}

export async function getTourBySlug(
  slug: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<Tour | null> {
  return (await allTours(locale)).find((t) => t.slug === slug) ?? null;
}

export async function getDestinations(
  filter: { region?: Destination["region"]; featured?: boolean } = {},
  locale: Locale = DEFAULT_LOCALE,
): Promise<Destination[]> {
  return (await allDestinations(locale))
    .filter((d) => !filter.region || d.region === filter.region)
    .filter((d) => filter.featured === undefined || d.featured === filter.featured);
}

export async function getDestinationBySlug(
  slug: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<Destination | null> {
  return (await allDestinations(locale)).find((d) => d.slug === slug) ?? null;
}

export async function getPackages(
  filter: { isSafari?: boolean; featured?: boolean; destinationSlug?: string } = {},
  locale: Locale = DEFAULT_LOCALE,
): Promise<TourPackage[]> {
  return (await allPackages(locale))
    .filter((p) => filter.isSafari === undefined || p.isSafari === filter.isSafari)
    .filter((p) => filter.featured === undefined || p.featured === filter.featured)
    .filter(
      (p) =>
        !filter.destinationSlug || p.destinationSlugs.includes(filter.destinationSlug),
    );
}

export async function getPackageBySlug(
  slug: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<TourPackage | null> {
  return (await allPackages(locale)).find((p) => p.slug === slug) ?? null;
}

export async function getArticles(locale: Locale = DEFAULT_LOCALE): Promise<Article[]> {
  return allArticles(locale);
}

export async function getArticleBySlug(
  slug: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<Article | null> {
  return (await allArticles(locale)).find((a) => a.slug === slug) ?? null;
}

/**
 * generateStaticParams must return at least one entry with Cache Components.
 * When there is no content yet, return a placeholder slug that renders 404.
 */
export function staticSlugParams(items: { slug: string }[]): { slug: string }[] {
  return items.length > 0
    ? items.map((item) => ({ slug: item.slug }))
    : [{ slug: "__no-content__" }];
}
