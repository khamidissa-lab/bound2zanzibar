"use client";

import Image from "next/image";

import { useMessagesOrEnglish } from "@/i18n/client";

import { cn } from "@/lib/utils";
import type { MediaImage, SceneTheme } from "@/types/content";

type SceneImageProps = {
  image: MediaImage;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Show the "Placeholder image" tag when no photo is set. */
  showPlaceholderTag?: boolean;
  /** Slowly zoom the picture when an ancestor with `group` is hovered. */
  hoverZoom?: boolean;
};

const zoomClass =
  "motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out motion-safe:group-hover:scale-[1.045]";

/**
 * Renders licensed photography when `image.src` is set; otherwise a branded,
 * clearly-labelled illustration so layouts can be reviewed before real
 * images are supplied. The parent controls the aspect ratio.
 */
export function SceneImage({
  image,
  className,
  sizes = "(min-width: 1024px) 33vw, 100vw",
  priority = false,
  showPlaceholderTag = true,
  hoverZoom = false,
}: SceneImageProps) {
  const t = useMessagesOrEnglish();
  if (image.src) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn("object-cover", hoverZoom && zoomClass)}
        />
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <SceneArt
        theme={image.theme}
        label={`${image.alt} ${t.common.placeholderIllustration}`}
        className={hoverZoom ? zoomClass : undefined}
      />
      {showPlaceholderTag ? (
        <span className="absolute bottom-2 left-2 bg-ocean-deep/55 px-2 py-0.5 text-[0.6rem] font-semibold tracking-[0.14em] text-white uppercase backdrop-blur-sm">
          {t.common.placeholderImage}
        </span>
      ) : null}
    </div>
  );
}

const palettes: Record<
  SceneTheme,
  { sky: string; sun: string; base: string; mid: string }
> = {
  ocean: {
    sky: "#cfeeea",
    sun: "var(--brand-gold)",
    base: "var(--brand-ocean)",
    mid: "var(--brand-turquoise)",
  },
  sunset: {
    sky: "#f3d9b8",
    sun: "var(--brand-sun)",
    base: "var(--brand-ocean-deep)",
    mid: "var(--brand-ocean)",
  },
  town: { sky: "#f5efe4", sun: "var(--brand-gold)", base: "#d9c8aa", mid: "#c4ae8b" },
  forest: { sky: "#e1e8df", sun: "#d9c98f", base: "#2c5a4b", mid: "#4a7a64" },
  spice: { sky: "#f4e3cc", sun: "#c46a3a", base: "#8a4b2a", mid: "#b5713f" },
  savanna: { sky: "#efe3cc", sun: "#d9a95a", base: "#a98a5c", mid: "#c9ad80" },
};

function SceneArt({
  theme,
  label,
  className,
}: {
  theme: SceneTheme;
  label: string;
  className?: string;
}) {
  const p = palettes[theme];
  return (
    <svg
      role="img"
      aria-label={label}
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      className={cn("absolute inset-0 size-full", className)}
    >
      <rect width="400" height="300" fill={p.sky} />
      <circle cx="300" cy="92" r="24" fill={p.sun} opacity="0.75" />

      {(theme === "ocean" || theme === "sunset") && (
        <>
          <rect y="185" width="400" height="115" fill={p.mid} />
          <rect y="225" width="400" height="75" fill={p.base} />
          <path
            d="M0 205 Q 50 198 100 205 T 200 205 T 300 205 T 400 205"
            stroke="#fff"
            strokeOpacity="0.35"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M0 250 Q 50 243 100 250 T 200 250 T 300 250 T 400 250"
            stroke="#fff"
            strokeOpacity="0.2"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M120 178 L120 110 L80 178 Z"
            fill={theme === "sunset" ? "var(--brand-ocean-deep)" : "#fff"}
            opacity="0.9"
          />
          <path
            d="M70 180 L150 180 L140 192 L80 192 Z"
            fill={theme === "sunset" ? "var(--brand-ocean-deep)" : p.base}
          />
        </>
      )}

      {theme === "town" && (
        <>
          <rect y="230" width="400" height="70" fill={p.base} />
          <rect x="30" y="140" width="70" height="100" fill={p.mid} />
          <rect x="105" y="110" width="60" height="130" fill="#e8dcc6" />
          <rect x="170" y="150" width="90" height="90" fill={p.mid} />
          <rect x="265" y="125" width="55" height="115" fill="#e8dcc6" />
          <rect x="325" y="160" width="60" height="80" fill={p.mid} />
          <path
            d="M128 240 L128 200 Q 135 186 142 200 L142 240 Z"
            fill="var(--brand-ocean-deep)"
            opacity="0.75"
          />
          <path
            d="M205 240 L205 205 Q 215 190 225 205 L225 240 Z"
            fill="var(--brand-ocean-deep)"
            opacity="0.75"
          />
        </>
      )}

      {(theme === "forest" || theme === "spice") && (
        <>
          <rect y="215" width="400" height="85" fill={p.base} />
          {[20, 90, 160, 230, 300, 370].map((x, i) => (
            <circle
              key={x}
              cx={x}
              cy={200 - (i % 2) * 25}
              r={i % 2 ? 60 : 50}
              fill={i % 2 ? p.mid : p.base}
            />
          ))}
          {[55, 195, 335].map((x) => (
            <circle key={x} cx={x} cy={235} r={45} fill={p.mid} opacity="0.85" />
          ))}
        </>
      )}

      {theme === "savanna" && (
        <>
          <rect y="200" width="400" height="100" fill={p.mid} />
          <rect y="245" width="400" height="55" fill={p.base} />
          <path d="M110 200 L114 150 L118 200 Z" fill="#5b4126" />
          <ellipse cx="114" cy="148" rx="55" ry="12" fill="#4d6b3c" />
          <path d="M290 205 L292 178 L294 205 Z" fill="#5b4126" />
          <ellipse cx="292" cy="177" rx="26" ry="6" fill="#4d6b3c" />
        </>
      )}
    </svg>
  );
}
