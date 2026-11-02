import type { Metadata } from "next";
import { Binoculars, Plane, Sun } from "lucide-react";

import { DestinationCard, PackageCard, TourCard } from "@/components/content/cards";
import { MarketSwitcher } from "@/components/pricing/market-switcher";
import { PageHeader } from "@/components/shared/page-header";
import { SampleBadge } from "@/components/shared/sample-badge";
import { SectionHeading } from "@/components/shared/section-heading";
import {
  getDestinations,
  getNameLookups,
  getPackages,
  getTours,
} from "@/services/content";

export const metadata: Metadata = {
  title: "Tanzania Safari from Zanzibar",
  description:
    "Combine Zanzibar with a Tanzania safari: day trips to Mikumi and multi-day northern circuit packages.",
};

const points = [
  {
    icon: Plane,
    title: "Island + safari, one plan",
    body: "Flights, transfers and island time arranged as one connected trip.",
  },
  {
    icon: Binoculars,
    title: "Options for any timeframe",
    body: "From a long day trip to Mikumi to a full northern-circuit safari.",
  },
  {
    icon: Sun,
    title: "Honest about conditions",
    body: "Wildlife sightings and flight schedules can't be guaranteed — we tell you what to expect.",
  },
];

export default async function SafariPage() {
  const [packages, tours, parks, lookups] = await Promise.all([
    getPackages({ isSafari: true }),
    getTours({ categorySlug: "safari" }),
    getDestinations({ region: "mainland" }),
    getNameLookups(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Safari"
        title="Tanzania safari, from Zanzibar"
        description="Pair the beaches and culture of Zanzibar with the wildlife of mainland Tanzania."
        crumbs={[{ label: "Home", href: "/" }, { label: "Safari" }]}
      >
        <div className="flex flex-wrap items-center gap-3">
          <MarketSwitcher />
          <SampleBadge label="Sample safaris & illustrative prices" />
        </div>
      </PageHeader>

      <section className="container-page py-14">
        <ul className="grid gap-5 md:grid-cols-3">
          {points.map(({ icon: Icon, title, body }) => (
            <li key={title} className="rounded-2xl border bg-card p-6">
              <Icon className="size-6 text-turquoise-deep" aria-hidden="true" />
              <h2 className="mt-4 text-xl font-medium">{title}</h2>
              <p className="mt-2 text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>
      </section>

      {packages.length > 0 ? (
        <section aria-labelledby="safari-packages" className="container-page pb-16">
          <SectionHeading
            id="safari-packages"
            title="Safari packages"
            description="Multi-day trips combining a mainland safari with time in Zanzibar."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => (
              <PackageCard key={pkg.slug} pkg={pkg} />
            ))}
          </div>
        </section>
      ) : null}

      {tours.length > 0 ? (
        <section aria-labelledby="safari-days" className="container-page pb-16">
          <SectionHeading
            id="safari-days"
            title="Short on time?"
            description="Safari day trips from Zanzibar."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tours.map((t) => (
              <TourCard
                key={t.slug}
                tour={t}
                destinationName={lookups.destinations[t.destinationSlug]}
              />
            ))}
          </div>
        </section>
      ) : null}

      {parks.length > 0 ? (
        <section aria-labelledby="parks" className="border-t bg-sand-soft py-16">
          <div className="container-page">
            <SectionHeading id="parks" title="Where we go on safari" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {parks.map((d) => (
                <DestinationCard key={d.slug} destination={d} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
