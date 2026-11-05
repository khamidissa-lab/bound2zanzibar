/**
 * How the Safari page groups safari tours, following the owner's own list
 * (2026-11-04). Presentation only: a safari tour whose slug is not listed
 * here still appears, under "More safari experiences".
 */
export const safariCircuits = [
  {
    id: "northern",
    title: "Northern Circuit Safaris",
    slugs: [
      "serengeti-national-park-safari",
      "ngorongoro-crater-day-safari",
      "tarangire-national-park-safari",
      "lake-manyara-national-park-safari",
      "arusha-national-park-safari",
    ],
  },
  {
    id: "southern",
    title: "Southern Circuit Safaris",
    slugs: [
      "mikumi-day-safari",
      "nyerere-selous-day-safari",
      "ruaha-national-park-safari",
    ],
  },
  {
    id: "western",
    title: "Western Tanzania Safaris",
    slugs: ["gombe-stream-national-park", "mahale-mountains-national-park"],
  },
  {
    id: "special",
    title: "Special Safari Experiences",
    slugs: ["great-wildebeest-migration-safari", "hot-air-balloon-safari-serengeti"],
  },
] as const;

/** Groups tours by circuit, keeping unlisted ones in a final "more" group. */
export function groupByCircuit<T extends { slug: string }>(
  tours: T[],
): { id: string; title: string; tours: T[] }[] {
  const listed = new Set<string>(safariCircuits.flatMap((c) => [...c.slugs]));
  const groups = safariCircuits.map((c) => ({
    id: c.id,
    title: c.title,
    tours: c.slugs.flatMap((slug) => tours.filter((t) => t.slug === slug)),
  }));
  const rest = tours.filter((t) => !listed.has(t.slug));
  return [
    ...groups,
    { id: "more", title: "More safari experiences", tours: rest },
  ].filter((g) => g.tours.length > 0);
}
