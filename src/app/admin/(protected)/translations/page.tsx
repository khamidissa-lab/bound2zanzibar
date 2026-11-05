import type { Metadata } from "next";
import Link from "next/link";

import { AccessDenied } from "@/components/admin/admin-states";
import { LOCALE_INFO, TRANSLATED_LOCALES } from "@/i18n/config";
import { requireStaffPage } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import { ENTITY_LABELS } from "@/services/translatable-items";
import { listTranslationOverview, type TranslationState } from "@/services/translations";

export const metadata: Metadata = { title: "Translations" };

const STATE: Record<TranslationState, { label: string; className: string }> = {
  missing: {
    label: "Not translated",
    className: "border border-dashed text-muted-foreground",
  },
  machine: { label: "AI draft", className: "bg-[#FFF3D6] text-[#7A5200]" },
  reviewed: { label: "Reviewed", className: "bg-[#E1F4EA] text-[#11633A]" },
};

export default async function TranslationsPage() {
  const { allowed } = await requireStaffPage("content.manage", "/admin/translations");
  if (!allowed) return <AccessDenied />;

  const items = await listTranslationOverview();
  const groups = (Object.keys(ENTITY_LABELS) as (keyof typeof ENTITY_LABELS)[])
    .map((entity) => ({ entity, items: items.filter((i) => i.entity === entity) }))
    .filter((g) => g.items.length > 0);
  const totals = TRANSLATED_LOCALES.map((l) => ({
    locale: l,
    reviewed: items.filter((i) => i.states[l] === "reviewed").length,
    machine: items.filter((i) => i.states[l] === "machine").length,
  }));

  return (
    <div className="max-w-6xl">
      <h1 className="font-display text-3xl text-ocean-deep">Translations</h1>
      <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
        The website is available in English plus {TRANSLATED_LOCALES.length} languages. AI
        drafts are shown to visitors with a “translated automatically” note until you
        review and save them here. Anything not translated shows in English.
      </p>

      <ul className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {totals.map((t) => (
          <li key={t.locale} className="rounded-xl border bg-card p-4">
            <p className="text-sm font-semibold text-ocean-deep">
              {LOCALE_INFO[t.locale].english}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t.reviewed} reviewed · {t.machine} AI drafts · {items.length} items
            </p>
          </li>
        ))}
      </ul>

      {groups.map((group) => (
        <section
          key={group.entity}
          className="mt-8"
          aria-labelledby={`tr-${group.entity}`}
        >
          <h2 id={`tr-${group.entity}`} className="mb-3 text-lg text-ocean-deep">
            {ENTITY_LABELS[group.entity].many}
          </h2>
          <div
            className="overflow-x-auto rounded-xl border bg-card"
            tabIndex={0}
            role="region"
            aria-label={`${ENTITY_LABELS[group.entity].many} translations (scrolls sideways)`}
          >
            <table className="w-full min-w-[48rem] text-sm">
              <thead className="border-b bg-muted/60 text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-start font-medium">
                    {ENTITY_LABELS[group.entity].one}
                  </th>
                  {TRANSLATED_LOCALES.map((l) => (
                    <th key={l} className="px-3 py-3 text-start font-medium">
                      {LOCALE_INFO[l].english}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {group.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-2.5 font-medium text-ocean-deep">
                      {item.label}
                      {item.status !== "published" ? (
                        <span className="ms-2 text-xs font-normal text-muted-foreground">
                          ({item.status})
                        </span>
                      ) : null}
                    </td>
                    {TRANSLATED_LOCALES.map((l) => (
                      <td key={l} className="px-3 py-2.5">
                        <Link
                          href={`/admin/translations/${item.entity}/${item.id}?lang=${l}`}
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium hover:underline",
                            STATE[item.states[l]].className,
                          )}
                        >
                          {STATE[item.states[l]].label}
                          <span className="sr-only">
                            {" "}
                            — edit {LOCALE_INFO[l].english} translation of {item.label}
                          </span>
                        </Link>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
