import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";
import { getSupabasePublicEnv } from "./env";

/**
 * Privileged client using the service-role key. It BYPASSES Row Level
 * Security, so use it only for narrowly scoped server tasks that cannot run as
 * the user (none are needed yet). The `server-only` import makes any attempt
 * to bundle this into client code fail at build time.
 */
export function createSupabaseAdminClient() {
  const { url } = getSupabasePublicEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set (server-only).");
  }
  return createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
