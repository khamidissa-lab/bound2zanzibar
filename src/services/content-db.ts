import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import type { TranslatedLocale } from "@/i18n/config";
import type { TranslatableEntity, Translation } from "@/lib/i18n/localize-content";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import type {
  Article,
  Destination,
  Tour,
  TourCategory,
  TourPackage,
} from "@/types/content";

import {
  mapArticle,
  mapCategory,
  mapDestination,
  mapPackage,
  mapTour,
  type PackageRow,
  type TourRow,
} from "./content-mappers";

/**
 * Published content from Supabase, read as a visitor (RLS: published only)
 * and cached for all visitors. Admin saves call updateTag(CONTENT_TAG) so
 * changes appear immediately; otherwise entries refresh hourly.
 */
export const CONTENT_TAG = "content";

function fail(what: string, error: { message: string }): never {
  // Log server-side only; pages show their error boundary, never SQL details.
  console.error(`[content] failed to load ${what}: ${error.message}`);
  throw new Error(`Failed to load ${what}`);
}

export async function loadCategories(): Promise<TourCategory[]> {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("hours");
  const { data, error } = await createSupabasePublicClient()
    .from("tour_categories")
    .select("*")
    .order("sort_order")
    .order("name");
  if (error) fail("categories", error);
  return data.map(mapCategory);
}

export async function loadTours(): Promise<Tour[]> {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("hours");
  const { data, error } = await createSupabasePublicClient()
    .from("tours")
    .select(
      `*, category:tour_categories(slug, name), destination:destinations(slug, name, region),
       tour_prices(market, customer_type, currency, amount, unit_label, is_illustrative, is_active),
       tour_images(storage_path, alt_text, sort_order),
       tour_options(id, name, description, pricing, sort_order, is_active,
         tour_option_prices(market, currency, amount))`,
    )
    .eq("status", "published")
    .order("sort_order")
    .order("name");
  if (error) fail("tours", error);
  return (data as unknown as TourRow[]).map(mapTour);
}

export async function loadDestinations(): Promise<Destination[]> {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("hours");
  const { data, error } = await createSupabasePublicClient()
    .from("destinations")
    .select("*")
    .eq("status", "published")
    .order("sort_order")
    .order("name");
  if (error) fail("destinations", error);
  return data.map(mapDestination);
}

export async function loadPackages(): Promise<TourPackage[]> {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("hours");
  const { data, error } = await createSupabasePublicClient()
    .from("packages")
    .select(
      `*, package_prices(market, customer_type, currency, amount, unit_label, is_illustrative, is_active),
       package_itinerary_days(day_number, title, description, meals, overnight),
       package_tours(tour:tours(slug)),
       package_destinations(sort_order, destination:destinations(slug))`,
    )
    .eq("status", "published")
    .order("sort_order")
    .order("name");
  if (error) fail("packages", error);
  return (data as unknown as PackageRow[]).map(mapPackage);
}

export async function loadArticles(): Promise<Article[]> {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("hours");
  const { data, error } = await createSupabasePublicClient()
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error) fail("articles", error);
  return data.map(mapArticle);
}

/** entity → item id → translation, for one language. */
export type TranslationIndex = Partial<
  Record<TranslatableEntity, Record<string, Translation>>
>;

/** Published content's translations for one language (cached like the content). */
export async function loadTranslations(
  locale: TranslatedLocale,
): Promise<TranslationIndex> {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("hours");
  const { data, error } = await createSupabasePublicClient()
    .from("content_translations")
    .select("entity, entity_id, fields, is_machine")
    .eq("locale", locale);
  if (error) fail("translations", error);
  const index: TranslationIndex = {};
  for (const row of data) {
    const entity = row.entity as TranslatableEntity;
    const fields =
      typeof row.fields === "object" && row.fields !== null && !Array.isArray(row.fields)
        ? (row.fields as Record<string, unknown>)
        : {};
    (index[entity] ??= {})[row.entity_id] = { fields, isMachine: row.is_machine };
  }
  return index;
}
