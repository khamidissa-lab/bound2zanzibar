"use client";

import { useI18n } from "@/i18n/client";
import { BUDGET_BANDS } from "@/lib/discovery";
import type { Currency } from "@/types/content";

/** "Up to USD 50", "USD 50 – USD 150", "Over USD 400" for a budget band id. */
export function useBudgetLabel(currency: Currency) {
  const { t, fmt, price } = useI18n();
  return (id: string) => {
    const band = BUDGET_BANDS[currency].find((b) => b.id === id);
    if (!band) return "";
    if (band.min === 0 && band.max !== null)
      return fmt(t.tours.budgetUpTo, { max: price(band.max, currency) });
    if (band.max === null)
      return fmt(t.tours.budgetOver, { min: price(band.min, currency) });
    return fmt(t.tours.budgetBetween, {
      min: price(band.min, currency),
      max: price(band.max, currency),
    });
  };
}
