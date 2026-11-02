import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";
import { getSupabasePublicEnv } from "./env";

/**
 * Cookie-less client that always acts as a visitor (`anon`). Used for public,
 * cacheable reads: RLS limits it to published content, and because it never
 * touches cookies its results can be shared across all visitors.
 */
export function createSupabasePublicClient() {
  const { url, publishableKey } = getSupabasePublicEnv();
  return createClient<Database>(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
