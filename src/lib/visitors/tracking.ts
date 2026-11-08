import { z } from "zod";

import { isLocale } from "@/i18n/config";

/**
 * Shared rules for visitor tracking (used by the /api/track route, the
 * consent route, form actions and their tests). Nothing here reads cookies
 * or the database.
 */

/** "accepted" | "declined"; readable by the page so the banner knows. */
export const CONSENT_COOKIE = "b2z_consent";
/** Random visitor ID, httpOnly, set only after consent. */
export const VISITOR_COOKIE = "b2z_vid";
/** Bump when the privacy wording changes so visitors are asked again. */
export const CONSENT_POLICY_VERSION = "2026-11";
/** Consent is asked again after about six months. */
export const CONSENT_MAX_AGE_S = 180 * 24 * 60 * 60;

export const CLIENT_EVENT_TYPES = [
  "page_view",
  "heartbeat",
  "leave",
  "booking_click",
  "whatsapp_click",
  "contact_click",
  "booking_started",
] as const;
export type ClientEventType = (typeof CLIENT_EVENT_TYPES)[number];

export const trackRequestSchema = z.object({
  type: z.enum(CLIENT_EVENT_TYPES),
  path: z.string().max(600).startsWith("/"),
  title: z.string().max(300).optional(),
  referrer: z.string().max(600).optional(),
  visible: z.boolean().optional(),
  label: z.string().max(200).optional(),
  /** The item a booking form is for ("tour:slug"), when not in the path. */
  item: z
    .string()
    .regex(/^(tour|package):[a-z0-9]+(-[a-z0-9]+)*$/)
    .max(130)
    .optional(),
});
export type TrackRequest = z.infer<typeof trackRequestSchema>;

export type ItemType = "tour" | "package" | "destination" | "article";

const ITEM_ROUTES: Record<string, ItemType> = {
  tours: "tour",
  packages: "package",
  destinations: "destination",
  "travel-guide": "article",
};

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Normalises a page path (drops the query and hash, keeps the language
 * prefix) and recognises tour, package, destination and article pages.
 */
export function classifyPath(raw: string): {
  path: string;
  locale: string;
  itemType: ItemType | null;
  itemSlug: string | null;
  utmSource: string | null;
} {
  let url: URL;
  try {
    url = new URL(raw, "https://example.invalid");
  } catch {
    return { path: "/", locale: "en", itemType: null, itemSlug: null, utmSource: null };
  }
  const path = (url.pathname.replace(/\/+$/, "") || "/").slice(0, 300);
  const parts = path.split("/").filter(Boolean);
  const locale = parts[0] && isLocale(parts[0]) ? parts[0] : "en";
  const rest = parts[0] && isLocale(parts[0]) ? parts.slice(1) : parts;
  const itemType = rest.length === 2 ? (ITEM_ROUTES[rest[0]] ?? null) : null;
  const itemSlug = itemType && SLUG_RE.test(rest[1]) ? rest[1] : null;
  const utm = url.searchParams.get("utm_source");
  return {
    path,
    locale,
    itemType: itemSlug ? itemType : null,
    itemSlug,
    utmSource: utm ? utm.slice(0, 80) : null,
  };
}

/** Host name of an external referrer; null for this site or invalid values. */
export function referrerHost(
  referrer: string | undefined,
  ownHost: string,
): string | null {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname.toLowerCase();
    if (!host || host === ownHost.toLowerCase().split(":")[0]) return null;
    return host.slice(0, 120);
  } catch {
    return null;
  }
}

export type Device = "mobile" | "tablet" | "desktop";

/** Coarse device, browser and OS from the user-agent (no fingerprinting). */
export function parseUserAgent(ua: string): {
  device: Device;
  browser: string;
  os: string;
} {
  const s = ua || "";
  const os = /iPad|iPhone|iPod/.test(s)
    ? "iOS"
    : /Android/.test(s)
      ? "Android"
      : /Windows/.test(s)
        ? "Windows"
        : /Mac OS X|Macintosh/.test(s)
          ? "macOS"
          : /CrOS/.test(s)
            ? "ChromeOS"
            : /Linux/.test(s)
              ? "Linux"
              : "Other";
  const browser = /Edg\//.test(s)
    ? "Edge"
    : /OPR\/|Opera/.test(s)
      ? "Opera"
      : /SamsungBrowser/.test(s)
        ? "Samsung Internet"
        : /Firefox\/|FxiOS/.test(s)
          ? "Firefox"
          : /Chrome\/|CriOS/.test(s)
            ? "Chrome"
            : /Safari\//.test(s)
              ? "Safari"
              : "Other";
  const device: Device =
    /iPad|Tablet/.test(s) || (/Android/.test(s) && !/Mobile/.test(s))
      ? "tablet"
      : /Mobi|iPhone|iPod|Android/.test(s)
        ? "mobile"
        : "desktop";
  return { device, browser, os };
}

const BOT_RE =
  /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|lighthouse|pingdom|monitor|curl|wget|python-requests|axios|node-fetch/i;

/** Crawlers, link previews and monitoring tools aren't visitors. */
export function isBot(ua: string | null): boolean {
  return !ua || BOT_RE.test(ua);
}

/**
 * Approximate location from Cloudflare's headers. "CF-IPCountry" is always
 * sent; city and region need the free "Add visitor location headers" managed
 * transform. The IP address itself is never stored.
 */
export function locationFromHeaders(headers: Headers): {
  country: string | null;
  region: string | null;
  city: string | null;
} {
  const country = headers.get("cf-ipcountry")?.toUpperCase() ?? null;
  const decode = (v: string | null) => {
    if (!v) return null;
    try {
      return decodeURIComponent(v).slice(0, 80);
    } catch {
      return v.slice(0, 80);
    }
  };
  return {
    country: country && /^[A-Z]{2}$/.test(country) && country !== "XX" ? country : null,
    region: decode(headers.get("cf-region")),
    city: decode(headers.get("cf-ipcity")),
  };
}

export const isVisitorId = (v: string | undefined | null): v is string =>
  !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(v);
