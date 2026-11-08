import "server-only";

import type { ReviewRequest, ReviewStatus } from "@/lib/review/request";
import type { Tables } from "@/lib/supabase/database.types";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Public: through SECURITY DEFINER functions; the link is the only key.
// ---------------------------------------------------------------------------

export type ReviewInvitation = {
  firstName: string;
  itemName: string;
  alreadyReviewed: boolean;
};

/** Null when the link is unknown or its booking isn't completed. */
export async function getReviewInvitation(
  token: string,
): Promise<ReviewInvitation | null> {
  const { data, error } = await createSupabasePublicClient().rpc(
    "get_review_invitation",
    {
      p_token: token,
    },
  );
  const row = data?.[0];
  if (error || !row) return null;
  return {
    firstName: row.first_name,
    itemName: row.item_name,
    alreadyReviewed: row.already_reviewed,
  };
}

export async function submitReview(
  req: ReviewRequest,
  locale: string,
): Promise<{ ok: true } | { ok: false; dbMessage: string }> {
  const { error } = await createSupabasePublicClient().rpc("submit_review", {
    p_token: req.token,
    p_rating: req.rating,
    p_body: req.body,
    p_display_name: req.displayName,
    p_title: req.title || undefined,
    p_country: req.country || undefined,
    p_locale: locale,
  });
  return error ? { ok: false, dbMessage: error.message } : { ok: true };
}

// ---------------------------------------------------------------------------
// Staff moderation: signed-in session, so RLS decides (content managers).
// ---------------------------------------------------------------------------

export type AdminReview = Tables<"reviews"> & {
  booking: { reference: string } | null;
  tour: { name: string; slug: string } | null;
  package: { name: string; slug: string } | null;
};

function failed(what: string, error: { message: string }): never {
  console.error(`[reviews] failed to ${what}: ${error.message}`);
  throw new Error(`Failed to ${what}`);
}

export async function listReviews(status: ReviewStatus): Promise<AdminReview[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("reviews")
    .select(
      "*, booking:bookings(reference), tour:tours(name, slug), package:packages(name, slug)",
    )
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) failed("load reviews", error);
  return data as unknown as AdminReview[];
}

export async function countReviewsByStatus(): Promise<Record<ReviewStatus, number>> {
  const supabase = await createSupabaseServerClient();
  const statuses: ReviewStatus[] = ["pending", "approved", "rejected"];
  const counts = await Promise.all(
    statuses.map(async (status) => {
      const { count, error } = await supabase
        .from("reviews")
        .select("id", { count: "exact", head: true })
        .eq("status", status);
      if (error) failed("count reviews", error);
      return [status, count ?? 0] as const;
    }),
  );
  return Object.fromEntries(counts) as Record<ReviewStatus, number>;
}

/** Returns false when the review isn't visible to the signed-in staff member. */
export async function setReviewStatus(
  id: string,
  status: ReviewStatus,
): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("reviews")
    .update({ status })
    .eq("id", id)
    .select("id");
  if (error) failed("moderate review", error);
  return (data ?? []).length > 0;
}

export async function deleteReview(id: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", id)
    .select("id");
  if (error) failed("delete review", error);
  return (data ?? []).length > 0;
}
