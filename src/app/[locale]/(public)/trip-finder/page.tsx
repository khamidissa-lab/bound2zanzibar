import type { Metadata } from "next";

import { TripFinder } from "@/components/finder/trip-finder";
import { MarketSwitcher } from "@/components/pricing/market-switcher";
import { PageHeader } from "@/components/shared/page-header";
import { SampleBadge } from "@/components/shared/sample-badge";
import { getMessages } from "@/i18n/messages";
import { localeAlternates, pageLocale } from "@/i18n/seo";
import {
  getCategories,
  getDestinations,
  getNameLookups,
  getPackages,
  getTours,
} from "@/services/content";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/trip-finder">): Promise<Metadata> {
  const locale = pageLocale((await params).locale);
  const t = getMessages(locale);
  return {
    title: t.finder.metaTitle,
    description: t.finder.metaDescription,
    alternates: localeAlternates(locale, "/trip-finder"),
  };
}

export default async function TripFinderPage({
  params,
}: PageProps<"/[locale]/trip-finder">) {
  const locale = pageLocale((await params).locale);
  const t = getMessages(locale);
  const [tours, packages, categories, destinations, lookups] = await Promise.all([
    getTours({}, locale),
    getPackages({}, locale),
    getCategories(locale),
    getDestinations({}, locale),
    getNameLookups(locale),
  ]);
  // Only offer interests that have at least one tour.
  const usedCategories = categories.filter((c) =>
    tours.some((tour) => tour.categorySlug === c.slug),
  );

  return (
    <>
      <PageHeader
        eyebrow={t.finder.eyebrow}
        title={t.finder.title}
        description={t.finder.description}
        crumbs={[{ label: t.nav.home, href: "/" }, { label: t.finder.title }]}
        tone="sand"
      >
        <div className="flex flex-wrap items-center gap-3">
          <MarketSwitcher />
          <SampleBadge label={t.price.samplePrices} />
        </div>
      </PageHeader>
      <section className="container-page py-14 sm:py-20">
        <TripFinder
          tours={tours}
          packages={packages}
          categories={usedCategories.map(({ slug, name }) => ({ slug, name }))}
          destinationRegion={Object.fromEntries(
            destinations.map((d) => [d.slug, d.region]),
          )}
          lookups={lookups}
        />
      </section>
    </>
  );
}
