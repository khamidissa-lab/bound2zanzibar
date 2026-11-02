import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Compass } from "lucide-react";

import { PackageCard, TourCard } from "@/components/content/cards";
import { ListBlock } from "@/components/content/list-block";
import { SceneImage } from "@/components/media/scene-image";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { EmptyState } from "@/components/shared/empty-state";
import { SampleBadge } from "@/components/shared/sample-badge";
import {
  getDestinationBySlug,
  getDestinations,
  getNameLookups,
  getPackages,
  getTours,
  staticSlugParams,
} from "@/services/content";

export async function generateStaticParams() {
  return staticSlugParams(await getDestinations());
}

export async function generateMetadata({
  params,
}: PageProps<"/destinations/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const destination = await getDestinationBySlug(slug);
  if (!destination) return { title: "Destination not found" };
  return {
    title: destination.seo.title,
    description: destination.seo.description,
    alternates: { canonical: `/destinations/${destination.slug}` },
    openGraph: { title: destination.seo.title, description: destination.seo.description },
  };
}

export default async function DestinationDetailPage({
  params,
}: PageProps<"/destinations/[slug]">) {
  const { slug } = await params;
  const destination = await getDestinationBySlug(slug);
  if (!destination) notFound();

  const [tours, packages, lookups] = await Promise.all([
    getTours({ destinationSlug: destination.slug }),
    getPackages({ destinationSlug: destination.slug }),
    getNameLookups(),
  ]);

  return (
    <>
      <section className="relative">
        <SceneImage
          image={destination.coverImage}
          priority
          sizes="100vw"
          className="aspect-[4/3] sm:aspect-[21/8]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ocean-deep/85 via-ocean-deep/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0">
          <div className="container-page pb-8 text-white sm:pb-12">
            <p className="text-sm font-medium text-white/80">
              {destination.region === "zanzibar" ? "Zanzibar" : "Mainland Tanzania"}
            </p>
            <h1 className="mt-1 text-4xl font-medium text-white sm:text-6xl">
              {destination.name}
            </h1>
          </div>
        </div>
      </section>

      <div className="container-page pt-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Destinations", href: "/destinations" },
            { label: destination.name },
          ]}
        />
      </div>

      <div className="container-page grid gap-12 py-10 lg:grid-cols-[1fr_20rem]">
        <section>
          {destination.isSample ? <SampleBadge className="mb-4" /> : null}
          <p className="text-xl leading-relaxed text-ocean-deep">{destination.summary}</p>
          <div className="mt-6 space-y-4 text-lg leading-relaxed">
            {destination.description.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>
        <ListBlock
          title="Highlights"
          items={destination.highlights}
          className="rounded-2xl bg-sand-soft p-6 lg:self-start"
        />
      </div>

      <section aria-labelledby="dest-tours" className="border-t bg-sand-soft py-16">
        <div className="container-page">
          <h2 id="dest-tours" className="mb-8 text-3xl font-medium">
            Experiences in {destination.name}
          </h2>
          {tours.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tours.map((t) => (
                <TourCard
                  key={t.slug}
                  tour={t}
                  categoryName={lookups.categories[t.categorySlug]}
                />
              ))}
            </div>
          ) : (
            <EmptyState icon={Compass} title="No day tours listed here yet">
              This destination features in our packages, or contact us and we can plan a
              visit for you.
            </EmptyState>
          )}
        </div>
      </section>

      {packages.length > 0 ? (
        <section aria-labelledby="dest-packages" className="py-16">
          <div className="container-page">
            <h2 id="dest-packages" className="mb-8 text-3xl font-medium">
              Packages that visit {destination.name}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {packages.map((pkg) => (
                <PackageCard key={pkg.slug} pkg={pkg} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
