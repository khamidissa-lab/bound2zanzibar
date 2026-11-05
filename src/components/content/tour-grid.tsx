import type { ReactNode } from "react";

export function TourGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
  );
}
