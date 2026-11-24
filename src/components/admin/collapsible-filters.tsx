"use client";

import { useId, useState, type ReactNode } from "react";
import { SlidersHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Extra filter fields that fold away on phones behind a "Filters" button and
 * are always shown from the small breakpoint up. The wrapper uses
 * `display: contents`, so the fields stay part of the parent form's grid.
 */
export function CollapsibleFilters({
  activeCount,
  children,
}: {
  /** How many of these filters are in use (shown on the button, opens it). */
  activeCount: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(activeCount > 0);
  const id = useId();
  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-10 w-fit items-center gap-2 rounded-lg border bg-background px-3 text-sm font-medium text-ocean-deep sm:hidden"
      >
        <SlidersHorizontal className="size-4" aria-hidden="true" />
        Filters
        {activeCount > 0 ? (
          <span className="rounded-full bg-ocean-deep px-1.5 text-xs text-white tabular-nums">
            {activeCount}
          </span>
        ) : null}
      </button>
      <div id={id} className={cn(open ? "contents" : "hidden", "sm:contents")}>
        {children}
      </div>
    </>
  );
}
