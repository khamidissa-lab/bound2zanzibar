/**
 * Drafts translations of published content (tours, packages, destinations,
 * travel-guide articles and tour categories) with Claude and stores them in
 * content_translations, marked as machine translated ("under review").
 *
 *   npm run i18n:content               # fill in every missing translation
 *   npm run i18n:content -- --force    # also redo machine translations
 *   npm run i18n:content -- fr de      # only these languages
 *
 * Translations reviewed in the admin (is_machine = false) are never touched.
 * Needs NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and
 * ANTHROPIC_API_KEY in .env.local. Public pages pick up new translations
 * within the content cache window (or after a server restart).
 */
import { createClient } from "@supabase/supabase-js";

import { TRANSLATED_LOCALES, type TranslatedLocale } from "../src/i18n/config";
import type { TranslatableEntity } from "../src/lib/i18n/localize-content";
import type { Database } from "../src/lib/supabase/database.types";
import { loadTranslatableItems } from "../src/services/translatable-items";

import { runPool, translateJson } from "./lib/translate";

const args = process.argv.slice(2);
const force = args.includes("--force");
const wanted = args.filter((a) => !a.startsWith("--"));
const locales = TRANSLATED_LOCALES.filter(
  (l) => wanted.length === 0 || wanted.includes(l),
);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key || !process.env.ANTHROPIC_API_KEY) {
  console.error(
    "Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and ANTHROPIC_API_KEY in .env.local.",
  );
  process.exit(1);
}
const db = createClient<Database>(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const CONTEXT: Record<TranslatableEntity, string> = {
  tours:
    "a tour's page: name, descriptions, itinerary steps, inclusions, practical notes and FAQs",
  packages:
    "a multi-day travel package: name, overview, day-by-day itinerary, inclusions and terms",
  destinations: "a destination guide: name, summary, description and highlights",
  blog_posts: "a travel-guide article: title, excerpt and sections",
  tour_categories: "a tour category name and short description",
};

async function loadItems() {
  // Only published content is shown on the website, so only it is drafted.
  return (await loadTranslatableItems(db)).filter((i) => i.status === "published");
}

/** Drops empty values so they aren't sent for translation (English is used). */
function compact(fields: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(fields).filter(([, v]) =>
      Array.isArray(v)
        ? v.length > 0
        : typeof v === "string"
          ? v.trim() !== ""
          : v != null,
    ),
  );
}

async function main() {
  const items = await loadItems();
  const { data: existing, error } = await db
    .from("content_translations")
    .select("entity, entity_id, locale, is_machine");
  if (error) throw new Error(`Failed to load existing translations: ${error.message}`);
  const have = new Map(
    existing.map((r) => [`${r.entity}:${r.entity_id}:${r.locale}`, r.is_machine]),
  );

  const jobs: (() => Promise<string>)[] = [];
  for (const item of items) {
    for (const locale of locales) {
      const state = have.get(`${item.entity}:${item.id}:${locale}`);
      if (state === false) continue; // reviewed by staff: never overwrite
      if (state === true && !force) continue; // already drafted
      jobs.push(async () => {
        const source = compact(item.fields);
        const translated = await translateJson(
          source as never,
          locale as TranslatedLocale,
          CONTEXT[item.entity],
        );
        const { error: saveError } = await db.from("content_translations").upsert(
          {
            entity: item.entity,
            entity_id: item.id,
            locale,
            fields: translated,
            is_machine: true,
          },
          { onConflict: "entity,entity_id,locale" },
        );
        if (saveError) throw new Error(`save failed: ${saveError.message}`);
        return `${locale} ${item.entity} ${item.label}`;
      });
    }
  }

  console.log(`${items.length} items, ${jobs.length} translations to draft…`);
  let done = 0;
  const results = await runPool(
    jobs.map((job) => async () => {
      const label = await job();
      console.log(`✓ [${++done}/${jobs.length}] ${label}`);
      return label;
    }),
    6,
  );
  const failed = results.filter(
    (r) => r.status === "rejected",
  ) as PromiseRejectedResult[];
  for (const f of failed)
    console.error(`✗ ${f.reason instanceof Error ? f.reason.message : f.reason}`);
  console.log(`Done: ${results.length - failed.length} saved, ${failed.length} failed.`);
  if (failed.length) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
