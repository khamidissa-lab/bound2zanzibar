"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";

import { updatePassword } from "@/app/admin/_actions/auth";
import { Field, FormMessage, SubmitButton } from "@/components/admin/form-controls";
import { initialFormState } from "@/lib/forms";

/** Shown after following an invitation or reset link. */
export function SetPasswordNotice() {
  const searchParams = useSearchParams();
  if (!searchParams.has("set_password")) return null;
  return (
    <p
      role="status"
      className="mt-4 rounded-lg bg-turquoise-soft px-4 py-3 text-sm text-ocean-deep"
    >
      Welcome! Please choose a password below to finish setting up your account.
    </p>
  );
}

export function PasswordForm() {
  const [state, action] = useActionState(updatePassword, initialFormState);
  return (
    <form action={action} className="mt-4 max-w-md space-y-4" noValidate>
      <FormMessage state={state} />
      <Field
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        hint="At least 10 characters. A short phrase is easier to remember."
        error={state.fieldErrors?.password}
      />
      <Field
        label="Confirm new password"
        name="confirm"
        type="password"
        autoComplete="new-password"
        required
        error={state.fieldErrors?.confirm}
      />
      <SubmitButton pendingLabel="Saving…">Update password</SubmitButton>
    </form>
  );
}
