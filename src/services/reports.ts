import "server-only";

import type { Enums } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import type { ReportBooking, ReportInput } from "./reports-model";

type BookingRow = {
  status: Enums<"booking_status">;
  created_at: string;
  market: Enums<"market">;
  currency: string;
  quoted_total: number | string | null;
  item_type: Enums<"booking_item_type">;
  adults: number;
  children: number;
  tour: { name: string; destination: { name: string } | null } | null;
  package: { name: string } | null;
};

function failed(what: string, error: { message: string }): never {
  console.error(`[reports] failed to load ${what}: ${error.message}`);
  throw new Error(`Failed to load ${what}`);
}

/**
 * Report input, read with the staff member's own session so RLS applies.
 * No customer names or contact details are loaded.
 */
export async function loadReportInput(): Promise<ReportInput> {
  const supabase = await createSupabaseServerClient();
  const [bookings, payments, inquiries, journeys] = await Promise.all([
    supabase
      .from("bookings")
      .select(
        "status, created_at, market, currency, quoted_total, item_type, adults, children, tour:tours(name, destination:destinations(name)), package:packages(name)",
      )
      .order("created_at", { ascending: false })
      .limit(10000),
    supabase.from("booking_payments").select("amount, currency, paid_on").limit(10000),
    supabase.from("inquiries").select("created_at").limit(10000),
    supabase.from("journey_requests").select("created_at").limit(10000),
  ]);
  if (bookings.error) failed("bookings", bookings.error);
  if (payments.error) failed("payments", payments.error);
  if (inquiries.error) failed("enquiries", inquiries.error);
  if (journeys.error) failed("journey requests", journeys.error);

  return {
    bookings: (bookings.data as unknown as BookingRow[]).map((b): ReportBooking => ({
      status: b.status,
      createdAt: b.created_at,
      market: b.market,
      currency: b.currency,
      quotedTotal: b.quoted_total === null ? null : Number(b.quoted_total),
      itemKind: b.item_type,
      itemName: b.tour?.name ?? b.package?.name ?? "—",
      destinationName: b.tour?.destination?.name ?? null,
      travellers: b.adults + b.children,
    })),
    payments: payments.data.map((p) => ({
      amount: Number(p.amount),
      currency: p.currency,
      paidOn: p.paid_on,
    })),
    inquiries: inquiries.data.map((i) => ({ createdAt: i.created_at })),
    journeys: journeys.data.map((j) => ({ createdAt: j.created_at })),
  };
}
