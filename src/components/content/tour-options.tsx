"use client";

import { Plus } from "lucide-react";

import { useI18n } from "@/i18n/client";
import { useMarket } from "@/lib/market-store";
import type { TourOption } from "@/types/content";

/** A tour's priced extras, in the visitor's selected market. */
export function TourOptions({ options }: { options: TourOption[] }) {
  const { t, price } = useI18n();
  const market = useMarket();
  if (options.length === 0) return null;
  return (
    <div className="mt-10 bg-sand-soft p-6 sm:p-8">
      <h3 className="eyebrow text-gold-deep">{t.tour.optionsTitle}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{t.tour.optionsIntro}</p>
      <ul className="mt-5 divide-y divide-ocean-deep/10">
        {options.map((o) => {
          // Prices are never converted: show this market's own price, if any.
          const p = o.prices.find((x) => x.market === market);
          return (
            <li key={o.id} className="flex items-start gap-4 py-3">
              <Plus
                className="mt-1 size-4 shrink-0 text-turquoise-deep"
                aria-hidden="true"
              />
              <div className="flex-1">
                <p className="font-medium text-ocean-deep">{o.name}</p>
                {o.description ? (
                  <p className="text-sm text-muted-foreground">{o.description}</p>
                ) : null}
              </div>
              <p className="text-end text-sm whitespace-nowrap text-ocean-deep">
                {p ? (
                  <>
                    {price(p.amount, p.currency)}
                    <span className="block text-xs text-muted-foreground">
                      {o.pricing === "per_booking" ? t.tour.perBooking : t.tour.perPerson}
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground">{t.price.onRequest}</span>
                )}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
