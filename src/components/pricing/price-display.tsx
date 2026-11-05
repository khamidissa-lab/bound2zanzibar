"use client";

import { useLocaleOrDefault, useMessagesOrEnglish } from "@/i18n/client";
import { fmt, formatPriceIn } from "@/i18n/format";
import { useMarket } from "@/lib/market-store";
import { cn } from "@/lib/utils";
import type { PriceRecord } from "@/types/content";

type PriceDisplayProps = {
  prices: PriceRecord[];
  variant?: "compact" | "detailed";
  /** `dark` for ocean-coloured surfaces (compact variant). */
  tone?: "light" | "dark";
  className?: string;
};

/**
 * Shows the configured price for the visitor's selected market. If no price
 * exists for that market we say so rather than converting another currency.
 */
export function PriceDisplay({
  prices,
  variant = "compact",
  tone = "light",
  className,
}: PriceDisplayProps) {
  const market = useMarket();
  const t = useMessagesOrEnglish();
  const locale = useLocaleOrDefault();
  const formatPrice = (amount: number, currency: string) =>
    formatPriceIn(locale, amount, currency);
  const unit = (u: string) => t.units[u] ?? u;
  const price = prices.find((p) => p.market === market);
  const dark = tone === "dark";
  const muted = dark ? "text-white/65" : "text-muted-foreground";

  if (!price) {
    return (
      <p className={cn("text-sm", muted, className)}>
        {fmt(t.price.onRequestFor, {
          // Mid-sentence lower case suits English; German capitalises nouns.
          market:
            locale === "en"
              ? t.markets[market].long.toLowerCase()
              : t.markets[market].long,
        })}
      </p>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("leading-tight", className)}>
        <p className={cn("eyebrow text-[0.62rem]", muted)}>{t.price.from}</p>
        <p className={cn("mt-1", dark ? "text-ivory" : "text-ocean-deep")}>
          <span className="font-display text-[1.65rem] leading-none">
            {formatPrice(price.adult, price.currency)}
          </span>
          <span className={cn("ms-1.5 text-xs", muted)}>{unit(price.unit)}</span>
        </p>
        {price.isIllustrative ? (
          <p className={cn("mt-1 text-[0.7rem]", muted)}>{t.price.illustrative}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <dl className="grid grid-cols-2 border border-ocean-deep/15">
        <div className="p-4">
          <dt className="eyebrow text-[0.62rem] text-muted-foreground">
            {t.price.adult}
          </dt>
          <dd className="mt-1.5 font-display text-3xl text-ocean-deep">
            {formatPrice(price.adult, price.currency)}
          </dd>
        </div>
        <div className="border-s border-ocean-deep/15 p-4">
          <dt className="eyebrow text-[0.62rem] text-muted-foreground">
            {t.price.child}
          </dt>
          <dd className="mt-1.5 font-display text-3xl text-ocean-deep">
            {price.child === null ? (
              <span className="text-xl">{t.price.onRequest}</span>
            ) : (
              formatPrice(price.child, price.currency)
            )}
          </dd>
        </div>
      </dl>
      <p className="text-xs text-muted-foreground">
        {t.markets[market].long} · {price.currency} · {unit(price.unit)}
      </p>
      {price.isIllustrative ? (
        <p className="border-s-2 border-gold bg-gold/10 px-3 py-2 text-xs text-ocean-deep">
          {t.price.illustrativeNote}
        </p>
      ) : null}
    </div>
  );
}
