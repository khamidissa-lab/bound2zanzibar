"use client";

import { LocaleLink as Link } from "@/components/i18n/locale-link";
import { useMessagesOrEnglish } from "@/i18n/client";
import { cn } from "@/lib/utils";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({
  items,
  className,
  tone = "light",
}: {
  items: Crumb[];
  className?: string;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  const t = useMessagesOrEnglish();
  return (
    <nav aria-label={t.nav.breadcrumb} className={className}>
      <ol
        className={cn(
          "flex flex-wrap items-center gap-x-2 gap-y-1 text-xs tracking-[0.08em] uppercase",
          dark ? "text-white/65" : "text-muted-foreground",
        )}
      >
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className={cn(
                    "link-underline",
                    dark ? "hover:text-white" : "hover:text-ocean-deep",
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={last ? "page" : undefined}
                  className={cn(last && (dark ? "text-white" : "text-ocean-deep"))}
                >
                  {item.label}
                </span>
              )}
              {!last ? (
                <span aria-hidden="true" className="opacity-60">
                  /
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
