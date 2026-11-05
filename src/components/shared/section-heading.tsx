import { LocaleLink as Link } from "@/components/i18n/locale-link";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  id: string;
  /** Editorial section number, e.g. "01". */
  index?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  link?: { href: string; label: string };
  /** `dark` for ocean-coloured sections. */
  tone?: "light" | "dark";
  /** Keep title and description in one column (for narrow columns). */
  stacked?: boolean;
  className?: string;
};

/**
 * Editorial section opener: a hairline rule carrying the section number and
 * label, then a large serif title with the description set beside it.
 */
export function SectionHeading({
  id,
  index,
  eyebrow,
  title,
  description,
  link,
  tone = "light",
  stacked = false,
  className,
}: SectionHeadingProps) {
  const dark = tone === "dark";
  return (
    <div className={cn("mb-10 sm:mb-14", className)}>
      {index || eyebrow ? (
        <div
          className={cn(
            "eyebrow mb-6 flex items-center gap-4 border-t pt-4",
            dark
              ? "border-white/20 text-gold-light"
              : "border-ocean-deep/15 text-gold-deep",
          )}
        >
          {index ? <span className="tabular-nums">{index}</span> : null}
          {index && eyebrow ? (
            <span
              aria-hidden="true"
              className={cn("h-px w-8", dark ? "bg-white/30" : "bg-ocean-deep/25")}
            />
          ) : null}
          {eyebrow ? <span>{eyebrow}</span> : null}
        </div>
      ) : null}
      <div
        className={cn(
          "grid gap-5",
          !stacked &&
            "lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-end lg:gap-16",
        )}
      >
        <h2
          id={id}
          className={cn("display-lg max-w-3xl", dark ? "text-ivory" : "text-ocean-deep")}
        >
          {title}
        </h2>
        {description || link ? (
          <div
            className={cn(
              "flex flex-col items-start gap-4 lg:pb-2",
              // A lone link sits flush right, like a magazine's "continue" cue.
              !description && !stacked && "lg:items-end",
            )}
          >
            {description ? (
              <p
                className={cn(
                  "max-w-md text-[1.05rem] leading-relaxed",
                  dark ? "text-white/75" : "text-muted-foreground",
                )}
              >
                {description}
              </p>
            ) : null}
            {link ? (
              <Link
                href={link.href}
                className={cn(
                  "link-underline inline-flex items-center gap-1.5 pb-0.5 text-sm font-semibold",
                  dark ? "text-ivory" : "text-ocean-deep",
                )}
              >
                {link.label}
                <ArrowUpRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
