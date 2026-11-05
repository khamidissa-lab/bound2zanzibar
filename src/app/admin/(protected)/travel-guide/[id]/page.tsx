import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AccessDenied } from "@/components/admin/admin-states";
import { DeleteButton } from "@/components/admin/delete-button";
import { EditorHeader } from "@/components/admin/editor-header";
import { serializeArticleMarkup } from "@/lib/article-markup";
import { can } from "@/lib/auth/permissions";
import { requireStaffPage } from "@/lib/auth/session";
import { getArticle, listMedia } from "@/services/admin-content";
import { parseArticleBody } from "@/services/content-mappers";

import { ArticleForm } from "../article-form";

export const metadata: Metadata = { title: "Edit article" };

export default async function EditArticlePage({
  params,
  searchParams,
}: PageProps<"/admin/travel-guide/[id]">) {
  const { id } = await params;
  const { staff, allowed } = await requireStaffPage(
    "content.manage",
    `/admin/travel-guide/${id}`,
  );
  if (!allowed) return <AccessDenied />;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const [article, media, query] = await Promise.all([
    getArticle(id),
    listMedia(),
    searchParams,
  ]);
  if (!article) notFound();

  return (
    <div className="max-w-4xl space-y-8">
      <EditorHeader
        backHref="/admin/travel-guide"
        backLabel="All articles"
        title={article.title}
        status={article.status}
        liveHref={`/travel-guide/${article.slug}`}
        translationsHref={`/admin/translations/blog_posts/${article.id}`}
        isSample={article.is_sample}
        created={query.created !== undefined}
      />
      <ArticleForm
        article={article}
        bodyMarkup={serializeArticleMarkup(parseArticleBody(article.body))}
        mediaPaths={media.map((m) => m.path)}
      />
      {can(staff.role, "content.delete") ? (
        <section className="rounded-2xl border border-destructive/30 bg-card p-5 sm:p-6">
          <h2 className="mb-4 font-display text-xl">Delete article</h2>
          <DeleteButton table="blog_posts" id={article.id} itemName={article.title} />
        </section>
      ) : null}
    </div>
  );
}
