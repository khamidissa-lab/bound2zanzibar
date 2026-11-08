"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  BookOpen,
  CalendarCheck,
  Compass,
  Contact,
  History,
  Images,
  Inbox,
  Languages,
  LayoutDashboard,
  Lightbulb,
  Map,
  Menu,
  MessageSquareQuote,
  Package,
  Radio,
  Settings,
  Target,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { can, type Permission, type StaffRole } from "@/lib/auth/permissions";
import { cn } from "@/lib/utils";

type NavItem = { label: string; href: string; icon: LucideIcon; permission: Permission };

const groups: { title: string | null; items: NavItem[] }[] = [
  {
    title: null,
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
        permission: "dashboard.view",
      },
    ],
  },
  {
    title: "Content",
    items: [
      {
        label: "Tours",
        href: "/admin/tours",
        icon: Compass,
        permission: "content.manage",
      },
      {
        label: "Destinations",
        href: "/admin/destinations",
        icon: Map,
        permission: "content.manage",
      },
      {
        label: "Packages",
        href: "/admin/packages",
        icon: Package,
        permission: "content.manage",
      },
      {
        label: "Travel guide",
        href: "/admin/travel-guide",
        icon: BookOpen,
        permission: "content.manage",
      },
      {
        label: "Translations",
        href: "/admin/translations",
        icon: Languages,
        permission: "content.manage",
      },
      {
        label: "Reviews",
        href: "/admin/reviews",
        icon: MessageSquareQuote,
        permission: "content.manage",
      },
      {
        label: "Media",
        href: "/admin/media",
        icon: Images,
        permission: "content.manage",
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        label: "Bookings",
        href: "/admin/bookings",
        icon: CalendarCheck,
        permission: "bookings.manage",
      },
      {
        label: "Enquiries",
        href: "/admin/enquiries",
        icon: Inbox,
        permission: "bookings.manage",
      },
      {
        label: "Journey requests",
        href: "/admin/journeys",
        icon: Compass,
        permission: "bookings.manage",
      },
      {
        label: "Customers",
        href: "/admin/customers",
        icon: Contact,
        permission: "bookings.manage",
      },
    ],
  },
  {
    title: "Visitors",
    items: [
      {
        label: "Live visitors",
        href: "/admin/visitors/live",
        icon: Radio,
        permission: "visitors.view",
      },
      {
        label: "Visitor analytics",
        href: "/admin/visitors/analytics",
        icon: BarChart3,
        permission: "visitors.view",
      },
      {
        label: "Potential customers",
        href: "/admin/visitors/leads",
        icon: Target,
        permission: "visitors.view",
      },
      {
        label: "Visitor activity",
        href: "/admin/visitors",
        icon: Activity,
        permission: "visitors.view",
      },
      {
        label: "Customer insights",
        href: "/admin/visitors/insights",
        icon: Lightbulb,
        permission: "visitors.view",
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        label: "Site settings",
        href: "/admin/settings",
        icon: Settings,
        permission: "settings.manage",
      },
      { label: "Staff", href: "/admin/staff", icon: Users, permission: "staff.manage" },
      {
        label: "Activity log",
        href: "/admin/activity",
        icon: History,
        permission: "activity.view",
      },
      {
        label: "My account",
        href: "/admin/account",
        icon: UserCog,
        permission: "dashboard.view",
      },
    ],
  },
];

function isActive(pathname: string, href: string) {
  // Development previews mirror the real sections under /admin/preview.
  const path = pathname.replace(/^\/admin\/preview(?=\/|$)/, "/admin");
  if (href === "/admin") return path === "/admin";
  const matches = (h: string) => path === h || path.startsWith(`${h}/`);
  if (!matches(href)) return false;
  // The most specific section wins (/admin/visitors/live over /admin/visitors).
  return !ALL_HREFS.some(
    (h) => h.length > href.length && h.startsWith(href) && matches(h),
  );
}

const ALL_HREFS = groups.flatMap((g) => g.items.map((i) => i.href));

function NavList({ role, onNavigate }: { role: StaffRole; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="space-y-6">
      {groups.map((group) => {
        const items = group.items.filter((item) => can(role, item.permission));
        if (items.length === 0) return null;
        return (
          <div key={group.title ?? "main"}>
            {group.title ? (
              <p className="mb-2 px-3 text-[0.68rem] font-semibold tracking-[0.12em] text-white/60 uppercase">
                {group.title}
              </p>
            ) : null}
            <ul className="space-y-0.5">
              {items.map(({ label, href, icon: Icon }) => {
                const active = isActive(pathname, href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/8 hover:text-white",
                        active &&
                          "bg-white/12 font-medium text-white before:absolute before:inset-y-2 before:-left-3 before:w-1 before:rounded-r-full before:bg-turquoise hover:bg-white/12",
                      )}
                    >
                      <Icon className="size-4 shrink-0" aria-hidden="true" />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

export function AdminSidebarNav({ role }: { role: StaffRole }) {
  return (
    <nav aria-label="Admin">
      <NavList role={role} />
    </nav>
  );
}

export function AdminMobileNav({ role }: { role: StaffRole }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open admin menu"
            className="text-ocean-deep hover:bg-muted"
          />
        }
      >
        <Menu className="size-5" aria-hidden="true" />
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-72 border-none bg-ocean-deep p-4 text-white [&_[data-slot=sheet-close]]:text-white [&_[data-slot=sheet-close]]:hover:bg-white/10"
      >
        <SheetTitle className="mb-4 px-3 pt-2 text-base font-semibold text-white">
          Admin
        </SheetTitle>
        <nav aria-label="Admin">
          <NavList role={role} onNavigate={() => setOpen(false)} />
        </nav>
      </SheetContent>
    </Sheet>
  );
}
