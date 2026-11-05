import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TourCard } from "@/components/content/cards";
import { EnquiryPanel } from "@/components/content/enquiry-panel";
import { TourSections, tourSectionLinks } from "@/components/content/tour-sections";
import { LocaleLink as Link } from "@/components/i18n/locale-link";
import { MachineTranslationNotice } from "@/components/i18n/machine-notice";
import { SceneImage } from "@/components/media/scene-image";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SampleBadge } from "@/components/shared/sample-badge";
import { SectionHeading } from "@/components/shared/section-heading";
import { localeAlternates, pageLocale } from "@/i18n/seo";
import { getI18n } from "@/i18n/server";
import { cn } from "@/lib/utils";
import {
  getDestinationBySlug,
  getNameLookups,
  getTourBySlug,
  getTours,
  staticSlugParams,
} from "@/services/content";
import { shareImages } from "@/lib/seo";

export async function generateStaticParams() {
  return staticSlugParams(await getTours());
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/tours/[slug]">): Promise<Metadata> {
  const { slug, locale: raw } = await params;
  const locale = pageLocale(raw);
  const tour = await getTourBySlug(slug, locale);
  if (!tour) return { title: getI18n(locale).t.tour.notFound };
  return {
    title: tour.seo.title,
    description: tour.seo.description,
    alternates: localeAlternates(locale, `/tours/${tour.slug}`),
    openGraph: {
      title: tour.seo.title,
      description: tour.seo.description,
      images: shareImages(tour.coverImage),
      type: "article",
    },
  };
}

// Gallery mosaic layouts by photo count (cover first).
const mosaicFor = (count: number) =>
  count >= 4
    ? ["lg:col-span-2 lg:row-span-2", "", "", "lg:col-span-2"]
    : count === 3
      ? ["lg:col-span-2 lg:row-span-2", "lg:col-span-2", "lg:col-span-2"]
      : count === 2
        ? ["lg:col-span-3 lg:row-span-2", "lg:row-span-2"]
        : ["lg:col-span-4 lg:row-span-2"];

export default async function TourDetailPage({
  params,
}: PageProps<"/[locale]/tours/[slug]">) {
  const { slug, locale: raw } = await params;
  const locale = pageLocale(raw);
  const { t } = getI18n(locale);
  const tour = await getTourBySlug(slug, locale);
  if (!tour) notFound();

  const [destination, lookups, sameCategory] = await Promise.all([
    getDestinationBySlug(tour.destinationSlug, locale),
    getNameLookups(locale),
    getTours({ categorySlug: tour.categorySlug }, locale),
  ]);
  const related = sameCategory.filter((r) => r.slug !== tour.slug).slice(0, 3);
  const photos = [tour.coverImage, ...tour.gallery].slice(0, 4);
  const layout = mosaicFor(photos.length);

  const facts = [
    { label: t.tour.facts.duration, value: tour.duration },
    {
      label: t.tour.facts.destination,
      value: destination ? (
        <Link href={`/destinations/${destination.slug}`} className="link-underline">
          {destination.name}
        </Link>
      ) : (
        "—"
      ),
    },
    { label: t.tour.facts.difficulty, value: t.difficulty[tour.difficulty] },
    { label: t.tour.facts.suitability, value: tour.suitability },
  ];

  return (
    <>
      <article>
        {/* Title + key facts */}
        <header className="bg-ivory">
          <div className="container-page pt-8 pb-10">
            <Breadcrumbs
              items={[
                { label: t.nav.home, href: "/" },
                { label: t.nav.tours, href: "/tours" },
                { label: tour.name },
              ]}
              className="mb-10"
            />
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
              <div>
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <span className="eyebrow flex items-center gap-3 text-gold-deep">
                    <span aria-hidden="true" className="h-px w-10 bg-current" />
                    {lookups.categories[tour.categorySlug]}
                  </span>
                  {tour.isSample ? <SampleBadge /> : null}
                </div>
                <h1 className="display-xl">{tour.name}</h1>
                <p className="mt-6 max-w-2xl text-xl leading-relaxed text-muted-foreground">
                  {tour.shortDescription}
                </p>
                {tour.machineTranslated ? (
                  <div className="mt-6">
                    <MachineTranslationNotice path={`/tours/${tour.slug}`} />
                  </div>
                ) : null}
              </div>
              <dl className="grid grid-cols-2 border-t border-ocean-deep/15">
                {facts.map(({ label, value }, i) => (
                  <div
                    key={label}
                    className={cn(
                      "border-b border-ocean-deep/15 py-4",
                      i % 2 === 0 ? "pe-4" : "border-s ps-4",
                    )}
                  >
                    <dt className="eyebrow text-[0.62rem] text-muted-foreground">
                      {label}
                    </dt>
                    <dd className="mt-1.5 text-sm font-medium text-ocean-deep">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </header>

        {/* Gallery mosaic */}
        <div className="container-page">
          <div className="grid gap-2 sm:grid-cols-2 lg:h-[34rem] lg:grid-cols-4 lg:grid-rows-2">
            {photos.map((image, i) => (
              <SceneImage
                key={`${i}-${image.alt}`}
                image={image}
                priority={i === 0}
                sizes={
                  i === 0
                    ? "(min-width: 1024px) 50vw, 100vw"
                    : "(min-width: 1024px) 25vw, 50vw"
                }
                className={cn(
                  "aspect-[4/3] lg:aspect-auto",
                  i === 0 ? "sm:col-span-2" : "hidden sm:block",
                  layout[i],
                )}
              />
            ))}
          </div>
        </div>

        {/* In-page navigation */}
        <nav
          aria-label={t.tour.onThisPage}
          className="sticky top-[var(--header-height)] z-30 mt-10 border-y border-ocean-deep/10 bg-warm-white"
        >
          <ul className="container-page flex [scrollbar-width:none] gap-7 overflow-x-auto [&::-webkit-scrollbar]:hidden">
            {tourSectionLinks(t).map((link) => (
              <li key={link.id} className="shrink-0">
                <a
                  href={`#${link.id}`}
                  className="block py-4 text-[0.75rem] font-semibold tracking-[0.14em] text-ocean-deep/70 uppercase hover:text-ocean-deep"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="container-page grid gap-12 pt-12 pb-20 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-16">
          <div className="min-w-0">
            <TourSections tour={tour} locale={locale} />
          </div>
          <div className="order-first lg:sticky lg:top-[calc(var(--header-height)+4.5rem)] lg:order-none lg:self-start">
            <EnquiryPanel
              locale={locale}
              itemName={tour.name}
              itemType="tour"
              slug={tour.slug}
              prices={tour.prices}
            />
          </div>
        </div>
      </article>

      {related.length > 0 ? (
        <section
          aria-labelledby="related-heading"
          className="bg-sand-soft py-20 sm:py-24"
        >
          <div className="container-page">
            <SectionHeading
              id="related-heading"
              eyebrow={t.tour.keepExploring}
              title={t.tour.similar}
              link={{ href: "/tours", label: t.common.allTours }}
            />
            <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <TourCard
                  key={r.slug}
                  tour={r}
                  categoryName={lookups.categories[r.categorySlug]}
                  destinationName={lookups.destinations[r.destinationSlug]}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
