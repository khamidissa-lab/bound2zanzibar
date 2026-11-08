import { z } from "zod";

import {
  addDays,
  BOOKING_WINDOW_DAYS,
  CURRENCIES,
  MAX_TRAVELLERS,
} from "@/lib/booking/request";
import type { Enums } from "@/lib/supabase/database.types";

/**
 * "Design Your Zanzibar Journey" request rules. They mirror
 * public.submit_journey_request, which re-checks everything in the database.
 * Messages are English keys, translated through the `errors` dictionary.
 */

export type AccommodationLevel = Enums<"accommodation_level">;
export const ACCOMMODATION_LEVELS = [
  "budget",
  "mid_range",
  "luxury",
  "mixed",
  "not_sure",
] as const satisfies readonly AccommodationLevel[];

export const MAX_TRIP_DAYS = 90;
export const JOURNEY_REFERENCE_RE = /^JRN-\d{4}-[0-9A-F]{8}$/;

const SLUG = /^[a-z0-9_-]{1,40}$/;

const isRealDate = (value: string) => {
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
};

const count = (label: string, min: number) =>
  z
    .string()
    .trim()
    .regex(/^\d{1,3}$/, `Enter the number of ${label}.`)
    .transform(Number)
    .pipe(
      z
        .number()
        .min(min, "At least 1 adult is required.")
        .max(MAX_TRAVELLERS, `For groups over ${MAX_TRAVELLERS}, please contact us.`),
    );

const optionalDate = z
  .string()
  .trim()
  .refine((v) => v === "" || (/^\d{4}-\d{2}-\d{2}$/.test(v) && isRealDate(v)), {
    message: "Choose a valid date.",
  });

/** @param today the current date in Zanzibar ("YYYY-MM-DD"). */
export function journeyRequestSchema(today: string) {
  const lastDate = addDays(today, BOOKING_WINDOW_DAYS);
  return z
    .object({
      destinations: z.array(z.string().regex(SLUG)).max(20).default([]),
      startDate: optionalDate,
      endDate: optionalDate,
      flexibleDates: z
        .string()
        .optional()
        .transform((v) => v === "on"),
      adults: count("adults", 1),
      children: count("children", 0),
      accommodation: z.enum(ACCOMMODATION_LEVELS).catch("not_sure"),
      budgetAmount: z
        .string()
        .trim()
        .refine((v) => v === "" || (/^\d{1,10}(\.\d{1,2})?$/.test(v) && Number(v) > 0), {
          message: "Enter a budget greater than zero, or leave it empty.",
        }),
      budgetCurrency: z.enum(CURRENCIES, "Choose a currency."),
      interests: z.array(z.string().regex(SLUG)).max(20).default([]),
      specialRequirements: z.string().trim().max(2000, "Use 2,000 characters or fewer."),
      message: z.string().trim().max(2000, "Use 2,000 characters or fewer."),
      customerName: z
        .string()
        .trim()
        .min(2, "Enter your full name.")
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
      country: z.string().trim().max(80, "Use 80 characters or fewer."),
      consent: z.literal("on", "Please agree so we can reply to your request."),
    })
    .superRefine((v, ctx) => {
      if (v.startDate && v.startDate < today)
        ctx.addIssue({
          code: "custom",
          path: ["startDate"],
          message: "Choose a date from today onwards.",
        });
      else if (v.startDate && v.startDate > lastDate)
        ctx.addIssue({
          code: "custom",
          path: ["startDate"],
          message: "We take requests up to two years ahead.",
        });
      if (v.endDate && !v.startDate)
        ctx.addIssue({
          code: "custom",
          path: ["startDate"],
          message: "Add a start date first.",
        });
      else if (v.endDate && v.endDate < v.startDate)
        ctx.addIssue({
          code: "custom",
          path: ["endDate"],
          message: "The end date must be on or after the start date.",
        });
      else if (v.endDate && v.endDate > addDays(v.startDate, MAX_TRIP_DAYS))
        ctx.addIssue({
          code: "custom",
          path: ["endDate"],
          message: "Trips can be up to 90 days long.",
        });
    });
}

export type JourneyRequest = z.output<ReturnType<typeof journeyRequestSchema>>;

/** Friendly text for the error keys raised by public.submit_journey_request. */
export const JOURNEY_ERROR_MESSAGES: Record<string, string> = {
  journey_invalid_name: "Please check your name.",
  journey_invalid_email: "Please check your email address.",
  journey_invalid_phone: "Please check your phone number.",
  journey_invalid_party_size: "Please check the number of travellers.",
  journey_invalid_dates: "Please check your travel dates.",
  journey_invalid_destinations: "Please choose destinations from the list.",
  journey_invalid_interests: "Please choose interests from the list.",
  journey_invalid_budget: "Please check your budget.",
  journey_text_too_long: "Some of your answers are too long.",
  journey_rate_limited:
    "We've received several requests from you recently. Please wait an hour or contact us directly.",
};

export function journeyErrorMessage(dbMessage: string | undefined): string | null {
  if (!dbMessage) return null;
  const key = Object.keys(JOURNEY_ERROR_MESSAGES).find((k) => dbMessage.includes(k));
  return key ? JOURNEY_ERROR_MESSAGES[key] : null;
}

// --- Staff ------------------------------------------------------------------

export type JourneyStatus = Enums<"journey_status">;

export const JOURNEY_STATUSES = [
  "new",
  "in_progress",
  "quoted",
  "closed",
] as const satisfies readonly JourneyStatus[];

export const JOURNEY_STATUS_LABELS: Record<JourneyStatus, string> = {
  new: "New",
  in_progress: "In progress",
  quoted: "Quote sent",
  closed: "Closed",
};

export const JOURNEY_STATUS_HINTS: Record<JourneyStatus, string> = {
  new: "Not answered yet.",
  in_progress: "You're working on a plan or talking with the customer.",
  quoted: "You've sent a personalised quotation.",
  closed: "Booked, declined or no further action needed.",
};

export const ACCOMMODATION_LABELS: Record<AccommodationLevel, string> = {
  budget: "Budget",
  mid_range: "Mid-range",
  luxury: "Luxury",
  mixed: "A mix",
  not_sure: "Not sure yet",
};
