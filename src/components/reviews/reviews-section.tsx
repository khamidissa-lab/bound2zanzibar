import { BadgeCheck } from "lucide-react";

import { SectionHeading } from "@/components/shared/section-heading";
import type { Locale } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import type { RatingSummary, Review } from "@/types/content";

import { Stars } from "./stars";

/** "4.5 out of 5 · 12 verified reviews" with stars. */
export function RatingSummaryLine({
  rating,
  locale,
  className,
}: {
  rating: RatingSummary;
  locale: Locale;
  className?: string;
}) {
  const { t, fmt } = getI18n(locale);
  const r = t.reviews;
  const average = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(
    rating.average,
  );
  return (
    <p className={className}>
      <Stars
        rating={rating.average}
        label={fmt(r.stars, { n: average })}
        className="me-2 align-[-0.15em] text-lg"
      />
      <span className="font-medium text-ocean-deep">{fmt(r.average, { average })}</span>
      <span className="text-muted-foreground">
        {" · "}
        {rating.count === 1 ? r.countOne : fmt(r.countMany, { n: rating.count })}
      </span>
    </p>
  );
}

export function ReviewCard({ review, locale }: { review: Review; locale: Locale }) {
  const { t, fmt } = getI18n(locale);
  const date = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(
    new Date(`${review.date}T00:00:00Z`),
  );
  return (
    <article className="flex h-full flex-col bg-ivory p-6 shadow-card">
      <Stars rating={review.rating} label={fmt(t.reviews.stars, { n: review.rating })} />
      {review.title ? (
        <h3 className="mt-3 font-display text-2xl leading-tight text-ocean-deep">
          {review.title}
        </h3>
      ) : null}
      <p className="mt-3 flex-1 leading-relaxed whitespace-pre-line text-ink/90">
        {review.body}
      </p>
      <footer className="mt-5 border-t border-ocean-deep/10 pt-4 text-sm">
        <p className="font-medium text-ocean-deep">
          {review.displayName}
          {review.country ? (
            <span className="font-normal text-muted-foreground"> · {review.country}</span>
          ) : null}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <BadgeCheck className="size-3.5 text-turquoise-deep" aria-hidden="true" />
          {t.reviews.verified} · <time dateTime={review.date}>{date}</time>
        </p>
      </footer>
    </article>
  );
}

/**
 * Approved reviews for a tour or package. Renders nothing until there are
 * real reviews: no placeholder ratings are ever shown.
 */
export function ReviewsSection({
  reviews,
  rating,
  locale,
  headingId = "reviews-heading",
  title,
}: {
  reviews: Review[];
  rating?: RatingSummary;
  locale: Locale;
  headingId?: string;
  title?: string;
}) {
  if (reviews.length === 0) return null;
  const { t } = getI18n(locale);
  return (
    <section aria-labelledby={headingId} className="bg-sand-soft py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading
          id={headingId}
          eyebrow={t.reviews.eyebrow}
          title={title ?? t.reviews.title}
          description={t.reviews.policy}
        />
        {rating ? (
          <RatingSummaryLine rating={rating} locale={locale} className="mb-8" />
        ) : null}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}
