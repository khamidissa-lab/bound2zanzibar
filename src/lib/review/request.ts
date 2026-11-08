import { z } from "zod";

import type { Enums } from "@/lib/supabase/database.types";

/**
 * Review form rules. They mirror public.submit_review, which re-checks
 * everything (and that the link belongs to a completed booking).
 */
export const reviewRequestSchema = z.object({
  token: z.uuid("This review link isn't valid."),
  rating: z.coerce
    .number({ error: "Choose a rating from 1 to 5 stars." })
    .int("Choose a rating from 1 to 5 stars.")
    .min(1, "Choose a rating from 1 to 5 stars.")
    .max(5, "Choose a rating from 1 to 5 stars."),
  title: z.string().trim().max(120, "Use 120 characters or fewer."),
  body: z
    .string()
    .trim()
    .min(10, "Tell us a little more (at least 10 characters).")
    .max(2000, "Use 2,000 characters or fewer."),
  displayName: z
    .string()
    .trim()
    .min(2, "Enter the name to show with your review.")
    .max(60, "Use 60 characters or fewer."),
  country: z.string().trim().max(60, "Use 60 characters or fewer."),
  consent: z.literal("on", "Please agree so we can publish your review."),
});

export type ReviewRequest = z.output<typeof reviewRequestSchema>;

/** Friendly text for the error keys raised by public.submit_review. */
export const REVIEW_ERROR_MESSAGES: Record<string, string> = {
  review_invalid_link: "This review link isn't valid.",
  review_already_submitted: "We've already received a review for this trip. Thank you!",
  review_invalid_rating: "Choose a rating from 1 to 5 stars.",
  review_invalid_body: "Tell us a little more (at least 10 characters).",
  review_invalid_name: "Enter the name to show with your review.",
  review_text_too_long: "Some of your answers are too long.",
};

export function reviewErrorMessage(dbMessage: string | undefined): string | null {
  if (!dbMessage) return null;
  const key = Object.keys(REVIEW_ERROR_MESSAGES).find((k) => dbMessage.includes(k));
  return key ? REVIEW_ERROR_MESSAGES[key] : null;
}

export type ReviewStatus = Enums<"review_status">;
export const REVIEW_STATUSES = [
  "pending",
  "approved",
  "rejected",
] as const satisfies readonly ReviewStatus[];

export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  pending: "Waiting for approval",
  approved: "Published",
  rejected: "Not published",
};
