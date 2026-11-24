export type AdminPriceRow = {
  market: string;
  customer_type: string;
  currency: string;
  amount: number;
  is_active: boolean;
  is_illustrative: boolean;
};

/**
 * The "from" price shown on an admin tour card: the lowest active adult price
 * for international visitors, or else the lowest active adult price in any
 * market. Amounts are never converted between currencies.
 */
export function adminFromPrice(
  rows: readonly AdminPriceRow[],
): { amount: number; currency: string; isExample: boolean } | null {
  const adult = rows.filter((r) => r.is_active && r.customer_type === "adult");
  const international = adult.filter((r) => r.market === "international");
  const pool = international.length > 0 ? international : adult;
  if (pool.length === 0) return null;
  const lowest = pool.reduce((a, b) => (Number(b.amount) < Number(a.amount) ? b : a));
  return {
    amount: Number(lowest.amount),
    currency: lowest.currency,
    isExample: lowest.is_illustrative,
  };
}
