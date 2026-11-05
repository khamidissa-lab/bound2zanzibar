import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowUpRight, MessageCircle } from "lucide-react";

import { TourCard } from "@/components/content/cards";
import { ListBlock } from "@/components/content/list-block";
import { TourGrid } from "@/components/content/tour-grid";
import { LocaleLink as Link } from "@/components/i18n/locale-link";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SectionHeading } from "@/components/shared/section-heading";
import { buttonVariants } from "@/components/ui/button";
import {
  TRAVELLERS,
  TRAVELLER_TYPES,
  isTravellerType,
  suggestTours,
} from "@/config/travellers";
import { localeAlternates, pageLocale } from "@/i18n/seo";
import { getI18n } from "@/i18n/server";
import { cn } from "@/lib/utils";
import { getNameLookups, getTours } from "@/services/content";

const MAX_SUGGESTIONS = 6;

export function generateStaticParams() {
  return TRAVELLER_TYPES.map((type) => ({ type }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/trips/[type]">): Promise<Metadata> {
  const { type, locale: raw } = await params;
  const locale = pageLocale(raw);
  if (!isTravellerType(type)) return {};
  const { t, fmt } = getI18n(locale);
  const item = t.home.travellers.items[type];
  const title = fmt(t.travellerPage.metaTitle, { title: item.title });
  return {
    title,
    description: item.body,
    alternates: localeAlternates(locale, `/trips/${type}`),
    openGraph: { title, description: item.body, images: [TRAVELLERS[type].photo] },
  };
}

export default async function TravellerPage({
  params,
}: PageProps<"/[locale]/trips/[type]">) {
  const { type, locale: raw } = await params;
  const locale = pageLocale(raw);
  if (!isTravellerType(type)) notFound();
  const { t, fmt } = getI18n(locale);
  const tp = t.travellerPage;
  const item = t.home.travellers.items[type];
  const page = tp.pages[type];
  const config = TRAVELLERS[type];

  const [tours, lookups] = await Promise.all([
    getTours({}, locale),
    getNameLookups(locale),
  ]);
  const suggested = suggestTours(tours, config.styles, MAX_SUGGESTIONS);

  return (
    <>
      <section className="relative isolate overflow-hidden bg-ocean-deep">
        <Image
          src={config.photo}
          alt={item.alt}
          fill
          priority
          sizes="100vw"
          className={cn("-z-10 object-cover", config.position)}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ocean-deep via-ocean-deep/40 to-ocean-deep/20" />
        <div className="container-page flex min-h-[30rem] flex-col justify-between pt-8 pb-12 sm:min-h-[min(70vh,40rem)] sm:pb-16">
          <Breadcrumbs
            tone="dark"
            items={[{ label: t.nav.home, href: "/" }, { label: item.title }]}
          />
          <div className="max-w-3xl text-ivory">
            <p className="eyebrow flex items-center gap-3 text-gold-light">
              <span aria-hidden="true" className="h-px w-10 bg-current" />
              {tp.eyebrow}
            </p>
            <h1 className="display-xl mt-5 text-ivory">{item.title}</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/85">
              {item.body}
            </p>
          </div>
        </div>
      </section>

      <div className="container-page grid gap-14 py-16 sm:py-24 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-20">
        <section aria-label={item.title} className="space-y-6">
          <p className="font-display text-3xl leading-snug text-ocean-deep sm:text-4xl">
            {page.intro[0]}
          </p>
          {page.intro.slice(1).map((paragraph) => (
            <p key={paragraph} className="text-lg leading-relaxed text-ink/90">
              {paragraph}
            </p>
          ))}
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Link href={`/book?trip=${type}`} className={buttonVariants({ size: "lg" })}>
              {tp.plan}
              <ArrowUpRight
                aria-hidden="true"
                data-icon="inline-end"
                className="rtl:-scale-x-100"
              />
            </Link>
            <Link
              href="/contact"
              className={buttonVariants({ size: "lg", variant: "outline" })}
            >
              <MessageCircle aria-hidden="true" data-icon="inline-start" />
              {tp.ask}
            </Link>
          </div>
        </section>
        <ListBlock
          title={tp.tipsTitle}
          items={page.tips}
          headingLevel="h2"
          icon="check"
          className="bg-sand-soft p-6 sm:p-8 lg:self-start"
        />
      </div>

      {suggested.length > 0 ? (
        <section
          aria-labelledby="suggested-heading"
          className="bg-sand-soft py-20 sm:py-24"
        >
          <div className="container-page">
            <SectionHeading
              id="suggested-heading"
              eyebrow={tp.suggestedEyebrow}
              title={fmt(tp.suggestedTitle, { title: item.title })}
              description={tp.suggestedNote}
            />
            <TourGrid>
              {suggested.map((tour) => (
                <TourCard
                  key={tour.slug}
                  tour={tour}
                  categoryName={lookups.categories[tour.categorySlug]}
                  destinationName={lookups.destinations[tour.destinationSlug]}
                />
              ))}
            </TourGrid>
          </div>
        </section>
      ) : null}

      <section
        aria-labelledby="plan-heading"
        className="bg-ocean-deep py-16 text-ivory sm:py-20"
      >
        <div className="container-page grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_auto] lg:items-center">
          <div>
            <h2 id="plan-heading" className="display-lg text-ivory">
              {tp.planTitle}
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/80">
              {tp.planBody}
            </p>
          </div>
          <Link
            href={`/book?trip=${type}`}
            className={buttonVariants({ size: "lg", variant: "light" })}
          >
            {tp.plan}
            <ArrowUpRight
              aria-hidden="true"
              data-icon="inline-end"
              className="rtl:-scale-x-100"
            />
          </Link>
        </div>
      </section>

      <nav aria-labelledby="others-heading" className="container-page py-16 sm:py-20">
        <h2 id="others-heading" className="eyebrow mb-6 text-gold-deep">
          {tp.others}
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRAVELLER_TYPES.filter((other) => other !== type).map((other) => (
            <li key={other}>
              <Link
                href={`/trips/${other}`}
                className="group flex items-center gap-4 bg-ivory p-3 shadow-card focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              >
                <span className="relative size-16 shrink-0 overflow-hidden">
                  <Image
                    src={TRAVELLERS[other].photo}
                    alt=""
                    fill
                    sizes="64px"
                    className={cn("object-cover", TRAVELLERS[other].position)}
                  />
                </span>
                <span className="font-display text-2xl leading-none text-ocean-deep">
                  {t.home.travellers.items[other].title}
                </span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="ms-auto size-4 text-gold-deep transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:-scale-x-100"
                />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
