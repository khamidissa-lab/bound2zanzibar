import { Suspense } from "react";
import type { Metadata } from "next";
import { BookOpen } from "lucide-react";

import { ArticleCard } from "@/components/content/cards";
import { LocaleLink as Link } from "@/components/i18n/locale-link";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { SampleBadge } from "@/components/shared/sample-badge";
import type { Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { localeAlternates, pageLocale } from "@/i18n/seo";
import { cn } from "@/lib/utils";
import { getArticles } from "@/services/content";
import { ARTICLE_CATEGORIES, type Article, type ArticleCategory } from "@/types/content";

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
  searchParams,
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
          // Without the category the full list renders statically first.
          <Suspense fallback={<ArticleList articles={articles} />}>
            <FilteredArticles
              articles={articles}
              locale={locale}
              searchParams={searchParams}
            />
          </Suspense>
        ) : (
          <EmptyState icon={BookOpen} title={g.emptyTitle}>
            {g.emptyBody}
          </EmptyState>
        )}
      </section>
    </>
  );
}

const isCategory = (v: string | undefined): v is ArticleCategory =>
  (ARTICLE_CATEGORIES as readonly string[]).includes(v ?? "");

async function FilteredArticles({
  articles,
  locale,
  searchParams,
}: {
  articles: Article[];
  locale: Locale;
  searchParams: PageProps<"/[locale]/travel-guide">["searchParams"];
}) {
  const t = getMessages(locale);
  const raw = (await searchParams).category;
  const value = Array.isArray(raw) ? raw[0] : raw;
  const category = isCategory(value) ? value : undefined;
  // Only categories that have articles get a tab.
  const used = ARTICLE_CATEGORIES.filter((c) => articles.some((a) => a.category === c));
  const shown = category ? articles.filter((a) => a.category === category) : articles;
  const tabs: { label: string; href: string; active: boolean }[] = [
    { label: t.journal.all, href: "/travel-guide", active: !category },
    ...used.map((c) => ({
      label: t.journal.categories[c],
      href: `/travel-guide?category=${c}`,
      active: category === c,
    })),
  ];

  return (
    <>
      <nav aria-label={t.journal.filter} className="-mx-1 mb-12 overflow-x-auto px-1">
        <ul className="flex min-w-max gap-2">
          {tabs.map((tab) => (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={tab.active ? "page" : undefined}
                className={cn(
                  "inline-flex border px-4 py-2 text-sm transition-colors",
                  tab.active
                    ? "border-ocean-deep bg-ocean-deep text-ivory"
                    : "border-ocean-deep/20 text-ocean-deep hover:border-ocean-deep/50",
                )}
              >
                {tab.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {shown.length > 0 ? (
        <ArticleList articles={shown} />
      ) : (
        <p className="text-muted-foreground">{t.journal.noneInCategory}</p>
      )}
    </>
  );
}

/** The featured article (or the newest) leads; the rest follow in pairs. */
function ArticleList({ articles }: { articles: Article[] }) {
  const lead = articles.find((a) => a.featured) ?? articles[0];
  const rest = articles.filter((a) => a !== lead);
  return (
    <div className="grid gap-x-10 gap-y-16 lg:grid-cols-12">
      <ArticleCard
        article={lead}
        variant="lead"
        className="lg:col-span-12"
        imageClassName="aspect-[4/3] lg:aspect-[21/9]"
      />
      {rest.map((article) => (
        <ArticleCard
          key={article.slug}
          article={article}
          className="reveal lg:col-span-6"
        />
      ))}
    </div>
  );
}
