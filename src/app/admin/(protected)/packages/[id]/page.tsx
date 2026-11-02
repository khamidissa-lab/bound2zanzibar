import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { savePackagePrices } from "@/app/admin/_actions/content";
import { AccessDenied } from "@/components/admin/admin-states";
import { DeleteButton } from "@/components/admin/delete-button";
import { EditorHeader } from "@/components/admin/editor-header";
import { PriceEditor } from "@/components/admin/price-editor";
import { toPriceRows } from "@/lib/admin-forms";
import { can } from "@/lib/auth/permissions";
import { requireStaffPage } from "@/lib/auth/session";
import {
  getOptions,
  getPackage,
  listCurrencies,
  listMedia,
} from "@/services/admin-content";

import { PackageForm } from "../package-form";

export const metadata: Metadata = { title: "Edit package" };

export default async function EditPackagePage({
  params,
  searchParams,
}: PageProps<"/admin/packages/[id]">) {
  const { id } = await params;
  const { staff, allowed } = await requireStaffPage(
    "content.manage",
    `/admin/packages/${id}`,
  );
  if (!allowed) return <AccessDenied />;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const [pkg, options, media, currencies, query] = await Promise.all([
    getPackage(id),
    getOptions(),
    listMedia(),
    listCurrencies(),
    searchParams,
  ]);
  if (!pkg) notFound();

  return (
    <div className="max-w-4xl space-y-8">
      <EditorHeader
        backHref="/admin/packages"
        backLabel="All packages"
        title={pkg.name}
        status={pkg.status}
        liveHref={`/packages/${pkg.slug}`}
        isSample={pkg.is_sample}
        created={query.created !== undefined}
      />
      <PackageForm
        pkg={pkg}
        itinerary={[...pkg.package_itinerary_days]
          .sort((a, b) => a.day_number - b.day_number)
          .map((d) => ({
            title: d.title,
            description: d.description,
            meals: d.meals,
            overnight: d.overnight ?? "",
          }))}
        selectedTourIds={pkg.package_tours.map((t) => t.tour_id)}
        selectedDestinationIds={[...pkg.package_destinations]
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((d) => d.destination_id)}
        tours={options.tours}
        destinations={options.destinations}
        mediaPaths={media.map((m) => m.path)}
      />
      <PriceEditor
        itemId={pkg.id}
        action={savePackagePrices}
        initialRows={toPriceRows(pkg.package_prices)}
        currencies={currencies}
        canEdit={can(staff.role, "prices.manage")}
        defaultUnit="per person sharing"
      />
      {can(staff.role, "content.delete") ? (
        <section className="rounded-2xl border border-destructive/30 bg-card p-5 sm:p-6">
          <h2 className="font-display text-xl">Delete package</h2>
          <p className="mt-1 mb-4 text-sm text-muted-foreground">
            Packages with booking requests can&apos;t be deleted — archive them instead.
          </p>
          <DeleteButton table="packages" id={pkg.id} itemName={pkg.name} />
        </section>
      ) : null}
    </div>
  );
}
