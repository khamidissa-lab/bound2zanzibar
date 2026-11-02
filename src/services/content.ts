import { sampleArticles } from "@/data/sample/articles";
import { sampleCategories } from "@/data/sample/categories";
import { sampleDestinations } from "@/data/sample/destinations";
import { samplePackages } from "@/data/sample/packages";
import { sampleTours } from "@/data/sample/tours";
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
} from "./content-db";

/**
 * Public content access used by every public page.
 *
 * Source: Supabase (published records, cached) once the project is
 * configured; until then, the clearly labelled sample data layer. Pages call
 * the same functions either way.
 */

const isPublished = <T extends { status: string }>(item: T) =>
  item.status === "published";

const fromDatabase = () => isSupabaseConfigured();

async function allCategories(): Promise<TourCategory[]> {
  return fromDatabase() ? loadCategories() : sampleCategories;
}

async function allTours(): Promise<Tour[]> {
  return fromDatabase() ? loadTours() : sampleTours.filter(isPublished);
}

async function allDestinations(): Promise<Destination[]> {
  return fromDatabase() ? loadDestinations() : sampleDestinations.filter(isPublished);
}

async function allPackages(): Promise<TourPackage[]> {
  return fromDatabase() ? loadPackages() : samplePackages.filter(isPublished);
}

async function allArticles(): Promise<Article[]> {
  const articles = fromDatabase()
    ? await loadArticles()
    : sampleArticles.filter(isPublished);
  return articles.toSorted((a, b) => b.publishedOn.localeCompare(a.publishedOn));
}

export async function getCategories(): Promise<TourCategory[]> {
  return allCategories();
}

/** Slug → display name maps for labelling cards without extra queries. */
export async function getNameLookups(): Promise<{
  categories: Record<string, string>;
  destinations: Record<string, string>;
}> {
  const [categories, destinations] = await Promise.all([
    allCategories(),
    allDestinations(),
  ]);
  return {
    categories: Object.fromEntries(categories.map((c) => [c.slug, c.name])),
    destinations: Object.fromEntries(destinations.map((d) => [d.slug, d.name])),
  };
}

export async function getTours(
  filter: { categorySlug?: string; destinationSlug?: string; featured?: boolean } = {},
): Promise<Tour[]> {
  return (await allTours())
    .filter((t) => !filter.categorySlug || t.categorySlug === filter.categorySlug)
    .filter(
      (t) => !filter.destinationSlug || t.destinationSlug === filter.destinationSlug,
    )
    .filter((t) => filter.featured === undefined || t.featured === filter.featured);
}

export async function getTourBySlug(slug: string): Promise<Tour | null> {
  return (await allTours()).find((t) => t.slug === slug) ?? null;
}

export async function getDestinations(
  filter: { region?: Destination["region"]; featured?: boolean } = {},
): Promise<Destination[]> {
  return (await allDestinations())
    .filter((d) => !filter.region || d.region === filter.region)
    .filter((d) => filter.featured === undefined || d.featured === filter.featured);
}

export async function getDestinationBySlug(slug: string): Promise<Destination | null> {
  return (await allDestinations()).find((d) => d.slug === slug) ?? null;
}

export async function getPackages(
  filter: { isSafari?: boolean; featured?: boolean; destinationSlug?: string } = {},
): Promise<TourPackage[]> {
  return (await allPackages())
    .filter((p) => filter.isSafari === undefined || p.isSafari === filter.isSafari)
    .filter((p) => filter.featured === undefined || p.featured === filter.featured)
    .filter(
      (p) =>
        !filter.destinationSlug || p.destinationSlugs.includes(filter.destinationSlug),
    );
}

export async function getPackageBySlug(slug: string): Promise<TourPackage | null> {
  return (await allPackages()).find((p) => p.slug === slug) ?? null;
}

export async function getArticles(): Promise<Article[]> {
  return allArticles();
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  return (await allArticles()).find((a) => a.slug === slug) ?? null;
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
