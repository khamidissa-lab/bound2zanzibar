import Anthropic from "@anthropic-ai/sdk";

import { contact } from "@/config/site";
import { LOCALE_INFO } from "@/i18n/config";
import { buildSystemPrompt, describePage } from "@/lib/assistant/prompt";
import { createRateLimiter } from "@/lib/rate-limit";
import { assistantRequestSchema } from "@/lib/validation/assistant";
import {
  getCategories,
  getDestinations,
  getPackages,
  getTours,
} from "@/services/content";

/**
 * Visitor AI assistant. Streams a plain-text answer grounded in the site's
 * published content. The API key is read server-side only; when it is not
 * configured the endpoint answers 503 and the widget shows contact details.
 */

const MODEL = "claude-opus-5-5";
// Caps the cost of a single answer on a public endpoint; answers are short.
const MAX_TOKENS = 8000;

const perMinute = createRateLimiter({ limit: 8, windowMs: 60_000 });
const perDay = createRateLimiter({ limit: 120, windowMs: 24 * 60 * 60_000 });

const FALLBACK_TEXT = `Sorry, I can't help with that here. For anything about your trip, please contact our team at ${contact.email} or ${contact.phoneDisplay}.`;

function clientKey(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "not_configured" }, { status: 503 });
  }

  const key = clientKey(request);
  for (const check of [perMinute, perDay]) {
    const { ok, retryAfterS } = check(key);
    if (!ok) {
      return Response.json(
        { error: "rate_limited" },
        { status: 429, headers: { "Retry-After": String(retryAfterS) } },
      );
    }
  }

  const parsed = assistantRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  const [tours, packages, destinations, categories] = await Promise.all([
    getTours(),
    getPackages(),
    getDestinations(),
    getCategories(),
  ]);
  const system = buildSystemPrompt({ tours, packages, destinations, categories });
  const pageNote = describePage(parsed.data.page, { tours, packages, destinations });
  const locale = parsed.data.locale ?? "en";
  // Language and page notes go after the visitor's turn so the cached system
  // prompt stays identical for every page and language.
  const notes = [
    pageNote,
    locale === "en"
      ? null
      : `The visitor is using the ${LOCALE_INFO[locale].english} version of the website. Reply in ${LOCALE_INFO[locale].english}, unless they write in another language. Keep site paths unchanged.`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const client = new Anthropic();
  const stream = client.beta.messages.stream(
    {
      model: MODEL,
      max_tokens: MAX_TOKENS,
      output_config: { effort: "low" },
      // If a safety classifier declines, the API retries on a suitable model.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
      messages: notes
        ? [...parsed.data.messages, { role: "system", content: notes }]
        : parsed.data.messages,
    },
    { signal: request.signal },
  );

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      let sent = false;
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            sent = true;
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal" && !sent) {
          controller.enqueue(encoder.encode(FALLBACK_TEXT));
        } else if (final.stop_reason === "max_tokens") {
          controller.enqueue(encoder.encode("…"));
        }
      } catch (error) {
        if (!request.signal.aborted) {
          console.error("[assistant] stream failed:", error);
          controller.enqueue(
            encoder.encode(
              `${sent ? "\n\n" : ""}Sorry, something went wrong. Please try again, or contact us at ${contact.email}.`,
            ),
          );
        }
      } finally {
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
