import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  CONSENT_COOKIE,
  CONSENT_MAX_AGE_S,
  CONSENT_POLICY_VERSION,
  isVisitorId,
  locationFromHeaders,
  VISITOR_COOKIE,
} from "@/lib/visitors/tracking";
import { canTrackVisitors } from "@/services/visitor-tracking";

const schema = z.object({ choice: z.enum(["accepted", "declined"]) });

/**
 * Saves the visitor's choice from the consent banner. Accepting creates the
 * random visitor ID; declining after having accepted erases their profile.
 */
export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return new NextResponse(null, { status: 400 });
  const { choice } = parsed.data;

  const existing = request.cookies.get(VISITOR_COOKIE)?.value;
  const response = new NextResponse(null, { status: 204 });
  const cookie = {
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: CONSENT_MAX_AGE_S,
    path: "/",
  };
  response.cookies.set(CONSENT_COOKIE, choice, cookie);

  let visitorId: string | null = null;
  let recorded: "accepted" | "declined" | "withdrawn" = choice;
  if (choice === "accepted") {
    visitorId = isVisitorId(existing) ? existing : crypto.randomUUID();
    response.cookies.set(VISITOR_COOKIE, visitorId, { ...cookie, httpOnly: true });
  } else {
    if (isVisitorId(existing)) {
      visitorId = existing;
      recorded = "withdrawn";
    }
    response.cookies.delete(VISITOR_COOKIE);
  }

  if (canTrackVisitors()) {
    const { error } = await createSupabaseAdminClient().rpc("record_consent", {
      // null for a first-time "decline": the choice is recorded without an ID.
      p_visitor_id: visitorId as string,
      p_choice: recorded,
      p_policy_version: CONSENT_POLICY_VERSION,
      p_country: locationFromHeaders(request.headers).country ?? undefined,
    });
    if (error) console.error("[visitors] consent failed:", error.message);
  }
  return response;
}
