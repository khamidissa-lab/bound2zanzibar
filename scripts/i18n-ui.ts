/**
 * Drafts the website interface text (src/i18n/messages/<locale>.ts) for every
 * non-English language from en.ts, using Claude. Each draft is checked to
 * have exactly the same keys and placeholders before it is written.
 *
 *   npm run i18n:ui            # all languages
 *   npm run i18n:ui -- fr ar   # only these
 *
 * Needs ANTHROPIC_API_KEY in .env.local. Review the output before publishing.
 */
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { TRANSLATED_LOCALES, type TranslatedLocale } from "../src/i18n/config";
import { en } from "../src/i18n/messages/en";

import { runPool, translateJson } from "./lib/translate";

const wanted = process.argv.slice(2);
const locales = TRANSLATED_LOCALES.filter(
  (l) => wanted.length === 0 || wanted.includes(l),
);

async function draft(locale: TranslatedLocale) {
  // Split by top-level section so each request stays small and focused.
  const sections = Object.keys(en) as (keyof typeof en)[];
  const out: Record<string, unknown> = {};
  const results = await runPool(
    sections.map((section) => async () => {
      out[section] = await translateJson(
        en[section] as never,
        locale,
        `the "${section}" section of the website interface text (menus, headings, buttons, form labels, notices). In the "errors" and "units" sections the keys are English lookup keys: never change them, translate only the values.`,
      );
    }),
    6,
  );
  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length) {
    throw new Error(
      `${locale}: ${failed.length} section(s) failed — ${failed.map((f) => (f as PromiseRejectedResult).reason).join("; ")}`,
    );
  }
  const ordered = Object.fromEntries(sections.map((s) => [s, out[s]]));
  const file = join(process.cwd(), "src", "i18n", "messages", `${locale}.ts`);
  writeFileSync(
    file,
    `import type { Messages } from "./en";

// AI-drafted from en.ts by \`npm run i18n:ui\`; review before relying on it.
export const ${locale}: Messages = ${JSON.stringify(ordered, null, 2)};
`,
  );
  execFileSync(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["prettier", "--write", file],
    {
      stdio: "ignore",
      shell: process.platform === "win32",
    },
  );
  console.log(`✓ ${locale}`);
}

async function main() {
  for (const locale of locales) {
    try {
      await draft(locale);
    } catch (error) {
      console.error(`✗ ${error instanceof Error ? error.message : error}`);
      process.exitCode = 1;
    }
  }
}

void main();
