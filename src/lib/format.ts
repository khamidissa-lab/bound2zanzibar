import type { Currency, Market } from "@/types/content";

/** Formats a configured native price. Never converts between currencies. */
export function formatPrice(amount: number, currency: Currency): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    currencyDisplay: "code",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

export const marketLabels: Record<Market, { short: string; long: string }> = {
  international: { short: "International", long: "International visitors" },
  resident: { short: "Tanzania resident", long: "Tanzanian residents" },
  east_african: { short: "East African", long: "East African residents" },
};
