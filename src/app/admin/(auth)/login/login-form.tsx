"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { signIn } from "@/app/admin/_actions/auth";
import { Field, FormMessage, SubmitButton } from "@/components/admin/form-controls";
import { initialFormState } from "@/lib/forms";

const notices: Record<string, { tone: "info" | "error"; text: string }> = {
  signed_out: { tone: "info", text: "You have been signed out." },
  invalid_link: {
    tone: "error",
    text: "That link isn't valid. Please request a new one.",
  },
  expired_link: {
    tone: "error",
    text: "That link has expired or was already used. Please request a new one.",
  },
  unconfigured: { tone: "error", text: "Sign-in isn't available yet." },
};

export function LoginForm({ disabled }: { disabled: boolean }) {
  const searchParams = useSearchParams();
  const [state, action] = useActionState(signIn, initialFormState);

  const noticeKey = searchParams.has("signed_out")
    ? "signed_out"
    : searchParams.get("error");
  const notice = noticeKey ? notices[noticeKey] : undefined;

  return (
    <form action={action} className="mt-6 space-y-4" noValidate>
      {notice ? (
        <p
          role={notice.tone === "error" ? "alert" : "status"}
          className={
            notice.tone === "error"
              ? "rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
              : "rounded-lg bg-turquoise-soft px-3 py-2.5 text-sm text-ocean-deep"
          }
        >
          {notice.text}
        </p>
      ) : null}
      <FormMessage state={state} />
      <input type="hidden" name="next" value={searchParams.get("next") ?? ""} />
      <Field
        label="Email"
        name="email"
        defaultValue={state.values?.email}
        type="email"
        autoComplete="email"
        required
        disabled={disabled}
        error={state.fieldErrors?.email}
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        disabled={disabled}
        error={state.fieldErrors?.password}
      />
      <SubmitButton pendingLabel="Signing in…" className="w-full">
        Sign in
      </SubmitButton>
      <p className="text-center text-sm">
        <Link
          href="/admin/forgot-password"
          className="text-turquoise-deep underline-offset-2 hover:underline"
        >
          Forgot your password?
        </Link>
      </p>
    </form>
  );
}
