"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { Cookie } from "lucide-react";

import { LocaleLink as Link } from "@/components/i18n/locale-link";
import { Button } from "@/components/ui/button";
import type { ClientEventType } from "@/lib/visitors/tracking";

type Choice = "accepted" | "declined" | null;
type Strings = {
  title: string;
  body: string;
  accept: string;
  decline: string;
  privacy: string;
};

/** Event name the footer's "Cookie settings" button dispatches. */
export const CONSENT_SETTINGS_EVENT = "b2z:consent-settings";
const HEARTBEAT_MS = 30_000;
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function readChoice(): Choice {
  const match = document.cookie.match(/(?:^|;\s*)b2z_consent=(accepted|declined)/);
  return (match?.[1] as Choice) ?? null;
}
// The cookie only changes through this component, which tracks that itself.
const subscribeNoop = () => () => {};

function send(payload: Record<string, unknown> & { type: ClientEventType }) {
  const body = JSON.stringify({
    path: window.location.pathname + window.location.search,
    ...payload,
  });
  try {
    if (payload.type === "leave" && navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", body);
      return;
    }
    void fetch("/api/track", { method: "POST", body, keepalive: true }).catch(() => {});
  } catch {
    // Tracking must never break the page.
  }
}

/** "tour:slug" from a /book?tour=… link, when present. */
function bookItem(url: URL): string | undefined {
  for (const type of ["tour", "package"] as const) {
    const slug = url.searchParams.get(type);
    if (slug && SLUG.test(slug)) return `${type}:${slug}`;
  }
  return undefined;
}

/**
 * Consent banner plus first-party visitor tracking for the public site.
 * Page views are always sent (the server only counts them anonymously
 * without consent); everything else is sent only after "Accept".
 */
export function VisitorTracker({ strings }: { strings: Strings }) {
  const pathname = usePathname();
  // The stored cookie choice; "server" while rendering on the server, where
  // the banner stays hidden (it appears right after hydration if needed).
  const stored = useSyncExternalStore(subscribeNoop, readChoice, () => "server" as const);
  const [decided, setDecided] = useState<Choice>(null);
  const [reopened, setReopened] = useState(false);
  const choice: Choice = decided ?? (stored === "server" ? null : stored);
  const open = stored !== "server" && (reopened || choice === null);
  const accepted = choice === "accepted";
  const firstView = useRef(true);
  const startedForms = useRef(new Set<string>());

  // The footer's "Cookie settings" button reopens the banner.
  useEffect(() => {
    const reopen = () => setReopened(true);
    window.addEventListener(CONSENT_SETTINGS_EVENT, reopen);
    return () => window.removeEventListener(CONSENT_SETTINGS_EVENT, reopen);
  }, []);

  // Page views, after the new page's title is set.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      send({
        type: "page_view",
        title: document.title,
        referrer: firstView.current ? document.referrer : undefined,
      });
      firstView.current = false;
      startedForms.current.clear();
    }, 300);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  // Heartbeats, visibility and leaving — only with consent.
  useEffect(() => {
    if (!accepted) return;
    const beat = () =>
      send({ type: "heartbeat", visible: document.visibilityState === "visible" });
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") beat();
    }, HEARTBEAT_MS);
    const leave = () => send({ type: "leave", visible: false });
    document.addEventListener("visibilitychange", beat);
    window.addEventListener("pagehide", leave);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", beat);
      window.removeEventListener("pagehide", leave);
    };
  }, [accepted]);

  // Clicks on Book / WhatsApp / Contact, and starting the booking form.
  useEffect(() => {
    if (!accepted) return;
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (!link) return;
      const href = link.getAttribute("href") ?? "";
      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (/(^|\.)wa\.me$|whatsapp\.com$/.test(url.hostname)) {
        send({ type: "whatsapp_click", label: link.textContent?.trim().slice(0, 120) });
      } else if (url.protocol === "mailto:" || url.protocol === "tel:") {
        send({ type: "contact_click", label: url.protocol.replace(":", "") });
      } else if (url.origin === window.location.origin) {
        const path = url.pathname.replace(/^\/[a-z]{2}(?=\/)/, "");
        if (path === "/contact") send({ type: "contact_click", label: "contact page" });
        if (path === "/book") send({ type: "booking_click", item: bookItem(url) });
      }
    };
    const onFocus = (event: FocusEvent) => {
      const form = (event.target as Element | null)?.closest?.("form[data-track-form]");
      if (!form) return;
      const kind = form.getAttribute("data-track-form") ?? "";
      if (kind !== "booking" || startedForms.current.has(kind)) return;
      startedForms.current.add(kind);
      const item = (form.querySelector('[name="item"]') as HTMLInputElement | null)
        ?.value;
      send({
        type: "booking_started",
        item: item && /^(tour|package):[a-z0-9-]+$/.test(item) ? item : undefined,
      });
    };
    document.addEventListener("click", onClick, { capture: true });
    document.addEventListener("focusin", onFocus);
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      document.removeEventListener("focusin", onFocus);
    };
  }, [accepted]);

  const decide = useCallback(async (next: "accepted" | "declined") => {
    setDecided(next);
    setReopened(false);
    try {
      await fetch("/api/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choice: next }),
      });
      // Start the visit straight away instead of waiting for the next page.
      if (next === "accepted") send({ type: "page_view", title: document.title });
    } catch {
      // The banner will simply show again next time.
    }
  }, []);

  if (!open) return null;
  return (
    <section
      aria-labelledby="consent-title"
      className="fixed inset-x-3 bottom-3 z-50 border border-ocean-deep/15 bg-ivory p-5 text-ocean-deep shadow-card sm:inset-x-auto sm:start-4 sm:bottom-4 sm:max-w-md"
    >
      <h2
        id="consent-title"
        className="flex items-center gap-2 font-sans text-base font-semibold"
      >
        <Cookie aria-hidden="true" className="size-4 text-gold-deep" />
        {strings.title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ocean-deep/80">
        {strings.body}{" "}
        <Link
          href="/privacy"
          className="underline underline-offset-2 hover:text-turquoise-deep"
        >
          {strings.privacy}
        </Link>
      </p>
      {/* Both choices are equally easy to make. */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button type="button" variant="outline" onClick={() => decide("declined")}>
          {strings.decline}
        </Button>
        <Button type="button" onClick={() => decide("accepted")}>
          {strings.accept}
        </Button>
      </div>
    </section>
  );
}

/** Footer link that reopens the consent banner. */
export function CookieSettingsButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(CONSENT_SETTINGS_EVENT))}
      className="uppercase underline-offset-2 hover:text-white hover:underline"
    >
      {label}
    </button>
  );
}
