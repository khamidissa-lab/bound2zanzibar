"use client";

import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { CircleAlert, Loader2, Send } from "lucide-react";

import { requestJourney } from "@/app/[locale]/(public)/design-your-journey/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/i18n/client";
import { CURRENCIES, MAX_TRAVELLERS } from "@/lib/booking/request";
import { initialFormState } from "@/lib/forms";
import { ACCOMMODATION_LEVELS } from "@/lib/journey/request";
import { useMarket } from "@/lib/market-store";
import { cn } from "@/lib/utils";
import type { DestinationRegion } from "@/types/content";

type Choice = { value: string; label: string };

const fieldClass =
  "h-11 w-full rounded-xl border border-input bg-background px-3 text-base text-ink outline-none focus-visible:border-turquoise-deep focus-visible:ring-2 focus-visible:ring-turquoise-deep/25 aria-invalid:border-destructive md:text-sm";
const chipClass =
  "flex cursor-pointer items-center gap-2.5 rounded-xl border bg-background px-3 py-2.5 text-sm text-ocean-deep transition has-checked:border-turquoise-deep has-checked:bg-turquoise-soft has-focus-visible:ring-2 has-focus-visible:ring-turquoise/40";

function Field({
  id,
  label,
  error,
  hint,
  children,
  className,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
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

const describe = (id: string, error?: string, hint?: boolean) => {
  const ids = [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean);
  return {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": ids.length ? ids.join(" ") : undefined,
  } as const;
};

function Section({
  legend,
  hint,
  error,
  children,
}: {
  legend: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="space-y-4 border-t border-ocean-deep/15 pt-6">
      <legend className="float-start mb-1 w-full font-display text-2xl text-ocean-deep">
        {legend}
      </legend>
      {hint ? <p className="clear-both text-sm text-muted-foreground">{hint}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="clear-both space-y-4">{children}</div>
    </fieldset>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useI18n();
  return (
    <Button
      type="submit"
      size="lg"
      variant="gold"
      disabled={pending}
      className="w-full sm:w-auto"
    >
      {pending ? (
        <Loader2 className="animate-spin" aria-hidden="true" data-icon="inline-start" />
      ) : (
        <Send aria-hidden="true" data-icon="inline-start" />
      )}
      {pending ? t.journey.sending : t.journey.submit}
    </Button>
  );
}

/** "Design Your Zanzibar Journey" request form. Nothing is booked or charged. */
export function JourneyForm({
  destinations,
  interests,
  today,
}: {
  destinations: { slug: string; name: string; region: DestinationRegion }[];
  interests: Choice[];
  today: string;
}) {
  const [state, action] = useActionState(requestJourney, initialFormState);
  const { t, locale } = useI18n();
  const j = t.journey;
  const market = useMarket();
  // Server messages are English keys; show them in the visitor's language.
  const tr = (msg?: string) => (msg ? (t.errors[msg] ?? msg) : msg);
  const v = state.values ?? {};
  const e = Object.fromEntries(
    Object.entries(state.fieldErrors ?? {}).map(([k, m]) => [k, tr(m)]),
  ) as Record<string, string | undefined>;
  const chosen = (key: string) => (v[key] ? v[key].split(",") : []);
  const defaultCurrency = v.budgetCurrency ?? (market === "resident" ? "TZS" : "USD");

  const regions: { id: DestinationRegion; label: string }[] = [
    { id: "zanzibar", label: j.zanzibar },
    { id: "mainland", label: j.mainland },
  ];

  return (
    <form action={action} noValidate className="space-y-8">
      {state.status === "error" && state.message ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {tr(state.message)}
        </p>
      ) : null}

      <input type="hidden" name="locale" value={locale} />
      {/* Honeypot: hidden from people and assistive tech. */}
      <div
        aria-hidden="true"
        className="absolute -start-[9999px] h-px w-px overflow-hidden"
      >
        <label htmlFor="website">{t.bookingForm.honeypot}</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <Section legend={j.whereLegend} hint={j.whereHint} error={e.destinations}>
        {regions.map((region) => {
          const list = destinations.filter((d) => d.region === region.id);
          if (list.length === 0) return null;
          return (
            <div key={region.id}>
              <p className="eyebrow mb-2 text-gold-deep">{region.label}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {list.map((d) => (
                  <label key={d.slug} className={chipClass}>
                    <input
                      type="checkbox"
                      name="destinations"
                      value={d.slug}
                      defaultChecked={chosen("destinations").includes(d.slug)}
                      className="accent-turquoise-deep"
                    />
                    {d.name}
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </Section>

      <Section legend={j.whenLegend} hint={j.whenHint}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="startDate" label={j.startDate} error={e.startDate}>
            <input
              {...describe("startDate", e.startDate)}
              type="date"
              name="startDate"
              min={today}
              defaultValue={v.startDate}
              className={fieldClass}
            />
          </Field>
          <Field id="endDate" label={j.endDate} error={e.endDate}>
            <input
              {...describe("endDate", e.endDate)}
              type="date"
              name="endDate"
              min={today}
              defaultValue={v.endDate}
              className={fieldClass}
            />
          </Field>
        </div>
        <label className="flex items-center gap-2.5 text-sm text-ocean-deep">
          <input
            type="checkbox"
            name="flexibleDates"
            defaultChecked={v.flexibleDates === "on"}
            className="accent-turquoise-deep"
          />
          {j.flexible}
        </label>
      </Section>

      <Section legend={j.whoLegend}>
        <div className="grid grid-cols-2 gap-4 sm:max-w-md">
          <Field id="adults" label={t.tours.adultsLabel} error={e.adults}>
            <Input
              {...describe("adults", e.adults)}
              type="number"
              inputMode="numeric"
              name="adults"
              min={1}
              max={MAX_TRAVELLERS}
              required
              defaultValue={v.adults ?? "2"}
              className="h-11 bg-background"
            />
          </Field>
          <Field id="children" label={t.tours.childrenLabel} error={e.children}>
            <Input
              {...describe("children", e.children)}
              type="number"
              inputMode="numeric"
              name="children"
              min={0}
              max={MAX_TRAVELLERS}
              defaultValue={v.children ?? "0"}
              className="h-11 bg-background"
            />
          </Field>
        </div>
      </Section>

      <Section legend={j.stayLegend}>
        <div className="grid gap-2 sm:grid-cols-3">
          {ACCOMMODATION_LEVELS.map((level) => (
            <label key={level} className={chipClass}>
              <input
                type="radio"
                name="accommodation"
                value={level}
                defaultChecked={(v.accommodation ?? "not_sure") === level}
                className="accent-turquoise-deep"
              />
              {j.accommodation[level]}
            </label>
          ))}
        </div>
      </Section>

      <Section legend={j.budgetLegend} hint={j.budgetHint}>
        <div className="grid grid-cols-[1fr_7rem] gap-4 sm:max-w-md">
          <Field id="budgetAmount" label={j.budgetAmount} error={e.budgetAmount}>
            <input
              {...describe("budgetAmount", e.budgetAmount)}
              name="budgetAmount"
              inputMode="decimal"
              defaultValue={v.budgetAmount}
              className={fieldClass}
            />
          </Field>
          <Field
            id="budgetCurrency"
            label={t.bookingForm.currency}
            error={e.budgetCurrency}
          >
            <select
              {...describe("budgetCurrency", e.budgetCurrency)}
              name="budgetCurrency"
              defaultValue={defaultCurrency}
              className={fieldClass}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      <Section legend={j.interestsLegend} hint={j.interestsHint} error={e.interests}>
        <div className="grid gap-2 sm:grid-cols-2">
          {interests.map((i) => (
            <label key={i.value} className={chipClass}>
              <input
                type="checkbox"
                name="interests"
                value={i.value}
                defaultChecked={chosen("interests").includes(i.value)}
                className="accent-turquoise-deep"
              />
              {i.label}
            </label>
          ))}
        </div>
      </Section>

      <Section legend={j.moreLegend}>
        <Field
          id="specialRequirements"
          label={j.special}
          hint={j.specialHint}
          error={e.specialRequirements}
        >
          <textarea
            {...describe("specialRequirements", e.specialRequirements, true)}
            name="specialRequirements"
            rows={3}
            maxLength={2000}
            defaultValue={v.specialRequirements}
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-base text-ink outline-none focus-visible:border-turquoise-deep focus-visible:ring-2 focus-visible:ring-turquoise-deep/25 md:text-sm"
          />
        </Field>
        <Field id="message" label={j.message} error={e.message}>
          <textarea
            {...describe("message", e.message)}
            name="message"
            rows={4}
            maxLength={2000}
            defaultValue={v.message}
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-base text-ink outline-none focus-visible:border-turquoise-deep focus-visible:ring-2 focus-visible:ring-turquoise-deep/25 md:text-sm"
          />
        </Field>
      </Section>

      <Section legend={j.contactLegend}>
        <Field id="customerName" label={j.name} error={e.customerName}>
          <Input
            {...describe("customerName", e.customerName)}
            name="customerName"
            autoComplete="name"
            required
            maxLength={120}
            defaultValue={v.customerName}
            className="h-11 bg-background"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="email" label={j.email} error={e.email}>
            <Input
              {...describe("email", e.email)}
              type="email"
              name="email"
              autoComplete="email"
              required
              defaultValue={v.email}
              className="h-11 bg-background"
            />
          </Field>
          <Field id="phone" label={j.phone} error={e.phone}>
            <Input
              {...describe("phone", e.phone)}
              type="tel"
              name="phone"
              autoComplete="tel"
              maxLength={40}
              defaultValue={v.phone}
              className="h-11 bg-background"
            />
          </Field>
        </div>
        <Field id="country" label={j.country} error={e.country}>
          <Input
            {...describe("country", e.country)}
            name="country"
            autoComplete="country-name"
            maxLength={80}
            defaultValue={v.country}
            className="h-11 bg-background"
          />
        </Field>
        <div>
          <label className="flex items-start gap-2.5 text-sm text-ocean-deep">
            <input
              type="checkbox"
              name="consent"
              required
              aria-invalid={e.consent ? true : undefined}
              aria-describedby={e.consent ? "consent-error" : undefined}
              defaultChecked={v.consent === "on"}
              className="mt-0.5 accent-turquoise-deep"
            />
            {j.consent}
          </label>
          {e.consent ? (
            <p id="consent-error" className="mt-1 text-sm text-destructive">
              {e.consent}
            </p>
          ) : null}
        </div>
      </Section>

      <div className="flex flex-col gap-3 border-t border-ocean-deep/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">{j.noPayment}</p>
        <SubmitButton />
      </div>
    </form>
  );
}
