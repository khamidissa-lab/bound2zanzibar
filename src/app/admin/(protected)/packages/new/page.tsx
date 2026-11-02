import type { Metadata } from "next";

import { AccessDenied } from "@/components/admin/admin-states";
import { EditorHeader } from "@/components/admin/editor-header";
import { requireStaffPage } from "@/lib/auth/session";
import { getOptions, listMedia } from "@/services/admin-content";

import { PackageForm } from "../package-form";

export const metadata: Metadata = { title: "New package" };

export default async function NewPackagePage() {
  const { allowed } = await requireStaffPage("content.manage", "/admin/packages/new");
  if (!allowed) return <AccessDenied />;
  const [options, media] = await Promise.all([getOptions(), listMedia()]);

  return (
    <div className="max-w-4xl">
      <EditorHeader
        backHref="/admin/packages"
        backLabel="All packages"
        title="New package"
      />
      <PackageForm
        pkg={null}
        itinerary={[{ title: "Arrival", description: "", meals: [], overnight: "" }]}
        selectedTourIds={[]}
        selectedDestinationIds={[]}
        tours={options.tours}
        destinations={options.destinations}
        mediaPaths={media.map((m) => m.path)}
      />
    </div>
  );
}
