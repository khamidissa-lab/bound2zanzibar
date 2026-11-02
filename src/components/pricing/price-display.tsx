"use client";

import { formatPrice, marketLabels } from "@/lib/format";
import { useMarket } from "@/lib/market-store";
import { cn } from "@/lib/utils";
import type { PriceRecord } from "@/types/content";

type PriceDisplayProps = {
  prices: PriceRecord[];
  variant?: "compact" | "detailed";
  className?: string;
};

/**
 * Shows the configured price for the visitor's selected market. If no price
 * exists for that market we say so rather than converting another currency.
 */
export function PriceDisplay({
  prices,
  variant = "compact",
  className,
}: PriceDisplayProps) {
  const market = useMarket();
  const price = prices.find((p) => p.market === market);

  if (!price) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        Price on request for {marketLabels[market].long.toLowerCase()}
      </p>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("leading-tight", className)}>
        <p className="text-xs text-muted-foreground">From</p>
        <p className="font-semibold text-ocean-deep">
          {formatPrice(price.adult, price.currency)}
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            {price.unit}
          </span>
        </p>
        {price.isIllustrative ? (
          <p className="mt-0.5 text-[0.7rem] text-muted-foreground">Illustrative price</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <dl className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-sand-soft p-3">
          <dt className="text-xs text-muted-foreground">Adult</dt>
          <dd className="font-display text-2xl text-ocean-deep">
            {formatPrice(price.adult, price.currency)}
          </dd>
        </div>
        <div className="rounded-xl bg-sand-soft p-3">
          <dt className="text-xs text-muted-foreground">Child</dt>
          <dd className="font-display text-2xl text-ocean-deep">
            {price.child === null ? (
              <span className="text-base">On request</span>
            ) : (
              formatPrice(price.child, price.currency)
            )}
          </dd>
        </div>
      </dl>
      <p className="text-xs text-muted-foreground">
        {marketLabels[market].long} · {price.currency} · {price.unit}
      </p>
      {price.isIllustrative ? (
        <p className="rounded-lg border border-dashed border-gold bg-gold/10 px-3 py-2 text-xs text-ocean-deep">
          Illustrative sample price — final prices will be confirmed by our team.
        </p>
      ) : null}
    </div>
  );
}
