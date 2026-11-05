import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ArticleCard } from "@/components/content/cards";
import { LocaleLink as Link } from "@/components/i18n/locale-link";
import { MachineTranslationNotice } from "@/components/i18n/machine-notice";
import { SceneImage } from "@/components/media/scene-image";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SampleBadge } from "@/components/shared/sample-badge";
import { SectionHeading } from "@/components/shared/section-heading";
import { localeAlternates, pageLocale } from "@/i18n/seo";
import { getI18n } from "@/i18n/server";
import { getArticleBySlug, getArticles, staticSlugParams } from "@/services/content";
import { shareImages } from "@/lib/seo";

export async function generateStaticParams() {
  return staticSlugParams(await getArticles());
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/travel-guide/[slug]">): Promise<Metadata> {
  const { slug, locale: raw } = await params;
  const locale = pageLocale(raw);
  const article = await getArticleBySlug(slug, locale);
  if (!article) return { title: getI18n(locale).t.guide.notFound };
  return {
    title: article.seo.title,
    description: article.seo.description,
    alternates: localeAlternates(locale, `/travel-guide/${article.slug}`),
    openGraph: {
      title: article.seo.title,
      description: article.seo.description,
      images: shareImages(article.coverImage),
      type: "article",
      publishedTime: article.publishedOn,
    },
  };
}

export default async function ArticlePage({
  params,
}: PageProps<"/[locale]/travel-guide/[slug]">) {
  const { slug, locale: raw } = await params;
  const locale = pageLocale(raw);
  const { t, fmt, date } = getI18n(locale);
  const article = await getArticleBySlug(slug, locale);
  if (!article) notFound();

  const more = (await getArticles(locale))
    .filter((a) => a.slug !== article.slug)
    .slice(0, 2);

  return (
    <>
      <article className="pb-20">
        <header className="bg-ivory">
          <div className="container-page pt-8 pb-12 sm:pb-16">
            <Breadcrumbs
              items={[
                { label: t.nav.home, href: "/" },
                { label: t.nav.travelGuide, href: "/travel-guide" },
                { label: article.title },
              ]}
              className="mb-12"
            />
            <div className="mx-auto max-w-4xl text-center">
              <div className="eyebrow flex flex-wrap items-center justify-center gap-2 text-gold-deep">
                <time dateTime={article.publishedOn}>{date(article.publishedOn)}</time>
                <span aria-hidden="true">·</span>
                <span>{fmt(t.common.minRead, { n: article.readingMinutes })}</span>
                {article.isSample ? <SampleBadge /> : null}
              </div>
              <h1 className="display-xl mt-6">{article.title}</h1>
              <p className="mx-auto mt-6 max-w-2xl font-display text-2xl leading-snug text-muted-foreground italic">
                {article.excerpt}
              </p>
              {article.machineTranslated ? (
                <div className="mx-auto mt-6 w-fit">
                  <MachineTranslationNotice path={`/travel-guide/${article.slug}`} />
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <div className="container-page">
          <SceneImage
            image={article.coverImage}
            priority
            sizes="(min-width: 1320px) 1240px, 100vw"
            className="aspect-[16/10] sm:aspect-[21/9]"
          />
        </div>

        <div className="container-page mt-14 max-w-3xl space-y-12 sm:mt-20">
          {article.sections.map((section, i) => (
            <section key={section.heading}>
              <h2 className="font-display text-3xl sm:text-4xl">{section.heading}</h2>
              <div
                className={
                  i === 0
                    ? "mt-4 space-y-5 text-lg leading-relaxed text-ink/90 first-letter:float-start first-letter:me-3 first-letter:font-display first-letter:text-7xl first-letter:leading-[0.8] first-letter:text-gold-deep"
                    : "mt-4 space-y-5 text-lg leading-relaxed text-ink/90"
                }
              >
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}

          <Link
            href="/travel-guide"
            className="link-underline inline-flex items-center gap-2 text-sm font-semibold text-ocean-deep"
          >
            <ArrowLeft className="size-4 rtl:-scale-x-100" aria-hidden="true" />
            {t.guide.backToAll}
          </Link>
        </div>
      </article>

      {more.length > 0 ? (
        <section aria-labelledby="more-heading" className="bg-sand-soft py-20 sm:py-24">
          <div className="container-page">
            <SectionHeading
              id="more-heading"
              eyebrow={t.guide.keepReading}
              title={t.guide.more}
              link={{ href: "/travel-guide", label: t.common.allArticles }}
            />
            <div className="grid gap-x-10 gap-y-14 sm:grid-cols-2">
              {more.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
