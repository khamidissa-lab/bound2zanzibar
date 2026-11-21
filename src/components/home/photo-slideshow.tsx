"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { Pause, Play } from "lucide-react";

import { fmt } from "@/i18n/format";
import { cn } from "@/lib/utils";

export type Slide = {
  src: string;
  alt: string;
  caption: string;
  /** Tailwind object-position class for the crop, e.g. "object-[60%_50%]". */
  position?: string;
};

export type SlideshowStrings = {
  /** Name of the photo set, for the controls group. */
  label: string;
  play: string;
  pause: string;
  /** "Show photo {n}: {caption}" */
  show: string;
};

const INTERVAL_MS = 7000;

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
function subscribeReducedMotion(callback: () => void) {
  const mql = window.matchMedia(reducedMotionQuery);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}
const prefersReducedMotion = () => window.matchMedia(reducedMotionQuery).matches;

/**
 * Photos that cross-fade slowly, with a caption, a dot per photo and a pause
 * button. Auto-advance can always be paused (WCAG 2.2.2), never starts for
 * visitors who prefer reduced motion, and (with `whenVisible`) only runs
 * while the slideshow is on screen. Only a `priority` slideshow loads its
 * first photo eagerly; the rest load lazily.
 */
export function PhotoSlideshow({
  slides,
  strings,
  sizes,
  priority = false,
  whenVisible = false,
  className,
  controlsClassName,
  captionClassName,
}: {
  slides: Slide[];
  strings: SlideshowStrings;
  sizes: string;
  priority?: boolean;
  whenVisible?: boolean;
  className?: string;
  /** Position of the caption + controls row (absolute, logical start/end). */
  controlsClassName?: string;
  /** Extra classes for the caption, e.g. "hidden sm:block". */
  captionClassName?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [pausedByUser, setPausedByUser] = useState(false);
  const [onScreen, setOnScreen] = useState(!whenVisible);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    prefersReducedMotion,
    () => true, // server: no motion until the browser decides
  );
  const playing = !pausedByUser && !reducedMotion;

  useEffect(() => {
    if (!whenVisible || !rootRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { threshold: 0.25 },
    );
    observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, [whenVisible]);

  useEffect(() => {
    if (!playing || !onScreen) return;
    const timer = window.setInterval(() => {
      // Don't advance unseen (background tab), so the visitor never misses a photo.
      if (document.visibilityState === "visible") {
        setIndex((i) => (i + 1) % slides.length);
      }
    }, INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [playing, onScreen, slides.length]);

  const current = slides[index] ?? slides[0];

  return (
    <div ref={rootRef} className={cn("overflow-hidden bg-ocean-deep", className)}>
      {slides.map((slide, i) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          aria-hidden={i === index ? undefined : true}
          fill
          priority={priority && i === 0}
          sizes={sizes}
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
        <p
          className={cn(
            "eyebrow bg-ocean-deep/65 px-3 py-1.5 text-white backdrop-blur-sm",
            captionClassName,
          )}
        >
          {current.caption}
        </p>
        <div
          role="group"
          aria-label={strings.label}
          className="flex shrink-0 items-center gap-0.5 bg-ocean-deep/65 px-1 backdrop-blur-sm"
        >
          {slides.map((slide, i) => (
            <button
              key={slide.src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={fmt(strings.show, { n: i + 1, caption: slide.caption })}
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
              aria-label={playing ? strings.pause : strings.play}
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
