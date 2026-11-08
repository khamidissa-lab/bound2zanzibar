"use server";

import { redirect } from "next/navigation";

import { contact } from "@/config/site";
import { isLocale, localizePath } from "@/i18n/config";
import { formValues, type FormState } from "@/lib/forms";
import { journeyErrorMessage, journeyRequestSchema } from "@/lib/journey/request";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { zanzibarDate } from "@/services/admin-dashboard-model";
import { submitJourneyRequest } from "@/services/journeys";

const UNAVAILABLE = `Journey requests aren't available online right now. Please email ${contact.email} or call ${contact.phoneDisplay} and we'll help you directly.`;

const strings = (formData: FormData, key: string) =>
  formData.getAll(key).filter((v): v is string => typeof v === "string");

/**
 * Saves a custom journey request for a personalised quotation. Nothing is
 * booked or charged: the team replies with a proposal.
 */
export async function requestJourney(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = formValues(formData);
  const destinations = strings(formData, "destinations");
  const interests = strings(formData, "interests");
  // Echo what the visitor entered (minus the honeypot) so errors never wipe it.
  const { website, ...rest } = values;
  const echo = {
    ...rest,
    destinations: destinations.join(","),
    interests: interests.join(","),
  };
  const locale = isLocale(values.locale) ? values.locale : "en";
  const received = localizePath(locale, "/design-your-journey/received");

  if (website) redirect(received);
  if (!isSupabaseConfigured())
    return { status: "error", message: UNAVAILABLE, values: echo };

  const parsed = journeyRequestSchema(zanzibarDate(new Date())).safeParse({
    ...values,
    destinations,
    interests,
  });
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

  const result = await submitJourneyRequest(parsed.data, locale);
  if (!result.ok) {
    const friendly = journeyErrorMessage(result.dbMessage);
    if (!friendly) console.error("[journey] request failed:", result.dbMessage);
    return { status: "error", message: friendly ?? UNAVAILABLE, values: echo };
  }

  redirect(`${received}?ref=${encodeURIComponent(result.reference)}`);
}
