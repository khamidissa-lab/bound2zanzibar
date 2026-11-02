import { Mail, Phone } from "lucide-react";

import { MarketSwitcher } from "@/components/pricing/market-switcher";
import { PriceDisplay } from "@/components/pricing/price-display";
import { buttonVariants } from "@/components/ui/button";
import { contact, enquiryMailto } from "@/config/site";
import type { PriceRecord } from "@/types/content";

/**
 * Pricing and enquiry actions for a tour or package. Online booking requests
 * arrive in Phase 6; until then visitors enquire by email or phone, and we
 * never imply a booking is confirmed.
 */
export function EnquiryPanel({
  itemName,
  prices,
}: {
  itemName: string;
  prices: PriceRecord[];
}) {
  return (
    <aside
      aria-label="Prices and enquiries"
      className="rounded-2xl border bg-card p-5 shadow-card sm:p-6"
    >
      <h2 className="font-display text-xl">Prices</h2>
      <MarketSwitcher className="mt-3" />
      <PriceDisplay prices={prices} variant="detailed" className="mt-4" />

      <div className="mt-6 space-y-3 border-t pt-6">
        <a
          href={enquiryMailto(`Enquiry: ${itemName}`)}
          className={buttonVariants({ size: "lg", className: "w-full" })}
        >
          <Mail aria-hidden="true" data-icon="inline-start" />
          Enquire by email
        </a>
        <a
          href={`tel:${contact.phone}`}
          className={buttonVariants({
            size: "lg",
            variant: "outline",
            className: "w-full",
          })}
        >
          <Phone aria-hidden="true" data-icon="inline-start" />
          Call {contact.phoneDisplay}
        </a>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Online booking requests are coming soon. Availability and final prices are
          always confirmed by our team before anything is booked.
        </p>
      </div>
    </aside>
  );
}
