"use client";

import { useSyncExternalStore } from "react";

import type { Market } from "@/types/content";

/**
 * The visitor's chosen pricing market, remembered in localStorage and shared
 * by every price on the page. Pages stay statically rendered: the server
 * snapshot is the default market and the client switches after hydration.
 */

const STORAGE_KEY = "btz-market";
const DEFAULT_MARKET: Market = "international";
const listeners = new Set<() => void>();

function readMarket(): Market {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "resident"
      ? "resident"
      : DEFAULT_MARKET;
  } catch {
    return DEFAULT_MARKET;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function setMarket(market: Market) {
  try {
    window.localStorage.setItem(STORAGE_KEY, market);
  } catch {
    // Storage unavailable (private mode); the choice simply won't persist.
  }
  listeners.forEach((listener) => listener());
}

export function useMarket(): Market {
  return useSyncExternalStore(subscribe, readMarket, () => DEFAULT_MARKET);
}
