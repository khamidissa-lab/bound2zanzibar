import type { Metadata } from "next";

import { AccessDenied } from "@/components/admin/admin-states";
import { EditorHeader } from "@/components/admin/editor-header";
import { requireStaffPage } from "@/lib/auth/session";
import { listMedia } from "@/services/admin-content";

import { DestinationForm } from "../destination-form";

export const metadata: Metadata = { title: "New destination" };

export default async function NewDestinationPage() {
  const { allowed } = await requireStaffPage("content.manage", "/admin/destinations/new");
  if (!allowed) return <AccessDenied />;
  const media = await listMedia();
  return (
    <div className="max-w-4xl">
      <EditorHeader
        backHref="/admin/destinations"
        backLabel="All destinations"
        title="New destination"
      />
      <DestinationForm destination={null} mediaPaths={media.map((m) => m.path)} />
    </div>
  );
}
