"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function monthMatrix(year: number, month: number) {
  const first = new Date(Date.UTC(year, month, 1));
  const offset = (first.getUTCDay() + 6) % 7; // Monday-first
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(Date.UTC(year, month, 1 - offset + i));
    return {
      iso: d.toISOString().slice(0, 10),
      day: d.getUTCDate(),
      inMonth: d.getUTCMonth() === month,
    };
  });
}

/**
 * Month calendar of preferred travel dates from booking requests. Days with
 * requests are filled; today is ringed. `today` comes from the server (in
 * Zanzibar time) so server and client render the same month.
 */
export function BookingCalendar({
  today,
  dates,
}: {
  today: string;
  dates: { date: string; count: number }[];
}) {
  const [y, m] = today.split("-").map(Number);
  const [view, setView] = useState({ year: y, month: m - 1 });
  const counts = new Map(dates.map((d) => [d.date, d.count]));
  const cells = monthMatrix(view.year, view.month);
  const title = new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(view.year, view.month, 1)));
  const monthTotal = cells
    .filter((c) => c.inMonth)
    .reduce((sum, c) => sum + (counts.get(c.iso) ?? 0), 0);
  const shift = (delta: number) =>
    setView(({ year, month }) => {
      const d = new Date(Date.UTC(year, month + delta, 1));
      return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
    });

  return (
    <section
      aria-labelledby="travel-calendar-title"
      className="rounded-xl border bg-card p-5 text-ocean-deep"
    >
      <h2
        id="travel-calendar-title"
        className="mb-4 font-sans text-base font-semibold text-ocean-deep"
      >
        Travel calendar
      </h2>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shift(-1)}
          aria-label="Previous month"
          className="flex size-8 items-center justify-center rounded-lg border bg-card text-ocean-deep hover:bg-muted"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </button>
        <p className="text-base font-semibold" aria-live="polite">
          {title}
        </p>
        <button
          type="button"
          onClick={() => shift(1)}
          aria-label="Next month"
          className="flex size-8 items-center justify-center rounded-lg border bg-card text-ocean-deep hover:bg-muted"
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>
      <table className="w-full table-fixed text-center text-xs">
        <caption className="sr-only">
          Preferred travel dates in {title}: {monthTotal} booking request
          {monthTotal === 1 ? "" : "s"}
        </caption>
        <thead>
          <tr className="text-muted-foreground">
            {WEEKDAYS.map((d) => (
              <th key={d} scope="col" className="pb-2 font-medium">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }, (_, row) => (
            <tr key={row}>
              {cells.slice(row * 7, row * 7 + 7).map((cell) => {
                const count = counts.get(cell.iso) ?? 0;
                const isToday = cell.iso === today;
                return (
                  <td key={cell.iso} className="p-0.5">
                    <span
                      title={
                        count ? `${count} request${count === 1 ? "" : "s"}` : undefined
                      }
                      aria-label={`${cell.day}${count ? `, ${count} booking request${count === 1 ? "" : "s"}` : ""}${isToday ? ", today" : ""}`}
                      className={cn(
                        "mx-auto flex size-8 items-center justify-center rounded-full tabular-nums",
                        !cell.inMonth && "text-muted-foreground/60",
                        count > 0 &&
                          cell.inMonth &&
                          "bg-gold font-semibold text-ocean-deep",
                        isToday && "ring-2 ring-turquoise-deep",
                      )}
                    >
                      {cell.day}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-block size-3 rounded-full bg-gold" aria-hidden="true" />
        Requested travel date · {monthTotal} this month
      </p>
    </section>
  );
}
