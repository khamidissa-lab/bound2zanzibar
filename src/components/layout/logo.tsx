import Image from "next/image";
import Link from "next/link";

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
};

/**
 * The owner's logo artwork (public/brand). The artwork has a white background,
 * so place it on white surfaces (the full logo carries its own white card).
 */
export function Logo({
  className,
  variant = "compact",
  size = 160,
  priority,
}: LogoProps) {
  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name} — home`}
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
            className="h-9 w-auto sm:h-12"
          />
          <Image
            src="/brand/wordmark.png"
            alt=""
            width={555}
            height={176}
            priority={priority}
            className="h-8 w-auto sm:h-11"
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
