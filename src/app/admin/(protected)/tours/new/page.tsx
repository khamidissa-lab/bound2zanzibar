import type { Metadata } from "next";

import { AccessDenied } from "@/components/admin/admin-states";
import { EditorHeader } from "@/components/admin/editor-header";
import { requireStaffPage } from "@/lib/auth/session";
import { getOptions, listMedia } from "@/services/admin-content";

import { TourForm } from "../tour-form";

export const metadata: Metadata = { title: "New tour" };

export default async function NewTourPage() {
  const { allowed } = await requireStaffPage("content.manage", "/admin/tours/new");
  if (!allowed) return <AccessDenied />;
  const [options, media] = await Promise.all([getOptions(), listMedia()]);

  return (
    <div className="max-w-4xl">
      <EditorHeader backHref="/admin/tours" backLabel="All tours" title="New tour" />
      <TourForm
        tour={null}
        categories={options.categories}
        destinations={options.destinations}
        mediaPaths={media.map((m) => m.path)}
      />
    </div>
  );
}
