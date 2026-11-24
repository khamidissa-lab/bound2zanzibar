import Image from "next/image";
import Link from "next/link";
import { Clock, ExternalLink, Eye, ImageOff, MapPin, Pencil } from "lucide-react";

import type { Enums } from "@/lib/supabase/database.types";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

export type AdminTourCard = {
  id: string;
  name: string;
  slug: string;
  status: Enums<"publish_status">;
  isFeatured: boolean;
  isSample: boolean;
  category: string | null;
  destination: string | null;
  duration: string | null;
  shortDescription: string | null;
  image: { src: string; alt: string } | null;
  /** Lowest active international adult price (or any adult price). */
  fromPrice: { amount: number; currency: string; isExample: boolean } | null;
  editHref: string;
  updatedLabel: string;
};

const STATUS: Record<Enums<"publish_status">, { label: string; className: string }> = {
  published: { label: "Published", className: "bg-[#1F9D55] text-white" },
  draft: { label: "Draft", className: "bg-[#FFF3D6] text-[#7A5200]" },
  archived: { label: "Archived", className: "bg-muted text-muted-foreground" },
};

/** Admin tours as photo cards: status, featured, price, details and actions. */
export function TourCardGrid({ tours }: { tours: AdminTourCard[] }) {
  return (
    <ul className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {tours.map((tour) => (
        <li key={tour.id}>
          <TourCard tour={tour} />
        </li>
      ))}
    </ul>
  );
}

function TourCard({ tour }: { tour: AdminTourCard }) {
  const status = STATUS[tour.status];
  const live = tour.status === "published";
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-card">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {tour.image ? (
          <Image
            src={tour.image.src}
            alt={tour.image.alt}
            fill
            sizes="(min-width: 1280px) 22rem, (min-width: 640px) 45vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-1.5 text-sm text-muted-foreground">
            <ImageOff className="size-6" aria-hidden="true" />
            No photo yet
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-xs font-semibold shadow-sm",
              status.className,
            )}
          >
            {status.label}
          </span>
          {tour.isFeatured ? (
            <span className="rounded-md bg-gold px-2 py-0.5 text-xs font-semibold text-ocean-deep shadow-sm">
              Featured
            </span>
          ) : null}
        </div>
        {tour.fromPrice ? (
          <span className="absolute right-3 bottom-3 rounded-lg bg-ocean-deep/90 px-2.5 py-1 text-sm font-semibold text-white tabular-nums shadow-sm backdrop-blur-sm">
            {formatMoney(tour.fromPrice.amount, tour.fromPrice.currency)}
            {tour.fromPrice.isExample ? (
              <span className="ml-1.5 text-[0.65rem] font-medium text-white/70 uppercase">
                example
              </span>
            ) : null}
          </span>
        ) : (
          <span className="absolute right-3 bottom-3 rounded-lg bg-card/90 px-2.5 py-1 text-xs font-medium text-ocean-deep shadow-sm">
            No price set
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[0.68rem] font-semibold tracking-[0.12em] text-turquoise-deep uppercase">
          {tour.category ?? "No category"}
          {tour.isSample ? (
            <span className="ml-2 tracking-normal text-[#7A5200] normal-case">
              · Sample content
            </span>
          ) : null}
        </p>
        <h2 className="mt-1.5 font-sans text-base leading-snug font-semibold text-ocean-deep">
          <Link href={tour.editHref} className="hover:underline">
            {tour.name}
          </Link>
        </h2>
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {tour.destination ? (
            <li className="flex items-center gap-1">
              <MapPin className="size-3.5" aria-hidden="true" />
              {tour.destination}
            </li>
          ) : null}
          {tour.duration ? (
            <li className="flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden="true" />
              {tour.duration}
            </li>
          ) : null}
        </ul>
        {tour.shortDescription ? (
          <p className="mt-2.5 line-clamp-2 text-sm text-ocean-deep/80">
            {tour.shortDescription}
          </p>
        ) : null}

        <div className="mt-auto flex items-center gap-2 pt-4">
          {live ? (
            <a
              href={`/tours/${tour.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border bg-card text-sm font-medium text-ocean-deep hover:bg-muted"
            >
              <Eye className="size-4" aria-hidden="true" />
              View
              <ExternalLink className="size-3 opacity-60" aria-hidden="true" />
              <span className="sr-only">
                {tour.name} on the website (opens in a new tab)
              </span>
            </a>
          ) : (
            <span
              className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-dashed text-sm text-muted-foreground"
              title="Only published tours are on the website"
            >
              <Eye className="size-4" aria-hidden="true" />
              Not live
            </span>
          )}
          <Link
            href={tour.editHref}
            className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-ocean-deep text-sm font-medium text-white hover:bg-ocean"
          >
            <Pencil className="size-4" aria-hidden="true" />
            Edit
            <span className="sr-only">{tour.name}</span>
          </Link>
        </div>
        <p className="mt-2.5 text-right text-[0.7rem] text-muted-foreground">
          Updated {tour.updatedLabel}
        </p>
      </div>
    </article>
  );
}
