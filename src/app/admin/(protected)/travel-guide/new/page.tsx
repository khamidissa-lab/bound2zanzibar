import type { Metadata } from "next";

import { AccessDenied } from "@/components/admin/admin-states";
import { EditorHeader } from "@/components/admin/editor-header";
import { requireStaffPage } from "@/lib/auth/session";
import { getOptions, listMedia } from "@/services/admin-content";

import { ArticleForm } from "../article-form";

export const metadata: Metadata = { title: "New article" };

const STARTER = `## First section heading
Write the first paragraph here.

Leave an empty line between paragraphs.

## Second section heading
More text.`;

export default async function NewArticlePage() {
  const { allowed } = await requireStaffPage("content.manage", "/admin/travel-guide/new");
  if (!allowed) return <AccessDenied />;
  const [media, options] = await Promise.all([listMedia(), getOptions()]);
  return (
    <div className="max-w-4xl">
      <EditorHeader
        backHref="/admin/travel-guide"
        backLabel="All articles"
        title="New article"
      />
      <ArticleForm
        article={null}
        bodyMarkup={STARTER}
        mediaPaths={media.map((m) => m.path)}
        tours={options.tours}
      />
    </div>
  );
}
