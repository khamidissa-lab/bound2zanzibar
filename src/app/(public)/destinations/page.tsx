import type { Metadata } from "next";

import { DestinationCard } from "@/components/content/cards";
import { PageHeader } from "@/components/shared/page-header";
import { SampleBadge } from "@/components/shared/sample-badge";
import { SectionHeading } from "@/components/shared/section-heading";
import { getDestinations } from "@/services/content";

export const metadata: Metadata = {
  title: "Destinations",
  description:
    "Explore Zanzibar's towns, beaches, reefs and forests, and mainland Tanzania's safari parks.",
};

export default async function DestinationsPage() {
  const destinations = await getDestinations();
  const groups = [
    {
      id: "zanzibar",
      title: "Zanzibar",
      items: destinations.filter((d) => d.region === "zanzibar"),
    },
    {
      id: "mainland",
      title: "Mainland Tanzania",
      items: destinations.filter((d) => d.region === "mainland"),
    },
  ].filter((g) => g.items.length > 0);

  return (
    <>
      <PageHeader
        eyebrow="Where to go"
        title="Destinations"
        description="From Stone Town's lanes to the reefs of Mnemba and the plains of the mainland parks."
        crumbs={[{ label: "Home", href: "/" }, { label: "Destinations" }]}
      >
        <SampleBadge label="Sample destination guides" />
      </PageHeader>

      <div className="container-page space-y-20 py-16">
        {groups.map((group) => (
          <section key={group.id} aria-labelledby={`${group.id}-heading`}>
            <SectionHeading id={`${group.id}-heading`} title={group.title} />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {group.items.map((d) => (
                <DestinationCard key={d.slug} destination={d} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
