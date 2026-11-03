/**
 * Uploads the photos the sample content uses (public/images, credited in
 * docs/PHOTO_CREDITS.md) to the Supabase `media` bucket and links them to the
 * matching tours, destinations, packages and guide articles by slug.
 *
 *   npm run db:photos
 *
 * Run it once after loading supabase/seed.sql into a hosted project. It is
 * safe to re-run: files are overwritten in place, and only rows still flagged
 * is_sample are touched, so photos staff have set in the admin are left alone.
 * Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { createClient } from "@supabase/supabase-js";

import { sampleArticles } from "../src/data/sample/articles";
import { sampleDestinations } from "../src/data/sample/destinations";
import { samplePackages } from "../src/data/sample/packages";
import { sampleTours } from "../src/data/sample/tours";
import type { Database } from "../src/lib/supabase/database.types";
import { MEDIA_BUCKET } from "../src/lib/media";
import type { MediaImage } from "../src/types/content";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.");
  process.exit(1);
}

const supabase = createClient<Database>(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const uploaded = new Map<string, string>();

/** Uploads a public/ file once and returns its storage path, e.g. "sample/reef.jpg". */
async function upload(src: string): Promise<string> {
  const known = uploaded.get(src);
  if (known) return known;
  const path = `sample/${src.split("/").pop()}`;
  const body = readFileSync(join(process.cwd(), "public", src));
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, body, {
    contentType: src.endsWith(".png") ? "image/png" : "image/jpeg",
    cacheControl: "31536000",
    upsert: true,
  });
  if (error) throw new Error(`Upload of ${src} failed: ${error.message}`);
  uploaded.set(src, path);
  return path;
}

type CoverTable = "tours" | "destinations" | "packages" | "blog_posts";

async function setCover(table: CoverTable, slug: string, image: MediaImage) {
  if (!image.src) return null;
  const { data, error } = await supabase
    .from(table)
    .update({ cover_image_path: await upload(image.src), cover_image_alt: image.alt })
    .eq("slug", slug)
    .eq("is_sample", true)
    .select("id")
    .maybeSingle();
  if (error) throw new Error(`${table} ${slug}: ${error.message}`);
  return data?.id ?? null;
}

async function main() {
  const missing: string[] = [];
  let linked = 0;

  for (const tour of sampleTours) {
    const id = await setCover("tours", tour.slug, tour.coverImage);
    if (!tour.coverImage.src) missing.push(`tour ${tour.slug}`);
    if (!id) continue;
    linked++;
    const gallery = tour.gallery.filter((img) => img.src);
    const rows = [];
    for (const [i, img] of gallery.entries()) {
      rows.push({
        tour_id: id,
        storage_path: await upload(img.src!),
        alt_text: img.alt,
        sort_order: i,
      });
    }
    const del = await supabase.from("tour_images").delete().eq("tour_id", id);
    if (del.error) throw new Error(`gallery ${tour.slug}: ${del.error.message}`);
    if (rows.length) {
      const ins = await supabase.from("tour_images").insert(rows);
      if (ins.error) throw new Error(`gallery ${tour.slug}: ${ins.error.message}`);
    }
  }

  const others: [CoverTable, { slug: string; coverImage: MediaImage }[]][] = [
    ["destinations", sampleDestinations],
    ["packages", samplePackages],
    ["blog_posts", sampleArticles],
  ];
  for (const [table, items] of others) {
    for (const item of items) {
      if (!item.coverImage.src) missing.push(`${table} ${item.slug}`);
      if (await setCover(table, item.slug, item.coverImage)) linked++;
    }
  }

  console.log(`Uploaded ${uploaded.size} photos; linked ${linked} items.`);
  if (missing.length)
    console.log(`No photo in the sample data for: ${missing.join(", ")}`);
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
