import type { Tour, TravelStyle } from "@/types/content";

/** Kinds of traveller, each with a homepage box and its own page at /trips/{type}. */
export const TRAVELLER_TYPES = [
  "family",
  "couples",
  "groups",
  "honeymoon",
  "solo",
] as const;
export type TravellerType = (typeof TRAVELLER_TYPES)[number];

export const isTravellerType = (v: string): v is TravellerType =>
  (TRAVELLER_TYPES as readonly string[]).includes(v);

type TravellerConfig = {
  /** Photo in public/images/travellers (credited in docs/PHOTO_CREDITS.md). */
  photo: string;
  /** Keeps the people in view when the photo is cropped to a portrait. */
  position: string;
  /** Suggested tours mix these styles in turn, so each page shows its own blend. */
  styles: TravelStyle[];
};

export const TRAVELLERS: Record<TravellerType, TravellerConfig> = {
  family: {
    photo: "/images/travellers/family.jpg",
    position: "object-[36%_50%]",
    styles: ["family"],
  },
  couples: {
    photo: "/images/travellers/couples.jpg",
    position: "object-[64%_50%]",
    styles: ["romantic", "relaxation"],
  },
  groups: {
    photo: "/images/travellers/groups.jpg",
    position: "object-[40%_50%]",
    styles: ["adventure", "relaxation"],
  },
  honeymoon: {
    photo: "/images/travellers/honeymoon-sandbank.jpg",
    position: "object-[50%_55%]",
    styles: ["romantic"],
  },
  solo: {
    photo: "/images/travellers/solo.jpg",
    position: "object-[88%_50%]",
    styles: ["cultural", "adventure"],
  },
};

/**
 * Tours to suggest for a traveller: takes one tour per style in turn (each
 * style's featured tours first), skipping repeats, up to `max`.
 */
export function suggestTours(tours: Tour[], styles: TravelStyle[], max: number): Tour[] {
  const queues = styles.map((style) =>
    tours
      .filter((tour) => tour.travelStyles.includes(style))
      .sort((a, b) => Number(b.featured) - Number(a.featured)),
  );
  const picked = new Set<Tour>();
  let added = true;
  while (added && picked.size < max) {
    added = false;
    for (const queue of queues) {
      // Skip tours already picked through another style.
      while (queue.length > 0 && picked.has(queue[0])) queue.shift();
      const next = queue.shift();
      if (next && picked.size < max) {
        picked.add(next);
        added = true;
      }
    }
  }
  return [...picked];
}
