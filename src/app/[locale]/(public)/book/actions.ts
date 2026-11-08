"use server";

import { redirect } from "next/navigation";

import { contact } from "@/config/site";
import { isLocale, localizePath } from "@/i18n/config";
import { bookingErrorMessage, bookingRequestSchema } from "@/lib/booking/request";
import { formValues, type FormState } from "@/lib/forms";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { zanzibarDate } from "@/services/admin-dashboard-model";
import { submitBookingRequest } from "@/services/bookings";
import { identifyCurrentVisitor } from "@/services/visitor-tracking";

const UNAVAILABLE = `Online booking requests aren't available right now. Please email ${contact.email} or call ${contact.phoneDisplay} and we'll help you directly.`;

/**
 * Saves a booking REQUEST (status "pending"). Nothing is confirmed or charged:
 * the team replies to confirm availability and the final price.
 */
export async function requestBooking(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = formValues(formData);
  // Echo back what the visitor typed (minus the honeypot) so a validation
  // error never wipes the form.
  const { website, ...echo } = values;
  // The confirmation page opens in the language the form was sent from.
  const locale = isLocale(values.locale) ? values.locale : "en";
  const received = localizePath(locale, "/book/received");

  // Honeypot: hidden from people, often filled in by bots. Pretend success.
  if (website) redirect(received);

  if (!isSupabaseConfigured()) {
    return { status: "error", message: UNAVAILABLE, values: echo };
  }

  const parsed = bookingRequestSchema(zanzibarDate(new Date())).safeParse({
    ...values,
    optionIds: formData.getAll("optionIds").filter((v) => typeof v === "string"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      fieldErrors[key] ??= issue.message;
    }
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors,
      values: echo,
    };
  }

  const result = await submitBookingRequest(parsed.data);
  if (!result.ok) {
    const friendly = bookingErrorMessage(result.dbMessage);
    if (!friendly) console.error("[booking] request failed:", result.dbMessage);
    return { status: "error", message: friendly ?? UNAVAILABLE, values: echo };
  }

  // Links the details to the visitor record (only with tracking consent).
  await identifyCurrentVisitor({
    source: "booking",
    email: parsed.data.email,
    name: parsed.data.customerName,
    phone: parsed.data.phone,
    reference: result.reference,
    item: parsed.data.item,
  });
  redirect(`${received}?ref=${encodeURIComponent(result.reference)}`);
}
