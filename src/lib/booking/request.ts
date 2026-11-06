import { z } from "zod";

import type { Currency, Market } from "@/types/content";

/**
 * Booking request rules, shared by the public form (for hints) and the server
 * action (authoritative). They mirror public.submit_booking_request, which
 * re-checks everything in the database.
 */

export const BOOKING_WINDOW_DAYS = 730;
export const MAX_TRAVELLERS = 50;

export const MARKETS = [
  "international",
  "east_african",
  "resident",
] as const satisfies readonly Market[];
export const CURRENCIES = ["USD", "TZS"] as const satisfies readonly Currency[];

/** "YYYY-MM-DD" plus whole days, in UTC calendar arithmetic. */
export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

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
        .min(min, min === 1 ? `At least 1 ${label.replace(/s$/, "")} is required.` : "")
        .max(MAX_TRAVELLERS, `For groups over ${MAX_TRAVELLERS}, please contact us.`),
    );

/**
 * @param today the current date in Zanzibar ("YYYY-MM-DD"); dates before it
 * or more than two years ahead are rejected.
 */
export function bookingRequestSchema(today: string) {
  const lastDate = addDays(today, BOOKING_WINDOW_DAYS);
  return z.object({
    item: z
      .string()
      .regex(/^(tour|package):[a-z0-9]+(-[a-z0-9]+)*$/, "Choose a tour or package.")
      .transform((value) => {
        const [type, slug] = value.split(":");
        return { type: type as "tour" | "package", slug };
      }),
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
      .regex(/^\+?[0-9 ()-]{6,40}$/, {
        message: "Enter a phone number with country code, like +255 712 345 678.",
        abort: true,
      })
      .refine((v) => v.replace(/\D/g, "").length >= 6, "That phone number is too short."),
    market: z.enum(MARKETS, "Choose where you're travelling from."),
    currency: z.enum(CURRENCIES, "Choose a currency."),
    preferredDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: "Choose your preferred date.",
        abort: true,
      })
      .refine(isRealDate, { message: "Choose a valid date.", abort: true })
      .refine((v) => v >= today, {
        message: "Choose a date from today onwards.",
        abort: true,
      })
      .refine((v) => v <= lastDate, "We take requests up to two years ahead."),
    adults: count("adults", 1),
    children: count("children", 0),
    pickupLocation: z.string().trim().max(300, "Use 300 characters or fewer."),
    message: z.string().trim().max(2000, "Use 2,000 characters or fewer."),
    consent: z.literal("on", "Please agree so we can reply to your request."),
    /** Chosen tour options; the database checks they belong to the tour. */
    optionIds: z
      .array(z.uuid("Please check the options you chose."))
      .max(20, "Please check the options you chose.")
      .default([]),
  });
}

export type BookingRequest = z.output<ReturnType<typeof bookingRequestSchema>>;

/** Booking references look like BTZ-2611-7F3A9C1E (see generate_booking_reference). */
export const BOOKING_REFERENCE_RE = /^BTZ-\d{4}-[0-9A-F]{8}$/;

/** Friendly text for the error keys raised by public.submit_booking_request. */
export const BOOKING_ERROR_MESSAGES: Record<string, string> = {
  booking_invalid_name: "Please check your name.",
  booking_invalid_email: "Please check your email address.",
  booking_invalid_phone: "Please check your phone number.",
  booking_invalid_party_size: "Please check the number of travellers.",
  booking_invalid_date: "Please choose a date between today and two years ahead.",
  booking_text_too_long: "Your pickup location or message is too long.",
  booking_invalid_currency: "That currency isn't available. Please choose another.",
  booking_invalid_options: "Please check the options you chose.",
  booking_item_unavailable:
    "That tour or package is no longer available. Please choose another or contact us.",
  booking_rate_limited:
    "We've received several requests from you recently. Please wait an hour or contact us directly.",
};

/** Finds a known error key in a database error message. */
export function bookingErrorMessage(dbMessage: string | undefined): string | null {
  if (!dbMessage) return null;
  const key = Object.keys(BOOKING_ERROR_MESSAGES).find((k) => dbMessage.includes(k));
  return key ? BOOKING_ERROR_MESSAGES[key] : null;
}
