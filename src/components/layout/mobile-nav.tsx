"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { bookNowItem, siteConfig, type NavItem } from "@/config/site";

import { NavLinks } from "./nav-links";

/**
 * Slide-in navigation for small screens. The dialog primitive provides focus
 * trapping, Escape-to-close and returns focus to the trigger on close.
 */
export function MobileNav({ items }: { items: readonly NavItem[] }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" aria-label="Open menu" />}
      >
        <Menu className="size-6" aria-hidden="true" />
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-sm bg-warm-white">
        <SheetHeader className="px-5 pt-6">
          <SheetTitle className="font-display text-2xl text-ocean-deep">Menu</SheetTitle>
          <SheetDescription>{siteConfig.tagline}</SheetDescription>
        </SheetHeader>
        <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-2">
          <MobileNavLinks items={items} onNavigate={close} />
        </nav>
        <SheetFooter className="border-t px-5 pb-8">
          <Link
            href={bookNowItem.href}
            onClick={close}
            className={buttonVariants({
              variant: "gold",
              size: "lg",
              className: "w-full",
            })}
          >
            {bookNowItem.label}
          </Link>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

/** Rendered only inside the open dialog, so the hook never runs at prerender. */
function MobileNavLinks({
  items,
  onNavigate,
}: {
  items: readonly NavItem[];
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  return (
    <NavLinks
      items={items}
      pathname={pathname}
      variant="mobile"
      onNavigate={onNavigate}
    />
  );
}
