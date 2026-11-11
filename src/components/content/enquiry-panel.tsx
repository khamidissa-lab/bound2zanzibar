import { CalendarCheck, Mail, MessageCircle, Phone } from "lucide-react";

import { LocaleLink as Link } from "@/components/i18n/locale-link";
import { MarketSwitcher } from "@/components/pricing/market-switcher";
import { PriceDisplay } from "@/components/pricing/price-display";
import { buttonVariants } from "@/components/ui/button";
import { contact, enquiryMailto, whatsappLink } from "@/config/site";
import type { Locale } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import type { PriceRecord } from "@/types/content";

const secondary =
  "flex items-center gap-3 border-b border-ocean-deep/10 py-3 text-sm font-medium text-ocean-deep transition-colors last:border-b-0 hover:text-turquoise-deep";

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
  locale,
}: {
  locale: Locale;
  itemName: string;
  itemType: "tour" | "package";
  slug: string;
  prices: PriceRecord[];
}) {
  const { t, fmt } = getI18n(locale);
  return (
    <aside
      aria-label={t.enquiry.label}
      className="border border-ocean-deep/15 bg-ivory shadow-card"
    >
      <div className="border-b border-ocean-deep/15 p-5 sm:p-6">
        <p className="eyebrow text-gold-deep">
          {itemType === "tour" ? t.enquiry.planTour : t.enquiry.planPackage}
        </p>
        <h2 className="mt-2 font-display text-3xl">{t.enquiry.prices}</h2>
        <MarketSwitcher className="mt-4" />
        <PriceDisplay prices={prices} variant="detailed" className="mt-5" />
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        <Link
          href={`/book?${itemType}=${slug}`}
          className={buttonVariants({ size: "lg", className: "w-full" })}
        >
          <CalendarCheck aria-hidden="true" data-icon="inline-start" />
          {t.enquiry.requestToBook}
        </Link>
        <div>
          <a
            href={whatsappLink(fmt(t.enquiry.whatsappMessage, { item: itemName }))}
            target="_blank"
            rel="noopener noreferrer"
            className={secondary}
          >
            <MessageCircle className="size-4 text-turquoise-deep" aria-hidden="true" />
            {t.enquiry.whatsapp}
            <span className="sr-only">{t.nav.opensWhatsApp}</span>
          </a>
          <a
            href={enquiryMailto(
              fmt(t.enquiry.emailSubject, { item: itemName }),
              contact.bookingEmail,
            )}
            className={secondary}
          >
            <Mail className="size-4 text-turquoise-deep" aria-hidden="true" />
            {t.enquiry.email}
          </a>
          <a href={`tel:${contact.phone}`} className={secondary}>
            <Phone className="size-4 text-turquoise-deep" aria-hidden="true" />
            {fmt(t.enquiry.call, { phone: contact.phoneDisplay })}
          </a>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">{t.enquiry.note}</p>
      </div>
    </aside>
  );
}
