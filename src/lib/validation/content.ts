import { z } from "zod";

import { parseArticleMarkup } from "@/lib/article-markup";
import { TOUR_LENGTHS, TRAVEL_STYLES, toTravelStyles } from "@/lib/discovery";
import { SLUG_PATTERN, slugify } from "@/lib/slug";
import { parseFaqs, parseSteps } from "@/lib/tour-details-format";
import type { TourLength, TravelStyle } from "@/types/content";

/*
 * Server-side validation for the admin content editors. Form fields arrive as
 * strings; these schemas trim, convert and bound every value before it is
 * written. List fields use "one item per line" textareas.
 */

const text = (max: number) =>
  z
    .string()
    .trim()
    .max(max, { error: `Use at most ${max} characters.` });
const required = (label: string, max: number) =>
  text(max).min(1, { error: `Enter ${label}.` });
const optionalText = (max: number) => text(max).transform((v) => (v === "" ? null : v));

/** One item per line → trimmed, non-empty array. */
export const lines = (maxItems = 40, maxLength = 300) =>
  z
    .string()
    .transform((v) =>
      v
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean),
    )
    .pipe(
      z
        .array(
          z
            .string()
            .max(maxLength, { error: `Keep each line under ${maxLength} characters.` }),
        )
        .max(maxItems, { error: `Use at most ${maxItems} lines.` }),
    );

const optionalUuid = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .pipe(z.uuid({ error: "Choose a valid option." }).nullable());

const checkbox = z
  .string()
  .optional()
  .transform((v) => v === "on" || v === "true");

const intField = (label: string, min: number, max: number) =>
  z.coerce
    .number({ error: `Enter ${label}.` })
    .int({ error: `${label} must be a whole number.` })
    .min(min, { error: `${label} must be at least ${min}.` })
    .max(max, { error: `${label} must be at most ${max}.` });

export const publishStatus = z.enum(["draft", "published", "archived"], {
  error: "Choose a status.",
});

/** Checkbox group: each ticked style arrives as its own form value. */
const travelStyles = z
  .array(
    z.enum(TRAVEL_STYLES as [TravelStyle, ...TravelStyle[]], {
      error: "Choose a valid travel style.",
    }),
  )
  .max(TRAVEL_STYLES.length)
  .optional()
  .transform((v) => toTravelStyles(v ?? []));

/** Storage object path inside the media bucket (no traversal, no URLs). */
export const mediaPath = z
  .string()
  .trim()
  .max(300)
  .transform((v) => (v === "" ? null : v))
  .refine((v) => v === null || (/^[a-z0-9][a-z0-9/_.-]*$/.test(v) && !v.includes("..")), {
    error: "Choose an image from the media library.",
  });

const seo = {
  seoTitle: optionalText(70),
  seoDescription: optionalText(170),
};

/** Uses the given slug, or derives one from the name. */
function withSlug<T extends { slug: string; name?: string; title?: string }>(value: T) {
  const slug = value.slug.trim() || slugify(value.name ?? value.title ?? "");
  return { ...value, slug };
}
const slugField = text(80);
const slugRefinement = {
  check: (v: { slug: string }) => SLUG_PATTERN.test(v.slug),
  params: {
    error: "Use lowercase letters, numbers and hyphens only (e.g. stone-town-tour).",
    path: ["slug"],
  },
};

export const categorySchema = z
  .object({
    name: required("a name", 80),
    slug: slugField,
    description: optionalText(500),
    sortOrder: intField("Order", 0, 1000),
    isActive: checkbox,
  })
  .transform(withSlug)
  .refine(slugRefinement.check, slugRefinement.params);

export const tourSchema = z
  .object({
    name: required("a name", 160),
    slug: slugField,
    categoryId: optionalUuid,
    destinationId: optionalUuid,
    shortDescription: text(300),
    description: text(10000),
    durationText: text(120),
    length: z
      .enum(["", ...(TOUR_LENGTHS as [TourLength, ...TourLength[]])], {
        error: "Choose a trip length.",
      })
      .optional()
      .transform((v) => v || null),
    travelStyles,
    highlights: lines(),
    inclusions: lines(),
    exclusions: lines(),
    whatToBring: lines(),
    meetingPoint: optionalText(500),
    difficulty: z
      .enum(["", "easy", "moderate", "challenging"])
      .transform((v) => (v === "" ? null : v)),
    suitability: optionalText(300),
    whatToExpect: z
      .string()
      .max(8000, { error: "This section is too long." })
      .transform(parseSteps)
      .pipe(
        z
          .array(
            z.object({
              title: z
                .string()
                .max(120, { error: "Keep each step title under 120 characters." }),
              description: z
                .string()
                .max(600, { error: "Keep each step under 600 characters." }),
            }),
          )
          .max(20, { error: "Use at most 20 steps." }),
      ),
    goodToKnow: lines(15, 300),
    faqs: z
      .string()
      .max(12000, { error: "This section is too long." })
      .transform(parseFaqs)
      .pipe(
        z
          .array(
            z.object({
              question: z
                .string()
                .max(200, { error: "Keep each question under 200 characters." }),
              answer: z
                .string()
                .min(1, { error: "Every question needs an answer below it." })
                .max(1000),
            }),
          )
          .max(20, { error: "Use at most 20 FAQs." }),
      ),
    coverImagePath: mediaPath,
    coverImageAlt: optionalText(200),
    isFeatured: checkbox,
    status: publishStatus,
    sortOrder: intField("Order", 0, 1000),
    ...seo,
  })
  .transform(withSlug)
  .refine(slugRefinement.check, slugRefinement.params);

export const destinationSchema = z
  .object({
    name: required("a name", 120),
    slug: slugField,
    region: z.enum(["zanzibar", "mainland"], { error: "Choose a region." }),
    shortDescription: text(300),
    description: text(10000),
    highlights: lines(),
    wildlife: lines(30, 100),
    bestTime: optionalText(800),
    coverImagePath: mediaPath,
    coverImageAlt: optionalText(200),
    isFeatured: checkbox,
    status: publishStatus,
    sortOrder: intField("Order", 0, 1000),
    ...seo,
  })
  .transform(withSlug)
  .refine(slugRefinement.check, slugRefinement.params);

export const itineraryDaySchema = z.object({
  title: z.string().trim().min(1, { error: "Every day needs a title." }).max(160),
  description: z.string().trim().max(3000),
  meals: z.array(z.string().trim().min(1).max(40)).max(6),
  overnight: z.string().trim().max(120),
});

const jsonArray = <T extends z.ZodType>(item: T, max: number, label: string) =>
  z
    .string()
    .transform((value, ctx) => {
      try {
        return JSON.parse(value || "[]") as unknown;
      } catch {
        ctx.addIssue({ code: "custom", message: `The ${label} could not be read.` });
        return z.NEVER;
      }
    })
    .pipe(z.array(item).max(max, { error: `Use at most ${max} ${label}.` }));

export const packageSchema = z
  .object({
    name: required("a name", 160),
    slug: slugField,
    shortDescription: text(300),
    description: text(10000),
    days: intField("Days", 1, 60),
    nights: intField("Nights", 0, 60),
    accommodationDescription: text(1000),
    transfersDescription: text(1000),
    mealsDescription: text(500),
    inclusions: lines(),
    exclusions: lines(),
    terms: lines(30, 600),
    isSafari: checkbox,
    travelStyles,
    isFeatured: checkbox,
    coverImagePath: mediaPath,
    coverImageAlt: optionalText(200),
    status: publishStatus,
    sortOrder: intField("Order", 0, 1000),
    itinerary: jsonArray(itineraryDaySchema, 60, "itinerary days"),
    tourIds: z.array(z.uuid()).max(60),
    destinationIds: z.array(z.uuid()).max(30),
    ...seo,
  })
  .transform(withSlug)
  .refine(slugRefinement.check, slugRefinement.params)
  .refine((v) => v.nights <= v.days, {
    error: "Nights can't be more than days.",
    path: ["nights"],
  });

export const articleSchema = z
  .object({
    title: required("a title", 200),
    slug: slugField,
    excerpt: text(400),
    body: z
      .string()
      .max(40000, { error: "The article is too long." })
      .transform((v) => parseArticleMarkup(v)),
    tags: z
      .string()
      .transform((v) =>
        v
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      )
      .pipe(z.array(z.string().max(40)).max(10, { error: "Use at most 10 tags." })),
    readingMinutes: z
      .string()
      .trim()
      .transform((v) => (v === "" ? null : Number(v)))
      .pipe(z.number().int().min(1).max(120).nullable()),
    coverImagePath: mediaPath,
    coverImageAlt: optionalText(200),
    status: publishStatus,
    ...seo,
  })
  .transform(withSlug)
  .refine(slugRefinement.check, slugRefinement.params);

export const priceRowSchema = z.object({
  market: z.enum(["resident", "east_african", "international"]),
  customerType: z.enum(["adult", "child", "group"]),
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, { error: "Use a 3-letter currency code." }),
  amount: z.coerce
    .number({ error: "Enter an amount." })
    .min(0, { error: "Amounts can't be negative." })
    .max(1_000_000_000),
  unitLabel: z.string().trim().max(60),
  isIllustrative: z.boolean(),
  isActive: z.boolean(),
});

export const pricesSchema = z.object({
  prices: jsonArray(priceRowSchema, 30, "prices").refine(
    (rows) =>
      new Set(rows.map((r) => `${r.market}:${r.customerType}:${r.currency}`)).size ===
      rows.length,
    { error: "Each market, traveller type and currency can only have one price." },
  ),
});

export const tourOptionSchema = z.object({
  name: z.string().trim().min(1, { error: "Every option needs a name." }).max(120),
  description: z
    .string()
    .trim()
    .max(300, { error: "Keep descriptions under 300 characters." }),
  pricing: z.enum(["per_person", "per_booking"], {
    error: "Choose how the option is priced.",
  }),
  isActive: z.boolean(),
  prices: z
    .array(
      z.object({
        market: z.enum(["resident", "east_african", "international"]),
        currency: z
          .string()
          .trim()
          .toUpperCase()
          .regex(/^[A-Z]{3}$/, { error: "Use a 3-letter currency code." }),
        amount: z.coerce
          .number({ error: "Enter an amount." })
          .min(0, { error: "Amounts can't be negative." })
          .max(1_000_000_000),
      }),
    )
    .max(9)
    .refine(
      (rows) =>
        new Set(rows.map((r) => `${r.market}:${r.currency}`)).size === rows.length,
      { error: "Each option can only have one price per market and currency." },
    ),
});

export const tourOptionsSchema = z.object({
  options: jsonArray(tourOptionSchema, 20, "options"),
});

export const galleryImageSchema = z.object({
  storagePath: mediaPath.refine((v) => v !== null, { error: "Choose an image." }),
  altText: z.string().trim().min(1, { error: "Describe each image." }).max(200),
});

export const gallerySchema = z.object({
  images: jsonArray(galleryImageSchema, 20, "images"),
});

export type TourInput = z.infer<typeof tourSchema>;
export type PackageInput = z.infer<typeof packageSchema>;
export type PriceRowInput = z.infer<typeof priceRowSchema>;
export type ItineraryDayInput = z.infer<typeof itineraryDaySchema>;
