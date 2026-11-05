"use client";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/client";

// Deliberately generic: never surface raw error messages to visitors.
export default function PublicError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const { t } = useI18n();
  return (
    <section className="container-page flex min-h-[60vh] flex-col justify-center py-20">
      <h1 className="display-lg">{t.error.title}</h1>
      <p className="mt-4 max-w-xl text-lg text-muted-foreground">{t.error.body}</p>
      <div className="mt-8">
        <Button size="lg" onClick={() => retry()}>
          {t.error.retry}
        </Button>
      </div>
    </section>
  );
}
