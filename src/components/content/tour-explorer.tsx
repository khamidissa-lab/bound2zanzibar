"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
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

function matchesQuery(tour: Tour, query: string) {
  if (!query) return true;
  const haystack = [tour.name, tour.shortDescription, ...tour.highlights]
    .join(" ")
    .toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const category = searchParams.get("category") ?? "";
  const destination = searchParams.get("destination") ?? "";
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const clearAll = () => {
    setQuery("");
    router.replace(pathname, { scroll: false });
  };

  const results = tours.filter(
    (tour) =>
      (!category || tour.categorySlug === category) &&
      (!destination || tour.destinationSlug === destination) &&
      matchesQuery(tour, query),
  );
  const hasFilters = Boolean(category || destination || query);

  return (
    <div>
      <form
        role="search"
        aria-label="Filter tours"
        onSubmit={(event) => {
          event.preventDefault();
          updateParam("q", query.trim());
        }}
        className="mb-6 grid gap-3 rounded-2xl border bg-card p-4 shadow-card md:grid-cols-[2fr_1fr_1fr_auto]"
      >
        <label className="relative block">
          <span className="sr-only">Search tours</span>
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onBlur={() => updateParam("q", query.trim())}
            placeholder="Search tours, e.g. snorkelling"
            className="h-11 w-full rounded-full border border-input bg-background pr-4 pl-10 text-sm"
          />
        </label>
        <label className="block">
          <span className="sr-only">Category</span>
          <select
            value={category}
            onChange={(event) => updateParam("category", event.target.value)}
            className="h-11 w-full rounded-full border border-input bg-background px-4 text-sm"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="sr-only">Destination</span>
          <select
            value={destination}
            onChange={(event) => updateParam("destination", event.target.value)}
            className="h-11 w-full rounded-full border border-input bg-background px-4 text-sm"
          >
            <option value="">All destinations</option>
            {destinations.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <Button type="submit" className="h-11 px-6">
          Search
        </Button>
      </form>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {results.length} {results.length === 1 ? "experience" : "experiences"} found
        </p>
        {hasFilters ? (
          <Button variant="ghost" size="sm" onClick={clearAll}>
            <X aria-hidden="true" data-icon="inline-start" />
            Clear filters
          </Button>
        ) : null}
      </div>

      {results.length > 0 ? (
        <TourGrid>
          {results.map((tour) => (
            <TourCard
              key={tour.slug}
              tour={tour}
              categoryName={lookups.categories[tour.categorySlug]}
              destinationName={lookups.destinations[tour.destinationSlug]}
            />
          ))}
        </TourGrid>
      ) : (
        <EmptyState icon={Search} title="No tours match your search">
          Try a different keyword or clear the filters. You can also contact us — we are
          happy to plan something around what you have in mind.
        </EmptyState>
      )}
    </div>
  );
}
