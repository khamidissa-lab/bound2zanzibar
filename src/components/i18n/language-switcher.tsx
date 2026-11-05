"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Check, ChevronDown, Globe } from "lucide-react";

import { useI18n } from "@/i18n/client";
import {
  LOCALE_COOKIE,
  LOCALE_INFO,
  LOCALES,
  localizePath,
  splitLocale,
  type Locale,
} from "@/i18n/config";
import { cn } from "@/lib/utils";

/** Remembers the choice for a year so unprefixed links open in this language. */
export function rememberLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
}

/**
 * Language menu. Each option is a real link to the same page in that
 * language (works without JavaScript and for search engines); the page
 * reloads so the document language and direction switch too.
 */
export function LanguageSwitcher({
  variant = "header",
  className,
}: {
  /** `list` renders all languages inline (mobile menu). */
  variant?: "header" | "list";
  className?: string;
}) {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const { path } = splitLocale(pathname ?? "/");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const options = LOCALES.map((l) => (
    <li key={l}>
      <a
        href={localizePath(l, path)}
        hrefLang={l}
        lang={l}
        aria-current={l === locale ? "true" : undefined}
        onClick={() => rememberLocale(l)}
        className={cn(
          "flex items-center justify-between gap-6 px-4 py-2.5 text-sm transition-colors",
          variant === "list"
            ? "border border-white/20 text-white/85 hover:border-white/60 hover:text-white aria-[current=true]:border-gold-light aria-[current=true]:text-gold-light"
            : "text-ocean-deep hover:bg-sand-soft aria-[current=true]:font-semibold",
        )}
      >
        {LOCALE_INFO[l].native}
        {l === locale && variant !== "list" ? (
          <Check className="size-4 text-turquoise-deep" aria-hidden="true" />
        ) : null}
      </a>
    </li>
  ));

  if (variant === "list") {
    return (
      <nav aria-label={t.language.choose} className={className}>
        <p className="eyebrow mb-3 text-gold-light">{t.language.label}</p>
        <ul className="grid grid-cols-2 gap-2">{options}</ul>
      </nav>
    );
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`${t.language.choose}: ${LOCALE_INFO[locale].native}`}
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 items-center gap-1.5 px-2 text-[0.75rem] font-semibold tracking-[0.12em] text-ocean-deep uppercase hover:text-turquoise-deep sm:h-10"
      >
        <Globe className="size-4" aria-hidden="true" />
        {locale}
        <ChevronDown
          className={cn("size-3.5 transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>
      <ul
        id={menuId}
        hidden={!open}
        className="absolute end-0 z-50 mt-2 min-w-44 border border-ocean-deep/15 bg-ivory py-1 shadow-card"
      >
        {options}
      </ul>
    </div>
  );
}
