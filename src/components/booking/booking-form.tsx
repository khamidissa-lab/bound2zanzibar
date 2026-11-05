"use client";

import { useActionState, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { CircleAlert, Loader2, Send } from "lucide-react";

import { requestBooking } from "@/app/[locale]/(public)/book/actions";
import { LocaleLink as Link } from "@/components/i18n/locale-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addDays,
  BOOKING_WINDOW_DAYS,
  CURRENCIES,
  MARKETS,
  MAX_TRAVELLERS,
} from "@/lib/booking/request";
import { useI18n } from "@/i18n/client";
import { initialFormState } from "@/lib/forms";
import { useMarket } from "@/lib/market-store";
import type { TripPlan } from "@/lib/trip-plan";
import { cn } from "@/lib/utils";
import type { Currency, Market, PriceRecord } from "@/types/content";

export type BookableItem = {
  /** "tour:slug" or "package:slug". */
  value: string;
  label: string;
  group: "Tours" | "Packages";
  prices: PriceRecord[];
};

const fieldClass =
  "h-11 w-full rounded-xl border border-input bg-background px-3 text-base text-ink outline-none focus-visible:border-turquoise-deep focus-visible:ring-2 focus-visible:ring-turquoise-deep/25 aria-invalid:border-destructive md:text-sm";

function FormField({
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
  hint?: ReactNode;
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

/** aria props linking a control to its hint and error text. */
function describe(id: string, error?: string, hint?: boolean) {
  const ids = [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean);
  return {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": ids.length ? ids.join(" ") : undefined,
  } as const;
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  const { t } = useI18n();
  return (
    <Button
      type="submit"
      size="lg"
      variant="gold"
      disabled={disabled || pending}
      className="w-full sm:w-auto"
    >
      {pending ? (
        <Loader2 className="animate-spin" aria-hidden="true" data-icon="inline-start" />
      ) : (
        <Send aria-hidden="true" data-icon="inline-start" />
      )}
      {pending ? t.bookingForm.sending : t.bookingForm.send}
    </Button>
  );
}

const toCount = (v: string, fallback: number) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= 0 && n <= MAX_TRAVELLERS ? n : fallback;
};

export function BookingForm({
  items,
  defaultItem,
  defaultMessage,
  plan,
  today,
  available,
}: {
  items: BookableItem[];
  defaultItem: string;
  /** Opening line for the message, e.g. from a homepage traveller box. */
  defaultMessage?: string;
  /** Date and group size chosen in the tour search. */
  plan?: TripPlan;
  today: string;
  available: boolean;
}) {
  const [state, action] = useActionState(requestBooking, initialFormState);
  const { t, fmt, price: formatPrice, locale } = useI18n();
  const f = t.bookingForm;
  // Server messages come back in English; show them in the visitor's language.
  const tr = (msg?: string) => (msg ? (t.errors[msg] ?? msg) : msg);
  const v = state.values ?? {};
  const e = Object.fromEntries(
    Object.entries(state.fieldErrors ?? {}).map(([k, m]) => [k, tr(m)]),
  ) as Record<string, string | undefined>;
  const siteMarket = useMarket();

  const [item, setItem] = useState(v.item ?? defaultItem);
  const [marketChoice, setMarket] = useState<Market | null>((v.market as Market) ?? null);
  const market = marketChoice ?? siteMarket;
  const [currencyChoice, setCurrency] = useState<Currency | null>(
    (v.currency as Currency) ?? null,
  );
  const [adults, setAdults] = useState(v.adults ?? (plan?.adults || "2"));
  const [children, setChildren] = useState(v.children ?? (plan?.children || "0"));

  const selected = items.find((i) => i.value === item);
  const marketPrices = selected?.prices.filter((p) => p.market === market) ?? [];
  const currencyOptions: Currency[] = marketPrices.length
    ? [...new Set(marketPrices.map((p) => p.currency))]
    : [...CURRENCIES];
  const currency =
    currencyChoice && currencyOptions.includes(currencyChoice)
      ? currencyChoice
      : (currencyOptions[0] ?? "USD");
  const price = marketPrices.find((p) => p.currency === currency);

  const nAdults = toCount(adults, 0);
  const nChildren = toCount(children, 0);
  const estimate =
    price && (nChildren === 0 || price.child !== null)
      ? price.adult * nAdults + (price.child ?? 0) * nChildren
      : null;

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
        <label htmlFor="website">{f.honeypot}</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <fieldset className="space-y-5">
        <legend className="font-display text-xl text-ocean-deep">{f.yourTrip}</legend>

        <FormField id="item" label={f.item} error={e.item}>
          <select
            {...describe("item", e.item)}
            name="item"
            value={item}
            onChange={(ev) => setItem(ev.target.value)}
            className={fieldClass}
          >
            <option value="">{f.chooseItem}</option>
            {(["Tours", "Packages"] as const).map((group) => (
              <optgroup
                key={group}
                label={group === "Tours" ? f.groupTours : f.groupPackages}
              >
                {items
                  .filter((i) => i.group === group)
                  .map((i) => (
                    <option key={i.value} value={i.value}>
                      {i.label}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </FormField>

        <fieldset>
          <legend className="mb-2 text-sm font-medium">{f.travellingFrom}</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {MARKETS.map((m) => (
              <label
                key={m}
                className={cn(
                  "flex cursor-pointer gap-3 rounded-xl border bg-background p-3 text-sm transition has-focus-visible:ring-2 has-focus-visible:ring-turquoise/40",
                  market === m
                    ? "border-turquoise-deep bg-turquoise-soft"
                    : "hover:border-turquoise",
                )}
              >
                <input
                  type="radio"
                  name="market"
                  value={m}
                  checked={market === m}
                  onChange={() => setMarket(m)}
                  className="mt-0.5 accent-turquoise-deep"
                />
                <span>
                  <span className="block font-medium text-ocean-deep">
                    {t.markets[m].short}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t.marketHints[m]}
                  </span>
                </span>
              </label>
            ))}
          </div>
          {e.market ? (
            <p className="mt-1.5 text-sm text-destructive">{e.market}</p>
          ) : null}
        </fieldset>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            id="preferredDate"
            label={f.preferredDate}
            error={e.preferredDate}
            hint={f.preferredDateHint}
          >
            <Input
              {...describe("preferredDate", e.preferredDate, true)}
              name="preferredDate"
              type="date"
              min={today}
              max={addDays(today, BOOKING_WINDOW_DAYS)}
              defaultValue={v.preferredDate ?? plan?.date}
              required
              className="h-11 bg-background"
            />
          </FormField>
          <FormField
            id="currency"
            label={f.currency}
            error={e.currency}
            hint={f.currencyHint}
          >
            <select
              {...describe("currency", e.currency, true)}
              name="currency"
              value={currency}
              onChange={(ev) => setCurrency(ev.target.value as Currency)}
              className={fieldClass}
            >
              {currencyOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </FormField>
          <FormField id="adults" label={f.adults} error={e.adults}>
            <Input
              {...describe("adults", e.adults)}
              name="adults"
              type="number"
              inputMode="numeric"
              min={1}
              max={MAX_TRAVELLERS}
              value={adults}
              onChange={(ev) => setAdults(ev.target.value)}
              required
              className="h-11 bg-background"
            />
          </FormField>
          <FormField
            id="children"
            label={f.children}
            error={e.children}
            hint={f.childrenHint}
          >
            <Input
              {...describe("children", e.children, true)}
              name="children"
              type="number"
              inputMode="numeric"
              min={0}
              max={MAX_TRAVELLERS}
              value={children}
              onChange={(ev) => setChildren(ev.target.value)}
              className="h-11 bg-background"
            />
          </FormField>
        </div>

        {selected ? (
          <div className="rounded-xl bg-sand-soft px-4 py-3 text-sm" aria-live="polite">
            {estimate !== null && price ? (
              <>
                <p className="font-medium text-ocean-deep">
                  {fmt(f.estimate, { total: formatPrice(estimate, price.currency) })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {fmt(f.perAdult, { price: formatPrice(price.adult, price.currency) })}
                  {price.child !== null
                    ? fmt(f.perChild, { price: formatPrice(price.child, price.currency) })
                    : ""}
                  {price.isIllustrative ? f.illustrative : ""}
                  {f.confirmNote}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">{f.noPrice}</p>
            )}
          </div>
        ) : null}
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="font-display text-xl text-ocean-deep">{f.yourDetails}</legend>
        <FormField id="customerName" label={f.fullName} error={e.customerName}>
          <Input
            {...describe("customerName", e.customerName)}
            name="customerName"
            autoComplete="name"
            defaultValue={v.customerName}
            required
            maxLength={120}
            className="h-11 bg-background"
          />
        </FormField>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="email" label={f.email} error={e.email}>
            <Input
              {...describe("email", e.email)}
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={v.email}
              required
              maxLength={254}
              className="h-11 bg-background"
            />
          </FormField>
          <FormField id="phone" label={f.phone} error={e.phone} hint={f.phoneHint}>
            <Input
              {...describe("phone", e.phone, true)}
              name="phone"
              type="tel"
              autoComplete="tel"
              defaultValue={v.phone}
              required
              maxLength={40}
              placeholder="+255 712 345 678"
              className="h-11 bg-background"
            />
          </FormField>
        </div>
        <FormField id="pickupLocation" label={f.pickup} error={e.pickupLocation}>
          <Input
            {...describe("pickupLocation", e.pickupLocation)}
            name="pickupLocation"
            defaultValue={v.pickupLocation}
            maxLength={300}
            className="h-11 bg-background"
          />
        </FormField>
        <FormField id="message" label={f.message} error={e.message}>
          <textarea
            {...describe("message", e.message)}
            name="message"
            rows={4}
            maxLength={2000}
            defaultValue={v.message ?? defaultMessage}
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-base text-ink outline-none focus-visible:border-turquoise-deep focus-visible:ring-2 focus-visible:ring-turquoise-deep/25 aria-invalid:border-destructive md:text-sm"
          />
        </FormField>
      </fieldset>

      <div className="space-y-5 border-t pt-6">
        <div>
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              name="consent"
              defaultChecked={v.consent === "on"}
              required
              aria-invalid={e.consent ? true : undefined}
              aria-describedby={e.consent ? "consent-error" : undefined}
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
            <p id="consent-error" className="mt-1.5 text-sm text-destructive">
              {e.consent}
            </p>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">
          {f.requestNoteBefore}{" "}
          <strong className="text-ocean-deep">{f.requestWord}</strong>
          {f.requestNoteAfter}
        </p>
        <SubmitButton disabled={!available} />
      </div>
    </form>
  );
}
