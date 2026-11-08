"use server";

import { contact } from "@/config/site";
import { enquiryErrorMessage, enquiryRequestSchema } from "@/lib/enquiry/request";
import { formValues, type FormState } from "@/lib/forms";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { submitEnquiry } from "@/services/enquiries";
import { identifyCurrentVisitor } from "@/services/visitor-tracking";

const UNAVAILABLE = `The contact form isn't available right now. Please email ${contact.email} or message us on WhatsApp at ${contact.phoneDisplay}.`;
const SENT = "Thank you — your message has been sent. Our team will reply by email.";

/** Saves a contact-form message for the team. */
export async function sendEnquiry(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = formValues(formData);
  const { website, ...echo } = values;

  // Honeypot: hidden from people, often filled in by bots. Pretend success.
  if (website) return { status: "success", message: SENT };

  if (!isSupabaseConfigured()) {
    return { status: "error", message: UNAVAILABLE, values: echo };
  }

  const parsed = enquiryRequestSchema.safeParse(values);
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

  const result = await submitEnquiry(parsed.data);
  if (!result.ok) {
    const friendly = enquiryErrorMessage(result.dbMessage);
    if (!friendly) console.error("[enquiry] failed:", result.dbMessage);
    return { status: "error", message: friendly ?? UNAVAILABLE, values: echo };
  }

  await identifyCurrentVisitor({
    source: "enquiry",
    email: parsed.data.email,
    name: parsed.data.name,
    phone: parsed.data.phone || null,
  });
  return { status: "success", message: SENT };
}
