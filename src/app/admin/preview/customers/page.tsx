import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { AdminFrame } from "@/components/admin/admin-frame";
import { PreviewNote } from "@/components/admin/bookings/preview-note";
import {
  CustomerList,
  customerSummary,
  parseCustomerParams,
} from "@/components/admin/customers/customer-list";
import { buildCustomers, filterCustomers } from "@/lib/customers";
import { previewBookings } from "@/services/admin-bookings-preview";
import { previewEnquiries } from "@/services/admin-enquiries-preview";

export const metadata: Metadata = { title: "Customers preview" };

const PAGE_SIZE = 10;

/** DEVELOPMENT-ONLY preview of the customer list built from example data. */
export default function CustomersPreviewPage({
  searchParams,
}: PageProps<"/admin/preview/customers">) {
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
  searchParams: PageProps<"/admin/preview/customers">["searchParams"];
}) {
  await connection();
  const { q, page } = parseCustomerParams(await searchParams);
  const now = new Date();
  const all = buildCustomers(await previewBookings(now), previewEnquiries(now));
  const matching = filterCustomers(all, q);

  return (
    <AdminFrame staff={{ fullName: "Preview User", role: "super_admin" }} preview>
      <PreviewNote />
      <CustomerList
        basePath="/admin/preview/customers"
        bookingsPath="/admin/preview/bookings"
        q={q}
        page={page}
        pageSize={PAGE_SIZE}
        rows={matching.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)}
        total={matching.length}
        summary={customerSummary(all)}
      />
    </AdminFrame>
  );
}
