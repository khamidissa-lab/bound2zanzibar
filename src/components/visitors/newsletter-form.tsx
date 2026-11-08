"use client";

import { useActionState } from "react";
import { Check } from "lucide-react";

import {
  subscribeNewsletter,
  type NewsletterState,
} from "@/app/[locale]/(public)/newsletter/actions";
import { Button } from "@/components/ui/button";

type Strings = {
  title: string;
  body: string;
  label: string;
  consent: string;
  submit: string;
  success: string;
  invalidEmail: string;
  consentRequired: string;
  error: string;
};

const initial: NewsletterState = { status: "idle" };

/** Footer newsletter sign-up (dark background). */
export function NewsletterForm({
  strings,
  locale,
}: {
  strings: Strings;
  locale: string;
}) {
  const [state, action, pending] = useActionState(subscribeNewsletter, initial);
  const message = state.code ? strings[state.code] : null;

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
      <div>
        <h2 className="eyebrow mb-2 text-gold-light">{strings.title}</h2>
        <p className="max-w-md text-sm leading-relaxed text-white/70">{strings.body}</p>
      </div>
      {state.status === "success" ? (
        <p role="status" className="flex items-center gap-2 text-sm text-white">
          <Check aria-hidden="true" className="size-4 text-gold-light" />
          {strings.success}
        </p>
      ) : (
        <form action={action} noValidate className="space-y-3">
          <input type="hidden" name="locale" value={locale} />
          <div aria-hidden="true" className="absolute -start-[9999px]">
            <label htmlFor="newsletter-website">Website</label>
            <input
              id="newsletter-website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label htmlFor="newsletter-email" className="sr-only">
              {strings.label}
            </label>
            <input
              id="newsletter-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder={strings.label}
              defaultValue={state.email}
              aria-invalid={state.code === "invalidEmail" || undefined}
              aria-describedby={message ? "newsletter-message" : undefined}
              className="h-11 w-full min-w-0 border border-white/30 bg-white/5 px-3 text-sm text-white placeholder:text-white/50 focus-visible:border-gold-light focus-visible:outline-none sm:flex-1"
            />
            <Button type="submit" variant="light" size="lg" disabled={pending}>
              {strings.submit}
            </Button>
          </div>
          <label className="flex items-start gap-2 text-xs leading-relaxed text-white/70">
            <input
              type="checkbox"
              name="consent"
              required
              aria-invalid={state.code === "consentRequired" || undefined}
              className="mt-0.5 size-4 accent-[color:var(--brand-gold)]"
            />
            {strings.consent}
          </label>
          {message ? (
            <p id="newsletter-message" role="alert" className="text-sm text-gold-light">
              {message}
            </p>
          ) : null}
        </form>
      )}
    </div>
  );
}
