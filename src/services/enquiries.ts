import "server-only";

import {
  ENQUIRY_STATUSES,
  type EnquiryRequest,
  type EnquiryStatus,
} from "@/lib/enquiry/request";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { sanitizeSearch } from "./bookings";

/** Public: saves a contact-form message through the SECURITY DEFINER function. */
export async function submitEnquiry(
  req: EnquiryRequest,
): Promise<{ ok: true } | { ok: false; dbMessage: string }> {
  const supabase = createSupabasePublicClient();
  const { error } = await supabase.rpc("submit_inquiry", {
    p_name: req.name,
    p_email: req.email,
    p_message: req.message,
    p_phone: req.phone || undefined,
    p_subject: req.subject || undefined,
  });
  return error ? { ok: false, dbMessage: error.message } : { ok: true };
}

export type Enquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: EnquiryStatus;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type EnquiryFilters = { status?: EnquiryStatus; q?: string };

export const ENQUIRY_PAGE_SIZE = 25;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyFilters<Q extends { eq: any; or: any }>(query: Q, f: EnquiryFilters): Q {
  let q = query;
  if (f.status && ENQUIRY_STATUSES.includes(f.status)) q = q.eq("status", f.status);
  const search = sanitizeSearch(f.q ?? "").replace(/[%_]/g, "");
  if (search) {
    const like = `%${search}%`;
    q = q.or(`name.ilike.${like},email.ilike.${like},subject.ilike.${like}`);
  }
  return q;
}

function failed(what: string, error: { message: string }): never {
  console.error(`[enquiries] failed to ${what}: ${error.message}`);
  throw new Error(`Failed to ${what}`);
}

export async function listEnquiries(
  filters: EnquiryFilters,
  page: number,
): Promise<{ rows: Enquiry[]; total: number }> {
  const supabase = await createSupabaseServerClient();
  const start = (Math.max(1, page) - 1) * ENQUIRY_PAGE_SIZE;
  const { data, error, count } = await applyFilters(
    supabase.from("inquiries").select("*", { count: "exact" }),
    filters,
  )
    .order("created_at", { ascending: false })
    .range(start, start + ENQUIRY_PAGE_SIZE - 1);
  if (error) failed("load enquiries", error);
  return { rows: data as Enquiry[], total: count ?? 0 };
}

export async function countEnquiriesByStatus(
  filters: EnquiryFilters,
): Promise<Record<EnquiryStatus, number>> {
  const supabase = await createSupabaseServerClient();
  const results = await Promise.all(
    ENQUIRY_STATUSES.map((status) =>
      applyFilters(
        supabase.from("inquiries").select("id", { count: "exact", head: true }),
        {
          ...filters,
          status,
        },
      ),
    ),
  );
  return Object.fromEntries(
    ENQUIRY_STATUSES.map((s, i) => [s, results[i].count ?? 0]),
  ) as Record<EnquiryStatus, number>;
}

export async function getEnquiry(id: string): Promise<Enquiry | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("inquiries")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) failed("load enquiry", error);
  return (data as Enquiry | null) ?? null;
}

export async function updateEnquiry(
  id: string,
  update: { status: EnquiryStatus; internalNotes: string },
): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("inquiries")
    .update({ status: update.status, internal_notes: update.internalNotes || null })
    .eq("id", id)
    .select("id");
  if (error) failed("update enquiry", error);
  return (data ?? []).length > 0;
}
