import type { ReactNode } from "react";

/**
 * Re-mounts on every navigation, so each page fades up gently (skipped for
 * visitors who prefer reduced motion; see `.page-enter` in globals.css).
 */
export default function PublicTemplate({ children }: { children: ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
