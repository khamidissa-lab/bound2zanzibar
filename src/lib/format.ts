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

/**
 * Money in its own currency, for any ISO code (including currencies added
 * later in the admin). Cents are shown only when there are any.
 */
export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      currencyDisplay: "code",
      minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
      maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("en-US")}`;
  }
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
