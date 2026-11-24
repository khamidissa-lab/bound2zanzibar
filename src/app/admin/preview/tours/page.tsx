import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminFrame } from "@/components/admin/admin-frame";
import { PreviewNote } from "@/components/admin/bookings/preview-note";
import { ListHeader } from "@/components/admin/content-list";
import {
  TourCardGrid,
  type AdminTourCard,
} from "@/components/admin/tours/tour-card-grid";
import { sampleCategories } from "@/data/sample/categories";
import { sampleDestinations } from "@/data/sample/destinations";
import { sampleTours } from "@/data/sample/tours";
import { adminFromPrice } from "@/lib/admin-tour-price";

export const metadata: Metadata = { title: "Tours preview" };

/** DEVELOPMENT-ONLY preview of the admin tours grid with the sample tours. */
export default function ToursPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  const category = new Map(sampleCategories.map((c) => [c.slug, c.name]));
  const destination = new Map(sampleDestinations.map((d) => [d.slug, d.name]));
  const tours: AdminTourCard[] = sampleTours.slice(0, 9).map((t, i) => ({
    id: t.slug,
    name: t.name,
    slug: t.slug,
    // A mix of statuses, so every badge can be reviewed.
    status: i === 4 ? "draft" : i === 7 ? "archived" : "published",
    isFeatured: t.featured,
    isSample: i % 3 === 0,
    category: category.get(t.categorySlug) ?? null,
    destination: destination.get(t.destinationSlug) ?? null,
    duration: t.duration,
    shortDescription: t.shortDescription,
    image:
      i === 5 || !t.coverImage.src
        ? null
        : { src: t.coverImage.src, alt: t.coverImage.alt },
    fromPrice:
      i === 6
        ? null
        : adminFromPrice(
            t.prices.map((p) => ({
              market: p.market,
              customer_type: "adult",
              currency: p.currency,
              amount: p.adult,
              is_active: true,
              is_illustrative: i % 2 === 0 ? p.isIllustrative : false,
            })),
          ),
    editHref: "#",
    updatedLabel: "24 Nov 2026",
  }));

  return (
    <AdminFrame staff={{ fullName: "Preview User", role: "super_admin" }} preview>
      <PreviewNote />
      <div className="max-w-7xl">
        <ListHeader
          title="Tours"
          description="Day tours and experiences. Only published tours appear on the website."
          newHref="#"
          newLabel="New tour"
        />
        <TourCardGrid tours={tours} />
      </div>
    </AdminFrame>
  );
}
