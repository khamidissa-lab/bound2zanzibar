import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  MapPin,
  Moon,
} from "lucide-react";

import { SceneImage } from "@/components/media/scene-image";
import { PriceDisplay } from "@/components/pricing/price-display";
import { SampleBadge } from "@/components/shared/sample-badge";
import { formatDate } from "@/lib/format";
import type { Article, Destination, Tour, TourPackage } from "@/types/content";

// Cards use a "stretched link": the title link's ::after covers the card so
// the whole card is clickable while screen readers get one clear link.
const cardClass =
  "group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-card transition-shadow hover:shadow-lg focus-within:ring-2 focus-within:ring-ring";
const stretchedLink =
  "after:absolute after:inset-0 after:content-[''] focus-visible:outline-none";

export function TourCard({
  tour,
  categoryName,
  destinationName,
}: {
  tour: Tour;
  categoryName?: string;
  destinationName?: string;
}) {
  return (
    <article className={cardClass}>
      <SceneImage
        image={tour.coverImage}
        className="aspect-[4/3] motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.02]"
      />
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {categoryName ? (
            <span className="text-xs font-semibold text-turquoise-deep">
              {categoryName}
            </span>
          ) : null}
          {tour.isSample ? <SampleBadge label="Sample" /> : null}
        </div>
        <h3 className="text-xl font-medium">
          <Link href={`/tours/${tour.slug}`} className={stretchedLink}>
            {tour.name}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {tour.shortDescription}
        </p>
        <ul className="mt-4 space-y-1.5 text-sm text-ocean-deep/80">
          <li className="flex items-center gap-2">
            <Clock className="size-4 text-turquoise-deep" aria-hidden="true" />
            {tour.duration}
          </li>
          {destinationName ? (
            <li className="flex items-center gap-2">
              <MapPin className="size-4 text-turquoise-deep" aria-hidden="true" />
              {destinationName}
            </li>
          ) : null}
        </ul>
        <div className="mt-auto pt-5">
          <PriceDisplay prices={tour.prices} />
        </div>
        <TourCardDetails tour={tour} />
      </div>
    </article>
  );
}

/**
 * Expandable "More details" on a tour card. Native <details>: keyboard and
 * screen-reader friendly, works without JavaScript. Raised above the card's
 * stretched link (z-10) so clicks here don't open the tour page.
 */
function TourCardDetails({ tour }: { tour: Tour }) {
  const steps = tour.whatToExpect.slice(0, 4);
  return (
    <details className="group/details relative z-10 mt-4 border-t pt-3">
      <summary className="flex cursor-pointer list-none items-center justify-between rounded-md py-1 text-sm font-semibold text-turquoise-deep hover:text-ocean-deep [&::-webkit-details-marker]:hidden">
        More details
        <ChevronDown
          className="size-4 transition-transform group-open/details:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="mt-3 space-y-4 text-sm">
        {steps.length > 0 ? (
          <div>
            <p className="mb-1.5 font-semibold text-ocean-deep">What to expect</p>
            <ol className="list-decimal space-y-1 pl-5 text-muted-foreground marker:text-turquoise-deep">
              {steps.map((step) => (
                <li key={step.title}>{step.title}</li>
              ))}
            </ol>
          </div>
        ) : null}
        {tour.included.length > 0 ? (
          <div>
            <p className="mb-1.5 font-semibold text-ocean-deep">Included</p>
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
          <p className="rounded-lg bg-turquoise-soft/60 px-3 py-2 text-ocean-deep">
            {tour.goodToKnow[0]}
          </p>
        ) : null}
        <Link
          href={`/tours/${tour.slug}`}
          className="inline-flex items-center gap-1.5 font-semibold text-turquoise-deep hover:underline"
        >
          View full tour
          <ArrowRight className="size-4" aria-hidden="true" />
          <span className="sr-only">: {tour.name}</span>
        </Link>
      </div>
    </details>
  );
}

export function PackageCard({ pkg }: { pkg: TourPackage }) {
  return (
    <article className={cardClass}>
      <SceneImage image={pkg.coverImage} className="aspect-[16/10]" />
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-turquoise-deep">
            <CalendarDays className="size-3.5" aria-hidden="true" />
            {pkg.days} days
            <Moon className="ml-1 size-3.5" aria-hidden="true" />
            {pkg.nights} nights
          </span>
          {pkg.isSafari ? (
            <span className="rounded-full bg-sand px-2 py-0.5 text-[0.7rem] font-medium text-ocean-deep">
              Includes safari
            </span>
          ) : null}
          {pkg.isSample ? <SampleBadge label="Sample" /> : null}
        </div>
        <h3 className="text-xl font-medium">
          <Link href={`/packages/${pkg.slug}`} className={stretchedLink}>
            {pkg.name}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{pkg.summary}</p>
        <div className="mt-auto pt-5">
          <PriceDisplay prices={pkg.prices} />
        </div>
      </div>
    </article>
  );
}

export function DestinationCard({ destination }: { destination: Destination }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl shadow-card focus-within:ring-2 focus-within:ring-ring">
      <SceneImage
        image={destination.coverImage}
        showPlaceholderTag={false}
        className="aspect-[3/4] motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ocean-deep/90 via-ocean-deep/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        <p className="text-xs font-medium tracking-wide text-white/80">
          {destination.region === "zanzibar" ? "Zanzibar" : "Mainland Tanzania"}
        </p>
        <h3 className="mt-1 text-2xl font-medium text-white">
          <Link href={`/destinations/${destination.slug}`} className={stretchedLink}>
            {destination.name}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-white/85">{destination.summary}</p>
      </div>
    </article>
  );
}

export function ArticleCard({ article }: { article: Article }) {
  return (
    <article className={cardClass}>
      <SceneImage image={article.coverImage} className="aspect-[16/9]" />
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <time dateTime={article.publishedOn}>{formatDate(article.publishedOn)}</time>
          <span aria-hidden="true">·</span>
          <span>{article.readingMinutes} min read</span>
          {article.isSample ? <SampleBadge label="Sample" /> : null}
        </div>
        <h3 className="text-xl font-medium">
          <Link href={`/travel-guide/${article.slug}`} className={stretchedLink}>
            {article.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
          {article.excerpt}
        </p>
      </div>
    </article>
  );
}
