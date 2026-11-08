"use client";

import { useActionState, useState } from "react";

import { updateJourneyStatus } from "@/app/admin/_actions/journeys";
import { EditorForm, SaveButton } from "@/components/admin/editor-controls";
import { FormMessage } from "@/components/admin/form-controls";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  JOURNEY_STATUS_HINTS,
  JOURNEY_STATUS_LABELS,
  JOURNEY_STATUSES,
  type JourneyStatus,
} from "@/lib/journey/request";
import { initialFormState } from "@/lib/forms";
import { cn } from "@/lib/utils";

export function JourneyStatusForm({
  journeyId,
  status,
  internalNotes,
  disabled = false,
}: {
  journeyId: string;
  status: JourneyStatus;
  internalNotes: string;
  /** For the design preview, where nothing can be saved. */
  disabled?: boolean;
}) {
  const [state, action, pending] = useActionState(updateJourneyStatus, initialFormState);
  const [selected, setSelected] = useState<JourneyStatus>(status);

  return (
    <EditorForm action={action} className="space-y-4">
      <input type="hidden" name="id" value={journeyId} />
      <FormMessage state={state} />
      <fieldset className="space-y-2">
        <legend className="sr-only">Status</legend>
        {JOURNEY_STATUSES.map((s) => (
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
              onChange={() => setSelected(s)}
              disabled={disabled}
              className="mt-0.5 accent-turquoise-deep"
            />
            <span>
              <span className="block font-medium text-ocean-deep">
                {JOURNEY_STATUS_LABELS[s]}
              </span>
              <span className="text-xs text-muted-foreground">
                {JOURNEY_STATUS_HINTS[s]}
              </span>
            </span>
          </label>
        ))}
      </fieldset>
      <div className="space-y-1.5">
        <Label htmlFor="journeyNotes">Internal notes</Label>
        <textarea
          id="journeyNotes"
          name="internalNotes"
          rows={4}
          maxLength={5000}
          defaultValue={internalNotes}
          disabled={disabled}
          className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus-visible:border-turquoise-deep focus-visible:ring-2 focus-visible:ring-turquoise-deep/25"
        />
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
          Save
        </SaveButton>
      )}
    </EditorForm>
  );
}
