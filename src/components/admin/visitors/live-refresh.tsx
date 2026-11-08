"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/** Fallback refresh, also moves visitors from Online to Idle to Left over time. */
const POLL_MS = 20_000;
/** Bursts of changes (a visitor clicking around) cause a single refresh. */
const DEBOUNCE_MS = 1_500;

/**
 * Keeps the Live visitors page current without reloading:
 * - Supabase Realtime pushes every change to visitor sessions (RLS: staff only)
 * - a 20-second timer is a fallback and updates "Online / Idle / Left".
 * Pauses while the admin tab is hidden to avoid needless server load.
 */
export function LiveRefresh() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [connected, setConnected] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    const refreshNow = () => {
      if (document.visibilityState !== "visible") return;
      startTransition(() => router.refresh());
      setUpdatedAt(new Date());
    };
    const refreshSoon = () => {
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(refreshNow, DEBOUNCE_MS);
    };

    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel("live-visitors")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "visitor_sessions" },
        refreshSoon,
      )
      .subscribe((status) => setConnected(status === "SUBSCRIBED"));

    const poll = window.setInterval(refreshNow, POLL_MS);
    document.addEventListener("visibilitychange", refreshNow);
    return () => {
      window.clearInterval(poll);
      if (timer.current) window.clearTimeout(timer.current);
      document.removeEventListener("visibilitychange", refreshNow);
      void supabase.removeChannel(channel);
    };
  }, [router]);

  return (
    <p
      className="flex items-center gap-2 text-xs text-muted-foreground"
      aria-live="polite"
    >
      <span
        aria-hidden="true"
        className={
          connected
            ? "size-2 animate-pulse rounded-full bg-emerald-500"
            : "size-2 rounded-full bg-amber-400"
        }
      />
      {connected ? "Live" : "Auto-refresh every 20 s"}
      {updatedAt ? (
        <span>
          · updated{" "}
          {updatedAt.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </span>
      ) : null}
      <RefreshCw
        aria-hidden="true"
        className={pending ? "size-3 animate-spin" : "size-3 opacity-0"}
      />
    </p>
  );
}
