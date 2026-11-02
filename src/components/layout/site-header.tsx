import { Suspense } from "react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { bookNowItem, mainNav } from "@/config/site";

import { DesktopNav } from "./desktop-nav";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { NavLinks } from "./nav-links";

export function SiteHeader() {
  return (
    // Solid white so it matches the logo artwork's white background.
    <header className="sticky top-0 z-40 border-b border-border/70 bg-white">
      <div className="container-page flex h-[var(--header-height)] items-center justify-between gap-3">
        <Logo priority />

        <nav aria-label="Main" className="hidden xl:block">
          <Suspense
            fallback={<NavLinks items={mainNav} pathname={null} variant="desktop" />}
          >
            <DesktopNav items={mainNav} />
          </Suspense>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href={bookNowItem.href}
            className={buttonVariants({
              variant: "gold",
              size: "sm",
              className: "sm:h-10 sm:px-5",
            })}
          >
            {bookNowItem.label}
          </Link>
          <div className="xl:hidden">
            <MobileNav items={mainNav} />
          </div>
        </div>
      </div>
    </header>
  );
}
