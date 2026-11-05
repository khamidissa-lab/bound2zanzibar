import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";

import { I18nProvider } from "@/i18n/client";
import { isLocale, LOCALE_INFO, LOCALES } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { getSiteUrl } from "@/lib/site-url";

import { fontVariables } from "../fonts";
import "../globals.css";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { meta } = getMessages(locale);
  return {
    metadataBase: getSiteUrl(),
    title: {
      default: `${meta.siteName} — ${meta.tagline}`,
      template: `%s | ${meta.siteName}`,
    },
    description: meta.description,
    applicationName: meta.siteName,
    openGraph: {
      type: "website",
      siteName: meta.siteName,
      title: meta.siteName,
      description: meta.description,
      locale: LOCALE_INFO[locale].og,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#0A2A38",
};

/** Root layout for the public site, one per language (sets lang and dir). */
export default async function LocaleRootLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html
      lang={locale}
      dir={LOCALE_INFO[locale].dir}
      className={`${fontVariables} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <I18nProvider locale={locale} messages={getMessages(locale)}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
