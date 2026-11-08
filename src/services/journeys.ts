import "server-only";

import {
  JOURNEY_STATUSES,
  type JourneyRequest,
  type JourneyStatus,
} from "@/lib/journey/request";
import type { Tables } from "@/lib/supabase/database.types";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { sanitizeSearch } from "./bookings";

/** Public: saves a custom journey request through the SECURITY DEFINER function. */
export async function submitJourneyRequest(
  req: JourneyRequest,
  locale: string,
): Promise<{ ok: true; reference: string } | { ok: false; dbMessage: string }> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase.rpc("submit_journey_request", {
    p_customer_name: req.customerName,
    p_email: req.email,
    p_adults: req.adults,
    p_children: req.children,
    p_phone: req.phone || undefined,
    p_country: req.country || undefined,
    p_destinations: req.destinations,
    p_start_date: req.startDate || undefined,
    p_end_date: req.endDate || undefined,
    p_flexible_dates: req.flexibleDates,
    p_accommodation: req.accommodation,
    p_budget_amount: req.budgetAmount ? Number(req.budgetAmount) : undefined,
    p_budget_currency: req.budgetAmount ? req.budgetCurrency : undefined,
    p_interests: req.interests,
    p_special_requirements: req.specialRequirements || undefined,
    p_message: req.message || undefined,
    p_locale: locale,
  });
  if (error || !data) return { ok: false, dbMessage: error?.message ?? "" };
  return { ok: true, reference: data };
}

// ---------------------------------------------------------------------------
// Staff: read with the signed-in session, so RLS decides who sees what.
// ---------------------------------------------------------------------------

export type Journey = Tables<"journey_requests">;
export type JourneyFilters = { status?: JourneyStatus; q?: string };

export const JOURNEY_PAGE_SIZE = 25;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyFilters<Q extends { eq: any; or: any }>(query: Q, f: JourneyFilters): Q {
  let q = query;
  if (f.status && JOURNEY_STATUSES.includes(f.status)) q = q.eq("status", f.status);
  const search = sanitizeSearch(f.q ?? "").replace(/[%_]/g, "");
  if (search) {
    const like = `%${search}%`;
    q = q.or(`customer_name.ilike.${like},email.ilike.${like},reference.ilike.${like}`);
  }
  return q;
}

function failed(what: string, error: { message: string }): never {
  console.error(`[journeys] failed to ${what}: ${error.message}`);
  throw new Error(`Failed to ${what}`);
}

export async function listJourneys(
  filters: JourneyFilters,
  page: number,
): Promise<{ rows: Journey[]; total: number }> {
  const supabase = await createSupabaseServerClient();
  const start = (Math.max(1, page) - 1) * JOURNEY_PAGE_SIZE;
  const { data, error, count } = await applyFilters(
    supabase.from("journey_requests").select("*", { count: "exact" }),
    filters,
  )
    .order("created_at", { ascending: false })
    .range(start, start + JOURNEY_PAGE_SIZE - 1);
  if (error) failed("load journey requests", error);
  return { rows: data ?? [], total: count ?? 0 };
}

export async function countJourneysByStatus(
  filters: JourneyFilters,
): Promise<Record<JourneyStatus, number>> {
  const supabase = await createSupabaseServerClient();
  const counts = await Promise.all(
    JOURNEY_STATUSES.map(async (status) => {
      const { count, error } = await applyFilters(
        supabase.from("journey_requests").select("id", { count: "exact", head: true }),
        { ...filters, status },
      );
      if (error) failed("count journey requests", error);
      return [status, count ?? 0] as const;
    }),
  );
  return Object.fromEntries(counts) as Record<JourneyStatus, number>;
}

export async function getJourney(reference: string): Promise<Journey | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("journey_requests")
    .select("*")
    .eq("reference", reference)
    .maybeSingle();
  if (error) failed("load journey request", error);
  return data;
}

/** Updates status and notes; returns false when no row was visible to update. */
export async function updateJourney(
  id: string,
  update: { status: JourneyStatus; internalNotes: string },
): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("journey_requests")
    .update({ status: update.status, internal_notes: update.internalNotes || null })
    .eq("id", id)
    .select("id");
  if (error) failed("update journey request", error);
  return (data ?? []).length > 0;
}
