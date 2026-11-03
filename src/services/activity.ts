import "server-only";

import {
  ACTIVITY_AREAS,
  type ActivityArea,
  type ActivityEntry,
} from "@/lib/activity/format";
import type { Json } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const ACTIVITY_PAGE_SIZE = 50;

export type ActivityFilters = { area?: ActivityArea; actor?: string };

export type StaffEvent =
  "signed_in" | "signed_out" | "password_changed" | "bookings_exported";

/** Admins only (RLS): newest first, filtered by area and staff member. */
export async function listActivity(
  filters: ActivityFilters,
  page: number,
): Promise<{ rows: ActivityEntry[]; total: number }> {
  const supabase = await createSupabaseServerClient();
  const start = (Math.max(1, page) - 1) * ACTIVITY_PAGE_SIZE;
  let query = supabase.from("activity_log").select("*", { count: "exact" });
  if (filters.area)
    query = query.in("entity", [...ACTIVITY_AREAS[filters.area].entities]);
  if (filters.actor) query = query.eq("actor_id", filters.actor);

  const { data, error, count } = await query
    .order("occurred_at", { ascending: false })
    .order("id", { ascending: false })
    .range(start, start + ACTIVITY_PAGE_SIZE - 1);
  if (error) {
    console.error(`[activity] failed to load activity: ${error.message}`);
    throw new Error("Failed to load activity");
  }
  return { rows: data, total: count ?? 0 };
}

/** Staff members for the filter, including deactivated ones. */
export async function listActivityActors(): Promise<{ id: string; name: string }[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .order("full_name");
  if (error) return [];
  return data.map((p) => ({ id: p.id, name: p.full_name }));
}

/**
 * Records an event the database can't see by itself. Never throws: a logging
 * failure must not block signing in or out.
 */
export async function logStaffEvent(
  action: StaffEvent,
  details?: Record<string, Json>,
): Promise<void> {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.rpc("log_staff_event", {
      p_action: action,
      p_details: details,
    });
    // Signed-in users without a staff profile are not logged; that's expected.
    if (error && !error.message.includes("not_staff")) {
      console.error(`[activity] failed to log ${action}: ${error.message}`);
    }
  } catch (error) {
    console.error(`[activity] failed to log ${action}:`, error);
  }
}
