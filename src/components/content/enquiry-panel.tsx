import Link from "next/link";
import { CalendarCheck, Mail, MessageCircle, Phone } from "lucide-react";

import { MarketSwitcher } from "@/components/pricing/market-switcher";
import { PriceDisplay } from "@/components/pricing/price-display";
import { buttonVariants } from "@/components/ui/button";
import { contact, enquiryMailto, whatsappLink } from "@/config/site";
import type { PriceRecord } from "@/types/content";

/**
 * Pricing and booking actions for a tour or package. "Request to book" opens
 * the booking request form with this item selected; we never imply a booking
 * is confirmed.
 */
export function EnquiryPanel({
  itemName,
  itemType,
  slug,
  prices,
}: {
  itemName: string;
  itemType: "tour" | "package";
  slug: string;
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
        <Link
          href={`/book?${itemType}=${slug}`}
          className={buttonVariants({ size: "lg", variant: "gold", className: "w-full" })}
        >
          <CalendarCheck aria-hidden="true" data-icon="inline-start" />
          Request to book
        </Link>
        <a
          href={whatsappLink(`Hello! I'm interested in the ${itemName}.`)}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({
            size: "lg",
            variant: "outline",
            className: "w-full",
          })}
        >
          <MessageCircle aria-hidden="true" data-icon="inline-start" />
          Chat on WhatsApp
          <span className="sr-only">(opens WhatsApp)</span>
        </a>
        <a
          href={enquiryMailto(`Enquiry: ${itemName}`)}
          className={buttonVariants({
            size: "lg",
            variant: "outline",
            className: "w-full",
          })}
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
          A request isn&apos;t a confirmed booking. Our team confirms availability and the
          final price before anything is booked, and no payment is taken online.
        </p>
      </div>
    </aside>
  );
}
