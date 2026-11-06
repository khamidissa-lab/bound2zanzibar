import type { MetadataRoute } from "next";

import { TRAVELLER_TYPES } from "@/config/travellers";
import { LOCALES, localizePath } from "@/i18n/config";
import { getSiteUrl } from "@/lib/site-url";
import { getArticles, getDestinations, getPackages, getTours } from "@/services/content";

// Indexable public pages. Privacy and Terms stay out until their final text
// is published (they are noindex), as do the booking confirmation and admin.
const STATIC_PATHS = [
  "/",
  "/tours",
  "/safari",
  "/packages",
  "/destinations",
  "/travel-guide",
  "/about",
  "/contact",
  "/book",
  "/trip-finder",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const url = (path: string) => new URL(path, base).toString();
  // One entry per language, each listing all language versions (hreflang).
  const entry = (path: string, lastModified?: string): MetadataRoute.Sitemap =>
    LOCALES.map((locale) => ({
      url: url(localizePath(locale, path)),
      ...(lastModified ? { lastModified } : {}),
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((l) => [l, url(localizePath(l, path))]),
        ),
      },
    }));
  const [tours, packages, destinations, articles] = await Promise.all([
    getTours(),
    getPackages(),
    getDestinations(),
    getArticles(),
  ]);

  return [
    ...STATIC_PATHS.flatMap((path) => entry(path)),
    ...tours.flatMap((t) => entry(`/tours/${t.slug}`)),
    ...packages.flatMap((p) => entry(`/packages/${p.slug}`)),
    ...destinations.flatMap((d) => entry(`/destinations/${d.slug}`)),
    ...articles.flatMap((a) => entry(`/travel-guide/${a.slug}`, a.publishedOn)),
    ...TRAVELLER_TYPES.flatMap((type) => entry(`/trips/${type}`)),
  ];
}
