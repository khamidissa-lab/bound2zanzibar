/**
 * Returns `next` only if it is a same-site admin path; otherwise the fallback.
 * Prevents open redirects via `?next=https://evil.example` or `//evil.example`.
 */
export function safeAdminPath(
  next: string | null | undefined,
  fallback = "/admin",
): string {
  if (!next) return fallback;
  if (!next.startsWith("/admin") || next.startsWith("//") || next.includes("\\")) {
    return fallback;
  }
  try {
    const url = new URL(next, "http://localhost");
    if (url.origin !== "http://localhost") return fallback;
    if (url.pathname !== "/admin" && !url.pathname.startsWith("/admin/")) return fallback;
    return `${url.pathname}${url.search}`;
  } catch {
    return fallback;
  }
}

/** Admin pages that must stay reachable without a session. */
export const PUBLIC_ADMIN_PATHS = [
  "/admin/login",
  "/admin/forgot-password",
  "/admin/no-access",
  // Development-only dashboard preview; the page itself 404s in production.
  "/admin/preview",
] as const;

export function isPublicAdminPath(pathname: string): boolean {
  return PUBLIC_ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
