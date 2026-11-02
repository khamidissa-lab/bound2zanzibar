import type { Metadata } from "next";
import { Package } from "lucide-react";

import { PackageCard } from "@/components/content/cards";
import { MarketSwitcher } from "@/components/pricing/market-switcher";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { SampleBadge } from "@/components/shared/sample-badge";
import { SectionHeading } from "@/components/shared/section-heading";
import { getPackages } from "@/services/content";

export const metadata: Metadata = {
  title: "Travel Packages",
  description:
    "Multi-day Zanzibar holiday packages and Zanzibar + Tanzania safari combinations with accommodation, transfers and tours.",
};

export default async function PackagesPage() {
  const packages = await getPackages();
  const island = packages.filter((p) => !p.isSafari);
  const safari = packages.filter((p) => p.isSafari);

  return (
    <>
      <PageHeader
        eyebrow="Multi-day trips"
        title="Travel packages"
        description="Itineraries that bring together accommodation, transfers and experiences. Every package can be adjusted to your dates, group and budget."
        crumbs={[{ label: "Home", href: "/" }, { label: "Packages" }]}
      >
        <div className="flex flex-wrap items-center gap-3">
          <MarketSwitcher />
          <SampleBadge label="Sample packages & illustrative prices" />
        </div>
      </PageHeader>

      <div className="container-page space-y-20 py-16">
        {packages.length === 0 ? (
          <EmptyState icon={Package} title="Packages coming soon">
            We are preparing our first packages. Contact us to plan a trip in the
            meantime.
          </EmptyState>
        ) : null}

        {island.length > 0 ? (
          <section aria-labelledby="island-heading">
            <SectionHeading id="island-heading" title="Zanzibar island packages" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {island.map((pkg) => (
                <PackageCard key={pkg.slug} pkg={pkg} />
              ))}
            </div>
          </section>
        ) : null}

        {safari.length > 0 ? (
          <section aria-labelledby="safari-heading">
            <SectionHeading
              id="safari-heading"
              title="Zanzibar + safari packages"
              link={{ href: "/safari", label: "About our safaris" }}
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {safari.map((pkg) => (
                <PackageCard key={pkg.slug} pkg={pkg} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}
