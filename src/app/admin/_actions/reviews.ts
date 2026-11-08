"use server";

import { refresh, updateTag } from "next/cache";
import { z } from "zod";

import { authorizeAction } from "@/lib/auth/session";
import type { FormState } from "@/lib/forms";
import { REVIEW_STATUSES } from "@/lib/review/request";
import { CONTENT_TAG } from "@/services/content-db";
import { deleteReview, setReviewStatus } from "@/services/reviews";

const moderateSchema = z.object({
  id: z.uuid(),
  status: z.enum(REVIEW_STATUSES),
});

/** Publishes or unpublishes a review (content managers; RLS enforced). */
export async function moderateReview(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const auth = await authorizeAction("content.manage");
  if (!auth.ok) return { status: "error", message: auth.message };
  const parsed = moderateSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });
  if (!parsed.success)
    return { status: "error", message: "That review no longer exists." };
  const ok = await setReviewStatus(parsed.data.id, parsed.data.status);
  if (!ok) return { status: "error", message: "That review no longer exists." };
  // Ratings and review lists on the public pages update straight away.
  updateTag(CONTENT_TAG);
  refresh();
  return {
    status: "success",
    message: parsed.data.status === "approved" ? "Review published." : "Review hidden.",
  };
}

export async function removeReview(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const auth = await authorizeAction("content.manage");
  if (!auth.ok) return { status: "error", message: auth.message };
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return { status: "error", message: "That review no longer exists." };
  const ok = await deleteReview(id.data);
  if (!ok) return { status: "error", message: "That review no longer exists." };
  updateTag(CONTENT_TAG);
  refresh();
  return { status: "success", message: "Review deleted." };
}
