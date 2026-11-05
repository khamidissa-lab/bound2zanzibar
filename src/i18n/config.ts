/**
 * Supported website languages. English is the default and keeps unprefixed
 * URLs (/tours); every other language lives under its code (/fr/tours).
 * The admin is English-only.
 */
export const LOCALES = ["en", "fr", "de", "it", "ar", "tr"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Languages other than English (content translations exist for these). */
export const TRANSLATED_LOCALES = LOCALES.filter(
  (l): l is Exclude<Locale, "en"> => l !== DEFAULT_LOCALE,
);
export type TranslatedLocale = Exclude<Locale, "en">;

export const LOCALE_INFO: Record<
  Locale,
  {
    /** Name in the language itself, for the switcher. */
    native: string;
    /** English name, for the admin. */
    english: string;
    dir: "ltr" | "rtl";
    /** BCP 47 tag for Intl number/date formatting. */
    intl: string;
    /** Open Graph locale. */
    og: string;
  }
> = {
  en: { native: "English", english: "English", dir: "ltr", intl: "en-GB", og: "en_GB" },
  fr: { native: "Français", english: "French", dir: "ltr", intl: "fr-FR", og: "fr_FR" },
  de: { native: "Deutsch", english: "German", dir: "ltr", intl: "de-DE", og: "de_DE" },
  it: { native: "Italiano", english: "Italian", dir: "ltr", intl: "it-IT", og: "it_IT" },
  // Latin digits keep prices and dates consistent with the rest of the site.
  ar: {
    native: "العربية",
    english: "Arabic",
    dir: "rtl",
    intl: "ar-u-nu-latn",
    og: "ar_AR",
  },
  tr: { native: "Türkçe", english: "Turkish", dir: "ltr", intl: "tr-TR", og: "tr_TR" },
};

/** Cookie remembering a visitor's chosen language. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** "/tours" → "/fr/tours" (English stays unprefixed). Leaves external URLs alone. */
export function localizePath(locale: Locale, path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  if (locale === DEFAULT_LOCALE) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/** "/fr/tours?x=1" → { locale: "fr", path: "/tours?x=1" }; unprefixed → English. */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const match = pathname.match(/^\/([a-z]{2})(?=\/|$|\?|#)/);
  if (match && isLocale(match[1])) {
    const rest = pathname.slice(match[0].length);
    return { locale: match[1], path: rest.startsWith("/") ? rest : `/${rest}` };
  }
  return { locale: DEFAULT_LOCALE, path: pathname || "/" };
}
