import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";

import { WhyTravel } from "@/components/content/why-travel";
import { LocaleLink as Link } from "@/components/i18n/locale-link";
import { PageHeader } from "@/components/shared/page-header";
import { SampleBadge } from "@/components/shared/sample-badge";
import { buttonVariants } from "@/components/ui/button";
import { getMessages } from "@/i18n/messages";
import { localeAlternates, pageLocale } from "@/i18n/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/about">): Promise<Metadata> {
  const locale = pageLocale((await params).locale);
  const t = getMessages(locale);
  return {
    title: t.about.metaTitle,
    description: t.about.metaDescription,
    alternates: localeAlternates(locale, "/about"),
  };
}

export default async function AboutPage({ params }: PageProps<"/[locale]/about">) {
  const locale = pageLocale((await params).locale);
  const t = getMessages(locale);
  const a = t.about;

  return (
    <>
      <PageHeader
        eyebrow={a.eyebrow}
        title={a.title}
        description={a.description}
        crumbs={[{ label: t.nav.home, href: "/" }, { label: t.nav.about }]}
        image={{
          src: "/images/photos/beach-hut.jpg",
          alt: a.headerAlt,
          theme: "sunset",
        }}
      />

      <section className="container-page grid gap-14 py-20 sm:py-28 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-20">
        <div>
          <SampleBadge label={a.draft} className="mb-8" />
          <p className="font-display text-3xl leading-snug text-ocean-deep sm:text-4xl">
            {a.lead}
          </p>
          <div className="mt-10 grid gap-8 text-lg leading-relaxed text-ink/90 sm:grid-cols-2">
            <p>{a.p1}</p>
            <p>{a.p2}</p>
          </div>
        </div>

        <div className="self-start border border-dashed border-gold-deep/50 bg-ivory p-7">
          <p className="eyebrow text-gold-deep">{a.toBePublished}</p>
          <h2 className="mt-3 font-display text-3xl">{a.companyDetails}</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">{a.companyBody}</p>
        </div>
      </section>

      <div className="bg-sand-soft">
        <WhyTravel locale={locale} />
      </div>

      <section className="bg-ocean-deep py-20 text-center text-ivory sm:py-24">
        <div className="container-page">
          <h2 className="display-lg text-ivory">{a.ready}</h2>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href="/tours"
              className={buttonVariants({ size: "lg", variant: "light" })}
            >
              {t.common.exploreTours}
              <ArrowUpRight
                aria-hidden="true"
                data-icon="inline-end"
                className="rtl:-scale-x-100"
              />
            </Link>
            <Link
              href="/contact"
              className={buttonVariants({ size: "lg", variant: "outline-light" })}
            >
              {t.common.contactUs}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
