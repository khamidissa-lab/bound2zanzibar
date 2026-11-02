import type { Tables } from "@/lib/supabase/database.types";

/** Array → "one item per line" textarea value. */
export const toLines = (items: string[] | null | undefined) => (items ?? []).join("\n");

type PriceTableRow = Pick<
  Tables<"tour_prices">,
  | "market"
  | "customer_type"
  | "currency"
  | "amount"
  | "unit_label"
  | "is_illustrative"
  | "is_active"
>;

const MARKET_ORDER = { international: 0, resident: 1, east_african: 2 } as const;
const TYPE_ORDER = { adult: 0, child: 1, group: 2 } as const;

/** Database price rows → editor rows, in a stable, readable order. */
export function toPriceRows(rows: PriceTableRow[]) {
  return [...rows]
    .sort(
      (a, b) =>
        MARKET_ORDER[a.market] - MARKET_ORDER[b.market] ||
        a.currency.localeCompare(b.currency) ||
        TYPE_ORDER[a.customer_type] - TYPE_ORDER[b.customer_type],
    )
    .map((r) => ({
      market: r.market,
      customerType: r.customer_type,
      currency: r.currency,
      amount: String(r.amount),
      unitLabel: r.unit_label,
      isIllustrative: r.is_illustrative,
      isActive: r.is_active,
    }));
}
