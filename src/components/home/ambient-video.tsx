"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { Pause, Play } from "lucide-react";

import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
function subscribeReducedMotion(callback: () => void) {
  const mql = window.matchMedia(reducedMotionQuery);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}
const prefersReducedMotion = () => window.matchMedia(reducedMotionQuery).matches;

/**
 * Muted, looping background video with a pause button. It never starts on
 * its own for visitors who prefer reduced motion (they see the poster and can
 * press play), and it can always be paused (WCAG 2.2.2).
 *
 * `whenVisible`: download and play only while on screen (for videos further
 * down the page), pausing again when scrolled away.
 *
 * `quietControls`: the pause button stays hidden until the video is hovered
 * or the button is focused; clicking or tapping the video also toggles it.
 *
 * `priority`: for a video at the top of the page. The poster is drawn as an
 * optimised, early-loading image behind the video (instead of the video's own
 * poster), so the first view appears quickly on slow connections.
 */
export function AmbientVideo({
  src,
  poster,
  label,
  whenVisible = false,
  quietControls = false,
  priority = false,
  className,
  controlsClassName = "end-3 top-3 sm:end-5 sm:top-5",
}: {
  src: string;
  poster: string;
  /** Description of the footage for screen readers. */
  label: string;
  whenVisible?: boolean;
  quietControls?: boolean;
  priority?: boolean;
  className?: string;
  /** Where the pause button sits (logical start/end, top/bottom). */
  controlsClassName?: string;
}) {
  const { t } = useI18n();
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  // Set once the visitor presses pause, so scrolling never restarts it.
  const pausedByUser = useRef(false);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    prefersReducedMotion,
    () => true, // server: render the still until the browser decides
  );

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const play = () => {
      if (!pausedByUser.current) void video.play().catch(() => undefined);
    };
    if (reducedMotion) {
      video.pause();
      return;
    }
    // Visitors in data-saver mode keep the still image (they can press play).
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection?.saveData;
    if (saveData) return;
    if (!whenVisible) {
      // Start only after the page itself has loaded, so the video never
      // competes with the text and photos for a slow connection.
      let idle: number | undefined;
      const start = () => {
        idle =
          typeof window.requestIdleCallback === "function"
            ? window.requestIdleCallback(play, { timeout: 2000 })
            : window.setTimeout(play, 300);
      };
      if (document.readyState === "complete") start();
      else window.addEventListener("load", start, { once: true });
      return () => {
        window.removeEventListener("load", start);
        if (idle !== undefined) {
          if (typeof window.cancelIdleCallback === "function")
            window.cancelIdleCallback(idle);
          window.clearTimeout(idle);
        }
      };
    }
    const observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? play() : video.pause()),
      { threshold: 0.25 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [reducedMotion, whenVisible]);

  const toggle = () => {
    const video = ref.current;
    if (!video) return;
    if (video.paused) {
      pausedByUser.current = false;
      void video.play().catch(() => undefined);
    } else {
      pausedByUser.current = true;
      video.pause();
    }
  };

  return (
    <div className={cn("group relative overflow-hidden bg-ocean-deep", className)}>
      {priority ? (
        <Image src={poster} alt="" fill priority sizes="100vw" className="object-cover" />
      ) : null}
      <video
        ref={ref}
        onClick={quietControls ? toggle : undefined}
        muted
        loop
        playsInline
        // Nothing downloads until play() is called (after page load or when
        // scrolled into view); the poster shows until then.
        preload="none"
        poster={priority ? undefined : poster}
        aria-label={label}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className={cn(
          "absolute inset-0 size-full object-cover",
          quietControls && "cursor-pointer",
        )}
      >
        <source src={src} type="video/mp4" />
      </video>
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? t.home.video.pause : t.home.video.play}
        className={cn(
          "absolute z-10 flex size-10 items-center justify-center border border-white/50 bg-ocean-deep/40 text-white backdrop-blur-sm hover:bg-white/15",
          quietControls &&
            "opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100",
          controlsClassName,
        )}
      >
        {playing ? (
          <Pause className="size-4" aria-hidden="true" />
        ) : (
          <Play className="size-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
