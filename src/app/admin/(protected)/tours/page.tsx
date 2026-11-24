import type { Metadata } from "next";
import Link from "next/link";

import {
  EmptyList,
  firstParam,
  formatUpdated,
  ListFilters,
  ListHeader,
  ListNotice,
} from "@/components/admin/content-list";
import { AccessDenied } from "@/components/admin/admin-states";
import {
  TourCardGrid,
  type AdminTourCard,
} from "@/components/admin/tours/tour-card-grid";
import { adminFromPrice } from "@/lib/admin-tour-price";
import { mediaUrl } from "@/lib/media";
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
    <div className="max-w-7xl">
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
        <TourCardGrid
          tours={tours.map((tour): AdminTourCard => ({
            id: tour.id,
            name: tour.name,
            slug: tour.slug,
            status: tour.status,
            isFeatured: tour.is_featured,
            isSample: tour.is_sample,
            category: tour.category?.name ?? null,
            destination: tour.destination?.name ?? null,
            duration: tour.duration_text || null,
            shortDescription: tour.short_description || null,
            image: mediaUrl(tour.cover_image_path)
              ? {
                  src: mediaUrl(tour.cover_image_path) as string,
                  alt: tour.cover_image_alt || tour.name,
                }
              : null,
            fromPrice: adminFromPrice(tour.tour_prices),
            editHref: `/admin/tours/${tour.id}`,
            updatedLabel: formatUpdated(tour.updated_at),
          }))}
        />
      )}
    </div>
  );
}
