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
import { listDestinations } from "@/services/admin-content";

export const metadata: Metadata = { title: "Destinations" };

export default async function AdminDestinationsPage({
  searchParams,
}: PageProps<"/admin/destinations">) {
  const { allowed } = await requireStaffPage("content.manage", "/admin/destinations");
  if (!allowed) return <AccessDenied />;

  const params = await searchParams;
  const q = firstParam(params.q).slice(0, 100);
  const status = firstParam(params.status);
  const destinations = await listDestinations({ q, status });

  return (
    <div className="max-w-5xl">
      <ListHeader
        title="Destinations"
        description="Places in Zanzibar and mainland Tanzania that tours and packages link to."
        newHref="/admin/destinations/new"
        newLabel="New destination"
      />
      <ListNotice searchParams={params} />
      <ListFilters
        action="/admin/destinations"
        q={q}
        status={status}
        searchLabel="Search destinations"
      />
      {destinations.length === 0 ? (
        <EmptyList>
          {q || status ? "No destinations match these filters." : "No destinations yet."}
        </EmptyList>
      ) : (
        <ul className="mt-6 divide-y rounded-2xl border bg-card">
          {destinations.map((d) => (
            <li
              key={d.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div>
                <Link
                  href={`/admin/destinations/${d.id}`}
                  className="font-medium text-ocean-deep hover:underline"
                >
                  {d.name}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {d.region === "zanzibar" ? "Zanzibar" : "Mainland"} · /destinations/
                  {d.slug}
                  {d.is_featured ? " · Featured" : ""}
                  {d.is_sample ? " · Sample" : ""}
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <StatusBadge status={d.status} />
                {formatUpdated(d.updated_at)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
