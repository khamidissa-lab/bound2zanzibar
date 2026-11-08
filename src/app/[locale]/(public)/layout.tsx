import { Suspense } from "react";
import { notFound } from "next/navigation";

import { AssistantWidget } from "@/components/assistant/assistant-widget";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { VisitorTracker } from "@/components/visitors/visitor-tracker";
import { isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";

export default async function PublicLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getMessages(locale);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only z-50 bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:start-3 focus:top-3"
      >
        {t.nav.skipToContent}
      </a>
      <SiteHeader locale={locale} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter locale={locale} />
      <Suspense fallback={null}>
        <AssistantWidget />
      </Suspense>
      {/* Reads the URL, so it streams in after the static shell. */}
      <Suspense fallback={null}>
        <VisitorTracker strings={t.consent} />
      </Suspense>
    </>
  );
}
