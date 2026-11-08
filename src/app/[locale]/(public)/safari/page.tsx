import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import { DestinationCard, PackageCard, TourCard } from "@/components/content/cards";
import { LocaleLink as Link } from "@/components/i18n/locale-link";
import { MarketSwitcher } from "@/components/pricing/market-switcher";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SampleBadge } from "@/components/shared/sample-badge";
import { SectionHeading } from "@/components/shared/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { groupByCircuit } from "@/config/safari-circuits";
import { localeAlternates, pageLocale } from "@/i18n/seo";
import { getI18n } from "@/i18n/server";
import {
  getDestinations,
  getNameLookups,
  getPackages,
  getTours,
} from "@/services/content";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/safari">): Promise<Metadata> {
  const locale = pageLocale((await params).locale);
  const { t } = getI18n(locale);
  return {
    title: t.safari.metaTitle,
    description: t.safari.metaDescription,
    alternates: localeAlternates(locale, "/safari"),
  };
}

export default async function SafariPage({ params }: PageProps<"/[locale]/safari">) {
  const locale = pageLocale((await params).locale);
  const { t, fmt } = getI18n(locale);
  const s = t.safari;
  const [packages, tours, parks, lookups] = await Promise.all([
    getPackages({ isSafari: true }, locale),
    getTours({ categorySlug: "safari" }, locale),
    getDestinations({ region: "mainland" }, locale),
    getNameLookups(locale),
  ]);
  const circuits = groupByCircuit(tours);

  return (
    <>
      {/* Immersive photographic opener */}
      <section className="relative isolate overflow-hidden bg-ocean-deep text-ivory">
        <Image
          src="/hero/serengeti-elephant-family.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover object-[70%_70%]"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ocean-deep/95 via-ocean-deep/70 to-ocean-deep/10 rtl:bg-gradient-to-l" />
        <div className="container-page flex min-h-[36rem] flex-col justify-between gap-16 pt-8 pb-14 lg:min-h-[min(82vh,48rem)]">
          <Breadcrumbs
            tone="dark"
            items={[{ label: t.nav.home, href: "/" }, { label: t.nav.safari }]}
          />
          <div className="max-w-3xl">
            <p className="eyebrow flex items-center gap-3 text-gold-light">
              <span aria-hidden="true" className="h-px w-10 bg-current" />
              {s.eyebrow}
            </p>
            <h1 className="display-xl mt-5 text-ivory">{s.title}</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">
              {s.description}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <MarketSwitcher tone="dark" />
              <SampleBadge
                label={t.price.sampleSafaris}
                className="border-gold-light/60 bg-ocean-deep/40 text-gold-light"
              />
            </div>
          </div>
        </div>
      </section>

      <section aria-label={s.howItWorks} className="bg-ivory">
        <ol className="container-page grid border-b border-ocean-deep/10 md:grid-cols-3">
          {s.points.map(({ title, body }, i) => (
            <li
              key={title}
              className="border-ocean-deep/10 py-10 md:border-e md:px-8 md:first:ps-0 md:last:border-e-0"
            >
              <span className="font-display text-4xl text-gold-deep italic">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="mt-4 font-display text-2xl">{title}</h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      {circuits.length > 0 ? (
        <section aria-labelledby="safari-days" className="py-20 sm:py-28">
          <div className="container-page">
            <SectionHeading
              id="safari-days"
              index="01"
              eyebrow={s.experiencesEyebrow}
              title={s.experiencesTitle}
              description={s.experiencesDescription}
            />
            <div className="space-y-20">
              {circuits.map((circuit) => (
                <section key={circuit.id} aria-labelledby={`circuit-${circuit.id}`}>
                  <div className="mb-8 flex items-baseline justify-between gap-4 border-b border-ocean-deep/15 pb-4">
                    <h3 id={`circuit-${circuit.id}`} className="font-display text-3xl">
                      {s.circuits[circuit.id] ?? circuit.title}
                    </h3>
                    <span className="eyebrow text-muted-foreground">
                      {fmt(s.experienceCount, { n: circuit.tours.length })}
                    </span>
                  </div>
                  <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                    {circuit.tours.map((tour) => (
                      <TourCard
                        key={tour.slug}
                        tour={tour}
                        destinationName={lookups.destinations[tour.destinationSlug]}
                        className="reveal"
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {packages.length > 0 ? (
        <section
          aria-labelledby="safari-packages"
          className="bg-sand-soft py-20 sm:py-28"
        >
          <div className="container-page">
            <SectionHeading
              id="safari-packages"
              index="02"
              eyebrow={s.packagesEyebrow}
              title={s.packagesTitle}
              description={s.packagesDescription}
            />
            <div className="border-b border-ocean-deep/15">
              {packages.map((pkg) => (
                <PackageCard key={pkg.slug} pkg={pkg} variant="row" className="reveal" />
              ))}
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-between gap-6 bg-ivory p-6 sm:p-8">
              <div className="max-w-xl">
                <p className="font-display text-2xl text-ocean-deep">{s.combosTitle}</p>
                <p className="mt-1 text-muted-foreground">{s.combosBody}</p>
              </div>
              <Link
                href="/design-your-journey"
                className={buttonVariants({ size: "lg" })}
              >
                {s.combosCta}
                <ArrowUpRight
                  aria-hidden="true"
                  data-icon="inline-end"
                  className="rtl:-scale-x-100"
                />
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {parks.length > 0 ? (
        <section aria-labelledby="parks" className="bg-ocean-deep py-20 sm:py-28">
          <div className="container-page">
            <SectionHeading
              id="parks"
              index="03"
              eyebrow={s.parksEyebrow}
              title={s.parksTitle}
              tone="dark"
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {parks.map((d, i) => (
                <DestinationCard key={d.slug} destination={d} index={i + 1} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
