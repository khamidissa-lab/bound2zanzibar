import "server-only";

import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { can, type Permission, type StaffRole } from "./permissions";

export type StaffUser = {
  id: string;
  email: string;
  fullName: string;
  role: StaffRole;
};

export type StaffAccess =
  | { kind: "unconfigured" }
  | { kind: "signed_out" }
  | { kind: "no_access"; email: string | null }
  | { kind: "ok"; staff: StaffUser };

/**
 * Data Access Layer: the single place that resolves who the current staff
 * member is. Verifies the session with Supabase Auth, then loads the profile
 * through RLS (a user can only read their own profile). Memoised per request.
 * Never trust a role sent from the browser.
 */
export const getStaffAccess = cache(async (): Promise<StaffAccess> => {
  // Always evaluate at request time — never prerender an access decision.
  await connection();
  if (!isSupabaseConfigured()) return { kind: "unconfigured" };

  const supabase = await createSupabaseServerClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  if (claimsError || !claims?.sub) return { kind: "signed_out" };

  const email = typeof claims.email === "string" ? claims.email : null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role, is_active")
    .eq("id", claims.sub)
    .maybeSingle();

  if (!profile || !profile.is_active) return { kind: "no_access", email };

  return {
    kind: "ok",
    staff: {
      id: profile.id,
      email: email ?? "",
      fullName: profile.full_name,
      role: profile.role,
    },
  };
});

/**
 * For pages: returns the staff member, redirecting to login when signed out.
 * Returns `null` when signed in but not allowed (render an access-denied state).
 */
export async function requireStaffPage(
  permission: Permission,
  currentPath = "/admin",
): Promise<{ staff: StaffUser; allowed: boolean }> {
  const access = await getStaffAccess();
  if (access.kind === "unconfigured" || access.kind === "signed_out") {
    redirect(`/admin/login?next=${encodeURIComponent(currentPath)}`);
  }
  if (access.kind === "no_access") {
    redirect("/admin/no-access");
  }
  return { staff: access.staff, allowed: can(access.staff.role, permission) };
}

export type ActionAuth = { ok: true; staff: StaffUser } | { ok: false; message: string };

/** For Server Actions: re-verifies the session and permission on every call. */
export async function authorizeAction(permission: Permission): Promise<ActionAuth> {
  const access = await getStaffAccess();
  if (access.kind !== "ok") {
    return { ok: false, message: "Your session has ended. Please sign in again." };
  }
  if (!can(access.staff.role, permission)) {
    return { ok: false, message: "You don't have permission to do that." };
  }
  return { ok: true, staff: access.staff };
}
