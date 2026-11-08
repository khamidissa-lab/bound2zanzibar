import "server-only";

import type { BookingRequest } from "@/lib/booking/request";
import { BOOKING_STATUSES, type BookingStatus } from "@/lib/booking/status";
import type { Enums } from "@/lib/supabase/database.types";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Public: submit a request through the SECURITY DEFINER function. Visitors
// have no table access; the function returns only the new reference.
// ---------------------------------------------------------------------------

export type SubmitResult =
  { ok: true; reference: string } | { ok: false; dbMessage: string };

export async function submitBookingRequest(req: BookingRequest): Promise<SubmitResult> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase.rpc("submit_booking_request", {
    p_item_type: req.item.type,
    p_item_slug: req.item.slug,
    p_customer_name: req.customerName,
    p_email: req.email,
    p_phone: req.phone,
    p_market: req.market,
    p_currency: req.currency,
    p_preferred_date: req.preferredDate,
    p_adults: req.adults,
    p_children: req.children,
    p_pickup_location: req.pickupLocation || undefined,
    p_message: req.message || undefined,
    p_option_ids: req.optionIds,
  });
  const reference = data?.[0]?.reference;
  if (error || !reference) return { ok: false, dbMessage: error?.message ?? "" };
  return { ok: true, reference };
}

// ---------------------------------------------------------------------------
// Staff: read with the signed-in session, so RLS decides who sees what.
// ---------------------------------------------------------------------------

export type BookingFilters = {
  status?: BookingStatus;
  type?: Enums<"booking_item_type">;
  q?: string;
  /** Preferred travel date range, inclusive ("YYYY-MM-DD"). */
  from?: string;
  to?: string;
};

export const PAGE_SIZE = 25;
const EXPORT_LIMIT = 5000;

const LIST_COLUMNS =
  "id, reference, status, item_type, customer_name, email, phone, market, currency, preferred_date, adults, children, quoted_total, created_at, tour:tours(name, slug), package:packages(name, slug)";

export type BookingListRow = {
  id: string;
  reference: string;
  status: BookingStatus;
  item_type: Enums<"booking_item_type">;
  customer_name: string;
  email: string;
  phone: string;
  market: Enums<"market">;
  currency: string;
  preferred_date: string;
  adults: number;
  children: number;
  quoted_total: number | null;
  created_at: string;
  tour: { name: string; slug: string } | null;
  package: { name: string; slug: string } | null;
};

export type BookingDetail = BookingListRow & {
  pickup_location: string | null;
  message: string | null;
  internal_notes: string | null;
  source: string;
  updated_at: string;
  /** Options chosen at request time (snapshot); loaded on the detail page. */
  options?: BookingOptionSnapshot[];
  /** Private review link key, created when the booking is completed. */
  review_token?: string | null;
};

export type BookingOptionSnapshot = {
  name: string;
  pricing: "per_person" | "per_booking";
  amount: number | null;
  total: number | null;
};

export type BookingPayment = {
  id: string;
  amount: number;
  currency: string;
  method: Enums<"payment_method">;
  reference: string | null;
  paid_on: string;
  notes: string | null;
  /** Staff member name (resolved from recorded_by). */
  recorded_by: string | null;
  created_at: string;
};

export type BookingEvent = {
  from_status: BookingStatus | null;
  to_status: BookingStatus;
  changed_by: string | null;
  created_at: string;
};

/**
 * Search text is used inside a PostgREST `or` filter, so keep only characters
 * that can appear in a name, email or reference — never commas or brackets.
 */
export function sanitizeSearch(q: string): string {
  return q
    .replace(/[^\p{L}\p{N}@._+ -]/gu, "")
    .trim()
    .slice(0, 100);
}

const isIsoDate = (v: string | undefined): v is string =>
  !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);

// Kept loose: the builder type changes after every filter call.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyFilters<Q extends { eq: any; gte: any; lte: any; or: any }>(
  query: Q,
  filters: BookingFilters,
): Q {
  let q = query;
  if (filters.status && BOOKING_STATUSES.includes(filters.status)) {
    q = q.eq("status", filters.status);
  }
  if (filters.type === "tour" || filters.type === "package")
    q = q.eq("item_type", filters.type);
  if (isIsoDate(filters.from)) q = q.gte("preferred_date", filters.from);
  if (isIsoDate(filters.to)) q = q.lte("preferred_date", filters.to);
  const search = sanitizeSearch(filters.q ?? "");
  if (search) {
    const like = `%${search.replace(/[%_]/g, "")}%`;
    q = q.or(
      `reference.ilike.${like},customer_name.ilike.${like},email.ilike.${like},phone.ilike.${like}`,
    );
  }
  return q;
}

function failed(what: string, error: { message: string }): never {
  console.error(`[bookings] failed to ${what}: ${error.message}`);
  throw new Error(`Failed to ${what}`);
}

export async function listBookings(
  filters: BookingFilters,
  page: number,
): Promise<{ rows: BookingListRow[]; total: number }> {
  const supabase = await createSupabaseServerClient();
  const start = (Math.max(1, page) - 1) * PAGE_SIZE;
  const { data, error, count } = await applyFilters(
    supabase.from("bookings").select(LIST_COLUMNS, { count: "exact" }),
    filters,
  )
    .order("created_at", { ascending: false })
    .range(start, start + PAGE_SIZE - 1);
  if (error) failed("load bookings", error);
  return { rows: data as unknown as BookingListRow[], total: count ?? 0 };
}

/** Number of bookings per status (ignores the status filter, keeps the others). */
export async function countByStatus(
  filters: BookingFilters,
): Promise<Record<BookingStatus, number>> {
  const supabase = await createSupabaseServerClient();
  const results = await Promise.all(
    BOOKING_STATUSES.map((status) =>
      applyFilters(
        supabase.from("bookings").select("id", { count: "exact", head: true }),
        {
          ...filters,
          status,
        },
      ),
    ),
  );
  return Object.fromEntries(
    BOOKING_STATUSES.map((status, i) => [status, results[i].count ?? 0]),
  ) as Record<BookingStatus, number>;
}

export async function getBooking(reference: string): Promise<{
  booking: BookingDetail;
  events: BookingEvent[];
  payments: BookingPayment[];
} | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(
      `${LIST_COLUMNS}, pickup_location, message, internal_notes, source, updated_at, options, review_token, events:booking_status_events(from_status, to_status, changed_by, created_at), payments:booking_payments(id, amount, currency, method, reference, paid_on, notes, recorded_by, created_at)`,
    )
    .eq("reference", reference)
    .maybeSingle();
  if (error) failed("load booking", error);
  if (!data) return null;

  const { events, payments, ...booking } = data as unknown as BookingDetail & {
    events: BookingEvent[];
    payments: BookingPayment[];
  };
  const staffIds = [
    ...new Set(
      [...events.map((e) => e.changed_by), ...payments.map((p) => p.recorded_by)].filter(
        Boolean,
      ),
    ),
  ] as string[];
  const names = new Map<string, string>();
  if (staffIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", staffIds);
    for (const p of profiles ?? []) names.set(p.id, p.full_name ?? "A team member");
  }
  return {
    booking,
    events: events
      .map((e) => ({
        ...e,
        changed_by: e.changed_by ? (names.get(e.changed_by) ?? "A team member") : null,
      }))
      .sort((a, b) => b.created_at.localeCompare(a.created_at)),
    payments: payments
      .map((p) => ({
        ...p,
        amount: Number(p.amount),
        recorded_by: p.recorded_by ? (names.get(p.recorded_by) ?? "A team member") : null,
      }))
      .sort((a, b) => a.paid_on.localeCompare(b.paid_on)),
  };
}

export type PaymentInput = {
  bookingId: string;
  amount: number;
  currency: string;
  method: Enums<"payment_method">;
  reference: string;
  paidOn: string;
  notes: string;
};

/** Records a verified payment. RLS limits this to booking staff. */
export async function recordPayment(input: PaymentInput): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("booking_payments")
    .insert({
      booking_id: input.bookingId,
      amount: input.amount,
      currency: input.currency,
      method: input.method,
      reference: input.reference || null,
      paid_on: input.paidOn,
      notes: input.notes || null,
    })
    .select("id");
  if (error) {
    if (error.code === "42501") return false;
    failed("record payment", error);
  }
  return (data ?? []).length > 0;
}

/** Deletes a payment recorded in error. RLS limits this to admins. */
export async function deletePayment(id: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("booking_payments")
    .delete()
    .eq("id", id)
    .select("id");
  if (error) failed("delete payment", error);
  return (data ?? []).length > 0;
}

export async function exportBookings(filters: BookingFilters): Promise<BookingDetail[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await applyFilters(
    supabase
      .from("bookings")
      .select(
        `${LIST_COLUMNS}, pickup_location, message, internal_notes, source, updated_at`,
      ),
    filters,
  )
    .order("created_at", { ascending: false })
    .limit(EXPORT_LIMIT);
  if (error) failed("export bookings", error);
  return data as unknown as BookingDetail[];
}

export type BookingUpdate = { status: BookingStatus; internalNotes: string };

/**
 * Updates status and notes. "denied" when no row was visible to update;
 * "payment_required" when the database refuses "paid" because recorded
 * payments don't cover the quote yet.
 */
export async function updateBooking(
  id: string,
  update: BookingUpdate,
): Promise<"ok" | "denied" | "payment_required"> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("bookings")
    .update({ status: update.status, internal_notes: update.internalNotes || null })
    .eq("id", id)
    .select("id");
  if (error?.message.includes("booking_payment_required")) return "payment_required";
  if (error) failed("update booking", error);
  return (data ?? []).length > 0 ? "ok" : "denied";
}

export async function getBookingStatus(id: string): Promise<BookingStatus | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("bookings")
    .select("status")
    .eq("id", id)
    .maybeSingle();
  return data?.status ?? null;
}
