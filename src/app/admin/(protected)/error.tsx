"use client";

import { Button } from "@/components/ui/button";

// Generic on purpose: details are logged on the server, never shown here.
export default function AdminError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <div role="alert" className="max-w-xl rounded-2xl border bg-card p-6 sm:p-8">
      <h1 className="font-display text-2xl text-ocean-deep">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This page couldn&apos;t load. Check your connection and try again. If it keeps
        happening, the database may be unavailable.
      </p>
      <Button className="mt-6" onClick={() => retry()}>
        Try again
      </Button>
    </div>
  );
}
