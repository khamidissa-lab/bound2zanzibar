import { cacheLife } from "next/cache";
import Link from "next/link";

import { contactDetails, footerNav, siteConfig, socialLinks } from "@/config/site";

import { Logo } from "./logo";

async function getCopyrightYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

function PendingValue() {
  return (
    <span className="inline-flex items-center rounded-full border border-dashed border-white/30 px-2 py-0.5 text-xs text-white/70">
      To be supplied by owner
    </span>
  );
}

export async function SiteFooter() {
  const year = await getCopyrightYear();

  return (
    <footer className="bg-tide mt-auto bg-ocean-deep text-white">
      <div className="container-page grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)_1.4fr]">
        <div className="space-y-4">
          <Logo variant="full" size={148} />
          <p className="max-w-xs text-sm leading-relaxed text-white/75">
            {siteConfig.tagline} Tours, safaris and travel packages for local and
            international travellers.
          </p>
        </div>

        {footerNav.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="mb-4 font-sans text-sm font-semibold tracking-wide text-gold">
              {group.title}
            </h2>
            <ul className="space-y-2.5 text-sm">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-white/80 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div>
          <h2 className="mb-4 font-sans text-sm font-semibold tracking-wide text-gold">
            Get in touch
          </h2>
          <dl className="space-y-3 text-sm">
            {contactDetails.map((field) => (
              <div key={field.label}>
                <dt className="text-white/60">{field.label}</dt>
                <dd className="mt-1 text-white/90">
                  {field.value && field.href ? (
                    <a
                      href={field.href}
                      className="break-all hover:text-white hover:underline"
                    >
                      {field.value}
                    </a>
                  ) : (
                    (field.value ?? <PendingValue />)
                  )}
                </dd>
              </div>
            ))}
          </dl>
          <h3 className="mt-6 mb-3 font-sans text-sm font-semibold text-white/60">
            Follow us
          </h3>
          <ul className="flex flex-wrap gap-2 text-sm">
            {socialLinks.map((social) =>
              social.href ? (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-white/25 px-3 py-1 text-white/85 hover:border-white/60 hover:text-white"
                  >
                    {social.label}
                  </a>
                </li>
              ) : (
                <li
                  key={social.label}
                  className="rounded-full border border-dashed border-white/25 px-3 py-1 text-white/55"
                  title="Profile link to be supplied by owner"
                >
                  {social.label}
                  <span className="sr-only"> (link to be supplied by owner)</span>
                </li>
              ),
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.name}. All rights reserved.
          </p>
          <p>Zanzibar, Tanzania</p>
        </div>
      </div>
    </footer>
  );
}
