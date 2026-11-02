/**
 * Canonical site URL used for metadata (Open Graph, canonical links, sitemap).
 * Falls back to localhost so local builds work without configuration.
 */
export function getSiteUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  try {
    return new URL(raw && raw.length > 0 ? raw : "http://localhost:3000");
  } catch {
    return new URL("http://localhost:3000");
  }
}
