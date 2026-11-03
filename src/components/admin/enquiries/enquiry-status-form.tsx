"use client";

import { useActionState, useState } from "react";

import { updateEnquiryStatus } from "@/app/admin/_actions/enquiries";
import { EditorForm, SaveButton } from "@/components/admin/editor-controls";
import { FormMessage } from "@/components/admin/form-controls";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  ENQUIRY_STATUS_HINTS,
  ENQUIRY_STATUS_LABELS,
  ENQUIRY_STATUSES,
  type EnquiryStatus,
} from "@/lib/enquiry/request";
import { initialFormState } from "@/lib/forms";
import { cn } from "@/lib/utils";

export function EnquiryStatusForm({
  enquiryId,
  status,
  internalNotes,
  disabled = false,
}: {
  enquiryId: string;
  status: EnquiryStatus;
  internalNotes: string;
  /** For the design preview, where nothing can be saved. */
  disabled?: boolean;
}) {
  const [state, action, pending] = useActionState(updateEnquiryStatus, initialFormState);
  const [selected, setSelected] = useState<EnquiryStatus>(status);

  return (
    <EditorForm action={action} className="space-y-4">
      <input type="hidden" name="id" value={enquiryId} />
      <FormMessage state={state} />
      <fieldset className="space-y-2">
        <legend className="sr-only">Status</legend>
        {ENQUIRY_STATUSES.map((s) => (
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
                {ENQUIRY_STATUS_LABELS[s]}
              </span>
              <span className="text-xs text-muted-foreground">
                {ENQUIRY_STATUS_HINTS[s]}
              </span>
            </span>
          </label>
        ))}
      </fieldset>
      <div className="space-y-1.5">
        <Label htmlFor="enquiryNotes">Internal notes</Label>
        <textarea
          id="enquiryNotes"
          name="internalNotes"
          rows={4}
          maxLength={5000}
          defaultValue={internalNotes}
          disabled={disabled}
          className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus-visible:border-turquoise focus-visible:ring-2 focus-visible:ring-turquoise/30"
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
