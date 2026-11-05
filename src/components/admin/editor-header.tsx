import Link from "next/link";
import { ArrowLeft, ExternalLink, Languages } from "lucide-react";

import type { Enums } from "@/lib/supabase/database.types";

import { StatusBadge } from "./content-list";

/** Heading for create/edit pages: back link, title, status and live link. */
export function EditorHeader({
  backHref,
  backLabel,
  title,
  status,
  liveHref,
  isSample,
  created,
  translationsHref,
}: {
  backHref: string;
  backLabel: string;
  title: string;
  status?: Enums<"publish_status">;
  liveHref?: string;
  isSample?: boolean;
  created?: boolean;
  /** Link to this item's translations, once it exists. */
  translationsHref?: string;
}) {
  return (
    <div className="mb-8">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-ocean-deep"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {backLabel}
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl">{title}</h1>
        {status ? <StatusBadge status={status} /> : null}
        {isSample ? (
          <span className="rounded-full border border-dashed border-gold bg-gold/10 px-2.5 py-0.5 text-xs text-ocean-deep">
            Sample content
          </span>
        ) : null}
        {liveHref && status === "published" ? (
          <Link
            href={liveHref}
            target="_blank"
            className="inline-flex items-center gap-1 text-sm text-turquoise-deep hover:underline"
          >
            View on website
            <ExternalLink className="size-3.5" aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </Link>
        ) : null}
        {translationsHref ? (
          <Link
            href={translationsHref}
            className="inline-flex items-center gap-1 text-sm text-turquoise-deep hover:underline"
          >
            <Languages className="size-3.5" aria-hidden="true" />
            Translations
          </Link>
        ) : null}
      </div>
      {created ? (
        <p
          role="status"
          className="mt-4 rounded-lg bg-turquoise-soft px-4 py-3 text-sm text-ocean-deep"
        >
          Created. You can now add prices{status ? " and photos" : ""}.
        </p>
      ) : null}
    </div>
  );
}
