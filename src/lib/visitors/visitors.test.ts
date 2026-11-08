import { describe, expect, it } from "vitest";

import { bucketKeys, countryFlag, formatDuration, liveStatus, parseRange } from "./admin";
import {
  classifyPath,
  isBot,
  isVisitorId,
  locationFromHeaders,
  parseUserAgent,
  referrerHost,
  trackRequestSchema,
} from "./tracking";

const IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const IPAD =
  "Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const ANDROID_TABLET =
  "Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
const EDGE =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36 Edg/140.0";

describe("parseUserAgent", () => {
  it("recognises common devices, browsers and systems", () => {
    expect(parseUserAgent(IPHONE)).toEqual({
      device: "mobile",
      browser: "Safari",
      os: "iOS",
    });
    expect(parseUserAgent(IPAD).device).toBe("tablet");
    expect(parseUserAgent(ANDROID_TABLET)).toEqual({
      device: "tablet",
      browser: "Chrome",
      os: "Android",
    });
    expect(parseUserAgent(EDGE)).toEqual({
      device: "desktop",
      browser: "Edge",
      os: "Windows",
    });
  });

  it("treats crawlers and empty user-agents as bots", () => {
    expect(isBot("Googlebot/2.1 (+http://www.google.com/bot.html)")).toBe(true);
    expect(isBot(null)).toBe(true);
    expect(isBot(IPHONE)).toBe(false);
  });
});

describe("classifyPath", () => {
  it("recognises tours, packages and articles in every language", () => {
    expect(classifyPath("/tours/stone-town-city-tour")).toMatchObject({
      path: "/tours/stone-town-city-tour",
      locale: "en",
      itemType: "tour",
      itemSlug: "stone-town-city-tour",
    });
    expect(
      classifyPath("/fr/packages/zanzibar-highlights-4-days?utm_source=ig"),
    ).toMatchObject({
      path: "/fr/packages/zanzibar-highlights-4-days",
      locale: "fr",
      itemType: "package",
      utmSource: "ig",
    });
    expect(classifyPath("/travel-guide/best-time")).toMatchObject({
      itemType: "article",
    });
  });

  it("leaves listing and unknown pages without an item", () => {
    expect(classifyPath("/tours")).toMatchObject({ itemType: null, itemSlug: null });
    expect(classifyPath("/tours/Bad_Slug")).toMatchObject({ itemType: null });
    expect(classifyPath("/de/")).toMatchObject({ path: "/de", locale: "de" });
  });
});

describe("request parsing", () => {
  it("keeps only external referrers", () => {
    expect(
      referrerHost("https://www.google.com/search?q=x", "bound2zanzibar.co.tz"),
    ).toBe("www.google.com");
    expect(
      referrerHost("https://bound2zanzibar.co.tz/tours", "bound2zanzibar.co.tz"),
    ).toBeNull();
    expect(referrerHost("not a url", "x")).toBeNull();
  });

  it("reads the Cloudflare location headers", () => {
    const h = new Headers({
      "cf-ipcountry": "de",
      "cf-ipcity": "M%C3%BCnchen",
      "cf-region": "Bavaria",
    });
    expect(locationFromHeaders(h)).toEqual({
      country: "DE",
      region: "Bavaria",
      city: "München",
    });
    expect(locationFromHeaders(new Headers({ "cf-ipcountry": "XX" })).country).toBeNull();
  });

  it("accepts only known event types and site paths", () => {
    expect(
      trackRequestSchema.safeParse({ type: "page_view", path: "/tours" }).success,
    ).toBe(true);
    expect(trackRequestSchema.safeParse({ type: "purchase", path: "/" }).success).toBe(
      false,
    );
    expect(
      trackRequestSchema.safeParse({ type: "page_view", path: "https://x.y" }).success,
    ).toBe(false);
  });

  it("validates visitor IDs", () => {
    expect(isVisitorId("11111111-1111-4111-8111-111111111111")).toBe(true);
    expect(isVisitorId("x")).toBe(false);
  });
});

describe("live status", () => {
  const now = Date.parse("2026-11-09T10:00:00Z");
  const ago = (s: number) => new Date(now - s * 1000).toISOString();
  it("is online with a recent heartbeat, idle when hidden or quiet, left when ended", () => {
    expect(
      liveStatus({ last_seen_at: ago(20), ended_at: null, visible: true }, now),
    ).toBe("online");
    expect(
      liveStatus({ last_seen_at: ago(20), ended_at: null, visible: false }, now),
    ).toBe("idle");
    expect(
      liveStatus({ last_seen_at: ago(300), ended_at: null, visible: true }, now),
    ).toBe("idle");
    expect(
      liveStatus({ last_seen_at: ago(20), ended_at: ago(5), visible: false }, now),
    ).toBe("left");
    expect(
      liveStatus({ last_seen_at: ago(3600), ended_at: null, visible: true }, now),
    ).toBe("left");
  });
});

describe("date ranges", () => {
  // 10:00 UTC = 13:00 in Zanzibar on 9 November.
  const now = Date.parse("2026-11-09T10:00:00Z");
  it("uses Zanzibar midnight boundaries", () => {
    expect(parseRange({ range: "today" }, now)).toMatchObject({
      from: "2026-11-08T21:00:00.000Z",
      to: "2026-11-09T21:00:00.000Z",
      bucket: "day",
    });
    expect(parseRange({ range: "7d" }, now)).toMatchObject({ startDate: "2026-11-03" });
    // Just after midnight in Zanzibar is already the next day.
    expect(
      parseRange({ range: "today" }, Date.parse("2026-11-09T21:30:00Z")).startDate,
    ).toBe("2026-11-10");
  });

  it("orders custom dates and picks a sensible bucket", () => {
    const r = parseRange({ range: "custom", from: "2026-10-01", to: "2026-01-01" }, now);
    expect(r).toMatchObject({
      startDate: "2026-01-01",
      endDate: "2026-10-01",
      bucket: "month",
    });
    expect(parseRange({ range: "nonsense" }, now).key).toBe("7d");
  });

  it("lists every bucket so empty days show as zero", () => {
    expect(bucketKeys("2026-11-01", "2026-11-03", "day")).toEqual([
      "2026-11-01",
      "2026-11-02",
      "2026-11-03",
    ]);
    // Weeks start on Monday.
    expect(bucketKeys("2026-11-04", "2026-11-12", "week")).toEqual([
      "2026-11-02",
      "2026-11-09",
    ]);
  });

  it("formats durations and flags", () => {
    expect(formatDuration(65)).toBe("1 min 05 s");
    expect(formatDuration(3720)).toBe("1 h 02 min");
    expect(countryFlag("TZ")).toBe("🇹🇿");
    expect(countryFlag(null)).toBe("");
  });
});
