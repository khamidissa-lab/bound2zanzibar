"use client";

import { useMessagesOrEnglish } from "@/i18n/client";
import { cn } from "@/lib/utils";

/** Marks content as sample/demo until the owner supplies verified content. */
export function SampleBadge({
  className,
  label,
}: {
  className?: string;
  label?: string;
}) {
  const t = useMessagesOrEnglish();
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 border border-dashed border-gold-deep/60 bg-gold/10 px-2 py-0.5 text-[0.65rem] font-semibold tracking-[0.12em] text-ocean-deep uppercase",
        className,
      )}
    >
      {label ?? t.common.sampleContent}
    </span>
  );
}
