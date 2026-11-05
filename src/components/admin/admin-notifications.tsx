"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CalendarCheck, Inbox } from "lucide-react";

import { cn } from "@/lib/utils";

export type NotificationCounts = { pendingBookings: number; newEnquiries: number };

/**
 * Header bell with real counts: booking requests waiting for confirmation and
 * enquiries not yet answered. Closes on Escape, outside click or navigation.
 */
export function AdminNotifications({
  counts,
  basePath = "/admin",
}: {
  counts: NotificationCounts;
  basePath?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const total = counts.pendingBookings + counts.newEnquiries;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const items = [
    {
      icon: CalendarCheck,
      count: counts.pendingBookings,
      label: "booking requests waiting for confirmation",
      single: "booking request waiting for confirmation",
      href: `${basePath}/bookings?status=pending`,
    },
    {
      icon: Inbox,
      count: counts.newEnquiries,
      label: "new enquiries to answer",
      single: "new enquiry to answer",
      href: `${basePath}/enquiries?status=new`,
    },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={
          total > 0 ? `Notifications: ${total} need attention` : "Notifications: none"
        }
        onClick={() => setOpen((o) => !o)}
        className="relative flex size-10 items-center justify-center rounded-lg border bg-card text-ocean-deep hover:bg-muted"
      >
        <Bell className="size-4.5" aria-hidden="true" />
        {total > 0 ? (
          <span
            aria-hidden="true"
            className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[0.65rem] font-semibold text-white"
          >
            {total > 99 ? "99+" : total}
          </span>
        ) : null}
      </button>
      <div
        id={panelId}
        hidden={!open}
        className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border bg-card shadow-card"
      >
        <p className="border-b px-4 py-3 text-sm font-semibold text-ocean-deep">
          Notifications
        </p>
        {total === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            You&apos;re all caught up.
          </p>
        ) : (
          <ul className="divide-y">
            {items
              .filter((i) => i.count > 0)
              .map(({ icon: Icon, count, label, single, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted"
                  >
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-lg bg-turquoise-soft text-turquoise-deep",
                      )}
                    >
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="text-ocean-deep">
                      <span className="font-semibold tabular-nums">{count}</span>{" "}
                      {count === 1 ? single : label}
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}
