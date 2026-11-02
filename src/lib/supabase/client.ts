"use client";

import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "./database.types";
import { getSupabasePublicEnv } from "./env";

/**
 * Supabase client for Client Components. Uses only the public key; all access
 * is governed by Row Level Security. Never import the admin client here.
 */
export function createSupabaseBrowserClient() {
  const { url, publishableKey } = getSupabasePublicEnv();
  return createBrowserClient<Database>(url, publishableKey);
}
