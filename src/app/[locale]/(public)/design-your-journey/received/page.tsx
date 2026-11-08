import { Suspense } from "react";
import type { Metadata } from "next";
import { CircleCheck, Mail, MessageCircle, Phone } from "lucide-react";

import { LocaleLink as Link } from "@/components/i18n/locale-link";
import { buttonVariants } from "@/components/ui/button";
import { contact, whatsappLink } from "@/config/site";
import type { Locale } from "@/i18n/config";
import { pageLocale } from "@/i18n/seo";
import { getI18n } from "@/i18n/server";
import { JOURNEY_REFERENCE_RE } from "@/lib/journey/request";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/design-your-journey/received">): Promise<Metadata> {
  const { t } = getI18n(pageLocale((await params).locale));
  return { title: t.journey.receivedMetaTitle, robots: { index: false, follow: false } };
}

/**
 * Shown after a journey request is saved. The reference is only echoed back
 * from the URL (when well-formed); nothing is looked up.
 */
export default async function JourneyReceivedPage({
  params,
  searchParams,
}: PageProps<"/[locale]/design-your-journey/received">) {
  const locale = pageLocale((await params).locale);
  const { t } = getI18n(locale);
  const j = t.journey;
  return (
    <section className="bg-tide flex justify-center px-4 py-16 sm:py-24">
      <div className="w-full max-w-xl border border-ocean-deep/15 bg-ivory p-6 text-center shadow-card sm:p-12">
        <CircleCheck className="mx-auto size-12 text-turquoise-deep" aria-hidden="true" />
        <h1 className="mt-5 font-display text-4xl text-ocean-deep sm:text-5xl">
          {j.receivedTitle}
        </h1>
        <p className="mt-3 text-muted-foreground">{j.receivedBody}</p>
        <p className="mt-2 text-sm text-muted-foreground">{j.noPayment}</p>

        <Suspense fallback={null}>
          <Reference searchParams={searchParams} locale={locale} />
        </Suspense>

        <div className="mt-6 flex flex-col justify-center gap-2 text-sm sm:flex-row sm:gap-6">
          <a
            href={`mailto:${contact.email}`}
            className="inline-flex items-center justify-center gap-2 text-turquoise-deep hover:underline"
          >
            <Mail className="size-4" aria-hidden="true" />
            {contact.email}
          </a>
          <a
            href={`tel:${contact.phone}`}
            className="inline-flex items-center justify-center gap-2 text-turquoise-deep hover:underline"
          >
            <Phone className="size-4" aria-hidden="true" />
            {contact.phoneDisplay}
          </a>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/tours" className={buttonVariants({ variant: "outline" })}>
            {t.received.browse}
          </Link>
          <Link href="/" className={buttonVariants()}>
            {t.common.backHome}
          </Link>
        </div>
      </div>
    </section>
  );
}

async function Reference({
  searchParams,
  locale,
}: {
  searchParams: PageProps<"/[locale]/design-your-journey/received">["searchParams"];
  locale: Locale;
}) {
  const { t, fmt } = getI18n(locale);
  const raw = (await searchParams).ref;
  const ref = Array.isArray(raw) ? raw[0] : raw;
  if (!ref || !JOURNEY_REFERENCE_RE.test(ref)) return null;
  return (
    <div className="mt-8 border-y border-ocean-deep/15 px-4 py-5">
      <p className="text-xs font-medium tracking-wide text-ocean-deep/70 uppercase">
        {t.journey.reference}
      </p>
      <p className="mt-1 font-mono text-2xl font-semibold tracking-wider text-ocean-deep">
        {ref}
      </p>
      <p className="mt-1 text-xs text-ocean-deep/70">{t.journey.keep}</p>
      <a
        href={whatsappLink(fmt(t.journey.whatsappMessage, { ref }))}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-turquoise-deep hover:underline"
      >
        <MessageCircle className="size-4" aria-hidden="true" />
        {t.journey.whatsapp}
      </a>
    </div>
  );
}
