import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { saveTourPrices } from "@/app/admin/_actions/content";
import { AccessDenied } from "@/components/admin/admin-states";
import { DeleteButton } from "@/components/admin/delete-button";
import { EditorHeader } from "@/components/admin/editor-header";
import { GalleryEditor } from "@/components/admin/gallery-editor";
import { PriceEditor } from "@/components/admin/price-editor";
import { toPriceRows } from "@/lib/admin-forms";
import { can } from "@/lib/auth/permissions";
import { requireStaffPage } from "@/lib/auth/session";
import { getOptions, getTour, listCurrencies, listMedia } from "@/services/admin-content";

import { TourForm } from "../tour-form";

export const metadata: Metadata = { title: "Edit tour" };

const UUID = /^[0-9a-f-]{36}$/i;

export default async function EditTourPage({
  params,
  searchParams,
}: PageProps<"/admin/tours/[id]">) {
  const { id } = await params;
  const { staff, allowed } = await requireStaffPage(
    "content.manage",
    `/admin/tours/${id}`,
  );
  if (!allowed) return <AccessDenied />;
  if (!UUID.test(id)) notFound();

  const [tour, options, media, currencies, query] = await Promise.all([
    getTour(id),
    getOptions(),
    listMedia(),
    listCurrencies(),
    searchParams,
  ]);
  if (!tour) notFound();
  const mediaPaths = media.map((m) => m.path);

  return (
    <div className="max-w-4xl space-y-8">
      <EditorHeader
        backHref="/admin/tours"
        backLabel="All tours"
        title={tour.name}
        status={tour.status}
        liveHref={`/tours/${tour.slug}`}
        isSample={tour.is_sample}
        created={query.created !== undefined}
      />
      <TourForm
        tour={tour}
        categories={options.categories}
        destinations={options.destinations}
        mediaPaths={mediaPaths}
      />
      <PriceEditor
        itemId={tour.id}
        action={saveTourPrices}
        initialRows={toPriceRows(tour.tour_prices)}
        currencies={currencies}
        canEdit={can(staff.role, "prices.manage")}
        defaultUnit="per person"
      />
      <GalleryEditor
        tourId={tour.id}
        mediaPaths={mediaPaths}
        initialImages={[...tour.tour_images]
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((img) => ({ storagePath: img.storage_path, altText: img.alt_text }))}
      />
      {can(staff.role, "content.delete") ? (
        <section className="rounded-2xl border border-destructive/30 bg-card p-5 sm:p-6">
          <h2 className="font-display text-xl">Delete tour</h2>
          <p className="mt-1 mb-4 text-sm text-muted-foreground">
            Tours with booking requests can&apos;t be deleted — archive them instead.
          </p>
          <DeleteButton table="tours" id={tour.id} itemName={tour.name} />
        </section>
      ) : null}
    </div>
  );
}
