import type { SceneTheme } from "@/types/content";

export const MEDIA_BUCKET = "media";

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Public URL for a file in the media bucket, or null when no path is set. */
export function mediaUrl(path: string | null | undefined): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!path || !base) return null;
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `${base.replace(/\/$/, "")}/storage/v1/object/public/${MEDIA_BUCKET}/${encoded}`;
}

/** Placeholder illustration theme used until a real photo is set. */
export function themeForCategory(categorySlug: string | null | undefined): SceneTheme {
  switch (categorySlug) {
    case "culture-history":
      return "town";
    case "nature-wildlife":
      return "forest";
    case "beach-leisure":
      return "sunset";
    case "safari":
      return "savanna";
    default:
      return "ocean";
  }
}

/** Safe storage object name: lowercase, hyphenated, with a unique prefix. */
export function storageFileName(originalName: string, uniquePrefix: string): string {
  const base = originalName.split(/[/\\]/).pop() ?? "";
  const dot = base.lastIndexOf(".");
  const ext =
    dot > 0
      ? base
          .slice(dot + 1)
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "")
      : "";
  const stem = (dot > 0 ? base.slice(0, dot) : base)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${uniquePrefix}-${stem || "image"}${ext ? `.${ext}` : ""}`;
}
