"use client";

import { createContext, useContext, type ReactNode } from "react";

import { DEFAULT_LOCALE, localizePath, type Locale } from "./config";
import { fmt, formatDateIn, formatPriceIn } from "./format";
import { en, type Messages } from "./messages/en";

const I18nContext = createContext<{ locale: Locale; t: Messages } | null>(null);

/** Gives client components the current language and its interface text. */
export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: ReactNode;
}) {
  return (
    <I18nContext.Provider value={{ locale, t: messages }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  const { locale, t } = ctx;
  return {
    locale,
    t,
    href: (path: string) => localizePath(locale, path),
    fmt,
    price: (amount: number, currency: string) => formatPriceIn(locale, amount, currency),
    date: (isoDate: string) => formatDateIn(locale, isoDate),
  };
}

/** Interface text, or English outside the public site (e.g. admin previews). */
export function useMessagesOrEnglish(): Messages {
  return useContext(I18nContext)?.t ?? en;
}

/** Current language, or English outside the public site (e.g. admin previews). */
export function useLocaleOrDefault(): Locale {
  return useContext(I18nContext)?.locale ?? DEFAULT_LOCALE;
}
