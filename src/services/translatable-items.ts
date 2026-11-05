import type { SupabaseClient } from "@supabase/supabase-js";

import { sourceFields, type TranslatableEntity } from "@/lib/i18n/localize-content";
import type { Database } from "@/lib/supabase/database.types";

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
 * Content that can be translated, with its English source fields. Shared by
 * the admin (signed-in client, RLS) and the drafting script (service role).
 */
export type TranslatableItem = {
  entity: TranslatableEntity;
  id: string;
  label: string;
  /** Public page path, if the item has its own page. */
  path: string | null;
  status: string;
  fields: Record<string, unknown>;
};

export const ENTITY_LABELS: Record<TranslatableEntity, { one: string; many: string }> = {
  tours: { one: "Tour", many: "Tours" },
  packages: { one: "Package", many: "Packages" },
  destinations: { one: "Destination", many: "Destinations" },
  blog_posts: { one: "Article", many: "Travel guide" },
  tour_categories: { one: "Category", many: "Tour categories" },
};

const TOUR_SELECT = `*, category:tour_categories(slug, name), destination:destinations(slug, name, region),
  tour_prices(market, customer_type, currency, amount, unit_label, is_illustrative, is_active),
  tour_images(storage_path, alt_text, sort_order)`;
const PACKAGE_SELECT = `*, package_prices(market, customer_type, currency, amount, unit_label, is_illustrative, is_active),
  package_itinerary_days(day_number, title, description, meals, overnight),
  package_tours(tour:tours(slug)),
  package_destinations(sort_order, destination:destinations(slug))`;

function fail(what: string, error: { message: string }): never {
  throw new Error(`Failed to load ${what}: ${error.message}`);
}

type Db = SupabaseClient<Database>;

/** Every translatable item (all statuses except archived). */
export async function loadTranslatableItems(db: Db): Promise<TranslatableItem[]> {
  const [tours, packages, destinations, articles, categories] = await Promise.all([
    db.from("tours").select(TOUR_SELECT).neq("status", "archived").order("sort_order"),
    db
      .from("packages")
      .select(PACKAGE_SELECT)
      .neq("status", "archived")
      .order("sort_order"),
    db.from("destinations").select("*").neq("status", "archived").order("sort_order"),
    db.from("blog_posts").select("*").neq("status", "archived").order("title"),
    db.from("tour_categories").select("*").order("sort_order"),
  ]);
  if (tours.error) fail("tours", tours.error);
  if (packages.error) fail("packages", packages.error);
  if (destinations.error) fail("destinations", destinations.error);
  if (articles.error) fail("articles", articles.error);
  if (categories.error) fail("categories", categories.error);

  return [
    ...(tours.data as unknown as TourRow[]).map((r) => {
      const t = mapTour(r);
      return {
        entity: "tours" as const,
        id: r.id,
        label: t.name,
        path: `/tours/${t.slug}`,
        status: r.status,
        fields: sourceFields("tours", t),
      };
    }),
    ...(packages.data as unknown as PackageRow[]).map((r) => {
      const p = mapPackage(r);
      return {
        entity: "packages" as const,
        id: r.id,
        label: p.name,
        path: `/packages/${p.slug}`,
        status: r.status,
        fields: sourceFields("packages", p),
      };
    }),
    ...destinations.data.map((r) => {
      const d = mapDestination(r);
      return {
        entity: "destinations" as const,
        id: r.id,
        label: d.name,
        path: `/destinations/${d.slug}`,
        status: r.status,
        fields: sourceFields("destinations", d),
      };
    }),
    ...articles.data.map((r) => {
      const a = mapArticle(r);
      return {
        entity: "blog_posts" as const,
        id: r.id,
        label: a.title,
        path: `/travel-guide/${a.slug}`,
        status: r.status,
        fields: sourceFields("blog_posts", a),
      };
    }),
    ...categories.data.map((r) => {
      const c = mapCategory(r);
      return {
        entity: "tour_categories" as const,
        id: r.id,
        label: c.name,
        path: null,
        status: r.is_active ? "published" : "draft",
        fields: sourceFields("tour_categories", c),
      };
    }),
  ];
}

/** One item, or null when it doesn't exist or isn't readable. */
export async function loadTranslatableItem(
  db: Db,
  entity: TranslatableEntity,
  id: string,
): Promise<TranslatableItem | null> {
  // Small enough to reuse the full loader and keep one mapping path.
  const items = await loadTranslatableItems(db);
  return items.find((i) => i.entity === entity && i.id === id) ?? null;
}
