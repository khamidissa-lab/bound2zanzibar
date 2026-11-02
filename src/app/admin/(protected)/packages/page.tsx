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
import { listPackages } from "@/services/admin-content";

export const metadata: Metadata = { title: "Packages" };

export default async function AdminPackagesPage({
  searchParams,
}: PageProps<"/admin/packages">) {
  const { allowed } = await requireStaffPage("content.manage", "/admin/packages");
  if (!allowed) return <AccessDenied />;

  const params = await searchParams;
  const q = firstParam(params.q).slice(0, 100);
  const status = firstParam(params.status);
  const packages = await listPackages({ q, status });

  return (
    <div className="max-w-5xl">
      <ListHeader
        title="Packages"
        description="Multi-day trips with itineraries, linked tours and prices."
        newHref="/admin/packages/new"
        newLabel="New package"
      />
      <ListNotice searchParams={params} />
      <ListFilters
        action="/admin/packages"
        q={q}
        status={status}
        searchLabel="Search packages"
      />
      {packages.length === 0 ? (
        <EmptyList>
          {q || status ? "No packages match these filters." : "No packages yet."}
        </EmptyList>
      ) : (
        <ul className="mt-6 divide-y rounded-2xl border bg-card">
          {packages.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div>
                <Link
                  href={`/admin/packages/${p.id}`}
                  className="font-medium text-ocean-deep hover:underline"
                >
                  {p.name}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {p.days} days / {p.nights} nights
                  {p.is_safari ? " · Safari" : ""}
                  {p.is_featured ? " · Featured" : ""}
                  {p.is_sample ? " · Sample" : ""}
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <StatusBadge status={p.status} />
                {formatUpdated(p.updated_at)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
