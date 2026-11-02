import type { ReactNode } from "react";
import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";

import { signOut } from "@/app/admin/_actions/auth";
import { Logo } from "@/components/layout/logo";
import { ROLE_LABELS, type StaffRole } from "@/lib/auth/permissions";

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
 * Admin chrome: white sidebar with pill navigation, and a top bar with the
 * staff member. Purely presentational — callers must have authorised access
 * (or be the development preview, which passes `preview`).
 */
export function AdminFrame({
  staff,
  preview = false,
  children,
}: {
  staff: { fullName: string; role: StaffRole };
  preview?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-1 bg-[#F3F5F4]">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r bg-card px-4 py-5 lg:flex">
        <Logo className="mb-8 px-2" />
        <div className="flex-1 overflow-y-auto">
          <AdminSidebarNav role={staff.role} />
        </div>
        {preview ? null : (
          <form action={signOut} className="mt-4 border-t pt-4">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ocean-deep/75 hover:bg-sand-soft hover:text-ocean-deep"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Log out
            </button>
          </form>
        )}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between gap-3 px-4 sm:px-8">
          <div className="flex items-center gap-2 lg:hidden">
            <AdminMobileNav role={staff.role} />
            <span className="font-display text-lg text-ocean-deep">Admin</span>
          </div>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/"
              target="_blank"
              className="hidden items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-sm text-ocean-deep shadow-card hover:bg-sand-soft sm:inline-flex"
            >
              View site
              <ExternalLink className="size-3.5" aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </Link>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-ocean-deep">{staff.fullName}</p>
                <p className="text-xs text-muted-foreground">{ROLE_LABELS[staff.role]}</p>
              </div>
              <span
                aria-hidden="true"
                className="flex size-10 items-center justify-center rounded-xl bg-ocean-deep text-sm font-semibold text-white"
              >
                {initials(staff.fullName)}
              </span>
            </div>
            {preview ? null : (
              <form action={signOut} className="lg:hidden">
                <button
                  type="submit"
                  aria-label="Log out"
                  className="flex size-9 items-center justify-center rounded-lg text-ocean-deep hover:bg-sand-soft"
                >
                  <LogOut className="size-4" aria-hidden="true" />
                </button>
              </form>
            )}
          </div>
        </header>
        <main id="main-content" className="flex-1 px-4 pb-10 sm:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
