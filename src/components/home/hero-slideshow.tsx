"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { Pause, Play } from "lucide-react";

import { useI18n } from "@/i18n/client";
import type { Messages } from "@/i18n/messages/en";
import { cn } from "@/lib/utils";

type SlideKey = keyof Messages["home"]["slides"]["items"];

/** The home hero photos, two Zanzibar and two safari (see docs/PHOTO_CREDITS.md). */
const SLIDES: { key: SlideKey; src: string; position?: string }[] = [
  {
    key: "mnemba",
    src: "/images/tours/mnemba-atoll-boats.jpg",
    position: "object-[60%_50%]",
  },
  {
    key: "elephants",
    src: "/hero/serengeti-elephant-family.jpg",
    position: "object-[70%_55%]",
  },
  {
    key: "stoneTown",
    src: "/images/tours/stone-town-aerial.jpg",
    position: "object-[65%_50%]",
  },
  { key: "migration", src: "/images/safari/migration.jpg", position: "object-[55%_60%]" },
];

const INTERVAL_MS = 7000;

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
function subscribeReducedMotion(callback: () => void) {
  const mql = window.matchMedia(reducedMotionQuery);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}
const prefersReducedMotion = () => window.matchMedia(reducedMotionQuery).matches;

/**
 * Full-bleed background photos for the home hero that cross-fade slowly.
 * Auto-advance can always be paused (WCAG 2.2.2) and never starts for
 * visitors who prefer reduced motion; the dots pick a photo directly.
 * Only the first photo loads with high priority.
 */
export function HeroSlideshow({
  className,
  controlsClassName = "end-4 top-4 sm:end-8 sm:top-8",
}: {
  className?: string;
  /** Where the caption and controls sit (logical start/end, top/bottom). */
  controlsClassName?: string;
}) {
  const { t, fmt } = useI18n();
  const s = t.home.slides;
  const [index, setIndex] = useState(0);
  const [pausedByUser, setPausedByUser] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    prefersReducedMotion,
    () => true, // server: no motion until the browser decides
  );
  const playing = !pausedByUser && !reducedMotion;

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      // Don't advance unseen (background tab), so the visitor never misses a photo.
      if (document.visibilityState === "visible") {
        setIndex((i) => (i + 1) % SLIDES.length);
      }
    }, INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [playing]);

  const current = SLIDES[index];

  return (
    <div className={cn("overflow-hidden bg-ocean-deep", className)}>
      {SLIDES.map((slide, i) => (
        <Image
          key={slide.key}
          src={slide.src}
          alt={s.items[slide.key].alt}
          aria-hidden={i === index ? undefined : true}
          fill
          priority={i === 0}
          sizes="100vw"
          className={cn(
            "object-cover transition-[opacity,transform] ease-out motion-safe:duration-[1600ms,9000ms] motion-reduce:transition-none",
            slide.position,
            i === index ? "scale-100 opacity-100" : "scale-[1.06] opacity-0",
          )}
        />
      ))}

      <div
        className={cn(
          "absolute z-10 flex items-center gap-3 text-white",
          controlsClassName,
        )}
      >
        <p className="eyebrow hidden bg-ocean-deep/65 px-3 py-1.5 text-white backdrop-blur-sm sm:block">
          {s.items[current.key].caption}
        </p>
        <div
          role="group"
          aria-label={s.label}
          className="flex items-center gap-0.5 bg-ocean-deep/65 px-1 backdrop-blur-sm"
        >
          {SLIDES.map((slide, i) => (
            <button
              key={slide.key}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={fmt(s.show, {
                n: String(i + 1),
                caption: s.items[slide.key].caption,
              })}
              aria-current={i === index ? "true" : undefined}
              className="flex size-8 items-center justify-center"
            >
              <span
                aria-hidden="true"
                className={cn(
                  "block h-1.5 rounded-full transition-all",
                  i === index ? "w-5 bg-white" : "w-1.5 bg-white/55",
                )}
              />
            </button>
          ))}
          {reducedMotion ? null : (
            <button
              type="button"
              onClick={() => setPausedByUser((p) => !p)}
              aria-label={playing ? s.pause : s.play}
              className="flex size-8 items-center justify-center hover:bg-white/15"
            >
              {playing ? (
                <Pause className="size-3.5" aria-hidden="true" />
              ) : (
                <Play className="size-3.5" aria-hidden="true" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
