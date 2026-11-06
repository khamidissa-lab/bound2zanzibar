import type { Currency, Market, PriceRecord, TourOption } from "@/types/content";

/*
 * The price breakdown shown on the booking form. It mirrors the quote that
 * public.submit_booking_request snapshots, so the visitor sees the same sum
 * the team receives. Both are estimates until the team confirms.
 */

export type QuoteLine =
  | { kind: "adults"; count: number; unit: number; total: number }
  | { kind: "children"; count: number; unit: number; total: number }
  | {
      kind: "option";
      name: string;
      pricing: TourOption["pricing"];
      count: number;
      unit: number | null;
      total: number | null;
    };

export type Quote = {
  currency: Currency;
  lines: QuoteLine[];
  /** null when any traveller or chosen option has no price: staff will quote. */
  total: number | null;
};

export function buildQuote({
  price,
  adults,
  children,
  options,
  market,
}: {
  price: PriceRecord;
  adults: number;
  children: number;
  options: TourOption[];
  market: Market;
}): Quote {
  const lines: QuoteLine[] = [
    { kind: "adults", count: adults, unit: price.adult, total: price.adult * adults },
  ];
  let complete = true;
  if (children > 0) {
    if (price.child === null) complete = false;
    else
      lines.push({
        kind: "children",
        count: children,
        unit: price.child,
        total: price.child * children,
      });
  }
  for (const option of options) {
    const unit =
      option.prices.find((p) => p.market === market && p.currency === price.currency)
        ?.amount ?? null;
    const count = option.pricing === "per_booking" ? 1 : adults + children;
    if (unit === null) complete = false;
    lines.push({
      kind: "option",
      name: option.name,
      pricing: option.pricing,
      count,
      unit,
      total: unit === null ? null : unit * count,
    });
  }
  const total = complete ? lines.reduce((sum, line) => sum + (line.total ?? 0), 0) : null;
  return { currency: price.currency, lines, total };
}
