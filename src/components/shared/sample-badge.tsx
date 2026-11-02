import { cn } from "@/lib/utils";

/** Marks content as sample/demo until the owner supplies verified content. */
export function SampleBadge({
  className,
  label = "Sample content",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full border border-dashed border-gold bg-gold/10 px-2.5 py-0.5 text-[0.7rem] font-medium text-ocean-deep",
        className,
      )}
    >
      {label}
    </span>
  );
}
