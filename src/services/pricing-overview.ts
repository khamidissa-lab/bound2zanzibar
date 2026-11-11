import "server-only";

import type { Enums } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const MARKETS: Enums<"market">[] = ["resident", "east_african", "international"];

type PriceRow = {
  market: Enums<"market">;
  customer_type: Enums<"customer_type">;
  currency: string;
  amount: number | string;
  is_active: boolean;
  is_illustrative: boolean;
};

export type PricedItem = {
  kind: "tour" | "package";
  id: string;
  name: string;
  status: Enums<"publish_status">;
  /** Active adult prices per market, one entry per currency. */
  adult: Record<Enums<"market">, { currency: string; amount: number }[]>;
  /** Markets with no active adult price (the website shows "on request"). */
  missing: Enums<"market">[];
  illustrative: boolean;
};

function summarise(
  kind: PricedItem["kind"],
  row: { id: string; name: string; status: Enums<"publish_status"> },
  prices: PriceRow[],
): PricedItem {
  const active = prices.filter((p) => p.is_active && p.customer_type === "adult");
  const adult = Object.fromEntries(
    MARKETS.map((m) => [
      m,
      active
        .filter((p) => p.market === m)
        .map((p) => ({ currency: p.currency, amount: Number(p.amount) }))
        .sort((a, b) => a.currency.localeCompare(b.currency)),
    ]),
  ) as PricedItem["adult"];
  return {
    kind,
    id: row.id,
    name: row.name,
    status: row.status,
    adult,
    missing: MARKETS.filter((m) => adult[m].length === 0),
    illustrative: active.some((p) => p.is_illustrative),
  };
}

const PRICE_COLUMNS =
  "market, customer_type, currency, amount, is_active, is_illustrative";

/** Every tour and package that isn't archived, with its prices per market. */
export async function loadPricingOverview(): Promise<PricedItem[]> {
  const supabase = await createSupabaseServerClient();
  const [tours, packages] = await Promise.all([
    supabase
      .from("tours")
      .select(`id, name, status, tour_prices(${PRICE_COLUMNS})`)
      .neq("status", "archived")
      .order("name"),
    supabase
      .from("packages")
      .select(`id, name, status, package_prices(${PRICE_COLUMNS})`)
      .neq("status", "archived")
      .order("name"),
  ]);
  if (tours.error || packages.error) {
    console.error(
      `[pricing] failed to load: ${(tours.error ?? packages.error)?.message ?? ""}`,
    );
    throw new Error("Failed to load prices");
  }
  return [
    ...tours.data.map((t) => summarise("tour", t, t.tour_prices as PriceRow[])),
    ...packages.data.map((p) => summarise("package", p, p.package_prices as PriceRow[])),
  ];
}
