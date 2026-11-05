"use client";

import { useI18n } from "@/i18n/client";

/** Shown while a public page's data loads: an editorial skeleton, no spinner. */
export default function PublicLoading() {
  const { t } = useI18n();
  return (
    <div aria-busy="true" aria-label={t.common.loading} className="bg-ivory">
      <div className="container-page py-16">
        <div className="h-3 w-40 animate-pulse bg-sand" />
        <div className="mt-6 h-16 w-full max-w-2xl animate-pulse bg-sand" />
        <div className="mt-4 h-5 w-full max-w-xl animate-pulse bg-sand-soft" />
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i}>
              <div className="aspect-[4/5] animate-pulse bg-sand-soft" />
              <div className="mt-5 h-6 w-3/4 animate-pulse bg-sand" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
