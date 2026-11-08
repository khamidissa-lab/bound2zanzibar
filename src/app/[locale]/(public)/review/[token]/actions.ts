"use server";

import { isLocale } from "@/i18n/config";
import { formValues, type FormState } from "@/lib/forms";
import { reviewErrorMessage, reviewRequestSchema } from "@/lib/review/request";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { submitReview } from "@/services/reviews";

const UNAVAILABLE =
  "Reviews can't be sent right now. Please try again later or contact us.";

/** Saves a review for staff approval; it is never published automatically. */
export async function sendReview(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = formValues(formData);
  const { website, ...echo } = values;
  // Honeypot: pretend success for bots.
  if (website) return { status: "success", message: "" };
  if (!isSupabaseConfigured())
    return { status: "error", message: UNAVAILABLE, values: echo };

  const parsed = reviewRequestSchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues)
      fieldErrors[String(issue.path[0])] ??= issue.message;
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors,
      values: echo,
    };
  }

  const locale = isLocale(values.locale) ? values.locale : "en";
  const result = await submitReview(parsed.data, locale);
  if (!result.ok) {
    const friendly = reviewErrorMessage(result.dbMessage);
    if (!friendly) console.error("[review] failed:", result.dbMessage);
    return { status: "error", message: friendly ?? UNAVAILABLE, values: echo };
  }
  return { status: "success", message: "" };
}
