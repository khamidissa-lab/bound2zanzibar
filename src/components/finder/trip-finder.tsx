"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, Compass, RotateCcw } from "lucide-react";

import { PackageCard, TourCard } from "@/components/content/cards";
import { TourGrid } from "@/components/content/tour-grid";
import { LocaleLink as Link } from "@/components/i18n/locale-link";
import { useBudgetLabel } from "@/components/pricing/use-budget-label";
import { EmptyState } from "@/components/shared/empty-state";
import { Button, buttonVariants } from "@/components/ui/button";
import { useI18n } from "@/i18n/client";
import { BUDGET_BANDS, TRAVEL_STYLES, marketCurrency } from "@/lib/discovery";
import { useMarket } from "@/lib/market-store";
import {
  DAYS_OPTIONS,
  EMPTY_ANSWERS,
  WHERE_OPTIONS,
  type FinderAnswers,
  type Reason,
  recommendPackages,
  recommendTours,
} from "@/lib/trip-finder";
import { tripPlanQuery } from "@/lib/trip-plan";
import { cn } from "@/lib/utils";
import type { DestinationRegion, Tour, TourPackage } from "@/types/content";

const STEPS = ["where", "interests", "days", "budget", "travellers", "styles"] as const;
type Step = (typeof STEPS)[number];

const MAX_TRAVELLERS = 50;

type TripFinderProps = {
  tours: Tour[];
  packages: TourPackage[];
  categories: { slug: string; name: string }[];
  destinationRegion: Record<string, DestinationRegion>;
  lookups: { categories: Record<string, string>; destinations: Record<string, string> };
};

/**
 * Guided trip finder: six questions, one at a time, then suggestions from the
 * published tours and packages. Answers stay in the browser; nothing is sent.
 */
export function TripFinder({
  tours,
  packages,
  categories,
  destinationRegion,
  lookups,
}: TripFinderProps) {
  const { t, fmt } = useI18n();
  const f = t.finder;
  const market = useMarket();
  const currency = marketCurrency(tours, market);
  const budgetLabel = useBudgetLabel(currency);

  const [answers, setAnswers] = useState<FinderAnswers>(EMPTY_ANSWERS);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const started = useRef(false);

  // Move focus to the new question (or the results) so screen readers follow.
  useEffect(() => {
    if (!started.current) {
      started.current = true;
      return;
    }
    headingRef.current?.focus();
  }, [step, done]);

  const set = <K extends keyof FinderAnswers>(key: K, value: FinderAnswers[K]) =>
    setAnswers((a) => ({ ...a, [key]: value }));
  const toggle = <T,>(list: T[], value: T) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const next = () => (step < STEPS.length - 1 ? setStep(step + 1) : setDone(true));
  const restart = () => {
    setAnswers(EMPTY_ANSWERS);
    setStep(0);
    setDone(false);
  };

  if (done) {
    const tourResults = recommendTours(tours, answers, market, destinationRegion);
    const packageResults = recommendPackages(packages, answers, market);
    const bookQuery = tripPlanQuery({
      date: "",
      adults: String(answers.adults),
      children: String(answers.children),
    });
    const reasonLabel = (r: Reason) =>
      r.kind === "style"
        ? t.travelStyles[r.style]
        : r.kind === "interest"
          ? (lookups.categories[r.category] ?? r.category)
          : r.kind === "budget"
            ? f.reasonBudget
            : r.kind === "fits-days"
              ? f.reasonDays
              : f.reasonChildren;
    const reasons = (list: Reason[]) =>
      list.length > 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">
          <span className="font-semibold text-ocean-deep">{f.why}</span>{" "}
          {list.map(reasonLabel).join(" · ")}
        </p>
      ) : null;

    return (
      <section aria-labelledby="finder-results">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-ocean-deep/15 pb-8">
          <div className="max-w-2xl">
            <h2
              id="finder-results"
              ref={headingRef}
              tabIndex={-1}
              className="display-lg outline-none"
            >
              {f.resultsTitle}
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">{f.resultsIntro}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => setDone(false)}>
              <ArrowLeft
                aria-hidden="true"
                data-icon="inline-start"
                className="rtl:-scale-x-100"
              />
              {f.editAnswers}
            </Button>
            <Button variant="ghost" onClick={restart}>
              <RotateCcw aria-hidden="true" data-icon="inline-start" />
              {f.startAgain}
            </Button>
          </div>
        </div>

        {tourResults.length === 0 && packageResults.length === 0 ? (
          <EmptyState icon={Compass} title={f.noneTitle}>
            {f.noneBody}
          </EmptyState>
        ) : null}

        {packageResults.length > 0 ? (
          <section aria-labelledby="finder-packages" className="mb-16">
            <h3 id="finder-packages" className="eyebrow mb-6 text-gold-deep">
              {f.packagesHeading}
            </h3>
            <ul className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
              {packageResults.map((r) => (
                <li key={r.item.slug}>
                  <PackageCard pkg={r.item} />
                  {reasons(r.reasons)}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {tourResults.length > 0 ? (
          <section aria-labelledby="finder-tours">
            <h3 id="finder-tours" className="eyebrow mb-6 text-gold-deep">
              {f.toursHeading}
            </h3>
            <TourGrid>
              {tourResults.map((r) => (
                <div key={r.item.slug} className="flex flex-col">
                  <TourCard
                    tour={r.item}
                    categoryName={lookups.categories[r.item.categorySlug]}
                    destinationName={lookups.destinations[r.item.destinationSlug]}
                    bookQuery={bookQuery}
                    className="flex-1"
                  />
                  {reasons(r.reasons)}
                </div>
              ))}
            </TourGrid>
          </section>
        ) : null}

        <div className="mt-16 flex flex-wrap items-center justify-between gap-6 bg-ocean-deep p-8 text-ivory sm:p-10">
          <div className="max-w-xl">
            <p className="font-display text-3xl text-ivory">{f.customTitle}</p>
            <p className="mt-2 text-white/80">{f.customBody}</p>
          </div>
          <Link
            href="/contact"
            className={buttonVariants({ variant: "light", size: "lg" })}
          >
            {f.customCta}
            <ArrowRight
              aria-hidden="true"
              data-icon="inline-end"
              className="rtl:-scale-x-100"
            />
          </Link>
        </div>
      </section>
    );
  }

  const current: Step = STEPS[step];
  const titles: Record<Step, string> = {
    where: f.whereTitle,
    interests: f.interestsTitle,
    days: f.daysTitle,
    budget: f.budgetTitle,
    travellers: f.travellersTitle,
    styles: f.stylesTitle,
  };
  const hints: Partial<Record<Step, string>> = {
    interests: f.interestsHint,
    budget: fmt(f.budgetHint, { currency }),
    styles: f.stylesHint,
  };
  const answered: Record<Step, boolean> = {
    where: Boolean(answers.where),
    interests: answers.interests.length > 0,
    days: Boolean(answers.days),
    budget: true,
    travellers: answers.adults >= 1,
    styles: answers.styles.length > 0,
  };
  const isLast = step === STEPS.length - 1;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <p className="eyebrow text-muted-foreground">
          {fmt(f.stepOf, { n: step + 1, total: STEPS.length })}
        </p>
        <div
          className="mt-3 h-1 bg-ocean-deep/10"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
          aria-valuenow={step + 1}
          aria-label={fmt(f.stepOf, { n: step + 1, total: STEPS.length })}
        >
          <div
            className="h-full bg-gold transition-[width] duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          next();
        }}
      >
        <fieldset aria-labelledby="finder-question">
          <h2
            id="finder-question"
            ref={headingRef}
            tabIndex={-1}
            className="display-lg outline-none"
          >
            {titles[current]}
          </h2>
          {hints[current] ? (
            <p className="mt-3 text-muted-foreground">{hints[current]}</p>
          ) : null}

          <div className="mt-8">
            {current === "where" ? (
              <Options>
                {WHERE_OPTIONS.map((w) => (
                  <Choice
                    key={w}
                    type="radio"
                    name="where"
                    label={f.where[w]}
                    checked={answers.where === w}
                    onChange={() => set("where", w)}
                  />
                ))}
              </Options>
            ) : null}

            {current === "interests" ? (
              <Options>
                {categories.map((c) => (
                  <Choice
                    key={c.slug}
                    type="checkbox"
                    name="interests"
                    label={c.name}
                    checked={answers.interests.includes(c.slug)}
                    onChange={() => set("interests", toggle(answers.interests, c.slug))}
                  />
                ))}
              </Options>
            ) : null}

            {current === "days" ? (
              <Options>
                {DAYS_OPTIONS.map((d) => (
                  <Choice
                    key={d}
                    type="radio"
                    name="days"
                    label={f.days[d]}
                    checked={answers.days === d}
                    onChange={() => set("days", d)}
                  />
                ))}
              </Options>
            ) : null}

            {current === "budget" ? (
              <Options>
                <Choice
                  type="radio"
                  name="budget"
                  label={f.noPreference}
                  checked={answers.budget === ""}
                  onChange={() => set("budget", "")}
                />
                {BUDGET_BANDS[currency].map((b) => (
                  <Choice
                    key={b.id}
                    type="radio"
                    name="budget"
                    label={budgetLabel(b.id)}
                    checked={answers.budget === b.id}
                    onChange={() => set("budget", b.id)}
                  />
                ))}
              </Options>
            ) : null}

            {current === "travellers" ? (
              <div className="grid max-w-md grid-cols-2 gap-4">
                <Counter
                  label={t.tours.adultsLabel}
                  value={answers.adults}
                  min={1}
                  onChange={(v) => set("adults", v)}
                />
                <Counter
                  label={t.tours.childrenLabel}
                  value={answers.children}
                  min={0}
                  onChange={(v) => set("children", v)}
                />
              </div>
            ) : null}

            {current === "styles" ? (
              <Options>
                {TRAVEL_STYLES.map((s) => (
                  <Choice
                    key={s}
                    type="checkbox"
                    name="styles"
                    label={t.travelStyles[s]}
                    checked={answers.styles.includes(s)}
                    onChange={() => set("styles", toggle(answers.styles, s))}
                  />
                ))}
              </Options>
            ) : null}
          </div>
        </fieldset>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-ocean-deep/15 pt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep(step - 1)}
            disabled={step === 0}
          >
            <ArrowLeft
              aria-hidden="true"
              data-icon="inline-start"
              className="rtl:-scale-x-100"
            />
            {f.back}
          </Button>
          <div className="flex gap-3">
            {!answered[current] ? (
              <Button type="button" variant="outline" onClick={next}>
                {f.skip}
              </Button>
            ) : null}
            <Button type="submit" disabled={!answered[current]}>
              {isLast ? f.seeResults : f.next}
              <ArrowRight
                aria-hidden="true"
                data-icon="inline-end"
                className="rtl:-scale-x-100"
              />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Options({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}

/** A radio or checkbox drawn as a selectable card (the input stays native). */
function Choice({
  type,
  name,
  label,
  checked,
  onChange,
}: {
  type: "radio" | "checkbox";
  name: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 border px-4 py-4 text-ocean-deep transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
        checked
          ? "border-ocean-deep bg-ocean-deep text-ivory"
          : "border-ocean-deep/20 bg-ivory hover:border-ocean-deep/50",
      )}
    >
      <input
        type={type}
        name={name}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={cn(
          "flex size-5 shrink-0 items-center justify-center border",
          type === "radio" && "rounded-full",
          checked
            ? "border-gold-light bg-gold-light text-ocean-deep"
            : "border-ocean-deep/30",
        )}
      >
        {checked ? <Check className="size-3.5" /> : null}
      </span>
      <span className="font-medium">{label}</span>
    </label>
  );
}

function Counter({
  label,
  value,
  min,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block text-sm font-medium text-ocean-deep">
      {label}
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={MAX_TRAVELLERS}
        value={value}
        onChange={(event) => {
          const n = Number(event.target.value);
          if (Number.isInteger(n)) onChange(Math.min(MAX_TRAVELLERS, Math.max(min, n)));
        }}
        className="mt-1.5 h-14 w-full border border-ocean-deep/20 bg-ivory px-4 font-display text-2xl"
      />
    </label>
  );
}
