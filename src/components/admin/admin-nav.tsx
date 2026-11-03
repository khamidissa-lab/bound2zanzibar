"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CalendarCheck,
  Compass,
  History,
  Images,
  Inbox,
  LayoutDashboard,
  Map,
  Menu,
  MessageSquareQuote,
  Package,
  Settings,
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
  return path.startsWith(href);
}

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
              <p className="mb-2 px-3 text-xs font-semibold tracking-wide text-muted-foreground">
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
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ocean-deep/75 transition-colors hover:bg-sand-soft hover:text-ocean-deep",
                        active &&
                          "bg-turquoise-deep font-medium text-white shadow-sm hover:bg-turquoise-deep hover:text-white",
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
            className="text-ocean-deep"
          />
        }
      >
        <Menu className="size-5" aria-hidden="true" />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 bg-card p-4">
        <SheetTitle className="mb-4 px-3 pt-2 font-display text-lg text-ocean-deep">
          Admin
        </SheetTitle>
        <nav aria-label="Admin">
          <NavList role={role} onNavigate={() => setOpen(false)} />
        </nav>
      </SheetContent>
    </Sheet>
  );
}
