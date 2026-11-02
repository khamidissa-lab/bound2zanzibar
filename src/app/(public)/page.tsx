import Link from "next/link";
import { ArrowRight, MessageSquareQuote } from "lucide-react";

import {
  ArticleCard,
  DestinationCard,
  PackageCard,
  TourCard,
} from "@/components/content/cards";
import { DiscoveryPanel } from "@/components/content/discovery-panel";
import { WhyTravel } from "@/components/content/why-travel";
import { HeroSlideshow } from "@/components/home/hero-slideshow";
import { SceneImage } from "@/components/media/scene-image";
import { MarketSwitcher } from "@/components/pricing/market-switcher";
import { EmptyState } from "@/components/shared/empty-state";
import { SampleBadge } from "@/components/shared/sample-badge";
import { SectionHeading } from "@/components/shared/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import {
  getArticles,
  getCategories,
  getDestinations,
  getNameLookups,
  getPackages,
  getTours,
} from "@/services/content";

export default async function HomePage() {
  const [
    featuredTours,
    allTours,
    categories,
    destinations,
    featuredDestinations,
    packages,
    articles,
    lookups,
  ] = await Promise.all([
    getTours({ featured: true }),
    getTours(),
    getCategories(),
    getDestinations(),
    getDestinations({ featured: true }),
    getPackages({ featured: true }),
    getArticles(),
    getNameLookups(),
  ]);

  const searchableDestinations = destinations
    .filter((d) => allTours.some((t) => t.destinationSlug === d.slug))
    .map(({ slug, name }) => ({ slug, name }));

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-ocean-deep">
        <HeroSlideshow />
        <div className="container-page flex min-h-[640px] flex-col justify-center pt-20 pb-44 lg:min-h-[min(80vh,820px)] lg:pb-52">
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-gold-light">
              <span className="h-px w-8 bg-gold" aria-hidden="true" />
              Zanzibar &amp; Tanzania
            </p>
            <h1 className="text-5xl leading-[1.05] font-medium text-white drop-shadow-sm sm:text-6xl lg:text-7xl">
              {siteConfig.tagline}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/90">
              Tours, safaris and travel packages planned with local knowledge — for
              Tanzanian residents, East African travellers and visitors from around the
              world.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/tours"
                className={buttonVariants({ variant: "gold", size: "lg" })}
              >
                Explore tours
                <ArrowRight aria-hidden="true" data-icon="inline-end" />
              </Link>
              <Link
                href="/packages"
                className={buttonVariants({
                  size: "lg",
                  variant: "outline",
                  className:
                    "border-white/60 bg-white/10 text-white backdrop-blur-sm hover:border-white hover:bg-white/20 hover:text-white",
                })}
              >
                View packages
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Discovery panel overlaps the hero edge */}
      <div className="container-page relative z-10 -mt-20 lg:-mt-24">
        <DiscoveryPanel
          categories={categories.map(({ slug, name }) => ({ slug, name }))}
          destinations={searchableDestinations}
        />
      </div>

      {/* Featured experiences */}
      <section aria-labelledby="featured-heading" className="container-page pt-20 pb-16">
        <SectionHeading
          id="featured-heading"
          eyebrow="Featured experiences"
          title="Zanzibar, one day at a time"
          link={{ href: "/tours", label: "All tours" }}
        />
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <MarketSwitcher />
          <SampleBadge label="Sample tours & illustrative prices" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredTours.slice(0, 6).map((tour) => (
            <TourCard
              key={tour.slug}
              tour={tour}
              categoryName={lookups.categories[tour.categorySlug]}
              destinationName={lookups.destinations[tour.destinationSlug]}
            />
          ))}
        </div>
      </section>

      {/* Destinations */}
      <section aria-labelledby="dest-heading" className="bg-sand-soft py-20">
        <div className="container-page">
          <SectionHeading
            id="dest-heading"
            eyebrow="Popular destinations"
            title="Where to go"
            link={{ href: "/destinations", label: "All destinations" }}
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredDestinations.slice(0, 4).map((d) => (
              <DestinationCard key={d.slug} destination={d} />
            ))}
          </div>
        </div>
      </section>

      {/* Safari feature */}
      <section aria-labelledby="safari-heading" className="bg-ocean-deep text-white">
        <div className="container-page grid gap-10 py-20 lg:grid-cols-2 lg:items-center">
          <SceneImage
            image={{
              src: "/images/photos/zebras.jpg",
              alt: "Zebras grazing in the Ngorongoro Crater under shafts of light",
              theme: "savanna",
            }}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="aspect-[16/10] rounded-[2rem]"
          />
          <div>
            <p className="mb-2 text-sm font-semibold text-turquoise">
              Zanzibar + Tanzania safari
            </p>
            <h2
              id="safari-heading"
              className="text-3xl font-medium text-white sm:text-4xl"
            >
              From the reef to the plains
            </h2>
            <p className="mt-4 max-w-lg text-lg leading-relaxed text-white/80">
              Combine island days with a mainland safari — from a long day trip to Mikumi
              to a full northern-circuit adventure in the Serengeti and Ngorongoro.
            </p>
            <Link
              href="/safari"
              className={buttonVariants({
                variant: "gold",
                size: "lg",
                className: "mt-8",
              })}
            >
              Explore safaris
              <ArrowRight aria-hidden="true" data-icon="inline-end" />
            </Link>
          </div>
        </div>
      </section>

      {/* Packages */}
      {packages.length > 0 ? (
        <section aria-labelledby="packages-heading" className="container-page py-20">
          <SectionHeading
            id="packages-heading"
            eyebrow="Multi-day packages"
            title="Trips planned end to end"
            description="Accommodation, transfers and experiences in one itinerary — adjustable to your budget."
            link={{ href: "/packages", label: "All packages" }}
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {packages.slice(0, 3).map((pkg) => (
              <PackageCard key={pkg.slug} pkg={pkg} />
            ))}
          </div>
        </section>
      ) : null}

      <div className="border-y bg-sand-soft">
        <WhyTravel />
      </div>

      {/* Testimonials: only genuine reviews will be published. */}
      <section aria-labelledby="reviews-heading" className="container-page py-20">
        <SectionHeading
          id="reviews-heading"
          eyebrow="Guest reviews"
          title="What our guests say"
        />
        <EmptyState icon={MessageSquareQuote} title="Guest reviews coming soon">
          We only publish genuine reviews from real guests. Travelled with us? We would
          love to hear from you.
        </EmptyState>
      </section>

      {/* Travel guide */}
      {articles.length > 0 ? (
        <section aria-labelledby="guide-heading" className="border-t bg-sand-soft py-20">
          <div className="container-page">
            <SectionHeading
              id="guide-heading"
              eyebrow="Travel guide"
              title="Plan with confidence"
              link={{ href: "/travel-guide", label: "All articles" }}
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.slice(0, 3).map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
