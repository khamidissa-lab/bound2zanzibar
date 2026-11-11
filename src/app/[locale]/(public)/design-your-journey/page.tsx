import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";

import { JourneyForm } from "@/components/journey/journey-form";
import { PageHeader } from "@/components/shared/page-header";
import { getMessages } from "@/i18n/messages";
import { localeAlternates, pageLocale } from "@/i18n/seo";
import { TRAVEL_STYLES } from "@/lib/discovery";
import { zanzibarDate } from "@/services/admin-dashboard-model";
import { getCategories, getDestinations } from "@/services/content";
import type { Locale } from "@/i18n/config";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/design-your-journey">): Promise<Metadata> {
  const locale = pageLocale((await params).locale);
  const t = getMessages(locale);
  return {
    title: t.journey.metaTitle,
    description: t.journey.metaDescription,
    alternates: localeAlternates(locale, "/design-your-journey"),
  };
}

export default async function DesignYourJourneyPage({
  params,
}: PageProps<"/[locale]/design-your-journey">) {
  const locale = pageLocale((await params).locale);
  const t = getMessages(locale);
  const j = t.journey;

  return (
    <>
      <PageHeader
        eyebrow={j.eyebrow}
        title={j.title}
        description={j.description}
        crumbs={[{ label: t.nav.home, href: "/" }, { label: j.title }]}
        image={{
          src: "/images/travellers/honeymoon-sandbank.jpg",
          alt: t.home.travellers.items.honeymoon.alt,
          theme: "sunset",
        }}
      />
      <div className="container-page grid gap-14 py-14 sm:py-20 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-20">
        <Suspense fallback={null}>
          <JourneyFormSection locale={locale} />
        </Suspense>
        <aside className="lg:sticky lg:top-[calc(var(--header-height)+2rem)] lg:self-start">
          <div className="bg-sand-soft p-6 sm:p-8">
            <h2 className="eyebrow text-gold-deep">{j.howTitle}</h2>
            <ol className="mt-5 space-y-4">
              {j.how.map((step, i) => (
                <li key={step} className="flex gap-4">
                  <span className="font-display text-3xl leading-none text-gold-deep tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="pt-1 leading-relaxed text-ocean-deep">{step}</span>
                </li>
              ))}
            </ol>
            <p className="mt-6 border-t border-ocean-deep/15 pt-4 text-sm text-muted-foreground">
              {j.noPayment}
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}

/** Loads the choices; dynamic only for "today" (the earliest travel date). */
async function JourneyFormSection({ locale }: { locale: Locale }) {
  await connection();
  const t = getMessages(locale);
  const [destinations, categories] = await Promise.all([
    getDestinations({}, locale),
    getCategories(locale),
  ]);
  // Interests: travel styles first, then tour categories (both stored as
  // slugs). A category sharing a style's slug (e.g. "adventure") is the same
  // interest, so it is listed once.
  const styles: readonly string[] = TRAVEL_STYLES;
  const interests = [
    ...TRAVEL_STYLES.map((s) => ({ value: s, label: t.travelStyles[s] })),
    ...categories
      .filter((c) => !styles.includes(c.slug))
      .map((c) => ({ value: c.slug, label: c.name })),
  ];
  return (
    <JourneyForm
      destinations={destinations.map(({ slug, name, region }) => ({
        slug,
        name,
        region,
      }))}
      interests={interests}
      today={zanzibarDate(new Date())}
    />
  );
}
