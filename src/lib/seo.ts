import type { MediaImage } from "@/types/content";

/**
 * Open Graph images for a page's cover photo. Undefined when there is no photo
 * yet, so the site-wide default share image is used instead.
 */
export function shareImages(image: MediaImage) {
  return image.src ? [{ url: image.src, alt: image.alt }] : undefined;
}
