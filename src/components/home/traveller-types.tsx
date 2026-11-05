import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import { LocaleLink as Link } from "@/components/i18n/locale-link";
import { TRAVELLERS, TRAVELLER_TYPES } from "@/config/travellers";
import type { Messages } from "@/i18n/messages";
import { cn } from "@/lib/utils";

/** One picture box per kind of traveller, each opening its own page. */
export function TravellerTypes({ t }: { t: Messages["home"]["travellers"] }) {
  return (
    // Swipeable row on phones (bleeding to the screen edge, matching the
    // .container-page gutters), five columns on large screens.
    <ul className="-mx-4 flex snap-x snap-mandatory scroll-ps-4 gap-4 overflow-x-auto px-4 pb-2 sm:-mx-8 sm:scroll-ps-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0 lg:pb-0">
      {TRAVELLER_TYPES.map((type, i) => {
        const item = t.items[type];
        const photo = TRAVELLERS[type];
        return (
          <li
            key={type}
            className="reveal w-[72%] shrink-0 snap-start sm:w-[44%] lg:w-auto"
          >
            <Link
              href={`/trips/${type}`}
              className="group flex h-full flex-col bg-ivory shadow-card focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              {/* The photo stays clear of text so faces are never covered. */}
              <div className="relative aspect-[4/5] overflow-hidden bg-ocean-deep">
                <Image
                  src={photo.photo}
                  alt={item.alt}
                  fill
                  sizes="(min-width: 1024px) 20vw, (min-width: 640px) 44vw, 72vw"
                  className={cn(
                    "object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out motion-safe:group-hover:scale-[1.045]",
                    photo.position,
                  )}
                />
                <span className="eyebrow absolute start-3 top-3 bg-ocean-deep/70 px-2 py-1 text-gold-light tabular-nums backdrop-blur-sm">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-3xl leading-none text-ocean-deep">
                  {item.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/75">
                  {item.body}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 self-start border-b border-gold-deep/50 pb-0.5 text-xs font-semibold tracking-[0.14em] text-gold-deep uppercase transition-colors group-hover:border-gold-deep">
                  {t.cta}
                  <ArrowUpRight
                    className="size-3.5 rtl:-scale-x-100"
                    aria-hidden="true"
                  />
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
