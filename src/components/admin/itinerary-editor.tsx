"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export type ItineraryDayValue = {
  title: string;
  description: string;
  meals: string[];
  overnight: string;
};

const MEALS = ["Breakfast", "Lunch", "Dinner"];
const input =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-ocean-deep";

/**
 * Day-by-day itinerary builder. Days are numbered by their order; the result
 * is posted as JSON in a hidden field and validated on the server.
 */
export function ItineraryEditor({
  initialDays,
  error,
}: {
  initialDays: ItineraryDayValue[];
  error?: string;
}) {
  const [days, setDays] = useState<ItineraryDayValue[]>(initialDays);

  const update = (index: number, patch: Partial<ItineraryDayValue>) =>
    setDays((current) => current.map((d, i) => (i === index ? { ...d, ...patch } : d)));

  const move = (index: number, delta: number) =>
    setDays((current) => {
      const next = [...current];
      const [day] = next.splice(index, 1);
      next.splice(index + delta, 0, day);
      return next;
    });

  return (
    <div className="sm:col-span-2">
      <input type="hidden" name="itinerary" value={JSON.stringify(days)} />
      {error ? (
        <p role="alert" className="mb-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {days.length === 0 ? (
        <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
          No days yet. Add the first day of the trip.
        </p>
      ) : null}
      <ol className="space-y-4">
        {days.map((day, i) => (
          <li key={i} className="rounded-xl border bg-background p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-turquoise-deep">Day {i + 1}</p>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Move day ${i + 1} up`}
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                >
                  <ArrowUp aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Move day ${i + 1} down`}
                  disabled={i === days.length - 1}
                  onClick={() => move(i, 1)}
                >
                  <ArrowDown aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove day ${i + 1}`}
                  onClick={() => setDays((d) => d.filter((_, j) => j !== i))}
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Title</span>
                <input
                  className={input}
                  value={day.title}
                  maxLength={160}
                  onChange={(e) => update(i, { title: e.target.value })}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Overnight</span>
                <input
                  className={input}
                  value={day.overnight}
                  maxLength={120}
                  placeholder="e.g. Stone Town (leave empty on the last day)"
                  onChange={(e) => update(i, { overnight: e.target.value })}
                />
              </label>
              <label className="block text-sm sm:col-span-2">
                <span className="mb-1 block font-medium">What happens</span>
                <textarea
                  className={`${input} h-auto py-2`}
                  rows={3}
                  value={day.description}
                  maxLength={3000}
                  onChange={(e) => update(i, { description: e.target.value })}
                />
              </label>
              <fieldset className="sm:col-span-2">
                <legend className="mb-1 text-sm font-medium">Meals included</legend>
                <div className="flex flex-wrap gap-4">
                  {MEALS.map((meal) => (
                    <label key={meal} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="size-4"
                        checked={day.meals.includes(meal)}
                        onChange={(e) =>
                          update(i, {
                            meals: e.target.checked
                              ? MEALS.filter((m) => m === meal || day.meals.includes(m))
                              : day.meals.filter((m) => m !== meal),
                          })
                        }
                      />
                      {meal}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          </li>
        ))}
      </ol>
      <Button
        type="button"
        variant="outline"
        className="mt-4"
        onClick={() =>
          setDays((d) => [...d, { title: "", description: "", meals: [], overnight: "" }])
        }
      >
        <Plus aria-hidden="true" data-icon="inline-start" />
        Add day
      </Button>
    </div>
  );
}
