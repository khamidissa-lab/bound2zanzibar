import { Suspense } from "react";
import { ArrowUpRight, MessageCircle, Phone } from "lucide-react";

import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { LocaleLink as Link } from "@/components/i18n/locale-link";
import { buttonVariants } from "@/components/ui/button";
import {
  bookNowHref,
  contact,
  localizedMainNav,
  socialLinks,
  whatsappLink,
} from "@/config/site";
import type { Locale } from "@/i18n/config";
import { getI18n } from "@/i18n/server";

import { DesktopNav } from "./desktop-nav";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { NavLinks } from "./nav-links";

const instagram = socialLinks.find((s) => s.label === "Instagram" && s.href);

export function SiteHeader({ locale }: { locale: Locale }) {
  const { t } = getI18n(locale);
  const nav = localizedMainNav(t);
  // Languages with long menu labels switch to the menu button below 1536px.
  const compactNav = locale === "en" || locale === "ar";

  return (
    <>
      {/* Slim editorial top bar with real contact routes (not sticky). */}
      <nav
        aria-label={t.nav.quickContact}
        className="hidden bg-ocean-deep text-[0.72rem] text-white/75 md:block"
      >
        <div className="container-page flex h-9 items-center justify-between gap-6">
          <p className="tracking-[0.18em] uppercase">{t.nav.topBar}</p>
          <ul className="flex items-center gap-5">
            <li>
              <a
                href={`tel:${contact.phone}`}
                dir="ltr"
                className="inline-flex items-center gap-1.5 hover:text-white"
              >
                <Phone className="size-3" aria-hidden="true" />
                {contact.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-white"
              >
                <MessageCircle className="size-3" aria-hidden="true" />
                {t.nav.whatsapp}
                <span className="sr-only">{t.nav.opensWhatsApp}</span>
              </a>
            </li>
            {instagram?.href ? (
              <li>
                <a
                  href={instagram.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  dir="ltr"
                  className="inline-flex items-center gap-1 hover:text-white"
                >
                  {instagram.handle}
                  <ArrowUpRight className="size-3" aria-hidden="true" />
                  <span className="sr-only">{t.nav.instagramNewTab}</span>
                </a>
              </li>
            ) : null}
          </ul>
        </div>
      </nav>

      {/* Solid (not translucent) so the multiplied logo stays clean. */}
      <header className="sticky top-0 z-40 border-b border-ocean-deep/10 bg-warm-white">
        <div className="container-page flex h-[var(--header-height)] items-center justify-between gap-4">
          <Logo priority homeLabel={t.nav.home} />

          <nav
            aria-label={t.nav.main}
            className={compactNav ? "hidden xl:block" : "hidden 2xl:block"}
          >
            <Suspense
              fallback={<NavLinks items={nav} pathname={null} variant="desktop" />}
            >
              <DesktopNav items={nav} />
            </Suspense>
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Reads the URL, so it waits for it on pages built without one. */}
            <Suspense
              fallback={
                <span className="flex h-9 items-center px-2 text-[0.75rem] font-semibold tracking-[0.12em] text-ocean-deep uppercase sm:h-10">
                  {locale}
                </span>
              }
            >
              <LanguageSwitcher />
            </Suspense>
            <Link
              href={bookNowHref}
              className={buttonVariants({
                size: "sm",
                className: "sm:h-10 sm:px-5",
              })}
            >
              {t.nav.bookNow}
              <ArrowUpRight
                aria-hidden="true"
                data-icon="inline-end"
                className="rtl:-scale-x-100"
              />
            </Link>
            <div className={compactNav ? "xl:hidden" : "2xl:hidden"}>
              <MobileNav items={nav} />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
