"use client";

import { useActionState, useState, type ReactNode } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { CircleAlert, CircleCheck, Loader2, Send } from "lucide-react";

import { sendEnquiry } from "@/app/(public)/contact/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialFormState } from "@/lib/forms";

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: (aria: {
    id: string;
    "aria-invalid"?: true;
    "aria-describedby"?: string;
  }) => ReactNode;
}) {
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null]
    .filter(Boolean)
    .join(" ");
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children({
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy || undefined,
      })}
      {hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="lg"
      disabled={disabled || pending}
      className="w-full sm:w-auto"
    >
      {pending ? (
        <Loader2 className="animate-spin" aria-hidden="true" data-icon="inline-start" />
      ) : (
        <Send aria-hidden="true" data-icon="inline-start" />
      )}
      {pending ? "Sending…" : "Send message"}
    </Button>
  );
}

export function EnquiryForm({ available }: { available: boolean }) {
  const [state, action] = useActionState(sendEnquiry, initialFormState);
  const [dismissedSuccess, setDismissed] = useState<typeof state | null>(null);
  const v = state.values ?? {};
  const e = state.fieldErrors ?? {};

  if (state.status === "success" && dismissedSuccess !== state) {
    return (
      <div role="status" className="rounded-2xl bg-turquoise-soft p-6 text-ocean-deep">
        <CircleCheck className="size-8 text-turquoise-deep" aria-hidden="true" />
        <p className="mt-3 font-medium">{state.message}</p>
        <button
          type="button"
          onClick={() => setDismissed(state)}
          className="mt-4 text-sm text-turquoise-deep underline underline-offset-2"
        >
          Send another message
        </button>
      </div>
    );
  }

  const fieldClass = "h-11 bg-background";

  return (
    <form action={action} noValidate className="space-y-5">
      {state.status === "error" && state.message ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {state.message}
        </p>
      ) : null}

      {/* Honeypot: hidden from people and assistive tech. */}
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] h-px w-px overflow-hidden"
      >
        <label htmlFor="enquiry-website">Leave this field empty</label>
        <input
          id="enquiry-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="enquiry-name" label="Name" error={e.name}>
          {(aria) => (
            <Input
              {...aria}
              name="name"
              autoComplete="name"
              defaultValue={v.name}
              maxLength={120}
              required
              className={fieldClass}
            />
          )}
        </Field>
        <Field id="enquiry-email" label="Email" error={e.email}>
          {(aria) => (
            <Input
              {...aria}
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={v.email}
              maxLength={254}
              required
              className={fieldClass}
            />
          )}
        </Field>
        <Field
          id="enquiry-phone"
          label="Phone or WhatsApp (optional)"
          error={e.phone}
          hint="Include your country code."
        >
          {(aria) => (
            <Input
              {...aria}
              name="phone"
              type="tel"
              autoComplete="tel"
              defaultValue={v.phone}
              maxLength={40}
              className={fieldClass}
            />
          )}
        </Field>
        <Field id="enquiry-subject" label="Subject (optional)" error={e.subject}>
          {(aria) => (
            <Input
              {...aria}
              name="subject"
              defaultValue={v.subject}
              maxLength={200}
              placeholder="e.g. Safari in March"
              className={fieldClass}
            />
          )}
        </Field>
      </div>
      <Field id="enquiry-message" label="Message" error={e.message}>
        {(aria) => (
          <textarea
            {...aria}
            name="message"
            rows={6}
            maxLength={4000}
            defaultValue={v.message}
            required
            placeholder="Your dates, group size and what you'd like to do."
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-base text-ink outline-none placeholder:text-muted-foreground focus-visible:border-turquoise focus-visible:ring-2 focus-visible:ring-turquoise/30 aria-invalid:border-destructive md:text-sm"
          />
        )}
      </Field>

      <div>
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="consent"
            defaultChecked={v.consent === "on"}
            required
            aria-invalid={e.consent ? true : undefined}
            aria-describedby={e.consent ? "enquiry-consent-error" : undefined}
            className="mt-0.5 size-4 accent-turquoise-deep"
          />
          <span>
            I agree that Bound to Zanzibar may use these details to reply to me, as
            described in the{" "}
            <Link
              href="/privacy"
              className="text-turquoise-deep underline underline-offset-2"
            >
              privacy policy
            </Link>
            .
          </span>
        </label>
        {e.consent ? (
          <p id="enquiry-consent-error" className="mt-1.5 text-sm text-destructive">
            {e.consent}
          </p>
        ) : null}
      </div>

      <SubmitButton disabled={!available} />
    </form>
  );
}
