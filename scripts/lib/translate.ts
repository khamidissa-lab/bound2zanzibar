/**
 * Shared AI translation helper for the i18n scripts. Sends English JSON to
 * Claude, asks for the same JSON with only the text values translated, and
 * rejects any answer whose structure differs from the source (keys, array
 * lengths, numbers, nulls and {placeholders} must all be unchanged).
 */
import Anthropic from "@anthropic-ai/sdk";

import { LOCALE_INFO, type TranslatedLocale } from "../../src/i18n/config";

const MODEL = "claude-opus-5-5";

const STYLE: Record<TranslatedLocale, string> = {
  fr: "French. Use the formal 'vous'.",
  de: "German. Use the formal 'Sie'.",
  it: "Italian. Use the formal 'Lei' where a form of address is needed.",
  ar: "Modern Standard Arabic, natural for Gulf and Levant travellers.",
  tr: "Turkish. Use the polite 'siz' form.",
};

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

/** Returns a reason when `out` doesn't match the shape of `src`, else null. */
export function shapeMismatch(src: Json, out: unknown, path = "$"): string | null {
  if (typeof src === "string") {
    if (typeof out !== "string") return `${path}: expected text`;
    if (src.trim() !== "" && out.trim() === "") return `${path}: empty translation`;
    const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(",");
    if (placeholders(src) !== placeholders(out)) return `${path}: placeholders changed`;
    return null;
  }
  if (typeof src === "number" || typeof src === "boolean" || src === null) {
    return out === src ? null : `${path}: value must stay ${JSON.stringify(src)}`;
  }
  if (Array.isArray(src)) {
    if (!Array.isArray(out) || out.length !== src.length)
      return `${path}: list length changed`;
    for (let i = 0; i < src.length; i++) {
      const err = shapeMismatch(src[i], out[i], `${path}[${i}]`);
      if (err) return err;
    }
    return null;
  }
  if (typeof out !== "object" || out === null || Array.isArray(out))
    return `${path}: expected object`;
  const srcKeys = Object.keys(src).sort().join("|");
  const outKeys = Object.keys(out).sort().join("|");
  if (srcKeys !== outKeys) return `${path}: keys changed`;
  for (const key of Object.keys(src)) {
    const err = shapeMismatch(
      src[key],
      (out as Record<string, unknown>)[key],
      `${path}.${key}`,
    );
    if (err) return err;
  }
  return null;
}

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = (fenced ? fenced[1] : text).trim();
  // The JSON may be an object or a list; take from the first opener.
  const object = raw.indexOf("{");
  const list = raw.indexOf("[");
  const isList = list !== -1 && (object === -1 || list < object);
  const start = isList ? list : object;
  const end = raw.lastIndexOf(isList ? "]" : "}");
  return JSON.parse(raw.slice(start, end + 1));
}

let client: Anthropic | null = null;

/**
 * Translates every user-facing string value in `source` into `locale`.
 * `context` explains what the text is (e.g. "website interface text").
 */
export async function translateJson<T extends Json>(
  source: T,
  locale: TranslatedLocale,
  context: string,
  { attempts = 3 }: { attempts?: number } = {},
): Promise<T> {
  client ??= new Anthropic();
  const language = LOCALE_INFO[locale].english;
  const instructions = `You translate content for "Bound to Zanzibar", a Zanzibar tour and safari company's website, from British English into ${STYLE[locale]}

What you are translating: ${context}

Rules:
- Return the SAME JSON structure: identical keys (never translate keys), identical list lengths and order, numbers, booleans and nulls unchanged.
- Translate only the text values. Keep {placeholders} exactly as written.
- Keep brand and proper names as they are: Bound to Zanzibar, Zanzibar, Stone Town, Nungwi, Kendwa, Mnemba, Jozani, Serengeti, Ngorongoro, park and island names, WhatsApp, Instagram. Keep email addresses, phone numbers, URLs, currency codes (USD, TZS) and site paths unchanged.
- Keep the meaning exact: do not add, remove or soften facts, prices, conditions or promises. Honest caveats (e.g. "sightings cannot be guaranteed", "illustrative price", "not a confirmed booking") must stay just as clear.
- Natural, warm, concise travel-website tone that a native speaker would write.
- Reply with the JSON only, in one \`\`\`json code block.`;

  let lastError = "";
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: 32000,
      output_config: { effort: "low" },
      system: instructions,
      messages: [
        {
          role: "user",
          content: `${lastError ? `Your previous answer was rejected: ${lastError}. Fix that.\n\n` : ""}Translate into ${language}:\n\n\`\`\`json\n${JSON.stringify(source, null, 2)}\n\`\`\``,
        },
      ],
    });
    const message = await stream.finalMessage();
    if (message.stop_reason !== "end_turn") {
      lastError = `stopped early (${message.stop_reason})`;
      continue;
    }
    const text = message.content
      .flatMap((block) => (block.type === "text" ? [block.text] : []))
      .join("");
    let parsed: unknown;
    try {
      parsed = extractJson(text);
    } catch {
      lastError = "the reply was not valid JSON";
      continue;
    }
    const mismatch = shapeMismatch(source, parsed);
    if (!mismatch) return parsed as T;
    lastError = mismatch;
  }
  throw new Error(`Translation into ${language} failed: ${lastError}`);
}

/** Runs async jobs with a fixed number in flight. */
export async function runPool<T>(
  jobs: (() => Promise<T>)[],
  concurrency: number,
): Promise<PromiseSettledResult<T>[]> {
  const results: PromiseSettledResult<T>[] = new Array(jobs.length);
  let next = 0;
  async function worker() {
    while (next < jobs.length) {
      const i = next++;
      try {
        results[i] = { status: "fulfilled", value: await jobs[i]() };
      } catch (reason) {
        results[i] = { status: "rejected", reason };
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, jobs.length) }, worker));
  return results;
}
