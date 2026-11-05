import type { Metadata } from "next";
import { ArrowUpRight, MessageSquareQuote } from "lucide-react";

import {
  ArticleCard,
  DestinationCard,
  PackageCard,
  TourCard,
} from "@/components/content/cards";
import { DiscoveryPanel } from "@/components/content/discovery-panel";
import { WhyTravel } from "@/components/content/why-travel";
import { AmbientVideo } from "@/components/home/ambient-video";
import { TravellerTypes } from "@/components/home/traveller-types";
import { LocaleLink as Link } from "@/components/i18n/locale-link";
import { MarketSwitcher } from "@/components/pricing/market-switcher";
import { OrganizationJsonLd } from "@/components/seo/organization-json-ld";
import { SampleBadge } from "@/components/shared/sample-badge";
import { SectionHeading } from "@/components/shared/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { localeAlternates, pageLocale } from "@/i18n/seo";
import { getI18n } from "@/i18n/server";
import { SAFARI_CATEGORY, isSafariTour } from "@/lib/discovery";
import { cn } from "@/lib/utils";
import {
  getArticles,
  getCategories,
  getDestinations,
  getNameLookups,
  getPackages,
  getTours,
} from "@/services/content";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]">): Promise<Metadata> {
  const locale = pageLocale((await params).locale);
  return { alternates: localeAlternates(locale, "/") };
}

// Asymmetric destination mosaic (12-column grid on large screens).
const mosaic = [
  "lg:col-span-5 lg:row-span-2",
  "lg:col-span-7",
  "lg:col-span-4",
  "lg:col-span-3",
];

/** The tagline with its final word set in italics. */
function Tagline({ text }: { text: string }) {
  const words = text.split(" ");
  const last = words.pop();
  return (
    <>
      {words.join(" ")} <em className="text-gold-light">{last}</em>
    </>
  );
}

const arrow = (
  <ArrowUpRight aria-hidden="true" data-icon="inline-end" className="rtl:-scale-x-100" />
);

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const locale = pageLocale((await params).locale);
  const { t } = getI18n(locale);
  const h = t.home;

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
    getTours({ featured: true }, locale),
    getTours({}, locale),
    getCategories(locale),
    getDestinations({}, locale),
    getDestinations({ featured: true }, locale),
    getPackages({ featured: true }, locale),
    getArticles(locale),
    getNameLookups(locale),
  ]);

  // The search goes to Zanzibar tours, which excludes safaris (they have their own page).
  const zanzibarTours = allTours.filter((tour) => !isSafariTour(tour));
  const searchableDestinations = destinations
    .filter((d) => zanzibarTours.some((tour) => tour.destinationSlug === d.slug))
    .map(({ slug, name }) => ({ slug, name }));
  const safaris = allTours.filter(isSafariTour);
  const [leadTour, ...moreTours] = featuredTours.slice(0, 7);
  const [leadArticle, ...moreArticles] = articles.slice(0, 3);
  const counts = [
    { value: zanzibarTours.length, label: h.counts.experiences },
    { value: destinations.length, label: h.counts.destinations },
    { value: safaris.length, label: h.counts.safaris },
  ].filter((c) => c.value > 0);

  return (
    <>
      <OrganizationJsonLd />

      {/* ------------------------------------------------------------ Hero */}
      {/* Full-screen video with the introduction laid over its start side. */}
      <section className="relative isolate flex min-h-[calc(100svh-var(--header-height))] items-end overflow-hidden bg-ocean-deep text-ivory md:min-h-[calc(100svh-var(--header-height)-2.25rem)]">
        <AmbientVideo
          src="/hero/home-video.mp4"
          poster="/hero/home-video-poster.jpg"
          label={h.video.label}
          quietControls
          className="absolute inset-0 -z-10"
          controlsClassName="end-4 top-4 sm:end-8 sm:top-8"
        />
        {/* Legibility: a deep fade behind the text side and along the bottom. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-ocean-deep/90 via-ocean-deep/55 to-ocean-deep/10 rtl:bg-gradient-to-l"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-gradient-to-t from-ocean-deep/85 to-transparent"
        />

        {/* Clicks pass through the empty area to the video controls. */}
        <div className="container-page pointer-events-none w-full pt-24 pb-14 sm:pb-16 lg:pb-20">
          <div className="pointer-events-auto max-w-2xl">
            <p className="eyebrow mb-6 flex items-center gap-3 text-gold-light">
              <span aria-hidden="true" className="h-px w-10 bg-current" />
              {h.eyebrow}
            </p>
            <h1 className="display-xl text-ivory drop-shadow-sm">
              <Tagline text={t.meta.tagline} />
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-relaxed text-white/85">
              {h.intro}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/tours"
                className={buttonVariants({ size: "lg", variant: "light" })}
              >
                {h.exploreTours}
                {arrow}
              </Link>
              <Link
                href="/book"
                className={buttonVariants({ size: "lg", variant: "outline-light" })}
              >
                {h.planJourney}
              </Link>
            </div>
            {counts.length > 0 ? (
              <dl className="mt-12 flex gap-8 border-t border-white/20 pt-6 sm:gap-12">
                {counts.map((c) => (
                  <div key={c.label}>
                    <dt className="sr-only">{c.label}</dt>
                    <dd>
                      <span className="block font-display text-4xl leading-none text-ivory tabular-nums">
                        {c.value}
                      </span>
                      <span className="eyebrow mt-1.5 block text-white/70">
                        {c.label}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- Discovery band */}
      <section aria-label={h.search.label} className="bg-ocean-deep py-10 sm:py-12">
        <div className="container-page">
          <DiscoveryPanel
            categories={categories
              .filter((c) => c.slug !== SAFARI_CATEGORY)
              .map(({ slug, name }) => ({ slug, name }))}
            destinations={searchableDestinations}
          />
        </div>
      </section>

      {/* ---------------------------------------------- 01 Destinations */}
      {featuredDestinations.length > 0 ? (
        <section aria-labelledby="dest-heading" className="bg-sand-soft py-20 sm:py-28">
          <div className="container-page">
            <SectionHeading
              id="dest-heading"
              index="01"
              eyebrow={h.destinations.eyebrow}
              title={h.destinations.title}
              description={h.destinations.description}
              link={{ href: "/destinations", label: t.common.allDestinations }}
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:auto-rows-[17rem] lg:grid-cols-12">
              {featuredDestinations.slice(0, 4).map((d, i) => (
                <DestinationCard
                  key={d.slug}
                  destination={d}
                  index={i + 1}
                  className={cn("reveal", mosaic[i])}
                  imageClassName="aspect-[4/5] sm:aspect-[3/4] lg:aspect-auto"
                  sizes={i === 0 ? "(min-width: 1024px) 42vw, 100vw" : undefined}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ---------------------------------------- 02 Popular experiences */}
      {leadTour ? (
        <section aria-labelledby="featured-heading" className="py-20 sm:py-28">
          <div className="container-page">
            <SectionHeading
              id="featured-heading"
              index="02"
              eyebrow={h.experiences.eyebrow}
              title={h.experiences.title}
              link={{ href: "/tours", label: t.common.allTours }}
            />
            <div className="mb-8 flex flex-wrap items-center gap-3">
              <MarketSwitcher />
              <SampleBadge label={t.price.samplePrices} />
            </div>
            <TourCard
              tour={leadTour}
              variant="feature"
              categoryName={lookups.categories[leadTour.categorySlug]}
              destinationName={lookups.destinations[leadTour.destinationSlug]}
              className="reveal"
            />
            {moreTours.length > 0 ? (
              <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                {moreTours.map((tour, i) => (
                  <TourCard
                    key={tour.slug}
                    tour={tour}
                    categoryName={lookups.categories[tour.categorySlug]}
                    destinationName={lookups.destinations[tour.destinationSlug]}
                    // Staggered columns for an editorial rhythm.
                    className={cn("reveal", i % 3 === 1 && "lg:mt-16")}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* --------------------------------------------- 03 Traveller types */}
      <section
        aria-labelledby="travellers-heading"
        className="bg-sand-soft py-20 sm:py-28"
      >
        <div className="container-page">
          <SectionHeading
            id="travellers-heading"
            index="03"
            eyebrow={h.travellers.eyebrow}
            title={h.travellers.title}
            description={h.travellers.description}
          />
          <TravellerTypes t={h.travellers} />
        </div>
      </section>

      {/* ------------------------------------------------- 04 Safari */}
      <section
        aria-labelledby="safari-heading"
        className="relative overflow-hidden bg-ocean-deep text-ivory"
      >
        <div className="container-page grid gap-14 py-20 sm:py-28 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <SectionHeading
              id="safari-heading"
              index="04"
              eyebrow={h.safari.eyebrow}
              title={h.safari.title}
              tone="dark"
              stacked
              className="mb-8"
            />
            <p className="max-w-md text-lg leading-relaxed text-white/75">
              {h.safari.body}
            </p>
            {safaris.length > 0 ? (
              <ol className="mt-10 border-t border-white/15">
                {safaris.slice(0, 6).map((tour, i) => (
                  <li key={tour.slug} className="border-b border-white/15">
                    <Link
                      href={`/tours/${tour.slug}`}
                      className="group flex items-baseline gap-5 py-3.5 transition-colors hover:text-gold-light"
                    >
                      <span className="w-6 text-xs text-gold-light tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1 font-display text-xl sm:text-2xl">
                        {tour.name}
                      </span>
                      <ArrowUpRight
                        className="size-4 shrink-0 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 rtl:-scale-x-100"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ol>
            ) : null}
            <Link
              href="/safari"
              className={buttonVariants({
                variant: "gold",
                size: "lg",
                className: "mt-10",
              })}
            >
              {h.safari.cta}
              {arrow}
            </Link>
          </div>

          {/* Safari video; it plays only while on screen. */}
          <div className="relative lg:col-span-7 lg:flex lg:items-center lg:justify-end">
            <div className="relative w-full lg:w-[92%]">
              <AmbientVideo
                src="/hero/safari-video.mp4"
                poster="/hero/safari-video-poster.jpg"
                label={h.safari.videoLabel}
                whenVisible
                quietControls
                className="aspect-[4/5] border-[6px] border-ocean shadow-card"
                controlsClassName="end-3 top-3"
              />
              <p className="eyebrow absolute start-4 top-4 bg-ocean-deep/70 px-3 py-1.5 text-white/85 backdrop-blur-sm">
                {h.safari.caption}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------- 05 Packages */}
      {packages.length > 0 ? (
        <section
          aria-labelledby="packages-heading"
          className="bg-sand-soft py-20 sm:py-28"
        >
          <div className="container-page">
            <SectionHeading
              id="packages-heading"
              index="05"
              eyebrow={h.packages.eyebrow}
              title={h.packages.title}
              description={h.packages.description}
              link={{ href: "/packages", label: t.common.allPackages }}
            />
            <div className="border-b border-ocean-deep/15">
              {packages.slice(0, 3).map((pkg) => (
                <PackageCard key={pkg.slug} pkg={pkg} variant="row" className="reveal" />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* --------------------------------------------- 06 Why us + reviews */}
      <WhyTravel index="06" locale={locale} />

      {/* Testimonials: only genuine reviews will be published. */}
      <section aria-labelledby="reviews-heading" className="pb-20 sm:pb-28">
        <div className="container-page">
          <div className="grid gap-8 border border-ocean-deep/15 bg-ivory p-8 sm:p-12 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center lg:gap-14">
            <MessageSquareQuote className="size-10 text-gold-deep" aria-hidden="true" />
            <div>
              <p className="eyebrow text-gold-deep">{h.reviews.eyebrow}</p>
              <h2 id="reviews-heading" className="mt-3 font-display text-4xl">
                {h.reviews.title}
              </h2>
              <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                <span className="font-medium text-ocean-deep">{h.reviews.soon}</span>{" "}
                {h.reviews.body}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------ 07 Travel inspiration */}
      {leadArticle ? (
        <section
          aria-labelledby="guide-heading"
          className="border-t bg-ivory py-20 sm:py-28"
        >
          <div className="container-page">
            <SectionHeading
              id="guide-heading"
              index="07"
              eyebrow={h.guide.eyebrow}
              title={h.guide.title}
              link={{ href: "/travel-guide", label: t.common.allArticles }}
            />
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
              <ArticleCard
                article={leadArticle}
                variant="lead"
                className="reveal lg:col-span-7"
              />
              <div className="grid gap-12 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
                {moreArticles.map((article) => (
                  <ArticleCard key={article.slug} article={article} className="reveal" />
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
