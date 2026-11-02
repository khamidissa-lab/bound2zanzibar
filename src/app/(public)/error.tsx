"use client";

import { Button } from "@/components/ui/button";

// Deliberately generic: never surface raw error messages to visitors.
export default function PublicError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <section className="container-page flex min-h-[60vh] flex-col justify-center py-20">
      <h1 className="text-4xl font-medium">Something went wrong</h1>
      <p className="mt-4 max-w-xl text-lg text-muted-foreground">
        We couldn&apos;t load this page. Please try again in a moment.
      </p>
      <div className="mt-8">
        <Button size="lg" onClick={() => retry()}>
          Try again
        </Button>
      </div>
    </section>
  );
}
