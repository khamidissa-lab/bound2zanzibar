"use client";

import { ArrowUpRight, Check, ChevronDown, Clock, MapPin } from "lucide-react";

import { LocaleLink as Link } from "@/components/i18n/locale-link";
import { SceneImage } from "@/components/media/scene-image";
import { PriceDisplay } from "@/components/pricing/price-display";
import { SampleBadge } from "@/components/shared/sample-badge";
import { buttonVariants } from "@/components/ui/button";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";
import type { Article, Destination, Tour, TourPackage } from "@/types/content";

// Cards use a "stretched link": the title link's ::after covers the card so
// the whole card is clickable while screen readers get one clear link. The
// visible "View …" cue is decorative (aria-hidden) for the same reason.
const stretchedLink =
  "after:absolute after:inset-0 after:z-[1] after:content-[''] focus-visible:outline-none";
const cardFocus =
  "focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-ring";

function ViewCue({ label, tone = "light" }: { label: string; tone?: "light" | "dark" }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex items-center gap-1.5 text-[0.72rem] font-semibold tracking-[0.14em] uppercase",
        tone === "dark" ? "text-ivory" : "text-ocean-deep",
      )}
    >
      {label}
      <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:-scale-x-100" />
    </span>
  );
}

function TourMeta({
  tour,
  destinationName,
  className,
}: {
  tour: Tour;
  destinationName?: string;
  className?: string;
}) {
  return (
    <ul
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground",
        className,
      )}
    >
      <li className="inline-flex items-center gap-1.5">
        <Clock className="size-3.5 text-turquoise-deep" aria-hidden="true" />
        {tour.duration}
      </li>
      {destinationName ? (
        <li className="inline-flex items-center gap-1.5">
          <MapPin className="size-3.5 text-turquoise-deep" aria-hidden="true" />
          {destinationName}
        </li>
      ) : null}
    </ul>
  );
}

export function TourCard({
  tour,
  categoryName,
  destinationName,
  variant = "default",
  bookQuery,
  className,
}: {
  tour: Tour;
  categoryName?: string;
  destinationName?: string;
  /** `feature`: wide two-column layout for a highlighted experience. */
  variant?: "default" | "feature";
  /** Extra booking-form parameters (date, travellers) for the Book now link. */
  bookQuery?: string;
  className?: string;
}) {
  const { t } = useI18n();
  if (variant === "feature") {
    return (
      <article
        className={cn(
          "group relative grid overflow-hidden bg-ocean-deep text-ivory md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]",
          cardFocus,
          className,
        )}
      >
        <SceneImage
          image={tour.coverImage}
          hoverZoom
          sizes="(min-width: 768px) 60vw, 100vw"
          className="aspect-[4/3] md:aspect-auto md:min-h-[30rem]"
        />
        <div className="flex flex-col p-7 sm:p-10">
          <div className="flex flex-wrap items-center gap-3">
            {categoryName ? (
              <span className="eyebrow text-gold-light">{categoryName}</span>
            ) : null}
            {tour.isSample ? (
              <SampleBadge label={t.common.sample} className="text-gold-light" />
            ) : null}
          </div>
          <h3 className="mt-5 font-display text-4xl leading-[1.02] text-ivory sm:text-5xl">
            <Link href={`/tours/${tour.slug}`} className={stretchedLink}>
              {tour.name}
            </Link>
          </h3>
          <p className="mt-5 text-[1.05rem] leading-relaxed text-white/75">
            {tour.shortDescription}
          </p>
          <TourMeta
            tour={tour}
            destinationName={destinationName}
            className="mt-6 text-white/70 [&_svg]:text-turquoise"
          />
          <div className="mt-auto flex items-end justify-between gap-4 border-t border-white/15 pt-6">
            <PriceDisplay prices={tour.prices} tone="dark" />
            <div className="flex flex-wrap items-center justify-end gap-x-5 gap-y-3">
              <ViewCue label={t.tours.viewDetails} tone="dark" />
              <Link
                href={`/book?tour=${tour.slug}${bookQuery ? `&${bookQuery}` : ""}`}
                className={buttonVariants({
                  variant: "light",
                  className: "relative z-10",
                })}
              >
                {t.tours.bookNow}
                <span className="sr-only">: {tour.name}</span>
              </Link>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={cn("group relative flex h-full flex-col", cardFocus, className)}>
      <div className="relative">
        <SceneImage image={tour.coverImage} hoverZoom className="aspect-[4/5]" />
        <div className="absolute start-3 top-3 flex flex-wrap gap-2">
          {categoryName ? (
            <span className="bg-ivory/95 px-2.5 py-1 text-[0.62rem] font-semibold tracking-[0.16em] text-ocean-deep uppercase">
              {categoryName}
            </span>
          ) : null}
          {tour.isSample ? (
            <SampleBadge label={t.common.sample} className="bg-ivory/95" />
          ) : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col pt-5">
        <TourMeta tour={tour} destinationName={destinationName} />
        <h3 className="mt-3 font-display text-[1.75rem] leading-[1.08]">
          <Link href={`/tours/${tour.slug}`} className={stretchedLink}>
            {tour.name}
          </Link>
        </h3>
        <p className="mt-2.5 line-clamp-2 text-[0.95rem] leading-relaxed text-muted-foreground">
          {tour.shortDescription}
        </p>
        <div className="mt-auto border-t border-ocean-deep/12 pt-4">
          <PriceDisplay prices={tour.prices} />
          <div className="mt-4 flex items-center justify-between gap-3">
            <ViewCue label={t.tours.viewDetails} />
            {/* Raised above the stretched link so it books instead of opening the tour. */}
            <Link
              href={`/book?tour=${tour.slug}${bookQuery ? `&${bookQuery}` : ""}`}
              className={buttonVariants({ size: "sm", className: "relative z-10" })}
            >
              {t.tours.bookNow}
              <span className="sr-only">: {tour.name}</span>
            </Link>
          </div>
        </div>
        <TourCardDetails tour={tour} />
      </div>
    </article>
  );
}

/**
 * Expandable "Quick look" on a tour card. Native <details>: keyboard and
 * screen-reader friendly, works without JavaScript. Raised above the card's
 * stretched link (z-10) so clicks here don't open the tour page.
 */
function TourCardDetails({ tour }: { tour: Tour }) {
  const { t } = useI18n();
  const steps = tour.whatToExpect.slice(0, 4);
  return (
    <details className="group/details relative z-10 mt-3">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 py-1 text-xs font-semibold tracking-[0.1em] text-turquoise-deep uppercase hover:text-ocean-deep [&::-webkit-details-marker]:hidden">
        {t.common.quickLook}
        <ChevronDown
          className="size-3.5 transition-transform group-open/details:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="mt-3 space-y-4 border-s-2 border-gold ps-4 text-sm">
        {steps.length > 0 ? (
          <div>
            <p className="mb-1.5 font-semibold text-ocean-deep">
              {t.common.whatToExpect}
            </p>
            <ol className="list-decimal space-y-1 ps-5 text-muted-foreground marker:text-gold-deep">
              {steps.map((step) => (
                <li key={step.title}>{step.title}</li>
              ))}
            </ol>
          </div>
        ) : null}
        {tour.included.length > 0 ? (
          <div>
            <p className="mb-1.5 font-semibold text-ocean-deep">{t.common.included}</p>
            <ul className="space-y-1 text-muted-foreground">
              {tour.included.slice(0, 3).map((item) => (
                <li key={item} className="flex gap-2">
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-turquoise-deep"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {tour.goodToKnow[0] ? (
          <p className="text-ocean-deep italic">{tour.goodToKnow[0]}</p>
        ) : null}
        <Link
          href={`/tours/${tour.slug}`}
          className="link-underline inline-flex items-center gap-1.5 font-semibold text-ocean-deep"
        >
          {t.common.viewFullTour}
          <ArrowUpRight className="size-4" aria-hidden="true" />
          <span className="sr-only">: {tour.name}</span>
        </Link>
      </div>
    </details>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");

export function PackageCard({
  pkg,
  variant = "default",
  className,
}: {
  pkg: TourPackage;
  /** `row`: editorial horizontal layout with an itinerary preview. */
  variant?: "default" | "row";
  className?: string;
}) {
  const { t, fmt } = useI18n();
  const badges = (
    <>
      {pkg.isSafari ? (
        <span className="border border-turquoise-deep/40 px-2 py-0.5 text-[0.62rem] font-semibold tracking-[0.14em] text-turquoise-deep uppercase">
          {t.common.includesSafari}
        </span>
      ) : null}
      {pkg.isSample ? <SampleBadge label={t.common.sample} /> : null}
    </>
  );

  if (variant === "row") {
    const days = pkg.itinerary.slice(0, 3);
    return (
      <article
        className={cn(
          "group relative grid gap-6 border-t border-ocean-deep/15 py-8 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] md:gap-10 lg:py-10",
          cardFocus,
          className,
        )}
      >
        <SceneImage
          image={pkg.coverImage}
          hoverZoom
          sizes="(min-width: 768px) 38vw, 100vw"
          className="aspect-[4/3]"
        />
        <div className="grid gap-6 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-10">
          <p className="flex items-baseline gap-2 lg:flex-col lg:gap-0">
            <span className="font-display text-6xl leading-none text-gold-deep lg:text-7xl">
              {pad(pkg.days)}
            </span>
            <span className="eyebrow text-muted-foreground">
              {fmt(t.common.daysThenNights, { nights: pkg.nights })}
            </span>
          </p>
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2">{badges}</div>
            <h3 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
              <Link href={`/packages/${pkg.slug}`} className={stretchedLink}>
                {pkg.name}
              </Link>
            </h3>
            <p className="mt-3 leading-relaxed text-muted-foreground">{pkg.summary}</p>
            {days.length > 0 ? (
              <ol className="mt-5 space-y-1.5 text-sm">
                {days.map((day) => (
                  <li key={day.day} className="flex gap-3">
                    <span className="w-12 shrink-0 font-semibold text-gold-deep">
                      {fmt(t.common.dayN, { n: day.day })}
                    </span>
                    <span className="text-ocean-deep">{day.title}</span>
                  </li>
                ))}
                {pkg.itinerary.length > days.length ? (
                  <li className="ps-15 text-muted-foreground">
                    {fmt(t.common.moreDays, { n: pkg.itinerary.length - days.length })}
                  </li>
                ) : null}
              </ol>
            ) : null}
            <div className="mt-6 flex items-end justify-between gap-4 border-t border-ocean-deep/12 pt-4">
              <PriceDisplay prices={pkg.prices} />
              <ViewCue label={t.common.viewItinerary} />
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={cn("group relative flex h-full flex-col", cardFocus, className)}>
      <SceneImage image={pkg.coverImage} hoverZoom className="aspect-[16/11]" />
      <div className="flex flex-1 flex-col pt-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="eyebrow text-gold-deep">
            {fmt(t.common.daysNights, { days: pkg.days, nights: pkg.nights })}
          </span>
          {badges}
        </div>
        <h3 className="mt-3 font-display text-[1.75rem] leading-[1.08]">
          <Link href={`/packages/${pkg.slug}`} className={stretchedLink}>
            {pkg.name}
          </Link>
        </h3>
        <p className="mt-2.5 line-clamp-3 text-[0.95rem] leading-relaxed text-muted-foreground">
          {pkg.summary}
        </p>
        <div className="mt-auto flex items-end justify-between gap-4 border-t border-ocean-deep/12 pt-4">
          <PriceDisplay prices={pkg.prices} />
          <ViewCue label={t.common.view} />
        </div>
      </div>
    </article>
  );
}

export function DestinationCard({
  destination,
  index,
  className,
  imageClassName = "aspect-[3/4]",
  sizes,
}: {
  destination: Destination;
  /** Optional running number shown as an editorial caption. */
  index?: number;
  className?: string;
  imageClassName?: string;
  sizes?: string;
}) {
  const { t } = useI18n();
  return (
    <article className={cn("group relative overflow-hidden", cardFocus, className)}>
      <SceneImage
        image={destination.coverImage}
        showPlaceholderTag={false}
        hoverZoom
        sizes={sizes}
        className={cn("h-full", imageClassName)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ocean-deep/85 via-ocean-deep/15 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 text-ivory sm:p-6">
        <p className="eyebrow flex items-center gap-3 text-gold-light">
          {index !== undefined ? (
            <span className="tabular-nums">{pad(index)}</span>
          ) : null}
          {destination.region === "zanzibar" ? t.common.zanzibar : t.common.mainland}
        </p>
        <h3 className="mt-2 font-display text-3xl leading-none text-ivory sm:text-4xl">
          <Link href={`/destinations/${destination.slug}`} className={stretchedLink}>
            {destination.name}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 max-w-md text-sm text-white/80">
          {destination.summary}
        </p>
      </div>
    </article>
  );
}

export function ArticleCard({
  article,
  variant = "default",
  className,
  imageClassName,
}: {
  article: Article;
  /** `lead`: large opening story. */
  variant?: "default" | "lead";
  className?: string;
  /** Overrides the photo's aspect ratio. */
  imageClassName?: string;
}) {
  const { t, fmt, date } = useI18n();
  const lead = variant === "lead";
  return (
    <article className={cn("group relative flex h-full flex-col", cardFocus, className)}>
      <SceneImage
        image={article.coverImage}
        hoverZoom
        sizes={lead ? "(min-width: 1024px) 55vw, 100vw" : undefined}
        className={imageClassName ?? (lead ? "aspect-[4/3]" : "aspect-[3/2]")}
      />
      <div className="flex flex-1 flex-col pt-5">
        <div className="eyebrow flex flex-wrap items-center gap-2 text-muted-foreground">
          <time dateTime={article.publishedOn}>{date(article.publishedOn)}</time>
          <span aria-hidden="true">·</span>
          <span>{fmt(t.common.minRead, { n: article.readingMinutes })}</span>
          {article.isSample ? <SampleBadge label={t.common.sample} /> : null}
        </div>
        <h3
          className={cn(
            "mt-3 font-display leading-[1.08]",
            lead ? "text-4xl sm:text-5xl" : "text-[1.65rem]",
          )}
        >
          <Link href={`/travel-guide/${article.slug}`} className={stretchedLink}>
            {article.title}
          </Link>
        </h3>
        <p
          className={cn(
            "mt-3 leading-relaxed text-muted-foreground",
            lead ? "text-lg" : "line-clamp-3 text-[0.95rem]",
          )}
        >
          {article.excerpt}
        </p>
        <div className="mt-auto pt-5">
          <ViewCue label={t.common.readGuide} />
        </div>
      </div>
    </article>
  );
}
