import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ArticleCard } from "@/components/content/cards";
import { SceneImage } from "@/components/media/scene-image";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SampleBadge } from "@/components/shared/sample-badge";
import { formatDate } from "@/lib/format";
import { getArticleBySlug, getArticles, staticSlugParams } from "@/services/content";
import { shareImages } from "@/lib/seo";

export async function generateStaticParams() {
  return staticSlugParams(await getArticles());
}

export async function generateMetadata({
  params,
}: PageProps<"/travel-guide/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Article not found" };
  return {
    title: article.seo.title,
    description: article.seo.description,
    alternates: { canonical: `/travel-guide/${article.slug}` },
    openGraph: {
      title: article.seo.title,
      description: article.seo.description,
      images: shareImages(article.coverImage),
      type: "article",
      publishedTime: article.publishedOn,
    },
  };
}

export default async function ArticlePage({ params }: PageProps<"/travel-guide/[slug]">) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const more = (await getArticles()).filter((a) => a.slug !== article.slug).slice(0, 2);

  return (
    <>
      <article className="container-page max-w-3xl py-10">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Travel Guide", href: "/travel-guide" },
            { label: article.title },
          ]}
        />
        <header className="mt-8">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <time dateTime={article.publishedOn}>{formatDate(article.publishedOn)}</time>
            <span aria-hidden="true">·</span>
            <span>{article.readingMinutes} min read</span>
            {article.isSample ? <SampleBadge /> : null}
          </div>
          <h1 className="text-4xl font-medium sm:text-5xl">{article.title}</h1>
          <p className="mt-4 text-xl leading-relaxed text-muted-foreground">
            {article.excerpt}
          </p>
        </header>

        <SceneImage
          image={article.coverImage}
          priority
          sizes="(min-width: 768px) 768px, 100vw"
          className="mt-8 aspect-[16/9] rounded-2xl"
        />

        <div className="mt-10 space-y-10">
          {article.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-2xl font-medium">{section.heading}</h2>
              <div className="mt-3 space-y-4 text-lg leading-relaxed">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <Link
          href="/travel-guide"
          className="mt-12 inline-flex items-center gap-2 text-sm font-semibold text-turquoise-deep hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All travel guide articles
        </Link>
      </article>

      {more.length > 0 ? (
        <section aria-labelledby="more-heading" className="border-t bg-sand-soft py-16">
          <div className="container-page">
            <h2 id="more-heading" className="mb-8 text-3xl font-medium">
              More from the travel guide
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
