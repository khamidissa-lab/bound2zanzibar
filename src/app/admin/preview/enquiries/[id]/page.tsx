import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { AdminFrame } from "@/components/admin/admin-frame";
import { PreviewNote } from "@/components/admin/bookings/preview-note";
import { EnquiryDetail } from "@/components/admin/enquiries/enquiry-views";
import { previewEnquiries } from "@/services/admin-enquiries-preview";

export const metadata: Metadata = { title: "Enquiry preview" };

/** DEVELOPMENT-ONLY preview of an enquiry with example data. */
export default function EnquiryPreviewPage({
  params,
}: PageProps<"/admin/preview/enquiries/[id]">) {
  if (process.env.NODE_ENV !== "development") notFound();
  return (
    <Suspense fallback={<div className="flex-1 p-8 text-muted-foreground">Loading…</div>}>
      <Preview params={params} />
    </Suspense>
  );
}

async function Preview({
  params,
}: {
  params: PageProps<"/admin/preview/enquiries/[id]">["params"];
}) {
  await connection();
  const { id } = await params;
  const enquiry = previewEnquiries(new Date()).find((e) => e.id === id);
  if (!enquiry) notFound();
  return (
    <AdminFrame staff={{ fullName: "Preview User", role: "super_admin" }} preview>
      <PreviewNote />
      <EnquiryDetail backHref="/admin/preview/enquiries" enquiry={enquiry} preview />
    </AdminFrame>
  );
}
