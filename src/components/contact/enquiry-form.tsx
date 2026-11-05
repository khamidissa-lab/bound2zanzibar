"use client";

import { useActionState, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { CircleAlert, CircleCheck, Loader2, Send } from "lucide-react";

import { sendEnquiry } from "@/app/[locale]/(public)/contact/actions";
import { LocaleLink as Link } from "@/components/i18n/locale-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/i18n/client";
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
  const { t } = useI18n();
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
      {pending ? t.enquiryForm.sending : t.enquiryForm.send}
    </Button>
  );
}

export function EnquiryForm({ available }: { available: boolean }) {
  const [state, action] = useActionState(sendEnquiry, initialFormState);
  const [dismissedSuccess, setDismissed] = useState<typeof state | null>(null);
  const { t } = useI18n();
  const f = t.enquiryForm;
  // Server messages come back in English; show them in the visitor's language.
  const tr = (msg?: string) => (msg ? (t.errors[msg] ?? msg) : msg);
  const v = state.values ?? {};
  const e = Object.fromEntries(
    Object.entries(state.fieldErrors ?? {}).map(([k, m]) => [k, tr(m)]),
  ) as Record<string, string | undefined>;

  if (state.status === "success" && dismissedSuccess !== state) {
    return (
      <div role="status" className="rounded-2xl bg-turquoise-soft p-6 text-ocean-deep">
        <CircleCheck className="size-8 text-turquoise-deep" aria-hidden="true" />
        <p className="mt-3 font-medium">{tr(state.message)}</p>
        <button
          type="button"
          onClick={() => setDismissed(state)}
          className="mt-4 text-sm text-turquoise-deep underline underline-offset-2"
        >
          {f.sendAnother}
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
          {tr(state.message)}
        </p>
      ) : null}

      {/* Honeypot: hidden from people and assistive tech. */}
      <div
        aria-hidden="true"
        className="absolute -start-[9999px] h-px w-px overflow-hidden"
      >
        <label htmlFor="enquiry-website">{f.honeypot}</label>
        <input
          id="enquiry-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="enquiry-name" label={f.name} error={e.name}>
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
        <Field id="enquiry-email" label={f.email} error={e.email}>
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
        <Field id="enquiry-phone" label={f.phone} error={e.phone} hint={f.phoneHint}>
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
        <Field id="enquiry-subject" label={f.subject} error={e.subject}>
          {(aria) => (
            <Input
              {...aria}
              name="subject"
              defaultValue={v.subject}
              maxLength={200}
              placeholder={f.subjectPlaceholder}
              className={fieldClass}
            />
          )}
        </Field>
      </div>
      <Field id="enquiry-message" label={f.message} error={e.message}>
        {(aria) => (
          <textarea
            {...aria}
            name="message"
            rows={6}
            maxLength={4000}
            defaultValue={v.message}
            required
            placeholder={f.messagePlaceholder}
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-base text-ink outline-none placeholder:text-muted-foreground focus-visible:border-turquoise-deep focus-visible:ring-2 focus-visible:ring-turquoise-deep/25 aria-invalid:border-destructive md:text-sm"
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
            {f.consentBefore}{" "}
            <Link
              href="/privacy"
              className="text-turquoise-deep underline underline-offset-2"
            >
              {f.privacyPolicy}
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
