"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { CircleAlert, CircleCheck, Loader2, Send, Star } from "lucide-react";

import { sendReview } from "@/app/[locale]/(public)/review/[token]/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/i18n/client";
import { initialFormState } from "@/lib/forms";
import { cn } from "@/lib/utils";

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useI18n();
  return (
    <Button type="submit" size="lg" variant="gold" disabled={pending}>
      {pending ? (
        <Loader2 className="animate-spin" aria-hidden="true" data-icon="inline-start" />
      ) : (
        <Send aria-hidden="true" data-icon="inline-start" />
      )}
      {pending ? t.reviewPage.sending : t.reviewPage.submit}
    </Button>
  );
}

/** Review form for a completed booking; the token is the only key. */
export function ReviewForm({
  token,
  defaultName,
}: {
  token: string;
  defaultName: string;
}) {
  const [state, action] = useActionState(sendReview, initialFormState);
  const { t, fmt, locale } = useI18n();
  const p = t.reviewPage;
  const tr = (msg?: string) => (msg ? (t.errors[msg] ?? msg) : msg);
  const v = state.values ?? {};
  const e = Object.fromEntries(
    Object.entries(state.fieldErrors ?? {}).map(([k, m]) => [k, tr(m)]),
  ) as Record<string, string | undefined>;
  const [rating, setRating] = useState(Number(v.rating) || 0);

  if (state.status === "success") {
    return (
      <div role="status" className="py-6 text-center">
        <CircleCheck className="mx-auto size-12 text-turquoise-deep" aria-hidden="true" />
        <h2 className="mt-4 font-display text-3xl text-ocean-deep">{p.thanksTitle}</h2>
        <p className="mt-2 text-muted-foreground">{p.thanksBody}</p>
      </div>
    );
  }

  return (
    <form action={action} noValidate className="space-y-6">
      {state.status === "error" && state.message ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {tr(state.message)}
        </p>
      ) : null}
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="locale" value={locale} />
      <div
        aria-hidden="true"
        className="absolute -start-[9999px] h-px w-px overflow-hidden"
      >
        <label htmlFor="website">{t.bookingForm.honeypot}</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">{p.ratingLegend}</legend>
        {/* Native radios (keyboard: arrow keys), drawn as stars. */}
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <label
              key={n}
              className="cursor-pointer rounded-md p-1 has-focus-visible:ring-2 has-focus-visible:ring-turquoise/40"
            >
              <input
                type="radio"
                name="rating"
                value={n}
                checked={rating === n}
                onChange={() => setRating(n)}
                className="sr-only"
                aria-describedby={e.rating ? "rating-error" : undefined}
              />
              <span className="sr-only">{fmt(t.reviews.stars, { n })}</span>
              <Star
                aria-hidden="true"
                className={cn(
                  "size-9 transition-colors",
                  n <= rating ? "fill-gold text-gold" : "text-ocean-deep/30",
                )}
              />
            </label>
          ))}
        </div>
        {e.rating ? (
          <p id="rating-error" className="mt-1 text-sm text-destructive">
            {e.rating}
          </p>
        ) : null}
      </fieldset>

      <div className="space-y-1.5">
        <Label htmlFor="title">{p.titleLabel}</Label>
        <Input
          id="title"
          name="title"
          maxLength={120}
          defaultValue={v.title}
          className="h-11 bg-background"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="body">{p.bodyLabel}</Label>
        <textarea
          id="body"
          name="body"
          rows={6}
          maxLength={2000}
          required
          defaultValue={v.body}
          aria-invalid={e.body ? true : undefined}
          aria-describedby={e.body ? "body-error" : undefined}
          className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-base outline-none focus-visible:border-turquoise-deep focus-visible:ring-2 focus-visible:ring-turquoise-deep/25 aria-invalid:border-destructive md:text-sm"
        />
        {e.body ? (
          <p id="body-error" className="text-sm text-destructive">
            {e.body}
          </p>
        ) : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="displayName">{p.displayNameLabel}</Label>
          <Input
            id="displayName"
            name="displayName"
            maxLength={60}
            required
            defaultValue={v.displayName ?? defaultName}
            aria-invalid={e.displayName ? true : undefined}
            aria-describedby={e.displayName ? "displayName-error" : "displayName-hint"}
            className="h-11 bg-background"
          />
          <p id="displayName-hint" className="text-xs text-muted-foreground">
            {p.displayNameHint}
          </p>
          {e.displayName ? (
            <p id="displayName-error" className="text-sm text-destructive">
              {e.displayName}
            </p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="country">{p.countryLabel}</Label>
          <Input
            id="country"
            name="country"
            maxLength={60}
            autoComplete="country-name"
            defaultValue={v.country}
            className="h-11 bg-background"
          />
        </div>
      </div>
      <div>
        <label className="flex items-start gap-2.5 text-sm text-ocean-deep">
          <input
            type="checkbox"
            name="consent"
            required
            defaultChecked={v.consent === "on"}
            aria-invalid={e.consent ? true : undefined}
            aria-describedby={e.consent ? "consent-error" : undefined}
            className="mt-0.5 accent-turquoise-deep"
          />
          {p.consent}
        </label>
        {e.consent ? (
          <p id="consent-error" className="mt-1 text-sm text-destructive">
            {e.consent}
          </p>
        ) : null}
      </div>
      <SubmitButton />
    </form>
  );
}
