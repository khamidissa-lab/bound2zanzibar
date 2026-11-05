"use client";

import { useMessagesOrEnglish } from "@/i18n/client";
import { setMarket, useMarket } from "@/lib/market-store";
import { cn } from "@/lib/utils";
import type { Market } from "@/types/content";

const options: { market: Market; currency: string }[] = [
  { market: "international", currency: "USD" },
  { market: "resident", currency: "TZS" },
];

export function MarketSwitcher({
  className,
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  const market = useMarket();
  const t = useMessagesOrEnglish();
  const dark = tone === "dark";

  return (
    <div
      role="group"
      aria-label={t.price.showFor}
      className={cn(
        "inline-flex border text-sm",
        dark ? "border-white/30" : "border-ocean-deep/20 bg-ivory",
        className,
      )}
    >
      {options.map((option) => (
        <button
          key={option.market}
          type="button"
          aria-pressed={market === option.market}
          onClick={() => setMarket(option.market)}
          className={cn(
            "px-3.5 py-2 font-medium transition-colors",
            dark
              ? "text-white/75 hover:text-white aria-pressed:bg-ivory aria-pressed:text-ocean-deep"
              : "text-ocean-deep/70 hover:text-ocean-deep aria-pressed:bg-ocean-deep aria-pressed:text-ivory",
          )}
        >
          {t.markets[option.market].short}
          <span className="ml-1.5 text-[0.7rem] tracking-[0.12em] uppercase">
            {option.currency}
          </span>
        </button>
      ))}
    </div>
  );
}
