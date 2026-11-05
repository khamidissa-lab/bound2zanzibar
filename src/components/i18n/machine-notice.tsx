"use client";

import { Languages } from "lucide-react";

import { useI18n } from "@/i18n/client";

import { rememberLocale } from "./language-switcher";

/**
 * Shown on content that was machine translated and not yet reviewed, with a
 * link to the English original.
 */
export function MachineTranslationNotice({ path }: { path: string }) {
  const { t, locale } = useI18n();
  if (locale === "en") return null;
  return (
    <p
      role="note"
      className="flex flex-wrap items-center gap-x-3 gap-y-1 border-s-2 border-gold bg-gold/10 px-4 py-2.5 text-sm text-ocean-deep"
    >
      <Languages className="size-4 shrink-0 text-gold-deep" aria-hidden="true" />
      <span>{t.language.machineNotice}</span>
      <a
        href={path}
        hrefLang="en"
        lang="en"
        onClick={() => rememberLocale("en")}
        className="font-semibold underline underline-offset-2"
      >
        {t.language.viewEnglish}
      </a>
    </p>
  );
}
