"use server";

import { refresh } from "next/cache";
import { z } from "zod";

import { authorizeAction } from "@/lib/auth/session";
import { BOOKING_STATUSES, canTransition } from "@/lib/booking/status";
import { formValues, type FormState } from "@/lib/forms";
import { STATUS_LABELS } from "@/services/admin-dashboard-model";
import { getBookingStatus, updateBooking } from "@/services/bookings";

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
  if (!saved) {
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
