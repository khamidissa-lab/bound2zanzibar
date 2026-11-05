"use client";

import type { ComponentProps } from "react";
import Link from "next/link";

import { useLocaleOrDefault } from "@/i18n/client";
import { localizePath } from "@/i18n/config";

/**
 * next/link that keeps the visitor's language: "/tours" becomes "/fr/tours"
 * on French pages. Usable from server components too.
 */
export function LocaleLink({ href, ...props }: ComponentProps<typeof Link>) {
  const locale = useLocaleOrDefault();
  const target = typeof href === "string" ? localizePath(locale, href) : href;
  return <Link href={target} {...props} />;
}
