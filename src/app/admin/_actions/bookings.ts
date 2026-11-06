"use server";

import { refresh } from "next/cache";
import { z } from "zod";

import { authorizeAction } from "@/lib/auth/session";
import { BOOKING_STATUSES, canTransition } from "@/lib/booking/status";
import { addDays } from "@/lib/booking/request";
import { formValues, type FormState } from "@/lib/forms";
import { STATUS_LABELS, zanzibarDate } from "@/services/admin-dashboard-model";
import {
  deletePayment,
  getBookingStatus,
  recordPayment,
  updateBooking,
} from "@/services/bookings";

const updateSchema = z.object({
  id: z.uuid(),
  status: z.enum(BOOKING_STATUSES, "Choose a status."),
  internalNotes: z.string().trim().max(5000, "Use 5,000 characters or fewer."),
});

/**
 * Changes a booking's status and internal notes. RLS limits this to booking
 * staff; the database records every status change with who made it.
 */
export async function updateBookingStatus(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const auth = await authorizeAction("bookings.manage");
  if (!auth.ok) return { status: "error", message: auth.message };

  const raw = formValues(formData);
  const values = { status: raw.status ?? "", internalNotes: raw.internalNotes ?? "" };
  const parsed = updateSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues)
      fieldErrors[String(issue.path[0])] ??= issue.message;
    return { status: "error", message: "Please check the form.", fieldErrors, values };
  }

  const { id, status, internalNotes } = parsed.data;
  const current = await getBookingStatus(id);
  if (!current) {
    return { status: "error", message: "That booking no longer exists.", values };
  }
  if (!canTransition(current, status)) {
    return {
      status: "error",
      message: `A ${STATUS_LABELS[current].toLowerCase()} booking can't be changed to ${STATUS_LABELS[status].toLowerCase()}.`,
      values,
    };
  }

  const saved = await updateBooking(id, { status, internalNotes });
  if (saved === "payment_required") {
    return {
      status: "error",
      message:
        "Record the payment first: a booking can only be marked paid once recorded payments in its currency cover the quote.",
      values,
    };
  }
  if (saved === "denied") {
    return { status: "error", message: "You don't have permission to do that.", values };
  }

  refresh();
  return {
    status: "success",
    message:
      current === status
        ? "Notes saved."
        : `Status changed to ${STATUS_LABELS[status].toLowerCase()}.`,
    values: { status, internalNotes },
  };
}

const PAYMENT_METHODS = [
  "bank_transfer",
  "mobile_money",
  "card",
  "cash",
  "other",
] as const;

/** Earliest payment date accepted (bookings are taken up to two years ahead). */
const earliestPaymentDate = () => addDays(zanzibarDate(new Date()), -730);

const paymentSchema = z.object({
  bookingId: z.uuid(),
  amount: z.coerce
    .number({ error: "Enter the amount received." })
    .positive("Enter the amount received.")
    .max(1_000_000_000, "That amount is too large."),
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, "Choose a currency."),
  method: z.enum(PAYMENT_METHODS, "Choose how it was paid."),
  reference: z.string().trim().max(120, "Use 120 characters or fewer."),
  paidOn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter the date it was received.")
    .refine((v) => v <= zanzibarDate(new Date()), "The date can't be in the future.")
    .refine((v) => v >= earliestPaymentDate(), "That date is too far in the past."),
  notes: z.string().trim().max(1000, "Use 1,000 characters or fewer."),
});

/**
 * Records a payment the team has verified (for example a bank transfer seen
 * on the statement). Nothing is charged here; this is the record that allows
 * a booking to be marked paid.
 */
export async function addPayment(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const auth = await authorizeAction("bookings.manage");
  if (!auth.ok) return { status: "error", message: auth.message };
  const raw = formValues(formData);
  const parsed = paymentSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues)
      fieldErrors[String(issue.path[0])] ??= issue.message;
    return {
      status: "error",
      message: "Please check the payment.",
      fieldErrors,
      values: raw,
    };
  }
  const ok = await recordPayment(parsed.data);
  if (!ok)
    return {
      status: "error",
      message: "You don't have permission to do that.",
      values: raw,
    };
  refresh();
  return { status: "success", message: "Payment recorded." };
}

export async function removePayment(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const auth = await authorizeAction("payments.delete");
  if (!auth.ok) return { status: "error", message: auth.message };
  const id = z.uuid().safeParse(formData.get("paymentId"));
  if (!id.success) return { status: "error", message: "That payment no longer exists." };
  const ok = await deletePayment(id.data);
  if (!ok) return { status: "error", message: "That payment no longer exists." };
  refresh();
  return { status: "success", message: "Payment removed." };
}
