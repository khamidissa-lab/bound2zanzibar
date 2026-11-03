"use client";

import { useActionState, useState } from "react";

import { updateBookingStatus } from "@/app/admin/_actions/bookings";
import { EditorForm, SaveButton } from "@/components/admin/editor-controls";
import { FormMessage } from "@/components/admin/form-controls";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { nextStatuses, STATUS_HINTS, type BookingStatus } from "@/lib/booking/status";
import { initialFormState } from "@/lib/forms";
import { cn } from "@/lib/utils";
import { STATUS_LABELS } from "@/services/admin-dashboard-model";

/**
 * Status and internal-notes editor. Only the changes allowed from the current
 * status are offered; the server checks the same rule.
 */
export function BookingStatusForm({
  bookingId,
  status,
  internalNotes,
  disabled = false,
}: {
  bookingId: string;
  status: BookingStatus;
  internalNotes: string;
  /** For the design preview, where nothing can be saved. */
  disabled?: boolean;
}) {
  const [state, action, pending] = useActionState(updateBookingStatus, initialFormState);
  const [choice, setChoice] = useState<BookingStatus>(status);
  const options = [status, ...nextStatuses(status)];
  const selected = options.includes(choice) ? choice : status;

  return (
    <EditorForm action={action} className="space-y-4">
      <input type="hidden" name="id" value={bookingId} />
      <FormMessage state={state} />

      <fieldset>
        <legend className="mb-2 text-sm font-medium">Status</legend>
        <div className="space-y-2">
          {options.map((s) => (
            <label
              key={s}
              className={cn(
                "flex cursor-pointer gap-3 rounded-xl border p-3 text-sm transition has-focus-visible:ring-2 has-focus-visible:ring-turquoise/40",
                selected === s
                  ? "border-turquoise-deep bg-turquoise-soft"
                  : "hover:border-turquoise",
              )}
            >
              <input
                type="radio"
                name="status"
                value={s}
                checked={selected === s}
                onChange={() => setChoice(s)}
                disabled={disabled}
                className="mt-0.5 accent-turquoise-deep"
              />
              <span>
                <span className="block font-medium text-ocean-deep">
                  {STATUS_LABELS[s]}
                  {s === status ? (
                    <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                      (current)
                    </span>
                  ) : null}
                </span>
                <span className="text-xs text-muted-foreground">{STATUS_HINTS[s]}</span>
              </span>
            </label>
          ))}
        </div>
        {state.fieldErrors?.status ? (
          <p className="mt-1.5 text-sm text-destructive">{state.fieldErrors.status}</p>
        ) : null}
      </fieldset>

      <div className="space-y-1.5">
        <Label htmlFor="internalNotes">Internal notes</Label>
        <textarea
          id="internalNotes"
          name="internalNotes"
          rows={5}
          maxLength={5000}
          defaultValue={internalNotes}
          disabled={disabled}
          aria-describedby="internalNotes-hint"
          className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus-visible:border-turquoise focus-visible:ring-2 focus-visible:ring-turquoise/30"
        />
        <p id="internalNotes-hint" className="text-xs text-muted-foreground">
          Only staff can see these notes. The customer never does.
        </p>
        {state.fieldErrors?.internalNotes ? (
          <p className="text-sm text-destructive">{state.fieldErrors.internalNotes}</p>
        ) : null}
      </div>

      {disabled ? (
        <Button type="button" size="lg" disabled className="w-full">
          Saving is off in the preview
        </Button>
      ) : (
        <SaveButton pending={pending} className="w-full">
          {selected === status
            ? "Save notes"
            : `Change to ${STATUS_LABELS[selected].toLowerCase()}`}
        </SaveButton>
      )}
    </EditorForm>
  );
}
