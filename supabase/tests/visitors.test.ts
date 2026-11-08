import type { PGlite, Transaction } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";

import {
  anon,
  as,
  createTestDatabase,
  service,
  setup,
  superuser,
  user,
} from "./db-harness";

const admin = "00000000-0000-4000-a000-000000000041";
const bookingStaff = "00000000-0000-4000-a000-000000000042";
const editor = "00000000-0000-4000-a000-000000000043";
const V1 = "11111111-1111-4111-8111-111111111111";
const RETURNING = "22222222-2222-4222-8222-222222222222";

let db: PGlite;

beforeAll(async () => {
  db = await createTestDatabase();
  await setup(
    db,
    `insert into auth.users (id) values ('${admin}'), ('${bookingStaff}'), ('${editor}');
     insert into public.profiles (id, full_name, role) values
       ('${admin}', 'Admin', 'admin'),
       ('${bookingStaff}', 'Bookings', 'booking_staff'),
       ('${editor}', 'Editor', 'content_editor');
     -- A visitor who was here yesterday.
     insert into public.visitors (id, first_seen_at, last_seen_at, visit_count, page_views)
     values ('${RETURNING}', now() - interval '1 day', now() - interval '1 day', 1, 3);
     insert into public.visitor_sessions (visitor_id, started_at, last_seen_at, landing_path, current_path)
     values ('${RETURNING}', now() - interval '1 day', now() - interval '1 day', '/', '/tours');`,
  );
}, 60_000);

type Track = {
  type?: string;
  path?: string;
  itemType?: string | null;
  itemSlug?: string | null;
  visible?: boolean;
};
const track = (tx: Transaction, visitor: string, t: Track = {}) =>
  tx.query<{ session: string | null }>(
    `select public.track_visitor_event(
       p_visitor_id => $1::uuid, p_type => $2, p_path => $3, p_title => 'Page',
       p_item_type => $4, p_item_slug => $5, p_country => 'de', p_device => 'mobile',
       p_browser => 'Safari', p_os => 'iOS', p_locale => 'en',
       p_referrer_host => 'www.google.com', p_visible => $6) as session`,
    [
      visitor,
      t.type ?? "page_view",
      t.path ?? "/",
      t.itemType ?? null,
      t.itemSlug ?? null,
      t.visible ?? true,
    ],
  );
const view = (tx: Transaction, visitor: string, slug: string, path = `/tours/${slug}`) =>
  track(tx, visitor, { path, itemType: "tour", itemSlug: slug });
const visitor = async (tx: Transaction, id: string) =>
  (
    await tx.query<{
      visit_count: number;
      page_views: number;
      country: string;
      device: string;
      email: string | null;
      name: string | null;
      lead_status: string | null;
      lead_score: number;
    }>("select * from public.visitors where id = $1", [id])
  ).rows[0];

describe("tracking a new visitor", () => {
  it("creates the visitor and a session, and follows them between pages", async () => {
    await as(db, service, async (tx) => {
      const first = await track(tx, V1, { path: "/" });
      await view(tx, V1, "stone-town-city-tour");
      const third = await view(tx, V1, "spice-farm-tour");
      expect(third.rows[0].session).toBe(first.rows[0].session);

      const v = await visitor(tx, V1);
      expect(v).toMatchObject({
        visit_count: 1,
        page_views: 3,
        country: "DE",
        device: "mobile",
      });

      const { rows } = await tx.query<{ landing_path: string; current_path: string }>(
        "select landing_path, current_path from public.visitor_sessions where visitor_id = $1",
        [V1],
      );
      expect(rows).toEqual([
        { landing_path: "/", current_path: "/tours/spice-farm-tour" },
      ]);
    });
  });

  it("counts a page reported twice in quick succession once", async () => {
    await as(db, service, async (tx) => {
      await track(tx, V1, { path: "/about" });
      await track(tx, V1, { path: "/about" });
      expect((await visitor(tx, V1)).page_views).toBe(1);
    });
  });

  it("marks the session hidden on heartbeat and ended on leave", async () => {
    await as(db, service, async (tx) => {
      await track(tx, V1, { path: "/" });
      await track(tx, V1, { type: "heartbeat", visible: false });
      let s = await tx.query<{ visible: boolean; ended_at: string | null }>(
        "select visible, ended_at from public.visitor_sessions where visitor_id = $1",
        [V1],
      );
      expect(s.rows[0]).toMatchObject({ visible: false, ended_at: null });
      await track(tx, V1, { type: "leave" });
      s = await tx.query(
        "select visible, ended_at from public.visitor_sessions where visitor_id = $1",
        [V1],
      );
      expect(s.rows[0].ended_at).not.toBeNull();
    });
  });

  it("rejects unknown event types", async () => {
    await as(db, service, async (tx) => {
      await expect(track(tx, V1, { type: "drop_table" })).rejects.toThrow(
        /visitor_invalid_event/,
      );
    });
  });
});

describe("returning visitors", () => {
  it("starts a new visit for someone seen yesterday", async () => {
    await as(db, service, async (tx) => {
      await track(tx, RETURNING, { path: "/safari" });
      const v = await visitor(tx, RETURNING);
      expect(v.visit_count).toBe(2);
      const { rows } = await tx.query(
        "select id from public.visitor_sessions where visitor_id = $1",
        [RETURNING],
      );
      expect(rows).toHaveLength(2);
    });
  });
});

describe("identification and leads", () => {
  it("links an email from a booking form to the visitor", async () => {
    await as(db, service, async (tx) => {
      await view(tx, V1, "stone-town-city-tour");
      const { rows } = await tx.query<{ ok: boolean }>(
        `select public.identify_visitor($1::uuid, 'booking', ' Amina@Example.com ',
           'Amina Hassan', '+255 700 000 000', 'BTZ-2611-AAAAAAAA', 'tour',
           'stone-town-city-tour') as ok`,
        [V1],
      );
      expect(rows[0].ok).toBe(true);
      const v = await visitor(tx, V1);
      expect(v).toMatchObject({
        email: "amina@example.com",
        name: "Amina Hassan",
        lead_status: "follow_up",
      });
      const ids = await tx.query(
        "select kind, value from public.visitor_identities where visitor_id = $1 order by kind",
        [V1],
      );
      expect(ids.rows).toEqual([
        { kind: "email", value: "amina@example.com" },
        { kind: "phone", value: "+255 700 000 000" },
      ]);
    });
  });

  it("ignores identification for unknown visitors and rejects bad emails", async () => {
    await as(db, service, async (tx) => {
      const { rows } = await tx.query<{ ok: boolean }>(
        `select public.identify_visitor('99999999-9999-4999-8999-999999999999', 'enquiry', 'a@b.co') as ok`,
      );
      expect(rows[0].ok).toBe(false);
      await track(tx, V1, { path: "/" });
      await expect(
        tx.query(`select public.identify_visitor($1::uuid, 'enquiry', 'not-an-email')`, [
          V1,
        ]),
      ).rejects.toThrow(/visitor_invalid_email/);
    });
  });

  it("classifies repeat interest, started bookings and confirmed bookings", async () => {
    await as(db, service, async (tx) => {
      await view(tx, V1, "stone-town-city-tour", "/tours/stone-town-city-tour");
      await view(tx, V1, "stone-town-city-tour", "/fr/tours/stone-town-city-tour");
      expect((await visitor(tx, V1)).lead_status).toBe("interested");

      await view(tx, V1, "stone-town-city-tour", "/de/tours/stone-town-city-tour");
      expect((await visitor(tx, V1)).lead_status).toBe("high_potential");

      await track(tx, V1, {
        type: "booking_started",
        path: "/book",
        itemType: "tour",
        itemSlug: "stone-town-city-tour",
      });
      expect((await visitor(tx, V1)).lead_status).toBe("booking_started");
    });
  });

  it("upgrades the lead when the matching booking is confirmed", async () => {
    // Superuser stands in for both the website server and booking staff here.
    await as(db, superuser, async (tx) => {
      await track(tx, V1, { path: "/" });
      await tx.query(
        `select public.identify_visitor($1::uuid, 'booking', 'juma@example.com', 'Juma')`,
        [V1],
      );
      await tx.query(
        `insert into public.bookings (item_type, tour_id, customer_name, email, phone, market,
           preferred_date, adults, currency)
         values ('tour', (select id from public.tours where slug = 'stone-town-city-tour'),
           'Juma', 'Juma@example.com', '+255 700 000 001', 'resident', current_date + 5, 2, 'TZS')`,
      );
      await tx.query(
        `update public.bookings set status = 'confirmed' where email = 'Juma@example.com'`,
      );
      const v = await visitor(tx, V1);
      expect(v).toMatchObject({ lead_status: "booking_completed", lead_score: 100 });
    });
  });

  it("stops automatic classification once staff set a status by hand", async () => {
    await as(db, service, async (tx) => {
      await view(tx, V1, "spice-farm-tour");
      await tx.query(
        `update public.visitors set lead_status = 'follow_up', lead_status_manual = true where id = $1`,
        [V1],
      );
      await view(tx, V1, "jozani-forest-tour");
      await view(tx, V1, "prison-island-tour");
      expect((await visitor(tx, V1)).lead_status).toBe("follow_up");
    });
  });
});

describe("consent", () => {
  it("counts visitors without consent anonymously only", async () => {
    await as(db, service, async (tx) => {
      await tx.query(`select public.record_anonymous_view('/tours', 'tz', 'mobile')`);
      await tx.query(`select public.record_anonymous_view('/tours', 'TZ', 'mobile')`);
      const { rows } = await tx.query<{ views: number; country: string }>(
        "select views, country from public.page_view_counts",
      );
      expect(rows).toEqual([{ views: 2, country: "TZ" }]);
    });
  });

  it("erases the visitor's profile when consent is withdrawn", async () => {
    await as(db, service, async (tx) => {
      await track(tx, V1, { path: "/" });
      await tx.query(`select public.record_consent($1::uuid, 'withdrawn', '2026-11')`, [
        V1,
      ]);
      expect(await visitor(tx, V1)).toBeUndefined();
      const { rows } = await tx.query("select choice from public.consent_records");
      expect(rows).toEqual([{ choice: "withdrawn" }]);
    });
  });
});

describe("access", () => {
  it("never lets the public read or write visitor data", async () => {
    const attempts: ((tx: Transaction) => Promise<unknown>)[] = [
      (tx) => tx.query("select * from public.visitors"),
      (tx) => track(tx, V1),
      (tx) =>
        tx.query(`select public.identify_visitor($1::uuid, 'booking', 'x@y.co')`, [V1]),
      (tx) => tx.query(`select public.record_consent(null, 'accepted', 'v1')`),
    ];
    for (const attempt of attempts) {
      await as(db, anon, async (tx) => {
        await expect(attempt(tx)).rejects.toThrow(/permission denied/);
      });
    }
  });

  it("lets booking staff and admins read visitors, but not content editors", async () => {
    for (const [id, expected] of [
      [admin, 1],
      [bookingStaff, 1],
      [editor, 0],
    ] as const) {
      await as(db, user(id), async (tx) => {
        const { rows } = await tx.query("select id from public.visitors where id = $1", [
          RETURNING,
        ]);
        expect(rows).toHaveLength(expected);
      });
    }
  });

  it("lets staff change lead fields only", async () => {
    await as(db, user(bookingStaff), async (tx) => {
      await tx.query(
        `update public.visitors set lead_status = 'interested', lead_status_manual = true where id = $1`,
        [RETURNING],
      );
      await tx.query(
        `insert into public.lead_notes (visitor_id, kind, body) values ($1, 'call', 'Called, will book in March.')`,
        [RETURNING],
      );
      const { rows } = await tx.query<{ author_id: string }>(
        "select author_id from public.lead_notes",
      );
      expect(rows[0].author_id).toBe(bookingStaff);
    });
    await as(db, user(bookingStaff), async (tx) => {
      await expect(
        tx.query(`update public.visitors set email = 'x@y.co' where id = $1`, [
          RETURNING,
        ]),
      ).rejects.toThrow(/permission denied/);
    });
  });

  it("gives staff analytics, and refuses everyone else", async () => {
    await as(db, service, async (tx) => {
      await view(tx, V1, "stone-town-city-tour");
    });
    await as(db, user(admin), async (tx) => {
      const { rows } = await tx.query<{ a: Record<string, unknown> }>(
        `select public.visitor_analytics(now() - interval '2 days', now() + interval '1 minute') as a`,
      );
      expect(rows[0].a).toMatchObject({ unique_visitors: 1, returning_visitors: 0 });
    });
    await as(db, user(editor), async (tx) => {
      await expect(
        tx.query(`select public.visitor_analytics(now() - interval '1 day', now())`),
      ).rejects.toThrow(/not_allowed/);
    });
  });
});

describe("newsletter", () => {
  it("lets anyone subscribe once per email", async () => {
    await as(db, anon, async (tx) => {
      await tx.query(`select public.subscribe_newsletter(' Sam@Example.com ', 'fr')`);
      await tx.query(`select public.subscribe_newsletter('sam@example.com', 'de')`);
      await expect(
        tx.query(`select public.subscribe_newsletter('nope')`),
      ).rejects.toThrow(/newsletter_invalid_email/);
    });
  });
});

describe("retention", () => {
  it("purges old anonymous activity but keeps identified visitors", async () => {
    await as(db, service, async (tx) => {
      await tx.query(
        `update public.visitors set last_seen_at = now() - interval '14 months' where id = $1`,
        [RETURNING],
      );
      await tx.query(
        `update public.visitor_sessions set last_seen_at = now() - interval '14 months' where visitor_id = $1`,
        [RETURNING],
      );
      const { rows } = await tx.query<{ r: { visitors: number; sessions: number } }>(
        "select public.purge_visitor_data() as r",
      );
      expect(rows[0].r).toMatchObject({ visitors: 1, sessions: 1 });
    });
  });
});
