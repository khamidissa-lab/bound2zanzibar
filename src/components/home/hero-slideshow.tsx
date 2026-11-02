"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { Pause, Play } from "lucide-react";

import { cn } from "@/lib/utils";

type Slide = {
  src: string;
  alt: string;
  caption: string;
  /** CSS object-position, to keep the subject in frame when cropped. */
  focus: string;
};

// Unsplash License photography (free for commercial use); sources and
// photographers are recorded in docs/PHOTO_CREDITS.md.
const SLIDES: Slide[] = [
  {
    src: "/hero/nungwi-dhow-sunset.jpg",
    alt: "A traditional dhow sailing past the setting sun off Nungwi, Zanzibar",
    caption: "Dhow at sunset · Nungwi, Zanzibar",
    focus: "45% 60%",
  },
  {
    src: "/hero/serengeti-elephant-family.jpg",
    alt: "An elephant family with a calf walking across green grass in the Serengeti",
    caption: "Elephant family · Serengeti",
    focus: "70% 70%",
  },
  {
    src: "/hero/nungwi-golden-hour-dhow.jpg",
    alt: "A dhow on a golden sea at sunset off Nungwi, Zanzibar",
    caption: "Golden hour · Nungwi, Zanzibar",
    focus: "75% 55%",
  },
  {
    src: "/hero/kilimanjaro-elephant-herd.jpg",
    alt: "A large herd of elephants grazing on the plains near Mount Kilimanjaro",
    caption: "Elephant herd · Kilimanjaro region",
    focus: "60% 70%",
  },
];

const INTERVAL_MS = 6500;

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
function subscribeReducedMotion(callback: () => void) {
  const mql = window.matchMedia(reducedMotionQuery);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}
const prefersReducedMotion = () => window.matchMedia(reducedMotionQuery).matches;

/**
 * Full-bleed background slideshow for the home hero: photos crossfade with a
 * slow zoom. Auto-advance can be paused (WCAG 2.2.2) and never starts for
 * visitors who prefer reduced motion. Overlays keep the headline legible.
 */
export function HeroSlideshow() {
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    prefersReducedMotion,
    () => false,
  );
  const playing = !userPaused && !reducedMotion;

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(
      () => setIndex((i) => (i + 1) % SLIDES.length),
      INTERVAL_MS,
    );
    return () => window.clearInterval(timer);
  }, [playing]);

  return (
    <>
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        {SLIDES.map((slide, i) => (
          <div
            key={slide.src}
            className={cn(
              "absolute inset-0 transition-opacity duration-[1600ms] ease-in-out",
              i === index ? "opacity-100" : "opacity-0",
            )}
          >
            <Image
              src={slide.src}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              // Continuous slow drift on every photo, so a fading slide never
              // snaps back; pausing freezes it in place.
              style={{
                objectPosition: slide.focus,
                animationPlayState: playing ? "running" : "paused",
              }}
              className="animate-[hero-zoom_14s_ease-in-out_infinite_alternate] object-cover"
            />
          </div>
        ))}
        {/* Legibility overlays in brand navy. */}
        <div className="absolute inset-0 bg-ocean-deep/45 lg:bg-transparent lg:bg-gradient-to-r lg:from-ocean-deep/90 lg:via-ocean-deep/55 lg:to-ocean-deep/5" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ocean-deep/80 to-transparent" />
      </div>

      {/* Visually hidden description of the current photo for screen readers. */}
      <p className="sr-only" aria-live={playing ? "off" : "polite"}>
        Photo {index + 1} of {SLIDES.length}: {SLIDES[index].alt}
      </p>

      <div className="absolute inset-x-0 bottom-28 z-10 lg:bottom-32">
        <div className="container-page flex items-center justify-end gap-3">
          <p
            className="hidden text-xs font-medium text-white/80 sm:block"
            aria-hidden="true"
          >
            {SLIDES[index].caption}
          </p>
          <div
            role="group"
            aria-label="Hero photos"
            className="flex items-center gap-1 rounded-full bg-ocean-deep/50 p-1 backdrop-blur-sm"
          >
            {SLIDES.map((slide, i) => (
              <button
                key={slide.src}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show photo ${i + 1}: ${slide.caption}`}
                aria-current={i === index ? "true" : undefined}
                className="group flex size-7 items-center justify-center rounded-full"
              >
                <span
                  className={cn(
                    "block h-1.5 rounded-full transition-all",
                    i === index
                      ? "w-5 bg-gold"
                      : "w-1.5 bg-white/60 group-hover:bg-white",
                  )}
                />
              </button>
            ))}
            {!reducedMotion ? (
              <button
                type="button"
                onClick={() => setUserPaused((p) => !p)}
                aria-label={userPaused ? "Play slideshow" : "Pause slideshow"}
                className="flex size-7 items-center justify-center rounded-full text-white hover:bg-white/15"
              >
                {userPaused ? (
                  <Play className="size-3.5" aria-hidden="true" />
                ) : (
                  <Pause className="size-3.5" aria-hidden="true" />
                )}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
