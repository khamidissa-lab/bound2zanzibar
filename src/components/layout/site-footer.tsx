import { cacheLife } from "next/cache";
import { ArrowUpRight, MessageCircle } from "lucide-react";

import { LocaleLink as Link } from "@/components/i18n/locale-link";
import { buttonVariants } from "@/components/ui/button";
import { NewsletterForm } from "@/components/visitors/newsletter-form";
import { CookieSettingsButton } from "@/components/visitors/visitor-tracker";
import {
  bookNowHref,
  localizedContactDetails,
  localizedFooterNav,
  siteConfig,
  socialLinks,
  whatsappLink,
} from "@/config/site";
import type { Locale } from "@/i18n/config";
import { getI18n } from "@/i18n/server";

import { Logo } from "./logo";

async function getCopyrightYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export async function SiteFooter({ locale }: { locale: Locale }) {
  const year = await getCopyrightYear();
  const { t } = getI18n(locale);

  return (
    <footer className="mt-auto bg-ocean-deep text-ivory">
      {/* Closing statement with real ways to start planning. */}
      <div className="container-page">
        <div className="grid gap-10 border-b border-white/10 py-16 sm:py-20 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-end">
          <p className="display-lg text-ivory">
            {t.footer.statementBefore}{" "}
            <em className="text-gold-light">{t.footer.statementPlace}</em>
          </p>
          <div className="space-y-6">
            <p className="max-w-sm leading-relaxed text-white/70">{t.footer.intro}</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={bookNowHref}
                className={buttonVariants({ variant: "light", size: "lg" })}
              >
                {t.footer.planJourney}
                <ArrowUpRight
                  aria-hidden="true"
                  data-icon="inline-end"
                  className="rtl:-scale-x-100"
                />
              </Link>
              <a
                href={whatsappLink(t.footer.whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "outline-light", size: "lg" })}
              >
                <MessageCircle aria-hidden="true" data-icon="inline-start" />
                {t.footer.whatsappUs}
                <span className="sr-only">{t.nav.opensWhatsApp}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="container-page grid gap-12 py-14 md:grid-cols-2 lg:grid-cols-[1.3fr_repeat(3,1fr)_1.5fr]">
        <div className="space-y-5">
          <Logo variant="full" size={120} homeLabel={t.nav.home} />
          <p className="max-w-xs text-sm leading-relaxed text-white/65">
            {t.meta.tagline} {t.footer.about}
          </p>
        </div>

        {localizedFooterNav(t).map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="eyebrow mb-5 text-gold-light">{group.title}</h2>
            <ul className="space-y-3 text-sm">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="link-underline text-white/75 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div>
          <h2 className="eyebrow mb-5 text-gold-light">{t.footer.getInTouch}</h2>
          <dl className="space-y-3.5 text-sm">
            {localizedContactDetails(t).map((field) => (
              <div key={field.label}>
                <dt className="text-xs text-white/50">{field.label}</dt>
                <dd className="mt-0.5 text-white/90">
                  {field.value && field.href ? (
                    <a
                      href={field.href}
                      dir="ltr"
                      className="link-underline break-all hover:text-white"
                    >
                      {field.value}
                    </a>
                  ) : (
                    (field.value ?? (
                      <span className="inline-flex items-center border border-dashed border-white/30 px-2 py-0.5 text-xs text-white/70">
                        {t.footer.pending}
                      </span>
                    ))
                  )}
                </dd>
              </div>
            ))}
          </dl>
          <h3 className="eyebrow mt-7 mb-3 text-white/50">{t.footer.followUs}</h3>
          <ul className="flex flex-wrap gap-2 text-sm">
            {socialLinks.map((social) =>
              social.href ? (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 border border-white/25 px-3 py-1 text-white/85 hover:border-white/70 hover:text-white"
                  >
                    {social.label}
                    <ArrowUpRight className="size-3" aria-hidden="true" />
                  </a>
                </li>
              ) : (
                <li
                  key={social.label}
                  className="border border-dashed border-white/20 px-3 py-1 text-white/50"
                  title={t.footer.pending}
                >
                  {social.label}
                  <span className="sr-only"> {t.footer.linkPending}</span>
                </li>
              ),
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page py-10">
          <NewsletterForm strings={t.newsletter} locale={locale} />
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs tracking-[0.06em] text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.name}. {t.footer.rights}
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <CookieSettingsButton label={t.consent.settings} />
            <p className="uppercase">{t.footer.place}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
