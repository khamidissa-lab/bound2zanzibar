import Image from "next/image";
import { LocaleLink as Link } from "@/components/i18n/locale-link";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  /**
   * `compact`: emblem + "BOUND 2 ZANZIBAR" wordmark, for the header.
   * `full`: the complete logo, for larger placements (footer, sign-in).
   */
  variant?: "compact" | "full";
  /** Pixel size of the full logo (square). */
  size?: number;
  priority?: boolean;
  /** Translated word for "home" in the link label. */
  homeLabel?: string;
};

/**
 * The owner's logo artwork (public/brand). The artwork has a solid white
 * background: the compact logo is multiplied onto light surfaces (white turns
 * transparent on ivory/sand); the full logo carries its own white card for
 * dark surfaces.
 */
export function Logo({
  className,
  variant = "compact",
  size = 160,
  priority,
  homeLabel = "home",
}: LogoProps) {
  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name} — ${homeLabel}`}
      className={cn(
        "inline-flex shrink-0 items-center",
        variant === "full" ? "rounded-2xl" : "rounded-md",
        className,
      )}
    >
      {variant === "compact" ? (
        <span className="flex items-center gap-2">
          <Image
            src="/brand/emblem.png"
            alt=""
            width={480}
            height={327}
            priority={priority}
            className="h-9 w-auto mix-blend-multiply sm:h-11"
          />
          <Image
            src="/brand/wordmark.png"
            alt=""
            width={555}
            height={176}
            priority={priority}
            className="h-8 w-auto mix-blend-multiply sm:h-10"
          />
        </span>
      ) : (
        <Image
          src="/brand/logo.png"
          alt=""
          width={900}
          height={900}
          priority={priority}
          style={{ width: size, height: size }}
          className="rounded-2xl bg-white"
        />
      )}
    </Link>
  );
}
