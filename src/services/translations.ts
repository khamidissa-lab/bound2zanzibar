import "server-only";

import { TRANSLATED_LOCALES, type TranslatedLocale } from "@/i18n/config";
import type { TranslatableEntity } from "@/lib/i18n/localize-content";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import {
  loadTranslatableItem,
  loadTranslatableItems,
  type TranslatableItem,
} from "./translatable-items";

export type TranslationState = "missing" | "machine" | "reviewed";

export type StoredTranslation = {
  fields: Record<string, unknown>;
  isMachine: boolean;
  updatedAt: string;
};

function failed(what: string, error: { message: string }): never {
  console.error(`[translations] failed to ${what}: ${error.message}`);
  throw new Error(`Failed to ${what}`);
}

/** Every translatable item with its status in each language (admin overview). */
export async function listTranslationOverview(): Promise<
  (TranslatableItem & { states: Record<TranslatedLocale, TranslationState> })[]
> {
  const supabase = await createSupabaseServerClient();
  const [items, rows] = await Promise.all([
    loadTranslatableItems(supabase),
    supabase.from("content_translations").select("entity, entity_id, locale, is_machine"),
  ]);
  if (rows.error) failed("load translations", rows.error);
  const index = new Map(
    rows.data.map((r) => [`${r.entity}:${r.entity_id}:${r.locale}`, r.is_machine]),
  );
  return items.map((item) => ({
    ...item,
    states: Object.fromEntries(
      TRANSLATED_LOCALES.map((l) => {
        const machine = index.get(`${item.entity}:${item.id}:${l}`);
        return [l, machine === undefined ? "missing" : machine ? "machine" : "reviewed"];
      }),
    ) as Record<TranslatedLocale, TranslationState>,
  }));
}

/** One item's English source and its stored translations. */
export async function getTranslationEditor(
  entity: TranslatableEntity,
  id: string,
): Promise<{
  item: TranslatableItem;
  translations: Partial<Record<TranslatedLocale, StoredTranslation>>;
} | null> {
  const supabase = await createSupabaseServerClient();
  const item = await loadTranslatableItem(supabase, entity, id);
  if (!item) return null;
  const { data, error } = await supabase
    .from("content_translations")
    .select("locale, fields, is_machine, updated_at")
    .eq("entity", entity)
    .eq("entity_id", id);
  if (error) failed("load translations", error);
  const translations: Partial<Record<TranslatedLocale, StoredTranslation>> = {};
  for (const row of data) {
    const fields =
      typeof row.fields === "object" && row.fields !== null && !Array.isArray(row.fields)
        ? (row.fields as Record<string, unknown>)
        : {};
    translations[row.locale as TranslatedLocale] = {
      fields,
      isMachine: row.is_machine,
      updatedAt: row.updated_at,
    };
  }
  return { item, translations };
}
