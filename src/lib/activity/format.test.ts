import { describe, expect, it } from "vitest";

import {
  activityChanges,
  activityHref,
  activityTitle,
  isActivityArea,
  type ActivityEntry,
} from "./format";

const entry = (overrides: Partial<ActivityEntry>): ActivityEntry => ({
  id: 1,
  occurred_at: "2026-11-03T10:00:00Z",
  actor_id: "u1",
  actor_name: "Amina",
  actor_role: "admin",
  action: "updated",
  entity: "tours",
  entity_id: "t1",
  entity_label: "Safari Blue",
  changed_fields: [],
  details: null,
  ...overrides,
});

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

describe("activityTitle", () => {
  it("describes content changes", () => {
    expect(activityTitle(entry({ action: "created" }))).toBe(
      'Created tour "Safari Blue"',
    );
    expect(activityTitle(entry({}))).toBe('Edited tour "Safari Blue"');
    expect(activityTitle(entry({ action: "deleted", entity: "blog_posts" }))).toBe(
      'Deleted guide article "Safari Blue"',
    );
    expect(
      activityTitle(entry({ entity: "package_prices", entity_label: "Highlights" })),
    ).toBe('Changed prices for package "Highlights"');
  });

  it("describes account events", () => {
    expect(activityTitle(entry({ action: "signed_in", entity: "account" }))).toBe(
      "Signed in",
    );
    expect(
      activityTitle(entry({ action: "bookings_exported", entity: "bookings" })),
    ).toBe("Exported bookings to CSV");
  });
});

describe("activityHref", () => {
  it("links to the item's admin page", () => {
    expect(activityHref(entry({}))).toBe("/admin/tours/t1");
    expect(activityHref(entry({ entity: "tour_prices" }))).toBe("/admin/tours/t1");
    expect(
      activityHref(entry({ entity: "bookings", entity_label: "BTZ-2611-ABCDEF12" })),
    ).toBe("/admin/bookings/BTZ-2611-ABCDEF12");
  });

  it("does not link deleted items or account events", () => {
    expect(activityHref(entry({ action: "deleted" }))).toBeNull();
    expect(activityHref(entry({ action: "signed_in", entity: "account" }))).toBeNull();
  });
});

describe("activityChanges", () => {
  it("shows before and after values, and names long fields only", () => {
    expect(
      activityChanges(
        entry({
          changed_fields: ["status", "description", "is_featured"],
          details: {
            status: { from: "draft", to: "published" },
            is_featured: { from: false, to: true },
          },
        }),
      ),
    ).toEqual(["status: draft → published", "featured: no → yes", "Changed description"]);
  });

  it("lists changed, added and removed prices", () => {
    const lines = activityChanges(
      entry({
        entity: "tour_prices",
        details: {
          before: [
            price("international", "adult", "USD", 60),
            price("resident", "adult", "TZS", 110000),
          ],
          after: [
            price("international", "adult", "USD", 70),
            price("international", "child", "USD", 40),
          ],
        },
      }),
    );
    expect(lines).toHaveLength(3);
    expect(lines[0]).toMatch(/^International · adult: USD\s60 → USD\s70$/);
    expect(lines[1]).toMatch(/^International · child: added at USD\s40$/);
    expect(lines[2]).toMatch(/^Tanzania resident · adult: removed \(was TZS\s110,000\)$/);
  });

  it("ignores malformed details instead of failing", () => {
    expect(
      activityChanges(entry({ entity: "tour_prices", details: { before: "x" } })),
    ).toEqual([]);
    expect(activityChanges(entry({ changed_fields: ["name"], details: "oops" }))).toEqual(
      ["Changed name"],
    );
  });

  it("summarises exports", () => {
    expect(
      activityChanges(
        entry({ action: "bookings_exported", details: { rows: 1, status: "confirmed" } }),
      ),
    ).toEqual(["1 booking", "status: confirmed"]);
  });
});

it("validates filter areas", () => {
  expect(isActivityArea("prices")).toBe(true);
  expect(isActivityArea("constructor")).toBe(false);
});
