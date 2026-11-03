"use client";

import { marketLabels } from "@/lib/format";
import { setMarket, useMarket } from "@/lib/market-store";
import { cn } from "@/lib/utils";
import type { Market } from "@/types/content";

const options: { market: Market; currency: string }[] = [
  { market: "international", currency: "USD" },
  { market: "resident", currency: "TZS" },
];

export function MarketSwitcher({ className }: { className?: string }) {
  const market = useMarket();

  return (
    <div
      role="group"
      aria-label="Show prices for"
      className={cn(
        "inline-flex rounded-full border border-ocean-deep/15 bg-card p-1 text-sm",
        className,
      )}
    >
      {options.map((option) => (
        <button
          key={option.market}
          type="button"
          aria-pressed={market === option.market}
          onClick={() => setMarket(option.market)}
          className="rounded-full px-3.5 py-1.5 font-medium text-ocean-deep/75 transition-colors hover:text-ocean-deep aria-pressed:bg-ocean-deep aria-pressed:text-white"
        >
          {marketLabels[option.market].short}
          <span className="ml-1 font-normal">· {option.currency}</span>
        </button>
      ))}
    </div>
  );
}
