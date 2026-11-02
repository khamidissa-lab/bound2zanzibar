"use client";

import { usePathname } from "next/navigation";

import type { NavItem } from "@/config/site";

import { NavLinks } from "./nav-links";

/** Desktop links with active-route highlighting. Wrap in <Suspense>. */
export function DesktopNav({ items }: { items: readonly NavItem[] }) {
  const pathname = usePathname();
  return <NavLinks items={items} pathname={pathname} variant="desktop" />;
}
