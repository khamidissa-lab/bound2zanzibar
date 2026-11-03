import type { Metadata } from "next";

import { AccessDenied } from "@/components/admin/admin-states";
import {
  EnquiryList,
  parseEnquiryParams,
} from "@/components/admin/enquiries/enquiry-views";
import { requireStaffPage } from "@/lib/auth/session";
import {
  countEnquiriesByStatus,
  ENQUIRY_PAGE_SIZE,
  listEnquiries,
} from "@/services/enquiries";

export const metadata: Metadata = { title: "Enquiries" };

export default async function AdminEnquiriesPage({
  searchParams,
}: PageProps<"/admin/enquiries">) {
  const { allowed } = await requireStaffPage("bookings.manage", "/admin/enquiries");
  if (!allowed) return <AccessDenied />;

  const { filters, page } = parseEnquiryParams(await searchParams);
  const [{ rows, total }, counts] = await Promise.all([
    listEnquiries(filters, page),
    countEnquiriesByStatus(filters),
  ]);

  return (
    <EnquiryList
      basePath="/admin/enquiries"
      filters={filters}
      page={page}
      pageSize={ENQUIRY_PAGE_SIZE}
      rows={rows}
      total={total}
      counts={counts}
    />
  );
}
