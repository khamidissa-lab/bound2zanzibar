"use server";

import { headers } from "next/headers";
import { z } from "zod";

import { createRateLimiter } from "@/lib/rate-limit";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { identifyCurrentVisitor } from "@/services/visitor-tracking";

export type NewsletterState = {
  status: "idle" | "success" | "error";
  /** Key into t.newsletter for the message to show. */
  code?: "invalidEmail" | "consentRequired" | "error";
  email?: string;
};

const perHour = createRateLimiter({ limit: 10, windowMs: 60 * 60_000 });

const schema = z.object({
  email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
  consent: z.literal("on"),
  locale: z
    .string()
    .regex(/^[a-z]{2}$/)
    .catch("en"),
});

/** Footer newsletter sign-up. Consent is the explicit checkbox. */
export async function subscribeNewsletter(
  _prev: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const raw = (k: string) => {
    const v = formData.get(k);
    return typeof v === "string" ? v : "";
  };
  // Honeypot: hidden from people, often filled in by bots.
  if (raw("website")) return { status: "success" };

  const parsed = schema.safeParse({
    email: raw("email"),
    consent: raw("consent"),
    locale: raw("locale"),
  });
  if (!parsed.success) {
    const field = String(parsed.error.issues[0]?.path[0]);
    return {
      status: "error",
      code: field === "consent" ? "consentRequired" : "invalidEmail",
      email: raw("email"),
    };
  }
  if (!isSupabaseConfigured())
    return { status: "error", code: "error", email: raw("email") };

  const h = await headers();
  const ip =
    h.get("cf-connecting-ip") ||
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  if (!perHour(ip).ok) return { status: "error", code: "error", email: raw("email") };

  const { error } = await createSupabasePublicClient().rpc("subscribe_newsletter", {
    p_email: parsed.data.email,
    p_locale: parsed.data.locale,
  });
  if (error) {
    console.error("[newsletter] subscribe failed:", error.message);
    return {
      status: "error",
      code: error.message.includes("newsletter_invalid_email") ? "invalidEmail" : "error",
      email: raw("email"),
    };
  }
  await identifyCurrentVisitor({ source: "newsletter", email: parsed.data.email });
  return { status: "success" };
}
