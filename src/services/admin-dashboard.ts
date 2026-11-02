import "server-only";

import { can, type StaffRole } from "@/lib/auth/permissions";
import type { Enums } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPackages, getTours } from "@/services/content";

import type {
  BookingLite,
  DashboardInput,
  FeaturedItem,
  InquiryLite,
  StatusEventLite,
} from "./admin-dashboard-model";

/** Featured tours first, then packages (published content, either source). */
export async function loadFeatured(): Promise<FeaturedItem[]> {
  const [tours, packages] = await Promise.all([
    getTours({ featured: true }),
    getPackages({ featured: true }),
  ]);
  return [
    ...tours.map((t) => ({
      kind: "tour" as const,
      name: t.name,
      slug: t.slug,
      meta: t.duration,
      image: t.coverImage,
      prices: t.prices,
    })),
    ...packages.map((p) => ({
      kind: "package" as const,
      name: p.name,
      slug: p.slug,
      meta: `${p.days} days / ${p.nights} nights`,
      image: p.coverImage,
      prices: p.prices,
    })),
  ];
}

function failed(what: string, error: { message: string }): never {
  console.error(`[dashboard] failed to load ${what}: ${error.message}`);
  throw new Error(`Failed to load ${what}`);
}

type BookingRow = {
  reference: string;
  status: Enums<"booking_status">;
  preferred_date: string;
  created_at: string;
  adults: number;
  children: number;
  customer_name: string;
  tour: { name: string; destination: { name: string } | null } | null;
  package: { name: string } | null;
};

type EventRow = {
  to_status: Enums<"booking_status">;
  from_status: Enums<"booking_status"> | null;
  changed_by: string | null;
  created_at: string;
  booking: { reference: string } | null;
};

/**
 * Real dashboard input, read with the staff member's session (RLS applies).
 * Booking data is only queried for roles allowed to manage bookings.
 */
export async function loadDashboardInput(role: StaffRole): Promise<DashboardInput> {
  const supabase = await createSupabaseServerClient();
  const head = { count: "exact" as const, head: true };

  const [published, drafts, packages, destinations, tourRows, featured] =
    await Promise.all([
      supabase.from("tours").select("id", head).eq("status", "published"),
      supabase.from("tours").select("id", head).eq("status", "draft"),
      supabase.from("packages").select("id", head).eq("status", "published"),
      supabase.from("destinations").select("id", head).eq("status", "published"),
      supabase
        .from("tours")
        .select("destination:destinations(name)")
        .eq("status", "published"),
      loadFeatured(),
    ]);
  if (tourRows.error) failed("tours", tourRows.error);

  const input: DashboardInput = {
    bookings: [],
    events: [],
    inquiries: [],
    publishedTours: (
      tourRows.data as unknown as { destination: { name: string } | null }[]
    ).map((t) => ({ destinationName: t.destination?.name ?? null })),
    content: {
      publishedTours: published.count ?? 0,
      draftTours: drafts.count ?? 0,
      publishedPackages: packages.count ?? 0,
      destinations: destinations.count ?? 0,
    },
    featured,
  };

  if (!can(role, "bookings.manage")) return input;

  const [bookings, events, inquiries, profiles] = await Promise.all([
    supabase
      .from("bookings")
      .select(
        "reference, status, preferred_date, created_at, adults, children, customer_name, tour:tours(name, destination:destinations(name)), package:packages(name)",
      )
      .order("created_at", { ascending: false })
      .limit(2000),
    supabase
      .from("booking_status_events")
      .select(
        "to_status, from_status, changed_by, created_at, booking:bookings(reference)",
      )
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("inquiries")
      .select("name, subject, status, created_at")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.from("profiles").select("id, full_name"),
  ]);
  if (bookings.error) failed("bookings", bookings.error);
  if (events.error) failed("activity", events.error);
  if (inquiries.error) failed("enquiries", inquiries.error);

  const names = new Map((profiles.data ?? []).map((p) => [p.id, p.full_name]));

  input.bookings = (bookings.data as unknown as BookingRow[]).map((b): BookingLite => ({
    reference: b.reference,
    status: b.status,
    preferredDate: b.preferred_date,
    createdAt: b.created_at,
    adults: b.adults,
    children: b.children,
    customerName: b.customer_name,
    itemName: b.tour?.name ?? b.package?.name ?? "—",
    destinationName: b.tour?.destination?.name ?? null,
  }));
  input.events = (events.data as unknown as EventRow[]).map((e): StatusEventLite => ({
    reference: e.booking?.reference ?? "—",
    toStatus: e.to_status,
    fromStatus: e.from_status,
    changedBy: e.changed_by ? (names.get(e.changed_by) ?? "A team member") : null,
    createdAt: e.created_at,
  }));
  input.inquiries = inquiries.data.map((i): InquiryLite => ({
    name: i.name,
    subject: i.subject,
    status: i.status,
    createdAt: i.created_at,
  }));
  return input;
}
