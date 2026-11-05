"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { useI18n } from "@/i18n/client";
import {
  BUDGET_BANDS,
  DIFFICULTIES,
  FILTER_PARAMS,
  TOUR_LENGTHS,
  TRAVEL_STYLES,
  filterTours,
  filtersFromParams,
  marketCurrency,
  type TourFilters,
} from "@/lib/discovery";
import { tripPlanFromParams, tripPlanQuery } from "@/lib/trip-plan";
import { useMarket } from "@/lib/market-store";
import type { Tour } from "@/types/content";

import { TourCard } from "./cards";
import { TourGrid } from "./tour-grid";

type Option = { slug: string; name: string };

type TourExplorerProps = {
  tours: Tour[];
  categories: Option[];
  destinations: Option[];
  lookups: { categories: Record<string, string>; destinations: Record<string, string> };
};

const selectClass = "h-14 w-full border-0 bg-ivory px-4 text-[0.95rem] text-ocean-deep";
const inputClass =
  "h-12 w-full border border-ocean-deep/15 bg-ivory px-3 text-[0.95rem] text-ocean-deep";

/**
 * Client-side filtering of the (small) published tour list. Filter state lives
 * in the URL so results are shareable and the homepage search can link here.
 * Render inside <Suspense> because it reads search params.
 */
export function TourExplorer({
  tours,
  categories,
  destinations,
  lookups,
}: TourExplorerProps) {
  const { t, fmt, price } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const market = useMarket();

  const filters = filtersFromParams((key) => searchParams.get(key));
  const plan = tripPlanFromParams((key) => searchParams.get(key));
  const [query, setQuery] = useState(filters.query);
  const extraActive = Boolean(
    filters.length || filters.style || filters.difficulty || filters.budget,
  );
  const [showMore, setShowMore] = useState(extraActive);

  const updateParams = (changes: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };
  const setFilter = (key: keyof TourFilters, value: string) =>
    updateParams({ [FILTER_PARAMS[key]]: value });

  const clearAll = () => {
    setQuery("");
    router.replace(pathname, { scroll: false });
  };

  const results = filterTours(tours, { ...filters, query }, market);
  const hasFilters =
    Object.values(filters).some(Boolean) ||
    Boolean(query || plan.date || plan.adults || plan.children);

  const currency = marketCurrency(tours, market);
  const budgetLabel = (id: string) => {
    const band = BUDGET_BANDS[currency].find((b) => b.id === id);
    if (!band) return "";
    if (band.min === 0 && band.max !== null)
      return fmt(t.tours.budgetUpTo, { max: price(band.max, currency) });
    if (band.max === null)
      return fmt(t.tours.budgetOver, { min: price(band.min, currency) });
    return fmt(t.tours.budgetBetween, {
      min: price(band.min, currency),
      max: price(band.max, currency),
    });
  };

  const today = new Date().toISOString().slice(0, 10);
  const bookQuery = tripPlanQuery(plan);

  return (
    <div>
      <form
        role="search"
        aria-label={t.tours.filter}
        onSubmit={(event) => {
          event.preventDefault();
          setFilter("query", query.trim());
        }}
      >
        <div className="grid gap-px border border-ocean-deep/15 bg-ocean-deep/15 md:grid-cols-[2fr_1fr_1fr_auto]">
          <label className="relative block">
            <span className="sr-only">{t.tours.searchLabel}</span>
            <Search
              className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-gold-deep"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onBlur={() => setFilter("query", query.trim())}
              placeholder={t.tours.searchPlaceholder}
              className="h-14 w-full border-0 bg-ivory ps-11 pe-4 text-[0.95rem] placeholder:text-muted-foreground"
            />
          </label>
          <label className="block">
            <span className="sr-only">{t.tours.category}</span>
            <select
              value={filters.category}
              onChange={(event) => setFilter("category", event.target.value)}
              className={selectClass}
            >
              <option value="">{t.tours.allCategories}</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="sr-only">{t.tours.destination}</span>
            <select
              value={filters.destination}
              onChange={(event) => setFilter("destination", event.target.value)}
              className={selectClass}
            >
              <option value="">{t.tours.allDestinations}</option>
              {destinations.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit" className="h-14 rounded-none px-8">
            {t.tours.search}
          </Button>
        </div>

        {/* Always shown on large screens; behind a toggle on phones. */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-expanded={showMore}
          aria-controls="more-filters"
          onClick={() => setShowMore((v) => !v)}
          className="mt-3 lg:hidden"
        >
          <SlidersHorizontal aria-hidden="true" data-icon="inline-start" />
          {showMore ? t.tours.fewerFilters : t.tours.moreFilters}
        </Button>
        <div
          id="more-filters"
          className={`mt-3 gap-px border border-ocean-deep/15 bg-ocean-deep/15 sm:grid-cols-2 lg:grid lg:grid-cols-4 ${showMore ? "grid" : "hidden"}`}
        >
          <label className="block bg-ivory">
            <span className="sr-only">{t.tours.lengthLabel}</span>
            <select
              value={filters.length}
              onChange={(event) => setFilter("length", event.target.value)}
              className={selectClass}
            >
              <option value="">{t.tours.anyLength}</option>
              {TOUR_LENGTHS.map((l) => (
                <option key={l} value={l}>
                  {t.tourLengths[l]}
                </option>
              ))}
            </select>
          </label>
          <label className="block bg-ivory">
            <span className="sr-only">{t.tours.styleLabel}</span>
            <select
              value={filters.style}
              onChange={(event) => setFilter("style", event.target.value)}
              className={selectClass}
            >
              <option value="">{t.tours.anyStyle}</option>
              {TRAVEL_STYLES.map((s) => (
                <option key={s} value={s}>
                  {t.travelStyles[s]}
                </option>
              ))}
            </select>
          </label>
          <label className="block bg-ivory">
            <span className="sr-only">{t.tours.levelLabel}</span>
            <select
              value={filters.difficulty}
              onChange={(event) => setFilter("difficulty", event.target.value)}
              className={selectClass}
            >
              <option value="">{t.tours.anyLevel}</option>
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {t.difficulty[d]}
                </option>
              ))}
            </select>
          </label>
          <label className="block bg-ivory">
            <span className="sr-only">{t.tours.budgetLabel}</span>
            <select
              value={filters.budget}
              onChange={(event) => setFilter("budget", event.target.value)}
              className={selectClass}
            >
              <option value="">{t.tours.anyBudget}</option>
              {BUDGET_BANDS[currency].map((b) => (
                <option key={b.id} value={b.id}>
                  {budgetLabel(b.id)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </form>

      {/* Date and group size don't filter (availability is confirmed by staff);
          they are carried into the booking form from each card's Book now. */}
      <fieldset className="mt-6 grid grid-cols-2 gap-4 border-s-2 border-gold ps-4 sm:grid-cols-[auto_8rem_8rem_1fr] sm:items-end">
        <legend className="eyebrow mb-3 text-gold-deep">{t.tours.planLabel}</legend>
        <label className="col-span-2 block text-sm text-ocean-deep sm:col-span-1">
          {t.tours.dateLabel}
          <input
            type="date"
            min={today}
            value={plan.date}
            onChange={(event) => updateParams({ date: event.target.value })}
            className={`${inputClass} mt-1.5`}
          />
        </label>
        <label className="block text-sm text-ocean-deep">
          {t.tours.adultsLabel}
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={50}
            value={plan.adults}
            placeholder="2"
            onChange={(event) => updateParams({ adults: event.target.value })}
            className={`${inputClass} mt-1.5`}
          />
        </label>
        <label className="block text-sm text-ocean-deep">
          {t.tours.childrenLabel}
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={50}
            value={plan.children}
            placeholder="0"
            onChange={(event) => updateParams({ children: event.target.value })}
            className={`${inputClass} mt-1.5`}
          />
        </label>
        <p className="col-span-2 text-xs leading-relaxed text-muted-foreground sm:col-span-1 sm:pb-1">
          {t.tours.planNote}
        </p>
      </fieldset>

      <div className="mt-8 mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="eyebrow text-muted-foreground" aria-live="polite">
          {fmt(t.tours.found, { n: results.length })}
        </p>
        {hasFilters ? (
          <Button variant="ghost" size="sm" onClick={clearAll}>
            <X aria-hidden="true" data-icon="inline-start" />
            {t.tours.clear}
          </Button>
        ) : null}
      </div>
      {filters.budget ? (
        <p className="-mt-3 mb-6 text-xs text-muted-foreground">{t.tours.budgetNote}</p>
      ) : null}

      {results.length > 0 ? (
        <TourGrid>
          {results.map((tour) => (
            <TourCard
              key={tour.slug}
              tour={tour}
              categoryName={lookups.categories[tour.categorySlug]}
              destinationName={lookups.destinations[tour.destinationSlug]}
              bookQuery={bookQuery}
            />
          ))}
        </TourGrid>
      ) : (
        <EmptyState icon={Search} title={t.tours.noneTitle}>
          {t.tours.noneBody}
        </EmptyState>
      )}
    </div>
  );
}
