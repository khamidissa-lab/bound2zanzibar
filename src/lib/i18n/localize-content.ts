import type {
  Article,
  ArticleSection,
  Destination,
  Faq,
  ItineraryDay,
  Tour,
  TourCategory,
  TourPackage,
  TourStep,
} from "@/types/content";

/**
 * Applies a stored translation (content_translations.fields) on top of the
 * English domain object. Every field is optional and validated: anything
 * missing or malformed keeps the English value, so a partial translation
 * never breaks a page.
 */

export type Translation = { fields: Record<string, unknown>; isMachine: boolean };

/** The fields each content type can translate (also used by the admin). */
export const TRANSLATABLE_FIELDS = {
  tours: [
    "name",
    "shortDescription",
    "description",
    "duration",
    "highlights",
    "included",
    "excluded",
    "whatToBring",
    "meetingPoint",
    "suitability",
    "whatToExpect",
    "goodToKnow",
    "faqs",
    "coverImageAlt",
    "seoTitle",
    "seoDescription",
  ],
  packages: [
    "name",
    "summary",
    "description",
    "accommodation",
    "transfers",
    "meals",
    "included",
    "excluded",
    "terms",
    "itinerary",
    "coverImageAlt",
    "seoTitle",
    "seoDescription",
  ],
  destinations: [
    "name",
    "summary",
    "description",
    "highlights",
    "coverImageAlt",
    "seoTitle",
    "seoDescription",
  ],
  blog_posts: [
    "title",
    "excerpt",
    "sections",
    "coverImageAlt",
    "seoTitle",
    "seoDescription",
  ],
  tour_categories: ["name", "description"],
} as const;

export type TranslatableEntity = keyof typeof TRANSLATABLE_FIELDS;

const str = (v: unknown, fallback: string): string =>
  typeof v === "string" && v.trim() !== "" ? v : fallback;

const strList = (v: unknown, fallback: string[]): string[] =>
  Array.isArray(v) && v.length > 0 && v.every((x) => typeof x === "string")
    ? (v as string[])
    : fallback;

function objList<T>(v: unknown, fallback: T[], keys: (keyof T & string)[]): T[] {
  if (
    !Array.isArray(v) ||
    v.length === 0 ||
    !v.every(
      (x) =>
        typeof x === "object" &&
        x !== null &&
        keys.every((k) => typeof (x as Record<string, unknown>)[k] === "string"),
    )
  ) {
    return fallback;
  }
  return v as T[];
}

export function localizeCategory(c: TourCategory, tr?: Translation): TourCategory {
  if (!tr) return c;
  return {
    ...c,
    name: str(tr.fields.name, c.name),
    description: str(tr.fields.description, c.description),
  };
}

export function localizeTour(t: Tour, tr?: Translation): Tour {
  if (!tr) return t;
  const f = tr.fields;
  return {
    ...t,
    name: str(f.name, t.name),
    shortDescription: str(f.shortDescription, t.shortDescription),
    description: strList(f.description, t.description),
    duration: str(f.duration, t.duration),
    highlights: strList(f.highlights, t.highlights),
    included: strList(f.included, t.included),
    excluded: strList(f.excluded, t.excluded),
    whatToBring: strList(f.whatToBring, t.whatToBring),
    meetingPoint: str(f.meetingPoint, t.meetingPoint),
    suitability: str(f.suitability, t.suitability),
    whatToExpect: objList<TourStep>(f.whatToExpect, t.whatToExpect, [
      "title",
      "description",
    ]),
    goodToKnow: strList(f.goodToKnow, t.goodToKnow),
    faqs: objList<Faq>(f.faqs, t.faqs, ["question", "answer"]),
    coverImage: { ...t.coverImage, alt: str(f.coverImageAlt, t.coverImage.alt) },
    seo: {
      title: str(f.seoTitle, str(f.name, t.seo.title)),
      description: str(f.seoDescription, str(f.shortDescription, t.seo.description)),
    },
    machineTranslated: tr.isMachine,
  };
}

/** Itinerary days are matched by day number; titles and texts are translated. */
function localizeItinerary(days: ItineraryDay[], v: unknown): ItineraryDay[] {
  if (!Array.isArray(v)) return days;
  const byDay = new Map<number, Record<string, unknown>>();
  for (const x of v) {
    if (
      typeof x === "object" &&
      x !== null &&
      typeof (x as { day?: unknown }).day === "number"
    ) {
      byDay.set((x as { day: number }).day, x as Record<string, unknown>);
    }
  }
  return days.map((d) => {
    const tr = byDay.get(d.day);
    if (!tr) return d;
    return {
      ...d,
      title: str(tr.title, d.title),
      description: str(tr.description, d.description),
      overnight: d.overnight === null ? null : str(tr.overnight, d.overnight),
      meals: strList(tr.meals, d.meals),
    };
  });
}

export function localizePackage(p: TourPackage, tr?: Translation): TourPackage {
  if (!tr) return p;
  const f = tr.fields;
  return {
    ...p,
    name: str(f.name, p.name),
    summary: str(f.summary, p.summary),
    description: strList(f.description, p.description),
    accommodation: str(f.accommodation, p.accommodation),
    transfers: str(f.transfers, p.transfers),
    meals: str(f.meals, p.meals),
    included: strList(f.included, p.included),
    excluded: strList(f.excluded, p.excluded),
    terms: strList(f.terms, p.terms),
    itinerary: localizeItinerary(p.itinerary, f.itinerary),
    coverImage: { ...p.coverImage, alt: str(f.coverImageAlt, p.coverImage.alt) },
    seo: {
      title: str(f.seoTitle, str(f.name, p.seo.title)),
      description: str(f.seoDescription, str(f.summary, p.seo.description)),
    },
    machineTranslated: tr.isMachine,
  };
}

export function localizeDestination(d: Destination, tr?: Translation): Destination {
  if (!tr) return d;
  const f = tr.fields;
  return {
    ...d,
    name: str(f.name, d.name),
    summary: str(f.summary, d.summary),
    description: strList(f.description, d.description),
    highlights: strList(f.highlights, d.highlights),
    coverImage: { ...d.coverImage, alt: str(f.coverImageAlt, d.coverImage.alt) },
    seo: {
      title: str(f.seoTitle, str(f.name, d.seo.title)),
      description: str(f.seoDescription, str(f.summary, d.seo.description)),
    },
    machineTranslated: tr.isMachine,
  };
}

function localizeSections(sections: ArticleSection[], v: unknown): ArticleSection[] {
  if (
    !Array.isArray(v) ||
    v.length !== sections.length ||
    !v.every(
      (s) =>
        typeof s === "object" &&
        s !== null &&
        typeof (s as { heading?: unknown }).heading === "string" &&
        Array.isArray((s as { paragraphs?: unknown }).paragraphs),
    )
  ) {
    return sections;
  }
  return (v as ArticleSection[]).map((s, i) => ({
    heading: str(s.heading, sections[i].heading),
    paragraphs: strList(s.paragraphs, sections[i].paragraphs),
  }));
}

export function localizeArticle(a: Article, tr?: Translation): Article {
  if (!tr) return a;
  const f = tr.fields;
  return {
    ...a,
    title: str(f.title, a.title),
    excerpt: str(f.excerpt, a.excerpt),
    sections: localizeSections(a.sections, f.sections),
    coverImage: { ...a.coverImage, alt: str(f.coverImageAlt, a.coverImage.alt) },
    seo: {
      title: str(f.seoTitle, str(f.title, a.seo.title)),
      description: str(f.seoDescription, str(f.excerpt, a.seo.description)),
    },
    machineTranslated: tr.isMachine,
  };
}

/**
 * The English source fields for a content item, in the same shape the
 * translation stores (used to draft and edit translations).
 */
export function sourceFields(
  entity: TranslatableEntity,
  item: Tour | TourPackage | Destination | Article | TourCategory,
): Record<string, unknown> {
  switch (entity) {
    case "tours": {
      const t = item as Tour;
      return {
        name: t.name,
        shortDescription: t.shortDescription,
        description: t.description,
        duration: t.duration,
        highlights: t.highlights,
        included: t.included,
        excluded: t.excluded,
        whatToBring: t.whatToBring,
        meetingPoint: t.meetingPoint,
        suitability: t.suitability,
        whatToExpect: t.whatToExpect,
        goodToKnow: t.goodToKnow,
        faqs: t.faqs,
        coverImageAlt: t.coverImage.alt,
        seoTitle: t.seo.title,
        seoDescription: t.seo.description,
      };
    }
    case "packages": {
      const p = item as TourPackage;
      return {
        name: p.name,
        summary: p.summary,
        description: p.description,
        accommodation: p.accommodation,
        transfers: p.transfers,
        meals: p.meals,
        included: p.included,
        excluded: p.excluded,
        terms: p.terms,
        itinerary: p.itinerary.map((d) => ({
          day: d.day,
          title: d.title,
          description: d.description,
          overnight: d.overnight,
          meals: d.meals,
        })),
        coverImageAlt: p.coverImage.alt,
        seoTitle: p.seo.title,
        seoDescription: p.seo.description,
      };
    }
    case "destinations": {
      const d = item as Destination;
      return {
        name: d.name,
        summary: d.summary,
        description: d.description,
        highlights: d.highlights,
        coverImageAlt: d.coverImage.alt,
        seoTitle: d.seo.title,
        seoDescription: d.seo.description,
      };
    }
    case "blog_posts": {
      const a = item as Article;
      return {
        title: a.title,
        excerpt: a.excerpt,
        sections: a.sections,
        coverImageAlt: a.coverImage.alt,
        seoTitle: a.seo.title,
        seoDescription: a.seo.description,
      };
    }
    case "tour_categories": {
      const c = item as TourCategory;
      return { name: c.name, description: c.description };
    }
  }
}
