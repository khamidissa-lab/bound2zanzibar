import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AccessDenied } from "@/components/admin/admin-states";
import { EnquiryDetail } from "@/components/admin/enquiries/enquiry-views";
import { requireStaffPage } from "@/lib/auth/session";
import { getEnquiry } from "@/services/enquiries";

export const metadata: Metadata = { title: "Enquiry" };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function AdminEnquiryPage({
  params,
}: PageProps<"/admin/enquiries/[id]">) {
  const { id } = await params;
  const { allowed } = await requireStaffPage("bookings.manage", `/admin/enquiries/${id}`);
  if (!allowed) return <AccessDenied />;
  if (!UUID_RE.test(id)) notFound();

  const enquiry = await getEnquiry(id);
  if (!enquiry) notFound();

  return <EnquiryDetail backHref="/admin/enquiries" enquiry={enquiry} />;
}
