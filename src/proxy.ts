import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, localizePath } from "@/i18n/config";
import { isPublicAdminPath } from "@/lib/auth/redirects";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Public pages: resolves the language. "/tours" is English (rewritten to the
 * internal /en/tours), "/fr/tours" is French, and "/en/…" redirects to the
 * unprefixed URL so each page has one English address. A visitor who chose
 * another language (cookie) is sent to that version of unprefixed URLs.
 */
function localeRouting(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;
  const first = pathname.split("/")[1] ?? "";

  if (first === DEFAULT_LOCALE) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(DEFAULT_LOCALE.length + 1) || "/";
    return NextResponse.redirect(url, 308);
  }
  if (isLocale(first)) return NextResponse.next();

  const preferred = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(preferred) && preferred !== DEFAULT_LOCALE) {
    const url = request.nextUrl.clone();
    url.pathname = localizePath(preferred, pathname);
    return NextResponse.redirect(url, 307);
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  url.search = search;
  return NextResponse.rewrite(url);
}

/**
 * Admin and auth routes: (1) refreshes the Supabase session cookie and (2)
 * optimistically sends signed-out visitors to the login page. It is NOT the
 * authorization check: every admin page and Server Action re-verifies the
 * user and role (src/lib/auth/session.ts), and the database enforces RLS.
 */
export async function proxy(request: NextRequest) {
  const { pathname: path } = request.nextUrl;
  if (!path.startsWith("/admin") && !path.startsWith("/auth")) {
    return localeRouting(request);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // Not configured yet: let pages render their own "setup required" state.
  if (!url || !key) return NextResponse.next({ request });

  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        for (const [header, value] of Object.entries(headers ?? {})) {
          response.headers.set(header, value);
        }
      },
    },
  });

  // Do not run code between client creation and this call (session refresh).
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims?.sub);

  const { pathname, search } = request.nextUrl;
  if (!signedIn && pathname.startsWith("/admin") && !isPublicAdminPath(pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  // Everything except Next internals, API routes and files with an extension
  // (images, icons, robots.txt, sitemap.xml…).
  matcher: ["/((?!_next/|api/|.*\\..*).*)"],
};
