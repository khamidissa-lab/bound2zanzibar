import "server-only";

import { cookies } from "next/headers";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { CONSENT_COOKIE, isVisitorId, VISITOR_COOKIE } from "@/lib/visitors/tracking";

/** True when the website server can write visitor data (service-role key set). */
export function canTrackVisitors(): boolean {
  return isSupabaseConfigured() && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * After a form is sent successfully, links the details the visitor typed in
 * (name, email, phone) to their visitor record — only when they accepted the
 * consent banner. Never throws: a tracking problem must not fail a booking.
 */
export async function identifyCurrentVisitor(input: {
  source: "booking" | "enquiry" | "journey" | "newsletter";
  email: string;
  name?: string | null;
  phone?: string | null;
  reference?: string | null;
  item?: { type: "tour" | "package"; slug: string } | null;
}): Promise<void> {
  try {
    if (!canTrackVisitors()) return;
    const jar = await cookies();
    const visitorId = jar.get(VISITOR_COOKIE)?.value;
    if (jar.get(CONSENT_COOKIE)?.value !== "accepted" || !isVisitorId(visitorId)) return;
    const { error } = await createSupabaseAdminClient().rpc("identify_visitor", {
      p_visitor_id: visitorId,
      p_source: input.source,
      p_email: input.email,
      p_name: input.name ?? undefined,
      p_phone: input.phone ?? undefined,
      p_reference: input.reference ?? undefined,
      p_item_type: input.item?.type,
      p_item_slug: input.item?.slug,
    });
    if (error) console.error("[visitors] identify failed:", error.message);
  } catch (error) {
    console.error("[visitors] identify failed:", (error as Error).message);
  }
}
