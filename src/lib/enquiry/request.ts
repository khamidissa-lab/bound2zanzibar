import { z } from "zod";

import type { Enums } from "@/lib/supabase/database.types";

/**
 * Contact-form rules. They mirror public.submit_inquiry, which re-checks
 * everything in the database.
 */
export const enquiryRequestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your name.")
    .max(120, "Use 120 characters or fewer."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254, "That email address is too long.")
    .pipe(z.email("Enter a valid email address, like name@example.com.")),
  phone: z
    .string()
    .trim()
    .max(40, "That phone number is too long.")
    .refine(
      (v) => v === "" || /^\+?[0-9 ()-]{6,40}$/.test(v),
      "Enter a phone number with country code, or leave it empty.",
    ),
  subject: z.string().trim().max(200, "Use 200 characters or fewer."),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a little more (at least 10 characters).")
    .max(4000, "Use 4,000 characters or fewer."),
  consent: z.literal("on", "Please agree so we can reply to you."),
});

export type EnquiryRequest = z.output<typeof enquiryRequestSchema>;

export const ENQUIRY_ERROR_MESSAGES: Record<string, string> = {
  inquiry_invalid_name: "Please check your name.",
  inquiry_invalid_email: "Please check your email address.",
  inquiry_invalid_message: "Please check your message.",
  inquiry_text_too_long: "Your phone number or subject is too long.",
  inquiry_rate_limited:
    "We've received several messages from you recently. Please wait an hour or contact us directly.",
};

export function enquiryErrorMessage(dbMessage: string | undefined): string | null {
  if (!dbMessage) return null;
  const key = Object.keys(ENQUIRY_ERROR_MESSAGES).find((k) => dbMessage.includes(k));
  return key ? ENQUIRY_ERROR_MESSAGES[key] : null;
}

export type EnquiryStatus = Enums<"inquiry_status">;

export const ENQUIRY_STATUSES = [
  "new",
  "in_progress",
  "closed",
] as const satisfies readonly EnquiryStatus[];

export const ENQUIRY_STATUS_LABELS: Record<EnquiryStatus, string> = {
  new: "New",
  in_progress: "In progress",
  closed: "Closed",
};

export const ENQUIRY_STATUS_HINTS: Record<EnquiryStatus, string> = {
  new: "Not answered yet.",
  in_progress: "You've replied and the conversation is ongoing.",
  closed: "Answered or no further action needed.",
};
