import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { AdminFrame } from "@/components/admin/admin-frame";
import { PreviewNote } from "@/components/admin/bookings/preview-note";
import {
  EnquiryList,
  parseEnquiryParams,
} from "@/components/admin/enquiries/enquiry-views";
import { ENQUIRY_STATUSES, type EnquiryStatus } from "@/lib/enquiry/request";
import { filterEnquiries, previewEnquiries } from "@/services/admin-enquiries-preview";

export const metadata: Metadata = { title: "Enquiries preview" };

/** DEVELOPMENT-ONLY preview of the enquiries inbox with example data. */
export default function EnquiriesPreviewPage({
  searchParams,
}: PageProps<"/admin/preview/enquiries">) {
  if (process.env.NODE_ENV !== "development") notFound();
  return (
    <Suspense fallback={<div className="flex-1 p-8 text-muted-foreground">Loading…</div>}>
      <Preview searchParams={searchParams} />
    </Suspense>
  );
}

async function Preview({
  searchParams,
}: {
  searchParams: PageProps<"/admin/preview/enquiries">["searchParams"];
}) {
  await connection();
  const { filters, page } = parseEnquiryParams(await searchParams);
  const all = previewEnquiries(new Date());
  const rows = filterEnquiries(all, filters);
  const counts = Object.fromEntries(
    ENQUIRY_STATUSES.map((s) => [
      s,
      filterEnquiries(all, { ...filters, status: s }).length,
    ]),
  ) as Record<EnquiryStatus, number>;

  return (
    <AdminFrame staff={{ fullName: "Preview User", role: "super_admin" }} preview>
      <PreviewNote />
      <EnquiryList
        basePath="/admin/preview/enquiries"
        filters={filters}
        page={page}
        pageSize={25}
        rows={rows}
        total={rows.length}
        counts={counts}
      />
    </AdminFrame>
  );
}
