import { LOCALE_INFO, type Locale } from "./config";

/** Fills {placeholders}: fmt("Day {n}", { n: 3 }) → "Day 3". */
export function fmt(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

/** A configured native price in the visitor's language. Never converts currencies. */
export function formatPriceIn(locale: Locale, amount: number, currency: string): string {
  return new Intl.NumberFormat(LOCALE_INFO[locale].intl, {
    style: "currency",
    currency,
    currencyDisplay: "code",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** "2026-11-04" → "4 November 2026" (in the visitor's language). */
export function formatDateIn(locale: Locale, isoDate: string): string {
  return new Intl.DateTimeFormat(LOCALE_INFO[locale].intl, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}
