import "server-only";

import { MEDIA_BUCKET } from "@/lib/media";
import type { Enums, Tables } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Admin-side reads. Uses the signed-in staff member's session, so RLS lets
 * staff see drafts and archived items as well as published ones. Callers must
 * already have checked the page permission (requireStaffPage).
 */

export type Option = { id: string; name: string };
export type ListFilter = { status?: string; q?: string };

const STATUSES: readonly Enums<"publish_status">[] = ["draft", "published", "archived"];
const asStatus = (s?: string) =>
  STATUSES.find((status) => status === s) as Enums<"publish_status"> | undefined;

/** Escapes `%`, `_` and `,` so a search term can't alter the PostgREST filter. */
const likeTerm = (q: string) => `%${q.replace(/[%_,()\\]/g, (c) => `\\${c}`)}%`;

function failed(what: string, error: { message: string }): never {
  console.error(`[admin] failed to load ${what}: ${error.message}`);
  throw new Error(`Failed to load ${what}`);
}

export async function listCategories(): Promise<Tables<"tour_categories">[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tour_categories")
    .select("*")
    .order("sort_order")
    .order("name");
  if (error) failed("categories", error);
  return data;
}

export async function listCurrencies(): Promise<string[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("currencies")
    .select("code")
    .eq("is_active", true)
    .order("sort_order");
  if (error) failed("currencies", error);
  return data.map((c) => c.code);
}

export async function getOptions(): Promise<{
  categories: Option[];
  destinations: Option[];
  tours: Option[];
}> {
  const supabase = await createSupabaseServerClient();
  const [c, d, t] = await Promise.all([
    supabase.from("tour_categories").select("id, name").order("sort_order").order("name"),
    supabase
      .from("destinations")
      .select("id, name")
      .neq("status", "archived")
      .order("name"),
    supabase.from("tours").select("id, name").neq("status", "archived").order("name"),
  ]);
  if (c.error) failed("categories", c.error);
  if (d.error) failed("destinations", d.error);
  if (t.error) failed("tours", t.error);
  return { categories: c.data, destinations: d.data, tours: t.data };
}

export type TourListItem = Pick<
  Tables<"tours">,
  "id" | "name" | "slug" | "status" | "updated_at" | "is_featured" | "is_sample"
> & { category: { name: string } | null; destination: { name: string } | null };

export async function listTours(filter: ListFilter): Promise<TourListItem[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("tours")
    .select(
      "id, name, slug, status, updated_at, is_featured, is_sample, category:tour_categories(name), destination:destinations(name)",
    )
    .order("updated_at", { ascending: false });
  const status = asStatus(filter.status);
  if (status) query = query.eq("status", status);
  if (filter.q) query = query.ilike("name", likeTerm(filter.q));
  const { data, error } = await query;
  if (error) failed("tours", error);
  return data as unknown as TourListItem[];
}

export type TourDetail = Tables<"tours"> & {
  tour_prices: Tables<"tour_prices">[];
  tour_images: Tables<"tour_images">[];
  tour_options: (Tables<"tour_options"> & {
    tour_option_prices: Tables<"tour_option_prices">[];
  })[];
};

export async function getTour(id: string): Promise<TourDetail | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tours")
    .select("*, tour_prices(*), tour_images(*), tour_options(*, tour_option_prices(*))")
    .eq("id", id)
    .maybeSingle();
  if (error) failed("tour", error);
  return data as TourDetail | null;
}

export async function listDestinations(
  filter: ListFilter,
): Promise<Tables<"destinations">[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("destinations")
    .select("*")
    .order("updated_at", { ascending: false });
  const status = asStatus(filter.status);
  if (status) query = query.eq("status", status);
  if (filter.q) query = query.ilike("name", likeTerm(filter.q));
  const { data, error } = await query;
  if (error) failed("destinations", error);
  return data;
}

export async function getDestination(id: string): Promise<Tables<"destinations"> | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("destinations")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) failed("destination", error);
  return data;
}

export async function listPackages(filter: ListFilter): Promise<Tables<"packages">[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("packages")
    .select("*")
    .order("updated_at", { ascending: false });
  const status = asStatus(filter.status);
  if (status) query = query.eq("status", status);
  if (filter.q) query = query.ilike("name", likeTerm(filter.q));
  const { data, error } = await query;
  if (error) failed("packages", error);
  return data;
}

export type PackageDetail = Tables<"packages"> & {
  package_prices: Tables<"package_prices">[];
  package_itinerary_days: Tables<"package_itinerary_days">[];
  package_tours: { tour_id: string }[];
  package_destinations: { destination_id: string; sort_order: number }[];
};

export async function getPackage(id: string): Promise<PackageDetail | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("packages")
    .select(
      "*, package_prices(*), package_itinerary_days(*), package_tours(tour_id), package_destinations(destination_id, sort_order)",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) failed("package", error);
  return data as PackageDetail | null;
}

export async function listArticles(filter: ListFilter): Promise<Tables<"blog_posts">[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("blog_posts")
    .select("*")
    .order("updated_at", { ascending: false });
  const status = asStatus(filter.status);
  if (status) query = query.eq("status", status);
  if (filter.q) query = query.ilike("title", likeTerm(filter.q));
  const { data, error } = await query;
  if (error) failed("articles", error);
  return data;
}

export async function getArticle(id: string): Promise<Tables<"blog_posts"> | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) failed("article", error);
  return data;
}

export const MEDIA_FOLDERS = [
  "tours",
  "destinations",
  "packages",
  "guide",
  "general",
] as const;
export type MediaFolder = (typeof MEDIA_FOLDERS)[number];

export type MediaItem = {
  path: string;
  folder: MediaFolder;
  size: number | null;
  createdAt: string | null;
};

/** Lists images in every media folder, newest first. */
export async function listMedia(): Promise<MediaItem[]> {
  const supabase = await createSupabaseServerClient();
  const results = await Promise.all(
    MEDIA_FOLDERS.map(async (folder) => {
      const { data, error } = await supabase.storage
        .from(MEDIA_BUCKET)
        .list(folder, { limit: 500, sortBy: { column: "created_at", order: "desc" } });
      if (error) failed("media", error);
      return data
        .filter((f) => f.id !== null && !f.name.startsWith("."))
        .map((f) => ({
          path: `${folder}/${f.name}`,
          folder,
          size: typeof f.metadata?.size === "number" ? f.metadata.size : null,
          createdAt: f.created_at ?? null,
        }));
    }),
  );
  return results
    .flat()
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
}
