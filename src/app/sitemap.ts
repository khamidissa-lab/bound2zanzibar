import type { MetadataRoute } from "next";

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
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const url = (path: string) => new URL(path, base).toString();
  const [tours, packages, destinations, articles] = await Promise.all([
    getTours(),
    getPackages(),
    getDestinations(),
    getArticles(),
  ]);

  return [
    ...STATIC_PATHS.map((path) => ({ url: url(path) })),
    ...tours.map((t) => ({ url: url(`/tours/${t.slug}`) })),
    ...packages.map((p) => ({ url: url(`/packages/${p.slug}`) })),
    ...destinations.map((d) => ({ url: url(`/destinations/${d.slug}`) })),
    ...articles.map((a) => ({
      url: url(`/travel-guide/${a.slug}`),
      lastModified: a.publishedOn,
    })),
  ];
}
