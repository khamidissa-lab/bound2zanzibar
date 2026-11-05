import "server-only";

import { buildCustomers, type Customer } from "@/lib/customers";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Most recent records considered when building the customer list. */
const SOURCE_LIMIT = 2000;

function failed(what: string, error: { message: string }): never {
  console.error(`[customers] failed to ${what}: ${error.message}`);
  throw new Error(`Failed to ${what}`);
}

/**
 * Customers derived from booking requests and enquiries. Reads with the
 * signed-in session, so RLS limits this to staff who may see bookings.
 */
export async function loadCustomers(): Promise<Customer[]> {
  const supabase = await createSupabaseServerClient();
  const [bookings, enquiries] = await Promise.all([
    supabase
      .from("bookings")
      .select("customer_name, email, phone, created_at, status")
      .order("created_at", { ascending: false })
      .limit(SOURCE_LIMIT),
    supabase
      .from("inquiries")
      .select("name, email, phone, created_at")
      .order("created_at", { ascending: false })
      .limit(SOURCE_LIMIT),
  ]);
  if (bookings.error) failed("load bookings", bookings.error);
  if (enquiries.error) failed("load enquiries", enquiries.error);
  return buildCustomers(bookings.data, enquiries.data);
}

/** Header notification counts; null when they can't be loaded. */
export async function loadNotificationCounts(): Promise<{
  pendingBookings: number;
  newEnquiries: number;
} | null> {
  const supabase = await createSupabaseServerClient();
  const [bookings, enquiries] = await Promise.all([
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("inquiries")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
  ]);
  if (bookings.error || enquiries.error) return null;
  return { pendingBookings: bookings.count ?? 0, newEnquiries: enquiries.count ?? 0 };
}
