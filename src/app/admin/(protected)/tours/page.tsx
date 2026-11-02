import type { Metadata } from "next";
import Link from "next/link";

import {
  EmptyList,
  firstParam,
  formatUpdated,
  ListFilters,
  ListHeader,
  ListNotice,
  StatusBadge,
} from "@/components/admin/content-list";
import { AccessDenied } from "@/components/admin/admin-states";
import { requireStaffPage } from "@/lib/auth/session";
import { listTours } from "@/services/admin-content";

export const metadata: Metadata = { title: "Tours" };

export default async function AdminToursPage({
  searchParams,
}: PageProps<"/admin/tours">) {
  const { allowed } = await requireStaffPage("content.manage", "/admin/tours");
  if (!allowed) return <AccessDenied />;

  const params = await searchParams;
  const q = firstParam(params.q).slice(0, 100);
  const status = firstParam(params.status);
  const tours = await listTours({ q, status });

  return (
    <div className="max-w-5xl">
      <ListHeader
        title="Tours"
        description="Day tours and experiences. Only published tours appear on the website."
        newHref="/admin/tours/new"
        newLabel="New tour"
      >
        <Link
          href="/admin/tours/categories"
          className="mt-2 inline-block text-sm text-turquoise-deep hover:underline"
        >
          Manage categories
        </Link>
      </ListHeader>
      <ListNotice searchParams={params} />
      <ListFilters
        action="/admin/tours"
        q={q}
        status={status}
        searchLabel="Search tours"
      />

      {tours.length === 0 ? (
        <EmptyList>
          {q || status
            ? "No tours match these filters."
            : "No tours yet. Create your first tour."}
        </EmptyList>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border bg-card">
          <table className="w-full min-w-[40rem] text-sm">
            <thead className="border-b text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Tour</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Destination</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tours.map((tour) => (
                <tr key={tour.id} className="hover:bg-sand-soft/60">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/tours/${tour.id}`}
                      className="font-medium text-ocean-deep hover:underline"
                    >
                      {tour.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      /tours/{tour.slug}
                      {tour.is_featured ? " · Featured" : ""}
                      {tour.is_sample ? " · Sample" : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {tour.category?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {tour.destination?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={tour.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatUpdated(tour.updated_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
