import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AccessDenied } from "@/components/admin/admin-states";
import { DeleteButton } from "@/components/admin/delete-button";
import { EditorHeader } from "@/components/admin/editor-header";
import { can } from "@/lib/auth/permissions";
import { requireStaffPage } from "@/lib/auth/session";
import { getDestination, listMedia } from "@/services/admin-content";

import { DestinationForm } from "../destination-form";

export const metadata: Metadata = { title: "Edit destination" };

export default async function EditDestinationPage({
  params,
  searchParams,
}: PageProps<"/admin/destinations/[id]">) {
  const { id } = await params;
  const { staff, allowed } = await requireStaffPage(
    "content.manage",
    `/admin/destinations/${id}`,
  );
  if (!allowed) return <AccessDenied />;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const [destination, media, query] = await Promise.all([
    getDestination(id),
    listMedia(),
    searchParams,
  ]);
  if (!destination) notFound();

  return (
    <div className="max-w-4xl space-y-8">
      <EditorHeader
        backHref="/admin/destinations"
        backLabel="All destinations"
        title={destination.name}
        status={destination.status}
        liveHref={`/destinations/${destination.slug}`}
        translationsHref={`/admin/translations/destinations/${destination.id}`}
        isSample={destination.is_sample}
        created={query.created !== undefined}
      />
      <DestinationForm destination={destination} mediaPaths={media.map((m) => m.path)} />
      {can(staff.role, "content.delete") ? (
        <section className="rounded-2xl border border-destructive/30 bg-card p-5 sm:p-6">
          <h2 className="font-display text-xl">Delete destination</h2>
          <p className="mt-1 mb-4 text-sm text-muted-foreground">
            Tours linked to this destination keep working but lose the link.
          </p>
          <DeleteButton
            table="destinations"
            id={destination.id}
            itemName={destination.name}
          />
        </section>
      ) : null}
    </div>
  );
}
