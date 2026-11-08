"use server";

import { refresh } from "next/cache";
import { z } from "zod";

import { authorizeAction } from "@/lib/auth/session";
import { formValues, type FormState } from "@/lib/forms";
import { JOURNEY_STATUS_LABELS, JOURNEY_STATUSES } from "@/lib/journey/request";
import { updateJourney } from "@/services/journeys";

const updateSchema = z.object({
  id: z.uuid(),
  status: z.enum(JOURNEY_STATUSES, "Choose a status."),
  internalNotes: z.string().trim().max(5000, "Use 5,000 characters or fewer."),
});

/** Updates a journey request's status and notes (booking staff and up; RLS enforced). */
export async function updateJourneyStatus(
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
  const saved = await updateJourney(id, { status, internalNotes });
  if (!saved) {
    return { status: "error", message: "That request no longer exists.", values };
  }

  refresh();
  return {
    status: "success",
    message: `Saved — marked as ${JOURNEY_STATUS_LABELS[status].toLowerCase()}.`,
    values: { status, internalNotes },
  };
}
