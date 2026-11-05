import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { AccessDenied } from "@/components/admin/admin-states";
import {
  TranslationEditor,
  type EditorField,
  type EditorInput,
} from "@/components/admin/translations/translation-editor";
import {
  isLocale,
  LOCALE_INFO,
  localizePath,
  TRANSLATED_LOCALES,
  type TranslatedLocale,
} from "@/i18n/config";
import { requireStaffPage } from "@/lib/auth/session";
import {
  TRANSLATABLE_FIELDS,
  type TranslatableEntity,
} from "@/lib/i18n/localize-content";
import {
  FIELD_LABELS,
  fieldKind,
  formName,
  listToText,
} from "@/lib/i18n/translation-form";
import { cn } from "@/lib/utils";
import { ENTITY_LABELS } from "@/services/translatable-items";
import { getTranslationEditor } from "@/services/translations";

export const metadata: Metadata = { title: "Edit translation" };

const UUID = /^[0-9a-f-]{36}$/i;

const label = (key: string) => FIELD_LABELS[key] ?? key;

/** Builds the editor's inputs from the English source and the saved translation. */
function editorFields(
  source: Record<string, unknown>,
  saved: Record<string, unknown>,
): EditorField[] {
  return Object.entries(source).flatMap(([key, english]): EditorField[] => {
    const kind = fieldKind(key, english);
    if (kind === "items" && Array.isArray(english)) {
      const savedList = Array.isArray(saved[key])
        ? (saved[key] as Record<string, unknown>[])
        : [];
      return [
        {
          group: true,
          key,
          label: label(key),
          items: english.map((item, i) => {
            const src = item as Record<string, unknown>;
            const day = typeof src.day === "number" ? src.day : null;
            return {
              title: day !== null ? `Day ${day}` : String(i + 1),
              inputs: Object.entries(src).flatMap(([sub, subEnglish]): EditorInput[] => {
                if (typeof subEnglish !== "string" && !Array.isArray(subEnglish))
                  return [];
                const subKind = fieldKind(sub, subEnglish);
                const savedValue = savedList[i]?.[sub];
                return [
                  {
                    name: formName(key, i, sub),
                    label: label(sub),
                    kind: subKind === "items" ? "list" : subKind,
                    english: listToText(sub, subEnglish),
                    value: savedValue === undefined ? "" : listToText(sub, savedValue),
                  },
                ];
              }),
            };
          }),
        },
      ];
    }
    return [
      {
        name: formName(key),
        label: label(key),
        kind: kind === "items" ? "list" : kind,
        english: listToText(key, english),
        value: saved[key] === undefined ? "" : listToText(key, saved[key]),
      },
    ];
  });
}

const savedAt = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Dar_es_Salaam",
  }).format(new Date(iso));

export default async function EditTranslationPage({
  params,
  searchParams,
}: PageProps<"/admin/translations/[entity]/[id]">) {
  const { entity, id } = await params;
  const { allowed } = await requireStaffPage(
    "content.manage",
    `/admin/translations/${entity}/${id}`,
  );
  if (!allowed) return <AccessDenied />;
  if (!Object.hasOwn(TRANSLATABLE_FIELDS, entity) || !UUID.test(id)) notFound();

  const lang = (await searchParams).lang;
  const requested = Array.isArray(lang) ? lang[0] : lang;
  const locale: TranslatedLocale =
    isLocale(requested) && requested !== "en" ? requested : TRANSLATED_LOCALES[0];

  const data = await getTranslationEditor(entity as TranslatableEntity, id);
  if (!data) notFound();
  const { item, translations } = data;
  const current = translations[locale];
  const language = LOCALE_INFO[locale].english;

  return (
    <div className="max-w-5xl">
      <Link
        href="/admin/translations"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-ocean-deep"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All translations
      </Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {ENTITY_LABELS[item.entity].one} translation
          </p>
          <h1 className="font-display text-3xl text-ocean-deep">{item.label}</h1>
        </div>
        {item.path && item.status === "published" ? (
          <a
            href={localizePath(locale, item.path)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-3 py-2 text-sm text-ocean-deep hover:bg-muted"
          >
            View in {language}
            <ExternalLink className="size-3.5" aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        ) : null}
      </div>

      <nav aria-label="Language" className="mt-6 flex flex-wrap gap-2">
        {TRANSLATED_LOCALES.map((l) => {
          const saved = translations[l];
          return (
            <Link
              key={l}
              href={`/admin/translations/${item.entity}/${item.id}?lang=${l}`}
              aria-current={l === locale ? "page" : undefined}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-sm",
                l === locale
                  ? "border-turquoise-deep bg-turquoise-deep text-white"
                  : "bg-card text-ocean-deep hover:bg-muted",
              )}
            >
              {LOCALE_INFO[l].english}
              <span className="ms-1.5 text-xs opacity-80">
                {saved
                  ? saved.isMachine
                    ? "· AI draft"
                    : "· reviewed"
                  : "· not translated"}
              </span>
            </Link>
          );
        })}
      </nav>

      <p
        className={cn(
          "mt-4 rounded-lg px-4 py-3 text-sm",
          !current
            ? "border border-dashed text-muted-foreground"
            : current.isMachine
              ? "bg-[#FFF3D6] text-[#7A5200]"
              : "bg-[#E1F4EA] text-[#11633A]",
        )}
      >
        {!current
          ? `Not translated into ${language} yet — visitors see the English text.`
          : current.isMachine
            ? "AI draft — shown to visitors with a “translated automatically” note. Check it and save to mark it as reviewed."
            : `Reviewed — last saved ${savedAt(current.updatedAt)}.`}
      </p>

      <div className="mt-6">
        <TranslationEditor
          entity={item.entity}
          id={item.id}
          locale={locale}
          dir={LOCALE_INFO[locale].dir}
          fields={editorFields(item.fields, current?.fields ?? {})}
        />
      </div>
    </div>
  );
}
