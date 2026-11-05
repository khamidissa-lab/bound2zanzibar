import type { ReactNode } from "react";
import Link from "next/link";
import { ExternalLink, LogOut, Search } from "lucide-react";

import { signOut } from "@/app/admin/_actions/auth";
import { Logo } from "@/components/layout/logo";
import { can, ROLE_LABELS, type StaffRole } from "@/lib/auth/permissions";

import { AdminNotifications, type NotificationCounts } from "./admin-notifications";
import { AdminMobileNav, AdminSidebarNav } from "./admin-nav";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/**
 * Admin chrome: deep-ocean sidebar, and a top bar with search, notifications
 * and the staff member. Purely presentational — callers must have authorised
 * access (or be the development preview, which passes `preview`).
 * `.admin-scope` switches the design tokens to the dashboard look.
 */
export function AdminFrame({
  staff,
  preview = false,
  notifications,
  children,
}: {
  staff: { fullName: string; role: StaffRole };
  preview?: boolean;
  /** Counts for the bell; omitted for staff who can't see bookings. */
  notifications?: NotificationCounts | null;
  children: ReactNode;
}) {
  const base = preview ? "/admin/preview" : "/admin";
  // Search goes where this staff member works: bookings, or tours for editors.
  const search = can(staff.role, "bookings.manage")
    ? { action: `${base}/bookings`, label: "Search bookings by name, email or reference" }
    : can(staff.role, "content.manage")
      ? { action: "/admin/tours", label: "Search tours" }
      : null;

  return (
    <div className="admin-scope flex flex-1 bg-background font-sans">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col bg-ocean-deep px-3 py-5 text-white lg:flex">
        <div className="mx-2 mb-7 rounded-lg bg-white px-3 py-2">
          <Logo />
        </div>
        <div className="flex-1 overflow-y-auto pr-1">
          <AdminSidebarNav role={staff.role} />
        </div>
        <div className="mt-4 border-t border-white/10 pt-4">
          <div className="flex items-center gap-3 px-3 py-2">
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-turquoise text-sm font-semibold text-ocean-deep"
            >
              {initials(staff.fullName)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{staff.fullName}</p>
              <p className="truncate text-xs text-white/60">{ROLE_LABELS[staff.role]}</p>
            </div>
          </div>
          {preview ? null : (
            <form action={signOut}>
              <button
                type="submit"
                className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white"
              >
                <LogOut className="size-4" aria-hidden="true" />
                Log out
              </button>
            </form>
          )}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-card/95 px-4 backdrop-blur sm:px-8">
          <div className="flex items-center gap-2 lg:hidden">
            <AdminMobileNav role={staff.role} />
            <span className="text-base font-semibold text-ocean-deep">Admin</span>
          </div>

          {search ? (
            <form
              action={search.action}
              method="get"
              role="search"
              className="relative hidden max-w-md flex-1 md:block"
            >
              <label>
                <span className="sr-only">{search.label}</span>
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  name="q"
                  placeholder={search.label}
                  className="h-10 w-full rounded-lg border bg-muted/60 pr-3 pl-9 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-turquoise-deep focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-turquoise-deep/25"
                />
              </label>
            </form>
          ) : null}

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden h-10 items-center gap-1.5 rounded-lg border bg-card px-3 text-sm text-ocean-deep hover:bg-muted sm:inline-flex"
            >
              View site
              <ExternalLink className="size-3.5" aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </Link>
            {notifications ? (
              <AdminNotifications counts={notifications} basePath={base} />
            ) : null}
            <span
              aria-hidden="true"
              className="flex size-10 items-center justify-center rounded-lg bg-ocean-deep text-sm font-semibold text-white lg:hidden"
            >
              {initials(staff.fullName)}
            </span>
            {preview ? null : (
              <form action={signOut} className="lg:hidden">
                <button
                  type="submit"
                  aria-label="Log out"
                  className="flex size-10 items-center justify-center rounded-lg text-ocean-deep hover:bg-muted"
                >
                  <LogOut className="size-4" aria-hidden="true" />
                </button>
              </form>
            )}
          </div>
        </header>
        <main id="main-content" className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
