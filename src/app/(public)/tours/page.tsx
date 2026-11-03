import { Suspense } from "react";
import type { Metadata } from "next";

import { TourCard } from "@/components/content/cards";
import { TourExplorer } from "@/components/content/tour-explorer";
import { TourGrid } from "@/components/content/tour-grid";
import { MarketSwitcher } from "@/components/pricing/market-switcher";
import { PageHeader } from "@/components/shared/page-header";
import { SampleBadge } from "@/components/shared/sample-badge";
import {
  getCategories,
  getDestinations,
  getNameLookups,
  getTours,
} from "@/services/content";

export const metadata: Metadata = {
  title: "Zanzibar Tours & Experiences",
  description:
    "Day tours and experiences in Zanzibar: Stone Town, Prison Island, spice farms, Jozani Forest, snorkelling, sandbanks and dhow cruises.",
};

export default async function ToursPage() {
  const [tours, categories, destinations, lookups] = await Promise.all([
    getTours(),
    getCategories(),
    getDestinations(),
    getNameLookups(),
  ]);
  const usedDestinations = destinations.filter((d) =>
    tours.some((t) => t.destinationSlug === d.slug),
  );

  return (
    <>
      <PageHeader
        eyebrow="Experiences"
        title="Zanzibar tours & experiences"
        description="Culture, sea, forest and beach — day trips across Zanzibar, plus options on the mainland."
        crumbs={[{ label: "Home", href: "/" }, { label: "Zanzibar Tours" }]}
      >
        <div className="flex flex-wrap items-center gap-3">
          <MarketSwitcher />
          <SampleBadge label="Sample tours & illustrative prices" />
        </div>
      </PageHeader>

      <section aria-labelledby="all-tours" className="container-page py-12 sm:py-16">
        <h2 id="all-tours" className="sr-only">
          All tours
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
