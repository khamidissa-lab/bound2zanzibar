"use client";

import { useActionState } from "react";

import { requestPasswordReset } from "@/app/admin/_actions/auth";
import { Field, FormMessage, SubmitButton } from "@/components/admin/form-controls";
import { initialFormState } from "@/lib/forms";

export function ForgotPasswordForm() {
  const [state, action] = useActionState(requestPasswordReset, initialFormState);
  return (
    <form action={action} className="mt-6 space-y-4" noValidate>
      <FormMessage state={state} />
      {state.status !== "success" ? (
        <>
          <Field
            label="Email"
            name="email"
            defaultValue={state.values?.email}
            type="email"
            autoComplete="email"
            required
            error={state.fieldErrors?.email}
          />
          <SubmitButton pendingLabel="Sending…" className="w-full">
            Send reset link
          </SubmitButton>
        </>
      ) : null}
    </form>
  );
}
