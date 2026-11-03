"use client";

import { useActionState, useState, type ReactNode } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { CircleAlert, Loader2, Send } from "lucide-react";

import { requestBooking } from "@/app/(public)/book/actions";
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
import { formatPrice, marketLabels } from "@/lib/format";
import { initialFormState } from "@/lib/forms";
import { useMarket } from "@/lib/market-store";
import { cn } from "@/lib/utils";
import type { Currency, Market, PriceRecord } from "@/types/content";

export type BookableItem = {
  /** "tour:slug" or "package:slug". */
  value: string;
  label: string;
  group: "Tours" | "Packages";
  prices: PriceRecord[];
};

const MARKET_HINTS: Record<Market, string> = {
  international: "Visitors from outside East Africa",
  east_african: "Residents of an East African Community country",
  resident: "Tanzanian citizens and residents",
};

const fieldClass =
  "h-11 w-full rounded-xl border border-input bg-background px-3 text-base text-ink outline-none focus-visible:border-turquoise focus-visible:ring-2 focus-visible:ring-turquoise/30 aria-invalid:border-destructive md:text-sm";

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
      {pending ? "Sending request…" : "Send booking request"}
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
  today,
  available,
}: {
  items: BookableItem[];
  defaultItem: string;
  today: string;
  available: boolean;
}) {
  const [state, action] = useActionState(requestBooking, initialFormState);
  const v = state.values ?? {};
  const e = state.fieldErrors ?? {};
  const siteMarket = useMarket();

  const [item, setItem] = useState(v.item ?? defaultItem);
  const [marketChoice, setMarket] = useState<Market | null>((v.market as Market) ?? null);
  const market = marketChoice ?? siteMarket;
  const [currencyChoice, setCurrency] = useState<Currency | null>(
    (v.currency as Currency) ?? null,
  );
  const [adults, setAdults] = useState(v.adults ?? "2");
  const [children, setChildren] = useState(v.children ?? "0");

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
          {state.message}
        </p>
      ) : null}

      {/* Honeypot: hidden from people and assistive tech. */}
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] h-px w-px overflow-hidden"
      >
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <fieldset className="space-y-5">
        <legend className="font-display text-xl text-ocean-deep">Your trip</legend>

        <FormField id="item" label="Tour or package" error={e.item}>
          <select
            {...describe("item", e.item)}
            name="item"
            value={item}
            onChange={(ev) => setItem(ev.target.value)}
            className={fieldClass}
          >
            <option value="">Choose a tour or package…</option>
            {(["Tours", "Packages"] as const).map((group) => (
              <optgroup key={group} label={group}>
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
          <legend className="mb-2 text-sm font-medium">
            Where are you travelling from?
          </legend>
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
                    {marketLabels[m].short}
                  </span>
                  <span className="text-xs text-muted-foreground">{MARKET_HINTS[m]}</span>
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
            label="Preferred date"
            error={e.preferredDate}
            hint="We'll confirm availability for this date."
          >
            <Input
              {...describe("preferredDate", e.preferredDate, true)}
              name="preferredDate"
              type="date"
              min={today}
              max={addDays(today, BOOKING_WINDOW_DAYS)}
              defaultValue={v.preferredDate}
              required
              className="h-11 bg-background"
            />
          </FormField>
          <FormField
            id="currency"
            label="Currency"
            error={e.currency}
            hint="Prices are set per currency and never converted."
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
          <FormField id="adults" label="Adults" error={e.adults}>
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
            label="Children"
            error={e.children}
            hint="Under 12 years."
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
                  Estimated total: {formatPrice(estimate, price.currency)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatPrice(price.adult, price.currency)} per adult
                  {price.child !== null
                    ? `, ${formatPrice(price.child, price.currency)} per child`
                    : ""}
                  {price.isIllustrative ? " · illustrative sample prices" : ""}. Our team
                  confirms the final price with you.
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">
                No online price for this choice — our team will quote you directly.
              </p>
            )}
          </div>
        ) : null}
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="font-display text-xl text-ocean-deep">Your details</legend>
        <FormField id="customerName" label="Full name" error={e.customerName}>
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
          <FormField id="email" label="Email" error={e.email}>
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
          <FormField
            id="phone"
            label="Phone or WhatsApp"
            error={e.phone}
            hint="Include your country code."
          >
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
        <FormField
          id="pickupLocation"
          label="Hotel or pickup area (optional)"
          error={e.pickupLocation}
        >
          <Input
            {...describe("pickupLocation", e.pickupLocation)}
            name="pickupLocation"
            defaultValue={v.pickupLocation}
            maxLength={300}
            className="h-11 bg-background"
          />
        </FormField>
        <FormField
          id="message"
          label="Questions or special requests (optional)"
          error={e.message}
        >
          <textarea
            {...describe("message", e.message)}
            name="message"
            rows={4}
            maxLength={2000}
            defaultValue={v.message}
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-base text-ink outline-none focus-visible:border-turquoise focus-visible:ring-2 focus-visible:ring-turquoise/30 aria-invalid:border-destructive md:text-sm"
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
              I agree that Bound to Zanzibar may use these details to reply to my request,
              as described in the{" "}
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
            <p id="consent-error" className="mt-1.5 text-sm text-destructive">
              {e.consent}
            </p>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">
          This sends a <strong className="text-ocean-deep">request</strong>, not a
          confirmed booking. No payment is taken online — our team will contact you to
          confirm availability and the final price.
        </p>
        <SubmitButton disabled={!available} />
      </div>
    </form>
  );
}
