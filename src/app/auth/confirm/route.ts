import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { safeAdminPath } from "@/lib/auth/redirects";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const ALLOWED_TYPES = new Set<EmailOtpType>(["invite", "recovery", "email", "magiclink"]);

/**
 * Handles links from Supabase Auth emails (staff invitations and password
 * resets). Exchanges the one-time token for a session, then continues to a
 * same-site admin page (open redirects are rejected).
 *
 * Email templates must link to:
 *   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=<type>&next=/admin/account
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeAdminPath(searchParams.get("next"), "/admin/account");

  const fail = (reason: string) => {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = `?error=${reason}`;
    return NextResponse.redirect(url);
  };

  if (!isSupabaseConfigured()) return fail("unconfigured");
  if (!tokenHash || !type || !ALLOWED_TYPES.has(type)) return fail("invalid_link");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
  if (error) return fail("expired_link");

  const url = request.nextUrl.clone();
  url.pathname = next.split("?")[0];
  url.search = type === "invite" || type === "recovery" ? "?set_password=1" : "";
  return NextResponse.redirect(url);
}
