import type { Metadata } from "next";
import Image from "next/image";

import { LocaleLink as Link } from "@/components/i18n/locale-link";
import { PageHeader } from "@/components/shared/page-header";
import { attributedPhotos } from "@/config/photo-credits";
import { getMessages } from "@/i18n/messages";
import { localeAlternates, pageLocale } from "@/i18n/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/photo-credits">): Promise<Metadata> {
  const locale = pageLocale((await params).locale);
  const t = getMessages(locale);
  return {
    title: t.legal.photoCreditsTitle,
    description: t.legal.photoCreditsIntro,
    alternates: localeAlternates(locale, "/photo-credits"),
  };
}

/** Credits that photo licences (e.g. CC BY-SA) require to be visible. */
export default async function PhotoCreditsPage({
  params,
}: PageProps<"/[locale]/photo-credits">) {
  const locale = pageLocale((await params).locale);
  const t = getMessages(locale);
  const l = t.legal;

  return (
    <>
      <PageHeader
        eyebrow={l.eyebrow}
        title={l.photoCreditsTitle}
        description={l.photoCreditsIntro}
        crumbs={[{ label: t.nav.home, href: "/" }, { label: l.photoCreditsTitle }]}
      />
      <section className="container-page py-14 sm:py-20">
        <ul className="grid max-w-4xl gap-6">
          {attributedPhotos.map((photo) => (
            <li
              key={photo.src}
              className="grid gap-5 border border-ocean-deep/15 bg-ivory p-4 sm:grid-cols-[12rem_minmax(0,1fr)] sm:p-5"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={photo.src}
                  alt=""
                  fill
                  sizes="(min-width: 640px) 12rem, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 text-sm leading-relaxed text-ocean-deep/85">
                <h2 className="font-display text-xl text-ocean-deep">
                  <a
                    href={photo.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline"
                  >
                    {photo.title}
                  </a>
                </h2>
                <dl className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1">
                  <dt className="text-muted-foreground">{l.photoCreditsBy}</dt>
                  <dd>{photo.author}</dd>
                  <dt className="text-muted-foreground">{l.photoCreditsLicence}</dt>
                  <dd>
                    <a
                      href={photo.licenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-underline"
                    >
                      {photo.licence}
                    </a>
                  </dd>
                  <dt className="text-muted-foreground">{l.photoCreditsUsedOn}</dt>
                  <dd>
                    <Link href={photo.usedOn.href} className="link-underline">
                      {photo.usedOn.label}
                    </Link>
                  </dd>
                </dl>
                <p className="mt-2 text-xs text-muted-foreground">
                  {l.photoCreditsChanges}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
