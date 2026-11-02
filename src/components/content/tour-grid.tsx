import type { ReactNode } from "react";

export function TourGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}
