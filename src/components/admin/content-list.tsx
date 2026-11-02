import type { ReactNode } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import type { Enums } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

const statusStyles: Record<Enums<"publish_status">, string> = {
  published: "bg-turquoise-soft text-ocean-deep",
  draft: "bg-sand text-ocean-deep",
  archived: "bg-muted text-muted-foreground",
};

const statusLabels: Record<Enums<"publish_status">, string> = {
  published: "Published",
  draft: "Draft",
  archived: "Archived",
};

export function StatusBadge({ status }: { status: Enums<"publish_status"> }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        statusStyles[status],
      )}
    >
      {statusLabels[status]}
    </span>
  );
}

export const STATUS_OPTIONS = [
  { value: "draft", label: "Draft — not visible on the website" },
  { value: "published", label: "Published — visible on the website" },
  { value: "archived", label: "Archived — hidden, kept for records" },
];

/** Page heading with a "New" button. */
export function ListHeader({
  title,
  description,
  newHref,
  newLabel,
  children,
}: {
  title: string;
  description: string;
  newHref: string;
  newLabel: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-3xl">{title}</h1>
        <p className="mt-1 text-muted-foreground">{description}</p>
        {children}
      </div>
      <Link href={newHref} className={buttonVariants({ size: "lg" })}>
        <Plus aria-hidden="true" data-icon="inline-start" />
        {newLabel}
      </Link>
    </div>
  );
}

/** GET form so filters live in the URL (shareable, back-button friendly). */
export function ListFilters({
  action,
  q,
  status,
  searchLabel,
}: {
  action: string;
  q: string;
  status: string;
  searchLabel: string;
}) {
  return (
    <form
      action={action}
      role="search"
      className="mt-6 flex flex-col gap-2 rounded-2xl border bg-card p-3 sm:flex-row"
    >
      <label className="relative flex-1">
        <span className="sr-only">{searchLabel}</span>
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder={searchLabel}
          className="h-10 w-full rounded-lg border border-input bg-background pr-3 pl-9 text-sm"
        />
      </label>
      <label>
        <span className="sr-only">Status</span>
        <select
          name="status"
          defaultValue={status}
          className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm sm:w-44"
        >
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </label>
      <button
        type="submit"
        className={buttonVariants({ variant: "outline", className: "h-10" })}
      >
        Filter
      </button>
    </form>
  );
}

export function ListNotice({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  if (searchParams.deleted === undefined) return null;
  return (
    <p
      role="status"
      className="mt-4 rounded-lg bg-turquoise-soft px-4 py-3 text-sm text-ocean-deep"
    >
      Deleted.
    </p>
  );
}

export function EmptyList({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed bg-card p-10 text-center text-muted-foreground">
      {children}
    </div>
  );
}

export function formatUpdated(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Dar_es_Salaam",
  }).format(new Date(iso));
}

export const firstParam = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value) ?? "";
