import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Gauge, MapPin, Users } from "lucide-react";

import { TourCard } from "@/components/content/cards";
import { EnquiryPanel } from "@/components/content/enquiry-panel";
import { TourTabs } from "@/components/content/tour-tabs";
import { SceneImage } from "@/components/media/scene-image";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SampleBadge } from "@/components/shared/sample-badge";
import { cn } from "@/lib/utils";
import {
  getDestinationBySlug,
  getNameLookups,
  getTourBySlug,
  getTours,
  staticSlugParams,
} from "@/services/content";

export async function generateStaticParams() {
  return staticSlugParams(await getTours());
}

export async function generateMetadata({
  params,
}: PageProps<"/tours/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);
  if (!tour) return { title: "Tour not found" };
  return {
    title: tour.seo.title,
    description: tour.seo.description,
    alternates: { canonical: `/tours/${tour.slug}` },
    openGraph: {
      title: tour.seo.title,
      description: tour.seo.description,
      type: "article",
    },
  };
}

const difficultyLabel = {
  easy: "Easy",
  moderate: "Moderate",
  challenging: "Challenging",
};

export default async function TourDetailPage({ params }: PageProps<"/tours/[slug]">) {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);
  if (!tour) notFound();

  const [destination, lookups, sameCategory] = await Promise.all([
    getDestinationBySlug(tour.destinationSlug),
    getNameLookups(),
    getTours({ categorySlug: tour.categorySlug }),
  ]);
  const related = sameCategory.filter((t) => t.slug !== tour.slug).slice(0, 3);
  const gallery = tour.gallery.slice(0, 2);

  const facts = [
    { icon: Clock, label: "Duration", value: tour.duration },
    {
      icon: MapPin,
      label: "Destination",
      value: destination ? (
        <Link
          href={`/destinations/${destination.slug}`}
          className="underline-offset-2 hover:underline"
        >
          {destination.name}
        </Link>
      ) : (
        "—"
      ),
    },
    { icon: Gauge, label: "Difficulty", value: difficultyLabel[tour.difficulty] },
    { icon: Users, label: "Suitability", value: tour.suitability },
  ];

  return (
    <>
      <div className="container-page pt-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Zanzibar Tours", href: "/tours" },
            { label: tour.name },
          ]}
        />
      </div>

      <article className="container-page pt-6 pb-16">
        <header className="max-w-3xl">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-turquoise-deep">
              {lookups.categories[tour.categorySlug]}
            </span>
            {tour.isSample ? <SampleBadge /> : null}
          </div>
          <h1 className="text-4xl font-medium sm:text-5xl">{tour.name}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{tour.shortDescription}</p>
        </header>

        <div
          className={cn(
            "mt-8 grid gap-3",
            gallery.length > 0 && "sm:grid-cols-[2fr_1fr]",
          )}
        >
          <SceneImage
            image={tour.coverImage}
            priority
            sizes="(min-width: 640px) 66vw, 100vw"
            className={cn(
              "aspect-[16/10] rounded-2xl",
              gallery.length > 0
                ? "sm:row-span-2 sm:aspect-auto sm:min-h-[22rem]"
                : "sm:aspect-[21/8]",
            )}
          />
          {gallery.map((image) => (
            <SceneImage
              key={image.alt}
              image={image}
              sizes="33vw"
              className="hidden aspect-[4/3] rounded-2xl sm:block sm:aspect-auto"
            />
          ))}
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem]">
          <div className="min-w-0 space-y-12">
            <dl className="grid gap-4 rounded-2xl bg-sand-soft p-5 sm:grid-cols-2">
              {facts.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex gap-3">
                  <Icon
                    className="mt-0.5 size-5 shrink-0 text-turquoise-deep"
                    aria-hidden="true"
                  />
                  <div>
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="text-sm font-medium text-ocean-deep">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>

            <TourTabs tour={tour} />
          </div>

          <div className="order-first lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:order-none lg:self-start">
            <EnquiryPanel itemName={tour.name} prices={tour.prices} />
          </div>
        </div>
      </article>

      {related.length > 0 ? (
        <section
          aria-labelledby="related-heading"
          className="border-t bg-sand-soft py-16"
        >
          <div className="container-page">
            <h2 id="related-heading" className="mb-8 text-3xl font-medium">
              Similar experiences
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((t) => (
                <TourCard
                  key={t.slug}
                  tour={t}
                  categoryName={lookups.categories[t.categorySlug]}
                  destinationName={lookups.destinations[t.destinationSlug]}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
