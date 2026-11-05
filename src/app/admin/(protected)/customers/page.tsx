import type { Metadata } from "next";

import { AccessDenied } from "@/components/admin/admin-states";
import {
  CustomerList,
  customerSummary,
  parseCustomerParams,
} from "@/components/admin/customers/customer-list";
import { requireStaffPage } from "@/lib/auth/session";
import { filterCustomers } from "@/lib/customers";
import { loadCustomers } from "@/services/customers";

export const metadata: Metadata = { title: "Customers" };

const PAGE_SIZE = 25;

export default async function AdminCustomersPage({
  searchParams,
}: PageProps<"/admin/customers">) {
  const { allowed } = await requireStaffPage("bookings.manage", "/admin/customers");
  if (!allowed) return <AccessDenied />;

  const { q, page } = parseCustomerParams(await searchParams);
  const all = await loadCustomers();
  const matching = filterCustomers(all, q);

  return (
    <CustomerList
      basePath="/admin/customers"
      bookingsPath="/admin/bookings"
      q={q}
      page={page}
      pageSize={PAGE_SIZE}
      rows={matching.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)}
      total={matching.length}
      summary={customerSummary(all)}
    />
  );
}
