"use server";

import { refresh, updateTag } from "next/cache";

import { isLocale } from "@/i18n/config";
import { authorizeAction } from "@/lib/auth/session";
import { formValues, type FormState } from "@/lib/forms";
import {
  TRANSLATABLE_FIELDS,
  type TranslatableEntity,
} from "@/lib/i18n/localize-content";
import { formToFields } from "@/lib/i18n/translation-form";
import type { Json } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CONTENT_TAG } from "@/services/content-db";
import { loadTranslatableItem } from "@/services/translatable-items";

const MAX_CHARS = 60000;

const isEntity = (v: unknown): v is TranslatableEntity =>
  typeof v === "string" && Object.hasOwn(TRANSLATABLE_FIELDS, v);

/**
 * Saves a reviewed translation. The English item is reloaded on the server
 * and decides the shape, so only real fields with the right structure are
 * stored. Saving marks the translation as reviewed by staff.
 */
export async function saveTranslation(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const auth = await authorizeAction("content.manage");
  if (!auth.ok) return { status: "error", message: auth.message };

  const values = formValues(formData);
  const { entity, id, locale } = values;
  if (
    !isEntity(entity) ||
    !/^[0-9a-f-]{36}$/i.test(id ?? "") ||
    !isLocale(locale) ||
    locale === "en"
  ) {
    return {
      status: "error",
      message: "This translation can't be saved. Reload the page.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const item = await loadTranslatableItem(supabase, entity, id);
  if (!item) return { status: "error", message: "This item no longer exists." };

  const fields = formToFields(item.fields, values);
  if (JSON.stringify(fields).length > MAX_CHARS) {
    return { status: "error", message: "This translation is too long to save." };
  }

  const { error } = await supabase.rpc("set_content_translation", {
    p_entity: entity,
    p_entity_id: id,
    p_locale: locale,
    p_fields: fields as Json,
    p_is_machine: false,
  });
  if (error) {
    if (error.code === "42501" || /row-level security/i.test(error.message)) {
      return { status: "error", message: "You don't have permission to do that." };
    }
    console.error(`[translations] save failed: ${error.code ?? ""} ${error.message}`);
    return {
      status: "error",
      message: "We couldn't save the translation. Please try again.",
    };
  }

  updateTag(CONTENT_TAG);
  refresh();
  return {
    status: "success",
    message: Object.keys(fields).length
      ? "Translation saved and marked as reviewed."
      : "Saved. Nothing is translated yet, so the website shows English.",
  };
}
