import "server-only";

import type { ActivityEntry } from "@/lib/activity/format";

/*
 * DEVELOPMENT PREVIEW ONLY. Deterministic EXAMPLE activity (staff names are
 * obviously fake) so the activity log can be reviewed before a database is
 * connected. Never used on the live site.
 */

const OWNER = "00000000-0000-4000-8000-0000000000a1";
const EDITOR = "00000000-0000-4000-8000-0000000000a2";
const BOOKINGS = "00000000-0000-4000-8000-0000000000a3";

export const PREVIEW_ACTORS = [
  { id: OWNER, name: "Example Owner" },
  { id: EDITOR, name: "Example Editor" },
  { id: BOOKINGS, name: "Example Booking Staff" },
];

const ROLES: Record<string, [string, string]> = {
  [OWNER]: ["Example Owner", "super_admin"],
  [EDITOR]: ["Example Editor", "content_editor"],
  [BOOKINGS]: ["Example Booking Staff", "booking_staff"],
};

type Seed = Omit<ActivityEntry, "id" | "occurred_at" | "actor_name" | "actor_role"> & {
  minutesAgo: number;
};

const price = (
  market: string,
  customer_type: string,
  currency: string,
  amount: number,
) => ({
  market,
  customer_type,
  currency,
  amount,
  is_active: true,
});

const SEEDS: Seed[] = [
  {
    minutesAgo: 4,
    actor_id: OWNER,
    action: "updated",
    entity: "tour_prices",
    entity_id: "preview-tour",
    entity_label: "Parasailing Experience",
    changed_fields: ["prices"],
    details: {
      before: [
        price("international", "adult", "USD", 70),
        price("resident", "adult", "TZS", 130000),
      ],
      after: [
        price("international", "adult", "USD", 75),
        price("resident", "adult", "TZS", 130000),
        price("international", "child", "USD", 50),
      ],
    },
  },
  {
    minutesAgo: 18,
    actor_id: EDITOR,
    action: "updated",
    entity: "tours",
    entity_id: "preview-tour",
    entity_label: "Jet Ski Experience",
    changed_fields: ["short_description", "status"],
    details: { status: { from: "draft", to: "published" } },
  },
  {
    minutesAgo: 35,
    actor_id: BOOKINGS,
    action: "updated",
    entity: "bookings",
    entity_id: "preview-booking",
    entity_label: "BTZ-2611-EXAMPLE1",
    changed_fields: ["internal_notes", "status"],
    details: { status: { from: "pending", to: "confirmed" } },
  },
  {
    minutesAgo: 52,
    actor_id: OWNER,
    action: "bookings_exported",
    entity: "bookings",
    entity_id: OWNER,
    entity_label: null,
    changed_fields: [],
    details: { rows: 12, status: "confirmed" },
  },
  {
    minutesAgo: 70,
    actor_id: BOOKINGS,
    action: "signed_in",
    entity: "account",
    entity_id: BOOKINGS,
    entity_label: null,
    changed_fields: [],
    details: null,
  },
  {
    minutesAgo: 95,
    actor_id: EDITOR,
    action: "created",
    entity: "blog_posts",
    entity_id: "preview-article",
    entity_label: "Example: What to pack for Zanzibar",
    changed_fields: [],
    details: null,
  },
  {
    minutesAgo: 130,
    actor_id: OWNER,
    action: "updated",
    entity: "profiles",
    entity_id: EDITOR,
    entity_label: "Example Editor",
    changed_fields: ["role"],
    details: { role: { from: "booking_staff", to: "content_editor" } },
  },
  {
    minutesAgo: 180,
    actor_id: OWNER,
    action: "deleted",
    entity: "packages",
    entity_id: "preview-package",
    entity_label: "Example Old Package",
    changed_fields: [],
    details: null,
  },
  {
    minutesAgo: 240,
    actor_id: EDITOR,
    action: "updated",
    entity: "inquiries",
    entity_id: "preview-enquiry",
    entity_label: "Example: Group trip question",
    changed_fields: ["status"],
    details: { status: { from: "new", to: "in_progress" } },
  },
  {
    minutesAgo: 300,
    actor_id: OWNER,
    action: "updated",
    entity: "package_prices",
    entity_id: "preview-package",
    entity_label: "Zanzibar Highlights",
    changed_fields: ["prices"],
    details: {
      before: [price("east_african", "adult", "TZS", 900000)],
      after: [],
    },
  },
  {
    minutesAgo: 360,
    actor_id: OWNER,
    action: "password_changed",
    entity: "account",
    entity_id: OWNER,
    entity_label: null,
    changed_fields: [],
    details: null,
  },
  {
    minutesAgo: 420,
    actor_id: OWNER,
    action: "signed_in",
    entity: "account",
    entity_id: OWNER,
    entity_label: null,
    changed_fields: [],
    details: null,
  },
];

export function previewActivity(now: Date): ActivityEntry[] {
  return SEEDS.map(({ minutesAgo, ...entry }, i) => ({
    ...entry,
    // Example rows have no real admin page to link to.
    entity_id: null,
    id: SEEDS.length - i,
    occurred_at: new Date(now.getTime() - minutesAgo * 60_000).toISOString(),
    actor_name: entry.actor_id ? ROLES[entry.actor_id][0] : null,
    actor_role: entry.actor_id ? ROLES[entry.actor_id][1] : null,
  }));
}
