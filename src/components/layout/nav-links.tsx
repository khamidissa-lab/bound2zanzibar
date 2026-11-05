import { LocaleLink as Link } from "@/components/i18n/locale-link";
import type { NavItem } from "@/config/site";
import { splitLocale } from "@/i18n/config";
import { cn } from "@/lib/utils";

/** True when `pathname` (any language) is the item's route or a child route. */
export function isActivePath(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  const { path } = splitLocale(pathname);
  if (href === "/") return path === "/";
  return path === href || path.startsWith(`${href}/`);
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
        variant === "desktop" ? "flex items-center gap-0.5" : "flex flex-col",
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
                  "relative px-2.5 py-2 text-[0.76rem] font-medium tracking-[0.04em] whitespace-nowrap text-ocean-deep/75 uppercase after:absolute after:inset-x-2.5 after:bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-ocean-deep after:transition-transform after:duration-300 hover:text-ocean-deep hover:after:scale-x-100 aria-[current=page]:text-ocean-deep aria-[current=page]:after:scale-x-100 aria-[current=page]:after:bg-gold-deep",
                variant === "mobile" &&
                  "flex items-baseline justify-between border-b border-white/10 py-3.5 font-display text-[1.9rem] leading-none text-ivory hover:text-gold-light aria-[current=page]:text-gold-light",
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
