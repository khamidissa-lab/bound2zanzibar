import { NextResponse, type NextRequest } from "next/server";

import { createRateLimiter } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  classifyPath,
  CONSENT_COOKIE,
  CONSENT_MAX_AGE_S,
  isBot,
  isVisitorId,
  locationFromHeaders,
  parseUserAgent,
  referrerHost,
  trackRequestSchema,
  VISITOR_COOKIE,
} from "@/lib/visitors/tracking";
import { canTrackVisitors } from "@/services/visitor-tracking";

/**
 * Visitor activity from the public site (page views, heartbeats, clicks).
 *
 * - Visitors who accepted the consent banner are tracked individually under a
 *   random first-party ID (httpOnly cookie).
 * - Everyone else is only added to anonymous page-view counts.
 * - Bots are ignored; the IP address is used for rate limiting only and
 *   never stored. Always answers 204 so tracking never affects the page.
 */

const perMinute = createRateLimiter({ limit: 120, windowMs: 60_000 });
const noContent = () => new NextResponse(null, { status: 204 });

function clientKey(request: NextRequest): string {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  const ua = request.headers.get("user-agent");
  if (isBot(ua) || !canTrackVisitors()) return noContent();
  if (!perMinute(clientKey(request)).ok) return new NextResponse(null, { status: 429 });

  // sendBeacon posts text/plain, so parse the body as text.
  const parsed = trackRequestSchema.safeParse(
    await request
      .text()
      .then((t) => JSON.parse(t))
      .catch(() => null),
  );
  if (!parsed.success) return new NextResponse(null, { status: 400 });
  const event = parsed.data;

  const page = classifyPath(event.path);
  const { device, browser, os } = parseUserAgent(ua ?? "");
  const location = locationFromHeaders(request.headers);
  const supabase = createSupabaseAdminClient();

  try {
    if (request.cookies.get(CONSENT_COOKIE)?.value !== "accepted") {
      if (event.type === "page_view") {
        await supabase.rpc("record_anonymous_view", {
          p_path: page.path,
          p_country: location.country ?? "ZZ",
          p_device: device,
        });
      }
      return noContent();
    }

    let visitorId = request.cookies.get(VISITOR_COOKIE)?.value;
    const isNew = !isVisitorId(visitorId);
    if (!isVisitorId(visitorId)) visitorId = crypto.randomUUID();

    const [formType, formSlug] = event.item?.split(":") ?? [];
    const { error } = await supabase.rpc("track_visitor_event", {
      p_visitor_id: visitorId,
      p_type: event.type,
      p_path: page.path,
      p_title: event.title?.slice(0, 200),
      p_item_type: formType ?? page.itemType ?? undefined,
      p_item_slug: formSlug ?? page.itemSlug ?? undefined,
      p_label: event.label,
      p_referrer_host: referrerHost(event.referrer, request.nextUrl.host) ?? undefined,
      p_utm_source: page.utmSource ?? undefined,
      p_locale: page.locale,
      p_country: location.country ?? undefined,
      p_region: location.region ?? undefined,
      p_city: location.city ?? undefined,
      p_device: device,
      p_browser: browser,
      p_os: os,
      p_visible: event.visible ?? true,
    });
    if (error) console.error("[visitors] track failed:", error.message);

    // Data retention runs now and then instead of needing a scheduler.
    if (Math.random() < 0.002) {
      const purge = await supabase.rpc("purge_visitor_data");
      if (purge.error) console.error("[visitors] purge failed:", purge.error.message);
    }

    const response = noContent();
    if (isNew) {
      response.cookies.set(VISITOR_COOKIE, visitorId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: CONSENT_MAX_AGE_S,
        path: "/",
      });
    }
    return response;
  } catch (error) {
    console.error("[visitors] track failed:", (error as Error).message);
    return noContent();
  }
}
