import { Suspense } from "react";
import type { Metadata } from "next";

import { TourCard } from "@/components/content/cards";
import { TourExplorer } from "@/components/content/tour-explorer";
import { TourGrid } from "@/components/content/tour-grid";
import { MarketSwitcher } from "@/components/pricing/market-switcher";
import { PageHeader } from "@/components/shared/page-header";
import { SampleBadge } from "@/components/shared/sample-badge";
import { getMessages } from "@/i18n/messages";
import { localeAlternates, pageLocale } from "@/i18n/seo";
import {
  getCategories,
  getDestinations,
  getNameLookups,
  getTours,
} from "@/services/content";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/tours">): Promise<Metadata> {
  const locale = pageLocale((await params).locale);
  const t = getMessages(locale);
  return {
    title: t.tours.metaTitle,
    description: t.tours.metaDescription,
    alternates: localeAlternates(locale, "/tours"),
  };
}

export default async function ToursPage({ params }: PageProps<"/[locale]/tours">) {
  const locale = pageLocale((await params).locale);
  const t = getMessages(locale);
  const [tours, categories, destinations, lookups] = await Promise.all([
    getTours({}, locale),
    getCategories(locale),
    getDestinations({}, locale),
    getNameLookups(locale),
  ]);
  const usedDestinations = destinations.filter((d) =>
    tours.some((tour) => tour.destinationSlug === d.slug),
  );

  return (
    <>
      <PageHeader
        eyebrow={t.tours.eyebrow}
        title={t.tours.title}
        description={t.tours.description}
        crumbs={[{ label: t.nav.home, href: "/" }, { label: t.nav.tours }]}
        image={{
          src: "/images/photos/sandbank.jpg",
          alt: t.tours.headerAlt,
          theme: "ocean",
        }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <MarketSwitcher />
          <SampleBadge label={t.price.samplePrices} />
        </div>
      </PageHeader>

      <section aria-labelledby="all-tours" className="container-page py-14 sm:py-20">
        <h2 id="all-tours" className="sr-only">
          {t.tours.allTours}
        </h2>
        <Suspense
          fallback={
            <TourGrid>
              {tours.map((tour) => (
                <TourCard
                  key={tour.slug}
                  tour={tour}
                  categoryName={lookups.categories[tour.categorySlug]}
                  destinationName={lookups.destinations[tour.destinationSlug]}
                />
              ))}
            </TourGrid>
          }
        >
          <TourExplorer
            tours={tours}
            categories={categories.map(({ slug, name }) => ({ slug, name }))}
            destinations={usedDestinations.map(({ slug, name }) => ({ slug, name }))}
            lookups={lookups}
          />
        </Suspense>
      </section>
    </>
  );
}
