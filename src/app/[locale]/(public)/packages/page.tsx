import type { Metadata } from "next";
import { Package } from "lucide-react";

import { PackageCard } from "@/components/content/cards";
import { MarketSwitcher } from "@/components/pricing/market-switcher";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { SampleBadge } from "@/components/shared/sample-badge";
import { SectionHeading } from "@/components/shared/section-heading";
import { getMessages } from "@/i18n/messages";
import { localeAlternates, pageLocale } from "@/i18n/seo";
import { getPackages } from "@/services/content";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/packages">): Promise<Metadata> {
  const locale = pageLocale((await params).locale);
  const t = getMessages(locale);
  return {
    title: t.packages.metaTitle,
    description: t.packages.metaDescription,
    alternates: localeAlternates(locale, "/packages"),
  };
}

export default async function PackagesPage({ params }: PageProps<"/[locale]/packages">) {
  const locale = pageLocale((await params).locale);
  const t = getMessages(locale);
  const p = t.packages;
  const packages = await getPackages({}, locale);
  const island = packages.filter((pkg) => !pkg.isSafari);
  const safari = packages.filter((pkg) => pkg.isSafari);

  return (
    <>
      <PageHeader
        eyebrow={p.eyebrow}
        title={p.title}
        description={p.description}
        crumbs={[{ label: t.nav.home, href: "/" }, { label: t.nav.packages }]}
        tone="sand"
        image={{
          src: "/images/photos/palm-beach.jpg",
          alt: p.headerAlt,
          theme: "sunset",
        }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <MarketSwitcher />
          <SampleBadge label={t.price.samplePackages} />
        </div>
      </PageHeader>

      <div className="container-page space-y-24 py-16 sm:py-24">
        {packages.length === 0 ? (
          <EmptyState icon={Package} title={p.emptyTitle}>
            {p.emptyBody}
          </EmptyState>
        ) : null}

        {island.length > 0 ? (
          <section aria-labelledby="island-heading">
            <SectionHeading
              id="island-heading"
              index="01"
              eyebrow={p.islandEyebrow}
              title={p.islandTitle}
            />
            <div className="border-b border-ocean-deep/15">
              {island.map((pkg) => (
                <PackageCard key={pkg.slug} pkg={pkg} variant="row" className="reveal" />
              ))}
            </div>
          </section>
        ) : null}

        {safari.length > 0 ? (
          <section aria-labelledby="safari-heading">
            <SectionHeading
              id="safari-heading"
              index="02"
              eyebrow={p.safariEyebrow}
              title={p.safariTitle}
              link={{ href: "/safari", label: p.aboutSafaris }}
            />
            <div className="border-b border-ocean-deep/15">
              {safari.map((pkg) => (
                <PackageCard key={pkg.slug} pkg={pkg} variant="row" className="reveal" />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}
