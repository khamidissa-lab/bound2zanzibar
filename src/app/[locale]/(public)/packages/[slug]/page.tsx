import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

import { EnquiryPanel } from "@/components/content/enquiry-panel";
import { ListBlock } from "@/components/content/list-block";
import { LocaleLink as Link } from "@/components/i18n/locale-link";
import { MachineTranslationNotice } from "@/components/i18n/machine-notice";
import { SceneImage } from "@/components/media/scene-image";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SampleBadge } from "@/components/shared/sample-badge";
import { localeAlternates, pageLocale } from "@/i18n/seo";
import { getI18n } from "@/i18n/server";
import {
  getNameLookups,
  getPackageBySlug,
  getPackages,
  getTours,
  staticSlugParams,
} from "@/services/content";
import { shareImages } from "@/lib/seo";

export async function generateStaticParams() {
  return staticSlugParams(await getPackages());
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/packages/[slug]">): Promise<Metadata> {
  const { slug, locale: raw } = await params;
  const locale = pageLocale(raw);
  const pkg = await getPackageBySlug(slug, locale);
  if (!pkg) return { title: getI18n(locale).t.package.notFound };
  return {
    title: pkg.seo.title,
    description: pkg.seo.description,
    alternates: localeAlternates(locale, `/packages/${pkg.slug}`),
    openGraph: {
      title: pkg.seo.title,
      description: pkg.seo.description,
      images: shareImages(pkg.coverImage),
      type: "article",
    },
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export default async function PackageDetailPage({
  params,
}: PageProps<"/[locale]/packages/[slug]">) {
  const { slug, locale: raw } = await params;
  const locale = pageLocale(raw);
  const { t, fmt } = getI18n(locale);
  const pkg = await getPackageBySlug(slug, locale);
  if (!pkg) notFound();

  const [allTours, lookups] = await Promise.all([
    getTours({}, locale),
    getNameLookups(locale),
  ]);
  const includedTours = allTours.filter((t) => pkg.includedTourSlugs.includes(t.slug));

  const facts = [
    {
      label: t.package.facts.length,
      value: fmt(t.package.facts.lengthValue, { days: pkg.days, nights: pkg.nights }),
    },
    { label: t.package.facts.accommodation, value: pkg.accommodation },
    { label: t.package.facts.transfers, value: pkg.transfers },
    { label: t.package.facts.meals, value: pkg.meals },
  ];

  return (
    <article>
      <header className="bg-sand-soft">
        <div className="container-page pt-8 pb-12">
          <Breadcrumbs
            items={[
              { label: t.nav.home, href: "/" },
              { label: t.nav.packages, href: "/packages" },
              { label: pkg.name },
            ]}
            className="mb-10"
          />
          <div className="grid gap-8 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-16">
            <p className="flex items-baseline gap-3 lg:flex-col lg:gap-1">
              <span className="font-display text-7xl leading-none text-gold-deep sm:text-8xl lg:text-[9rem]">
                {pad(pkg.days)}
              </span>
              <span className="eyebrow text-muted-foreground">
                {fmt(t.common.daysThenNights, { nights: pkg.nights })}
              </span>
            </p>
            <div>
              <div className="mb-5 flex flex-wrap items-center gap-3">
                {pkg.isSafari ? (
                  <span className="border border-turquoise-deep/40 px-2 py-0.5 text-[0.62rem] font-semibold tracking-[0.14em] text-turquoise-deep uppercase">
                    {t.common.includesSafari}
                  </span>
                ) : null}
                {pkg.isSample ? <SampleBadge /> : null}
              </div>
              <h1 className="display-xl">{pkg.name}</h1>
              <p className="mt-6 max-w-2xl text-xl leading-relaxed text-muted-foreground">
                {pkg.summary}
              </p>
              <p className="mt-5 text-sm text-muted-foreground">
                <span className="eyebrow me-2 text-gold-deep">
                  {t.package.destinations}
                </span>
                {pkg.destinationSlugs.map((d, i) => (
                  <span key={d}>
                    {i > 0 ? ", " : null}
                    <Link
                      href={`/destinations/${d}`}
                      className="link-underline text-ocean-deep"
                    >
                      {lookups.destinations[d] ?? d}
                    </Link>
                  </span>
                ))}
              </p>
              {pkg.machineTranslated ? (
                <div className="mt-6">
                  <MachineTranslationNotice path={`/packages/${pkg.slug}`} />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <SceneImage
        image={pkg.coverImage}
        priority
        sizes="100vw"
        className="aspect-[16/10] sm:aspect-[21/8]"
      />

      <div className="container-page grid gap-12 pt-14 pb-20 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-16">
        <div className="min-w-0 space-y-20">
          <dl className="grid border-t border-ocean-deep/15 sm:grid-cols-2">
            {facts.map(({ label, value }) => (
              <div
                key={label}
                className="border-b border-ocean-deep/15 py-4 sm:odd:pe-6 sm:even:border-s sm:even:ps-6"
              >
                <dt className="eyebrow text-[0.62rem] text-muted-foreground">{label}</dt>
                <dd className="mt-1.5 text-ocean-deep">{value}</dd>
              </div>
            ))}
          </dl>

          <section aria-labelledby="overview-heading">
            <h2 id="overview-heading" className="mb-6 font-display text-4xl">
              {t.package.overview}
            </h2>
            <div className="space-y-5 text-lg leading-relaxed text-ink/90">
              {pkg.description.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>

          <section aria-labelledby="itinerary-heading">
            <h2 id="itinerary-heading" className="mb-8 font-display text-4xl">
              {t.package.itinerary}
            </h2>
            <ol className="border-t border-ocean-deep/15">
              {pkg.itinerary.map((day) => (
                <li
                  key={day.day}
                  className="grid gap-3 border-b border-ocean-deep/15 py-7 sm:grid-cols-[6rem_minmax(0,1fr)] sm:gap-8"
                >
                  <p className="flex items-baseline gap-2 sm:flex-col sm:gap-1">
                    <span className="eyebrow text-gold-deep">{t.common.day}</span>
                    <span className="font-display text-5xl leading-none text-ocean-deep">
                      {pad(day.day)}
                    </span>
                  </p>
                  <div>
                    <h3 className="font-display text-2xl">{day.title}</h3>
                    <p className="mt-2 leading-relaxed text-ink/90">{day.description}</p>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {day.overnight
                        ? fmt(t.package.overnight, { place: day.overnight })
                        : t.package.noOvernight}
                      {day.meals.length > 0
                        ? ` · ${fmt(t.package.mealsList, { meals: day.meals.join(", ") })}`
                        : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {includedTours.length > 0 ? (
            <section aria-labelledby="experiences-heading">
              <h2 id="experiences-heading" className="mb-6 font-display text-4xl">
                {t.package.experiences}
              </h2>
              <ul className="grid border-t border-ocean-deep/15 sm:grid-cols-2 sm:gap-x-8">
                {includedTours.map((t) => (
                  <li key={t.slug} className="border-b border-ocean-deep/15">
                    <Link
                      href={`/tours/${t.slug}`}
                      className="group flex items-center justify-between gap-4 py-4 text-ocean-deep hover:text-turquoise-deep"
                    >
                      <span className="font-display text-xl">{t.name}</span>
                      <ArrowUpRight
                        className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:-scale-x-100"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section aria-labelledby="included-heading">
            <h2 id="included-heading" className="mb-6 font-display text-4xl">
              {t.package.whatsIncluded}
            </h2>
            <div className="grid gap-10 sm:grid-cols-2">
              <ListBlock title={t.common.included} items={pkg.included} icon="check" />
              <ListBlock title={t.common.notIncluded} items={pkg.excluded} icon="cross" />
            </div>
            <ListBlock title={t.package.terms} items={pkg.terms} className="mt-10" />
          </section>
        </div>

        <div className="order-first lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:order-none lg:self-start">
          <EnquiryPanel
            locale={locale}
            itemName={pkg.name}
            itemType="package"
            slug={pkg.slug}
            prices={pkg.prices}
          />
        </div>
      </div>
    </article>
  );
}
