"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, LogOut } from "lucide-react";

import { signOut } from "@/app/admin/_actions/auth";
import { cn } from "@/lib/utils";

export type AccountLink = { label: string; href: string };

/**
 * The signed-in staff member, top right of the admin: avatar, name and role,
 * opening a short menu of account and administration links plus Log out.
 * A disclosure (button + list), closed by Escape or a click outside.
 */
export function AccountMenu({
  name,
  role,
  initials,
  links,
  canSignOut,
}: {
  name: string;
  role: string;
  initials: string;
  links: AccountLink[];
  /** False in the development preview, which has no session. */
  canSignOut: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 items-center gap-2.5 rounded-lg pr-2 pl-1 text-left hover:bg-muted"
      >
        <span
          aria-hidden="true"
          className="flex size-8 shrink-0 items-center justify-center rounded-md bg-ocean-deep text-xs font-semibold text-white"
        >
          {initials}
        </span>
        <span className="hidden min-w-0 leading-tight sm:block">
          <span className="block max-w-40 truncate text-sm font-medium text-ocean-deep">
            {name}
          </span>
          <span className="block max-w-40 truncate text-xs text-muted-foreground">
            {role}
          </span>
        </span>
        <span className="sr-only sm:hidden">Account: {name}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      <div
        id={menuId}
        hidden={!open}
        className="absolute right-0 z-40 mt-2 w-60 rounded-xl border bg-card p-1.5 shadow-card"
      >
        <div className="border-b px-3 pt-2 pb-3">
          <p className="truncate text-sm font-medium text-ocean-deep">{name}</p>
          <p className="truncate text-xs text-muted-foreground">{role}</p>
        </div>
        <ul className="py-1.5">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm text-ocean-deep hover:bg-muted"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        {canSignOut ? (
          <form action={signOut} className="border-t pt-1.5">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#9A2A1F] hover:bg-[#FDE8E6]"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Log out
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
