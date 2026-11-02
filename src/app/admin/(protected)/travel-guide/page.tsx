import type { Metadata } from "next";
import Link from "next/link";

import { AccessDenied } from "@/components/admin/admin-states";
import {
  EmptyList,
  firstParam,
  formatUpdated,
  ListFilters,
  ListHeader,
  ListNotice,
  StatusBadge,
} from "@/components/admin/content-list";
import { requireStaffPage } from "@/lib/auth/session";
import { listArticles } from "@/services/admin-content";

export const metadata: Metadata = { title: "Travel guide" };

export default async function AdminArticlesPage({
  searchParams,
}: PageProps<"/admin/travel-guide">) {
  const { allowed } = await requireStaffPage("content.manage", "/admin/travel-guide");
  if (!allowed) return <AccessDenied />;

  const params = await searchParams;
  const q = firstParam(params.q).slice(0, 100);
  const status = firstParam(params.status);
  const articles = await listArticles({ q, status });

  return (
    <div className="max-w-5xl">
      <ListHeader
        title="Travel guide"
        description="Articles that help travellers plan. Published articles appear on the Travel Guide page."
        newHref="/admin/travel-guide/new"
        newLabel="New article"
      />
      <ListNotice searchParams={params} />
      <ListFilters
        action="/admin/travel-guide"
        q={q}
        status={status}
        searchLabel="Search articles"
      />
      {articles.length === 0 ? (
        <EmptyList>
          {q || status ? "No articles match these filters." : "No articles yet."}
        </EmptyList>
      ) : (
        <ul className="mt-6 divide-y rounded-2xl border bg-card">
          {articles.map((a) => (
            <li
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div>
                <Link
                  href={`/admin/travel-guide/${a.id}`}
                  className="font-medium text-ocean-deep hover:underline"
                >
                  {a.title}
                </Link>
                <p className="text-xs text-muted-foreground">
                  /travel-guide/{a.slug}
                  {a.is_sample ? " · Sample" : ""}
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <StatusBadge status={a.status} />
                {formatUpdated(a.updated_at)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
