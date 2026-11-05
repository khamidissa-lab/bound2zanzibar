import type { Metadata } from "next";

import { DEFAULT_LOCALE, isLocale, LOCALES, localizePath, type Locale } from "./config";

/** Canonical URL plus hreflang links to every language version of a page. */
export function localeAlternates(locale: Locale, path: string): Metadata["alternates"] {
  return {
    canonical: localizePath(locale, path),
    languages: {
      ...Object.fromEntries(LOCALES.map((l) => [l, localizePath(l, path)])),
      "x-default": path,
    },
  };
}

/** The route's locale param, falling back to English for anything unknown. */
export function pageLocale(value: string): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
