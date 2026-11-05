import type { Metadata } from "next";
import { BookOpen } from "lucide-react";

import { ArticleCard } from "@/components/content/cards";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { SampleBadge } from "@/components/shared/sample-badge";
import { getMessages } from "@/i18n/messages";
import { localeAlternates, pageLocale } from "@/i18n/seo";
import { getArticles } from "@/services/content";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/travel-guide">): Promise<Metadata> {
  const locale = pageLocale((await params).locale);
  const t = getMessages(locale);
  return {
    title: t.guide.metaTitle,
    description: t.guide.metaDescription,
    alternates: localeAlternates(locale, "/travel-guide"),
  };
}

export default async function TravelGuidePage({
  params,
}: PageProps<"/[locale]/travel-guide">) {
  const locale = pageLocale((await params).locale);
  const t = getMessages(locale);
  const g = t.guide;
  const articles = await getArticles(locale);

  return (
    <>
      <PageHeader
        eyebrow={g.eyebrow}
        title={g.title}
        description={g.description}
        crumbs={[{ label: t.nav.home, href: "/" }, { label: t.nav.travelGuide }]}
        tone="sand"
      >
        <SampleBadge label={g.sample} />
      </PageHeader>

      <section aria-labelledby="all-articles" className="container-page py-16 sm:py-24">
        <h2 id="all-articles" className="sr-only">
          {g.all}
        </h2>
        {articles.length > 0 ? (
          <div className="grid gap-x-10 gap-y-16 lg:grid-cols-12">
            {articles.map((article, i) => (
              <ArticleCard
                key={article.slug}
                article={article}
                variant={i === 0 ? "lead" : "default"}
                className={i === 0 ? "lg:col-span-12" : "reveal lg:col-span-6"}
                imageClassName={i === 0 ? "aspect-[4/3] lg:aspect-[21/9]" : undefined}
              />
            ))}
          </div>
        ) : (
          <EmptyState icon={BookOpen} title={g.emptyTitle}>
            {g.emptyBody}
          </EmptyState>
        )}
      </section>
    </>
  );
}
