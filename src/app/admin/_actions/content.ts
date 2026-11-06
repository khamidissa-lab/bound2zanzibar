"use server";

import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import type { z } from "zod";

import type { Permission } from "@/lib/auth/permissions";
import { authorizeAction } from "@/lib/auth/session";
import { formValues, type FormState } from "@/lib/forms";
import { MEDIA_BUCKET } from "@/lib/media";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fieldErrors } from "@/lib/validation/auth";
import {
  articleSchema,
  categorySchema,
  destinationSchema,
  gallerySchema,
  mediaPath,
  packageSchema,
  pricesSchema,
  tourOptionsSchema,
  tourSchema,
} from "@/lib/validation/content";
import { CONTENT_TAG } from "@/services/content-db";

type DbError = { code?: string; message: string } | null;

/** Maps database errors to safe, friendly messages (never raw SQL). */
function dbErrorMessage(error: NonNullable<DbError>): FormState {
  if (error.code === "23505") {
    return {
      status: "error",
      message: "That URL (slug) is already used. Choose a different one.",
      fieldErrors: { slug: "Already in use." },
    };
  }
  if (error.code === "23503") {
    return {
      status: "error",
      message:
        "This item is still linked to bookings or other content, so it can't be deleted. Archive it instead.",
    };
  }
  if (error.code === "42501" || /row-level security/i.test(error.message)) {
    return { status: "error", message: "You don't have permission to do that." };
  }
  console.error(`[admin] write failed: ${error.code ?? ""} ${error.message}`);
  return { status: "error", message: "We couldn't save your changes. Please try again." };
}

/** Shared preamble: authorise, then validate with a schema. */
async function prepare<S extends z.ZodType>(
  permission: Permission,
  schema: S,
  input: unknown,
): Promise<{ ok: true; data: z.infer<S> } | { ok: false; state: FormState }> {
  const auth = await authorizeAction(permission);
  if (!auth.ok) return { ok: false, state: { status: "error", message: auth.message } };
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      state: {
        status: "error",
        message: "Please fix the highlighted fields.",
        fieldErrors: fieldErrors(parsed.error),
      },
    };
  }
  return { ok: true, data: parsed.data };
}

const published = (status: string) => status === "published";
const idOf = (formData: FormData) => {
  const id = formData.get("id");
  return typeof id === "string" && /^[0-9a-f-]{36}$/i.test(id) ? id : null;
};

/** Expires public content caches and re-renders the current admin page. */
function saved(message = "Saved."): FormState {
  updateTag(CONTENT_TAG);
  refresh();
  return { status: "success", message };
}

// --- Categories ------------------------------------------------------------

export async function saveCategory(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const input = await prepare("content.manage", categorySchema, formValues(formData));
  if (!input.ok) return input.state;
  const v = input.data;
  const row = {
    name: v.name,
    slug: v.slug,
    description: v.description,
    sort_order: v.sortOrder,
    is_active: v.isActive,
  };
  const supabase = await createSupabaseServerClient();
  const id = idOf(formData);
  const { error } = id
    ? await supabase.from("tour_categories").update(row).eq("id", id)
    : await supabase.from("tour_categories").insert(row);
  if (error) return dbErrorMessage(error);
  return saved(id ? "Category saved." : "Category added.");
}

// --- Tours -------------------------------------------------------------------

export async function saveTour(_prev: FormState, formData: FormData): Promise<FormState> {
  const input = await prepare("content.manage", tourSchema, {
    ...formValues(formData),
    travelStyles: formData.getAll("travelStyles").filter((v) => typeof v === "string"),
  });
  if (!input.ok) return input.state;
  const v = input.data;
  const row = {
    name: v.name,
    slug: v.slug,
    category_id: v.categoryId,
    destination_id: v.destinationId,
    short_description: v.shortDescription,
    description: v.description,
    duration_text: v.durationText,
    length: v.length,
    travel_styles: v.travelStyles,
    highlights: v.highlights,
    inclusions: v.inclusions,
    exclusions: v.exclusions,
    what_to_bring: v.whatToBring,
    meeting_point: v.meetingPoint,
    difficulty: v.difficulty,
    suitability: v.suitability,
    what_to_expect: v.whatToExpect,
    good_to_know: v.goodToKnow,
    faqs: v.faqs,
    cover_image_path: v.coverImagePath,
    cover_image_alt: v.coverImageAlt,
    is_featured: v.isFeatured,
    status: v.status,
    sort_order: v.sortOrder,
    seo_title: v.seoTitle,
    seo_description: v.seoDescription,
    // Anything saved through the admin is real content, not seed sample data.
    is_sample: false,
  };

  const supabase = await createSupabaseServerClient();
  const id = idOf(formData);
  if (id) {
    const { error } = await supabase.from("tours").update(row).eq("id", id);
    if (error) return dbErrorMessage(error);
    return saved(published(v.status) ? "Saved and live on the website." : "Saved.");
  }
  const { data, error } = await supabase.from("tours").insert(row).select("id").single();
  if (error) return dbErrorMessage(error);
  updateTag(CONTENT_TAG);
  redirect(`/admin/tours/${data.id}?created=1`);
}

export async function saveTourPrices(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const input = await prepare("prices.manage", pricesSchema, formValues(formData));
  if (!input.ok) return input.state;
  const id = idOf(formData);
  if (!id) return { status: "error", message: "Save the tour first." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("set_tour_prices", {
    p_tour_id: id,
    p_prices: input.data.prices.map((p) => ({
      market: p.market,
      customer_type: p.customerType,
      currency: p.currency,
      amount: p.amount,
      unit_label: p.unitLabel,
      is_illustrative: p.isIllustrative,
      is_active: p.isActive,
    })),
  });
  if (error) return dbErrorMessage(error);
  return saved("Prices saved.");
}

export async function saveTourOptions(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const input = await prepare("prices.manage", tourOptionsSchema, formValues(formData));
  if (!input.ok) return input.state;
  const id = idOf(formData);
  if (!id) return { status: "error", message: "Save the tour first." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("set_tour_options", {
    p_tour_id: id,
    p_options: input.data.options.map((o) => ({
      name: o.name,
      description: o.description,
      pricing: o.pricing,
      is_active: o.isActive,
      prices: o.prices,
    })),
  });
  if (error) return dbErrorMessage(error);
  return saved("Options saved.");
}

export async function saveTourGallery(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const input = await prepare("content.manage", gallerySchema, formValues(formData));
  if (!input.ok) return input.state;
  const id = idOf(formData);
  if (!id) return { status: "error", message: "Save the tour first." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("set_tour_gallery", {
    p_tour_id: id,
    p_images: input.data.images.map((img) => ({
      storage_path: img.storagePath,
      alt_text: img.altText,
    })),
  });
  if (error) return dbErrorMessage(error);
  return saved("Gallery saved.");
}

// --- Destinations ------------------------------------------------------------

export async function saveDestination(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const input = await prepare("content.manage", destinationSchema, formValues(formData));
  if (!input.ok) return input.state;
  const v = input.data;
  const row = {
    name: v.name,
    slug: v.slug,
    region: v.region,
    short_description: v.shortDescription,
    description: v.description,
    highlights: v.highlights,
    cover_image_path: v.coverImagePath,
    cover_image_alt: v.coverImageAlt,
    is_featured: v.isFeatured,
    status: v.status,
    sort_order: v.sortOrder,
    seo_title: v.seoTitle,
    seo_description: v.seoDescription,
    is_sample: false,
  };
  const supabase = await createSupabaseServerClient();
  const id = idOf(formData);
  if (id) {
    const { error } = await supabase.from("destinations").update(row).eq("id", id);
    if (error) return dbErrorMessage(error);
    return saved(published(v.status) ? "Saved and live on the website." : "Saved.");
  }
  const { data, error } = await supabase
    .from("destinations")
    .insert(row)
    .select("id")
    .single();
  if (error) return dbErrorMessage(error);
  updateTag(CONTENT_TAG);
  redirect(`/admin/destinations/${data.id}?created=1`);
}

// --- Packages ----------------------------------------------------------------

export async function savePackage(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const input = await prepare("content.manage", packageSchema, {
    ...formValues(formData),
    tourIds: formData.getAll("tourIds").filter((v) => typeof v === "string"),
    destinationIds: formData
      .getAll("destinationIds")
      .filter((v) => typeof v === "string"),
    travelStyles: formData.getAll("travelStyles").filter((v) => typeof v === "string"),
  });
  if (!input.ok) return input.state;
  const v = input.data;
  const row = {
    name: v.name,
    slug: v.slug,
    short_description: v.shortDescription,
    description: v.description,
    days: v.days,
    nights: v.nights,
    accommodation_description: v.accommodationDescription,
    transfers_description: v.transfersDescription,
    meals_description: v.mealsDescription,
    inclusions: v.inclusions,
    exclusions: v.exclusions,
    terms: v.terms,
    is_safari: v.isSafari,
    travel_styles: v.travelStyles,
    is_featured: v.isFeatured,
    cover_image_path: v.coverImagePath,
    cover_image_alt: v.coverImageAlt,
    status: v.status,
    sort_order: v.sortOrder,
    seo_title: v.seoTitle,
    seo_description: v.seoDescription,
    is_sample: false,
  };

  const supabase = await createSupabaseServerClient();
  let id = idOf(formData);
  if (id) {
    const { error } = await supabase.from("packages").update(row).eq("id", id);
    if (error) return dbErrorMessage(error);
  } else {
    const { data, error } = await supabase
      .from("packages")
      .insert(row)
      .select("id")
      .single();
    if (error) return dbErrorMessage(error);
    id = data.id;
  }

  // Itinerary, included tours and destinations are replaced atomically.
  const { error: detailsError } = await supabase.rpc("set_package_details", {
    p_package_id: id,
    p_itinerary: v.itinerary.map((day, index) => ({
      day_number: index + 1,
      title: day.title,
      description: day.description,
      meals: day.meals,
      overnight: day.overnight,
    })),
    p_tour_ids: v.tourIds,
    p_destination_ids: v.destinationIds,
  });
  if (detailsError) {
    const state = dbErrorMessage(detailsError);
    return {
      ...state,
      message: `The package details were saved, but the itinerary and links were not: ${state.message}`,
    };
  }

  if (!idOf(formData)) {
    updateTag(CONTENT_TAG);
    redirect(`/admin/packages/${id}?created=1`);
  }
  return saved(published(v.status) ? "Saved and live on the website." : "Saved.");
}

export async function savePackagePrices(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const input = await prepare("prices.manage", pricesSchema, formValues(formData));
  if (!input.ok) return input.state;
  const id = idOf(formData);
  if (!id) return { status: "error", message: "Save the package first." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("set_package_prices", {
    p_package_id: id,
    p_prices: input.data.prices.map((p) => ({
      market: p.market,
      customer_type: p.customerType,
      currency: p.currency,
      amount: p.amount,
      unit_label: p.unitLabel,
      is_illustrative: p.isIllustrative,
      is_active: p.isActive,
    })),
  });
  if (error) return dbErrorMessage(error);
  return saved("Prices saved.");
}

// --- Travel guide articles -----------------------------------------------------

export async function saveArticle(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const input = await prepare("content.manage", articleSchema, formValues(formData));
  if (!input.ok) return input.state;
  const v = input.data;
  const auth = await authorizeAction("content.manage");
  const row = {
    title: v.title,
    slug: v.slug,
    excerpt: v.excerpt,
    body: v.body,
    tags: v.tags,
    reading_minutes: v.readingMinutes,
    cover_image_path: v.coverImagePath,
    cover_image_alt: v.coverImageAlt,
    status: v.status,
    seo_title: v.seoTitle,
    seo_description: v.seoDescription,
    is_sample: false,
  };
  const supabase = await createSupabaseServerClient();
  const id = idOf(formData);
  if (id) {
    const { error } = await supabase.from("blog_posts").update(row).eq("id", id);
    if (error) return dbErrorMessage(error);
    return saved(published(v.status) ? "Saved and live on the website." : "Saved.");
  }
  const { data, error } = await supabase
    .from("blog_posts")
    .insert({ ...row, author_profile_id: auth.ok ? auth.staff.id : null })
    .select("id")
    .single();
  if (error) return dbErrorMessage(error);
  updateTag(CONTENT_TAG);
  redirect(`/admin/travel-guide/${data.id}?created=1`);
}

// --- Deleting (admins only; editors archive instead) --------------------------

const deletable = {
  tours: "/admin/tours",
  destinations: "/admin/destinations",
  packages: "/admin/packages",
  blog_posts: "/admin/travel-guide",
  tour_categories: "/admin/tours/categories",
} as const;

export async function deleteContent(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const auth = await authorizeAction("content.delete");
  if (!auth.ok) return { status: "error", message: auth.message };
  const table = formData.get("table");
  const id = idOf(formData);
  if (typeof table !== "string" || !(table in deletable) || !id) {
    return { status: "error", message: "Invalid request." };
  }
  const key = table as keyof typeof deletable;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from(key).delete().eq("id", id).select("id");
  if (error) return dbErrorMessage(error);
  if (!data || data.length === 0) {
    return { status: "error", message: "That item could not be deleted." };
  }
  updateTag(CONTENT_TAG);
  redirect(`${deletable[key]}?deleted=1`);
}

// --- Media -----------------------------------------------------------------------

/** Called after a browser upload finishes so pages using images refresh. */
export async function mediaChanged(): Promise<void> {
  const auth = await authorizeAction("content.manage");
  if (!auth.ok) return;
  updateTag(CONTENT_TAG);
  refresh();
}

export async function deleteMedia(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const auth = await authorizeAction("content.manage");
  if (!auth.ok) return { status: "error", message: auth.message };
  const parsed = mediaPath.safeParse(formData.get("path") ?? "");
  if (!parsed.success || !parsed.data)
    return { status: "error", message: "Invalid file." };
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.storage.from(MEDIA_BUCKET).remove([parsed.data]);
  if (error || !data || data.length === 0) {
    return { status: "error", message: "We couldn't delete that image." };
  }
  return saved("Image deleted.");
}
