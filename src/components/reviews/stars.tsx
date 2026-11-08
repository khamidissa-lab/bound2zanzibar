import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Five stars for a rating, rounded to the nearest whole star. The label is
 * the accessible text (e.g. "4.5 out of 5 stars"); the icons are decorative.
 */
export function Stars({
  rating,
  label,
  className,
}: {
  rating: number;
  label: string;
  className?: string;
}) {
  const filled = Math.round(rating);
  return (
    <span role="img" aria-label={label} className={cn("inline-flex gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          aria-hidden="true"
          className={cn(
            "size-[1em]",
            n <= filled ? "fill-gold text-gold" : "fill-transparent text-ocean-deep/25",
          )}
        />
      ))}
    </span>
  );
}
