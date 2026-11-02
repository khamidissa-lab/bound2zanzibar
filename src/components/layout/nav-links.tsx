import Link from "next/link";

import type { NavItem } from "@/config/site";
import { cn } from "@/lib/utils";

/** True when `pathname` is the item's route or one of its child routes. */
export function isActivePath(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

type NavLinksProps = {
  items: readonly NavItem[];
  /** `null` while the pathname is unknown (e.g. during prerender fallback). */
  pathname: string | null;
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
};

/**
 * Presentational list of navigation links. Hook-free so it can render both
 * inside Client Components and as a server-rendered Suspense fallback.
 */
export function NavLinks({ items, pathname, variant, onNavigate }: NavLinksProps) {
  return (
    <ul
      className={cn(
        variant === "desktop" ? "flex items-center gap-1" : "flex flex-col gap-1",
      )}
    >
      {items.map((item) => {
        const active = isActivePath(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              onClick={onNavigate}
              className={cn(
                "transition-colors",
                variant === "desktop" &&
                  "relative rounded-full px-3 py-2 text-sm font-medium text-ocean-deep/80 hover:bg-sand-soft hover:text-ocean-deep aria-[current=page]:text-ocean-deep aria-[current=page]:after:absolute aria-[current=page]:after:inset-x-3 aria-[current=page]:after:-bottom-0.5 aria-[current=page]:after:h-0.5 aria-[current=page]:after:rounded-full aria-[current=page]:after:bg-turquoise",
                variant === "mobile" &&
                  "flex items-center rounded-xl px-4 py-3 font-display text-xl text-ocean-deep hover:bg-sand-soft aria-[current=page]:bg-turquoise-soft",
              )}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
