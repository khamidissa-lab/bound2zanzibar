import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowUpRight, CalendarDays, Compass, PawPrint, Tent } from "lucide-react";

import { PackageCard, TourCard } from "@/components/content/cards";
import { ListBlock } from "@/components/content/list-block";
import { SceneImage } from "@/components/media/scene-image";
import { MachineTranslationNotice } from "@/components/i18n/machine-notice";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { EmptyState } from "@/components/shared/empty-state";
import { SampleBadge } from "@/components/shared/sample-badge";
import { LocaleLink as Link } from "@/components/i18n/locale-link";
import { SectionHeading } from "@/components/shared/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { localeAlternates, pageLocale } from "@/i18n/seo";
import { getI18n } from "@/i18n/server";
import {
  getDestinationBySlug,
  getDestinations,
  getNameLookups,
  getPackages,
  getTours,
  staticSlugParams,
} from "@/services/content";
import { shareImages } from "@/lib/seo";

export async function generateStaticParams() {
  return staticSlugParams(await getDestinations());
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/destinations/[slug]">): Promise<Metadata> {
  const { slug, locale: raw } = await params;
  const locale = pageLocale(raw);
  const destination = await getDestinationBySlug(slug, locale);
  if (!destination) return { title: getI18n(locale).t.destination.notFound };
  return {
    title: destination.seo.title,
    description: destination.seo.description,
    alternates: localeAlternates(locale, `/destinations/${destination.slug}`),
    openGraph: {
      title: destination.seo.title,
      description: destination.seo.description,
      images: shareImages(destination.coverImage),
    },
  };
}

export default async function DestinationDetailPage({
  params,
}: PageProps<"/[locale]/destinations/[slug]">) {
  const { slug, locale: raw } = await params;
  const locale = pageLocale(raw);
  const { t, fmt } = getI18n(locale);
  const ds = t.destination;
  const destination = await getDestinationBySlug(slug, locale);
  if (!destination) notFound();

  // Mainland parks get wildlife, timing and a safari-planning call to action.
  const isPark = destination.region === "mainland";
  const [tours, packages, lookups] = await Promise.all([
    getTours({ destinationSlug: destination.slug }, locale),
    getPackages({ destinationSlug: destination.slug }, locale),
    getNameLookups(locale),
  ]);

  return (
    <>
      <section className="relative isolate overflow-hidden bg-ocean-deep">
        <SceneImage
          image={destination.coverImage}
          priority
          sizes="100vw"
          className="absolute inset-0 -z-10"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ocean-deep via-ocean-deep/35 to-ocean-deep/20" />
        <div className="container-page flex min-h-[34rem] flex-col justify-between pt-8 pb-12 sm:min-h-[min(80vh,46rem)] sm:pb-16">
          <Breadcrumbs
            tone="dark"
            items={[
              { label: t.nav.home, href: "/" },
              { label: t.nav.destinations, href: "/destinations" },
              { label: destination.name },
            ]}
          />
          <div className="max-w-4xl text-ivory">
            <p className="eyebrow flex items-center gap-3 text-gold-light">
              <span aria-hidden="true" className="h-px w-10 bg-current" />
              {destination.region === "zanzibar" ? t.common.zanzibar : t.common.mainland}
            </p>
            <h1 className="display-xl mt-5 text-ivory">{destination.name}</h1>
          </div>
        </div>
      </section>

      <div className="container-page grid gap-14 py-16 sm:py-24 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-20">
        <section aria-label={fmt(ds.about, { name: destination.name })}>
          {destination.isSample ? <SampleBadge className="mb-6" /> : null}
          {destination.machineTranslated ? (
            <div className="mb-6">
              <MachineTranslationNotice path={`/destinations/${destination.slug}`} />
            </div>
          ) : null}
          <p className="font-display text-3xl leading-snug text-ocean-deep sm:text-4xl">
            {destination.summary}
          </p>
          <div className="mt-8 space-y-5 text-lg leading-relaxed text-ink/90">
            {destination.description.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>
        <ListBlock
          title={ds.highlights}
          items={destination.highlights}
          headingLevel="h2"
          className="bg-sand-soft p-6 sm:p-8 lg:self-start"
        />
      </div>

      {isPark ? (
        <section
          aria-label={ds.wildlifeTitle}
          className="container-page grid gap-10 border-t border-ocean-deep/15 pt-14 pb-16 sm:pb-24 lg:grid-cols-3"
        >
          {destination.wildlife.length > 0 ? (
            <div>
              <h2 className="flex items-center gap-2 font-display text-2xl text-ocean-deep">
                <PawPrint className="size-5 text-gold-deep" aria-hidden="true" />
                {ds.wildlifeTitle}
              </h2>
              <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-ink/90">
                {destination.wildlife.map((animal) => (
                  <li key={animal} className="flex gap-2">
                    <span
                      aria-hidden="true"
                      className="mt-3 h-px w-3 shrink-0 bg-gold-deep"
                    />
                    {animal}
                  </li>
                ))}
              </ul>
              <p className="mt-4 border-s-2 border-gold ps-3 text-sm leading-relaxed text-muted-foreground">
                {ds.sightings}
              </p>
            </div>
          ) : null}
          {destination.bestTime ? (
            <div>
              <h2 className="flex items-center gap-2 font-display text-2xl text-ocean-deep">
                <CalendarDays className="size-5 text-gold-deep" aria-hidden="true" />
                {ds.bestTimeTitle}
              </h2>
              <p className="mt-4 leading-relaxed text-ink/90">{destination.bestTime}</p>
            </div>
          ) : null}
          <div>
            <h2 className="flex items-center gap-2 font-display text-2xl text-ocean-deep">
              <Tent className="size-5 text-gold-deep" aria-hidden="true" />
              {ds.stayTitle}
            </h2>
            <p className="mt-4 leading-relaxed text-ink/90">{ds.stayBody}</p>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="dest-tours" className="bg-sand-soft py-20 sm:py-24">
        <div className="container-page">
          <SectionHeading
            id="dest-tours"
            index="01"
            eyebrow={ds.experiencesEyebrow}
            title={fmt(ds.experiencesTitle, { name: destination.name })}
          />
          {tours.length > 0 ? (
            <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {tours.map((t) => (
                <TourCard
                  key={t.slug}
                  tour={t}
                  categoryName={lookups.categories[t.categorySlug]}
                />
              ))}
            </div>
          ) : (
            <EmptyState icon={Compass} title={ds.noToursTitle}>
              {ds.noToursBody}
            </EmptyState>
          )}
        </div>
      </section>

      {packages.length > 0 ? (
        <section aria-labelledby="dest-packages" className="py-20 sm:py-24">
          <div className="container-page">
            <SectionHeading
              id="dest-packages"
              index="02"
              eyebrow={ds.packagesEyebrow}
              title={fmt(ds.packagesTitle, { name: destination.name })}
            />
            <div className="border-b border-ocean-deep/15">
              {packages.map((pkg) => (
                <PackageCard key={pkg.slug} pkg={pkg} variant="row" />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {isPark ? (
        <section
          aria-labelledby="plan-park"
          className="bg-ocean-deep py-16 text-ivory sm:py-20"
        >
          <div className="container-page grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_auto] lg:items-center">
            <div>
              <h2 id="plan-park" className="display-lg text-ivory">
                {fmt(ds.planTitle, { name: destination.name })}
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/80">
                {ds.planBody}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href="/design-your-journey"
                className={buttonVariants({ size: "lg", variant: "light" })}
              >
                {ds.planCta}
                <ArrowUpRight
                  aria-hidden="true"
                  data-icon="inline-end"
                  className="rtl:-scale-x-100"
                />
              </Link>
              <Link
                href="/contact"
                className={buttonVariants({ size: "lg", variant: "outline-light" })}
              >
                {ds.enquire}
              </Link>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
