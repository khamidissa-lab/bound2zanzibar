import { localizePath, type Locale } from "./config";
import { fmt, formatDateIn, formatPriceIn } from "./format";
import { getMessages } from "./messages";

/** Everything a server component needs to render in a language. */
export function getI18n(locale: Locale) {
  return {
    locale,
    t: getMessages(locale),
    href: (path: string) => localizePath(locale, path),
    fmt,
    price: (amount: number, currency: string) => formatPriceIn(locale, amount, currency),
    date: (isoDate: string) => formatDateIn(locale, isoDate),
  };
}

export type I18n = ReturnType<typeof getI18n>;
