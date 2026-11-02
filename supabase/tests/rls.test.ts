import type { PGlite, Transaction } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";

import { anon, as, createTestDatabase, setup, superuser, user } from "./db-harness";

const ids = {
  superAdmin: "00000000-0000-4000-8000-000000000001",
  admin: "00000000-0000-4000-8000-000000000002",
  editor: "00000000-0000-4000-8000-000000000003",
  bookingStaff: "00000000-0000-4000-8000-000000000004",
  noProfile: "00000000-0000-4000-8000-000000000005",
  inactiveAdmin: "00000000-0000-4000-8000-000000000006",
};

const PERMISSION_DENIED = /permission denied/;
const RLS_VIOLATION = /row-level security/;

const tomorrow = () => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 7);
  return d.toISOString().slice(0, 10);
};

type BookingArgs = Partial<{
  itemType: string;
  slug: string;
  name: string;
  email: string;
  phone: string;
  market: string;
  currency: string;
  date: string;
  adults: number;
  children: number;
}>;

function submitBooking(tx: Transaction, args: BookingArgs = {}) {
  return tx.query<{ reference: string; status: string }>(
    `select * from public.submit_booking_request(
       p_item_type => $1::public.booking_item_type, p_item_slug => $2,
       p_customer_name => $3, p_email => $4, p_phone => $5,
       p_market => $6::public.market, p_currency => $7,
       p_preferred_date => $8::date, p_adults => $9, p_children => $10)`,
    [
      args.itemType ?? "tour",
      args.slug ?? "stone-town-city-tour",
      args.name ?? "Test Traveller",
      args.email ?? "traveller@example.com",
      args.phone ?? "+255 700 000 000",
      args.market ?? "resident",
      args.currency ?? "TZS",
      args.date ?? tomorrow(),
      args.adults ?? 2,
      args.children ?? 1,
    ],
  );
}

const count = async (tx: Transaction, sql: string) =>
  Number(
    (await tx.query<{ n: number }>(`select count(*)::int as n from (${sql}) s`)).rows[0]
      .n,
  );

let db: PGlite;

beforeAll(async () => {
  db = await createTestDatabase();
  await setup(
    db,
    `
    insert into auth.users (id) values
      ('${ids.superAdmin}'), ('${ids.admin}'), ('${ids.editor}'),
      ('${ids.bookingStaff}'), ('${ids.noProfile}'), ('${ids.inactiveAdmin}');
    insert into public.profiles (id, full_name, role, is_active) values
      ('${ids.superAdmin}', 'Super Admin', 'super_admin', true),
      ('${ids.admin}', 'Admin', 'admin', true),
      ('${ids.editor}', 'Editor', 'content_editor', true),
      ('${ids.bookingStaff}', 'Bookings', 'booking_staff', true),
      ('${ids.inactiveAdmin}', 'Former Admin', 'admin', false);

    -- A draft tour with a price, a private setting and an unapproved review.
    insert into public.tours (name, slug, status) values ('Draft Tour', 'draft-tour', 'draft');
    insert into public.tour_prices (tour_id, market, customer_type, currency, amount)
      values ((select id from public.tours where slug = 'draft-tour'), 'international', 'adult', 'USD', 10);
    insert into public.site_settings (key, value, is_public) values ('internal.secret', '"x"', false);
    insert into public.testimonials (customer_display_name, content, rating, is_approved)
      values ('Pending', 'Awaiting moderation', 5, false);

    -- One existing booking request with staff-only notes.
    insert into public.bookings (item_type, tour_id, customer_name, email, phone, market,
      preferred_date, adults, currency, internal_notes)
    values ('tour', (select id from public.tours where slug = 'prison-island-tour'),
      'Existing Guest', 'guest@example.com', '+255 711 111 111', 'international',
      current_date + 30, 2, 'USD', 'VIP — staff only');
    `,
  );
}, 60_000);

describe("schema", () => {
  it("enables RLS on every table in the public schema", async () => {
    const { rows } = await db.query<{ relname: string }>(`
      select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity`);
    expect(rows.map((r) => r.relname)).toEqual([]);
  });

  it("loads the development seed with sample flags and illustrative prices", async () => {
    await as(db, superuser, async (tx) => {
      expect(await count(tx, "select 1 from public.tours where is_sample")).toBe(25);
      expect(await count(tx, "select 1 from public.packages where is_sample")).toBe(4);
      expect(
        await count(tx, "select 1 from public.tour_prices where not is_illustrative"),
      ).toBe(0);
    });
  });
});

describe("visitors (anon)", () => {
  it("see only published content", async () => {
    await as(db, anon, async (tx) => {
      expect(await count(tx, "select 1 from public.tours")).toBe(25);
      expect(
        await count(tx, "select 1 from public.tours where slug = 'draft-tour'"),
      ).toBe(0);
      expect(await count(tx, "select 1 from public.packages")).toBe(4);
      expect(await count(tx, "select 1 from public.blog_posts")).toBe(3);
    });
  });

  it("see prices only for published items", async () => {
    await as(db, anon, async (tx) => {
      expect(
        await count(
          tx,
          "select 1 from public.tour_prices p join public.tours t on t.id = p.tour_id where t.slug = 'draft-tour'",
        ),
      ).toBe(0);
      expect(await count(tx, "select 1 from public.tour_prices")).toBeGreaterThan(0);
    });
  });

  it("cannot read bookings, enquiries, profiles or status history", async () => {
    for (const table of ["bookings", "inquiries", "profiles", "booking_status_events"]) {
      await expect(
        as(db, anon, (tx) => tx.query(`select * from public.${table}`)),
      ).rejects.toThrow(PERMISSION_DENIED);
    }
  });

  it("cannot insert bookings directly", async () => {
    await expect(
      as(db, anon, (tx) =>
        tx.query(`insert into public.bookings (item_type, tour_id, customer_name, email, phone,
          market, preferred_date, adults, currency)
          values ('tour', null, 'X', 'x@example.com', '123456', 'resident', current_date, 1, 'TZS')`),
      ),
    ).rejects.toThrow(PERMISSION_DENIED);
  });

  it("cannot create or change content", async () => {
    await expect(
      as(db, anon, (tx) =>
        tx.query("insert into public.tours (name, slug) values ('Hack', 'hack')"),
      ),
    ).rejects.toThrow(RLS_VIOLATION);

    const updated = await as(db, anon, async (tx) => {
      await tx.query(
        "update public.tours set name = 'Hacked' where slug = 'stone-town-city-tour'",
      );
      return tx.query<{ name: string }>(
        "select name from public.tours where slug = 'stone-town-city-tour'",
      );
    });
    expect(updated.rows[0].name).toBe("Stone Town City Tour");

    await expect(
      as(db, anon, (tx) =>
        tx.query("update public.tour_prices set amount = 0 returning id"),
      ),
    ).resolves.toMatchObject({ rows: [] });
  });

  it("see public settings and approved reviews only", async () => {
    await as(db, anon, async (tx) => {
      expect(
        await count(
          tx,
          "select 1 from public.site_settings where key = 'internal.secret'",
        ),
      ).toBe(0);
      expect(
        await count(tx, "select 1 from public.site_settings where key = 'contact.email'"),
      ).toBe(1);
      expect(await count(tx, "select 1 from public.testimonials")).toBe(0);
    });
  });

  it("cannot upload media", async () => {
    await expect(
      as(db, anon, (tx) =>
        tx.query(
          "insert into storage.objects (bucket_id, name) values ('media', 'x.jpg')",
        ),
      ),
    ).rejects.toThrow(RLS_VIOLATION);
  });
});

describe("submit_booking_request", () => {
  it("creates a pending request and returns only a reference", async () => {
    await as(db, anon, async (tx) => {
      const { rows } = await submitBooking(tx, { email: "new.guest@example.com" });
      expect(rows).toHaveLength(1);
      expect(Object.keys(rows[0]).sort()).toEqual(["reference", "status"]);
      expect(rows[0].reference).toMatch(/^BTZ-\d{4}-[0-9A-F]{8}$/);
      expect(rows[0].status).toBe("pending");
    });
  });

  it("snapshots a quote from the configured market prices", async () => {
    await as(db, superuser, async (tx) => {
      await tx.exec("set local role anon");
      await tx.query(
        "select set_config('request.jwt.claims', '{\"role\":\"anon\"}', true)",
      );
      const { rows } = await submitBooking(tx, {
        email: "quote@example.com",
        adults: 2,
        children: 1,
      });
      await tx.exec("reset role");
      const booking = await tx.query<{ quoted_total: string; currency: string }>(
        "select quoted_total, currency from public.bookings where reference = $1",
        [rows[0].reference],
      );
      // Sample resident prices for Stone Town: 50,000 adult, 30,000 child.
      expect(Number(booking.rows[0].quoted_total)).toBe(130000);
      expect(booking.rows[0].currency).toBe("TZS");
      const events = await tx.query(
        "select 1 from public.booking_status_events e join public.bookings b on b.id = e.booking_id where b.reference = $1 and e.to_status = 'pending'",
        [rows[0].reference],
      );
      expect(events.rows).toHaveLength(1);
    });
  });

  it.each([
    [{ adults: 0 }, "booking_invalid_party_size"],
    [{ children: -1 }, "booking_invalid_party_size"],
    [{ date: "2020-01-01" }, "booking_invalid_date"],
    [{ email: "not-an-email" }, "booking_invalid_email"],
    [{ phone: "abc" }, "booking_invalid_phone"],
    [{ name: "A" }, "booking_invalid_name"],
    [{ currency: "EUR" }, "booking_invalid_currency"],
    [{ slug: "draft-tour" }, "booking_item_unavailable"],
    [{ slug: "does-not-exist" }, "booking_item_unavailable"],
  ] as [BookingArgs, string][])("rejects invalid input %o", async (args, message) => {
    await expect(as(db, anon, (tx) => submitBooking(tx, args))).rejects.toThrow(message);
  });

  it("rate-limits repeated requests from the same email", async () => {
    await expect(
      as(db, anon, async (tx) => {
        for (let i = 0; i < 6; i++)
          await submitBooking(tx, { email: "spam@example.com" });
      }),
    ).rejects.toThrow("booking_rate_limited");
  });
});

describe("staff roles", () => {
  it("content editors edit content but not prices or bookings", async () => {
    await as(db, user(ids.editor), async (tx) => {
      const updated = await tx.query(
        "update public.tours set name = 'Edited' where slug = 'stone-town-city-tour' returning id",
      );
      expect(updated.rows).toHaveLength(1);
      expect(
        await count(tx, "select 1 from public.tours where slug = 'draft-tour'"),
      ).toBe(1);

      const prices = await tx.query(
        "update public.tour_prices set amount = 1 returning id",
      );
      expect(prices.rows).toHaveLength(0);
      expect(await count(tx, "select 1 from public.bookings")).toBe(0);
    });
  });

  it("booking staff manage bookings but not content", async () => {
    await as(db, user(ids.bookingStaff), async (tx) => {
      const { rows } = await tx.query<{ internal_notes: string }>(
        "select internal_notes from public.bookings where email = 'guest@example.com'",
      );
      expect(rows[0].internal_notes).toBe("VIP — staff only");

      await tx.query(
        "update public.bookings set status = 'confirmed', reference = 'TAMPERED' where email = 'guest@example.com'",
      );
      const after = await tx.query<{ status: string; reference: string }>(
        "select status, reference from public.bookings where email = 'guest@example.com'",
      );
      expect(after.rows[0].status).toBe("confirmed");
      expect(after.rows[0].reference).not.toBe("TAMPERED");

      const events = await tx.query<{ changed_by: string }>(
        "select changed_by from public.booking_status_events where to_status = 'confirmed'",
      );
      expect(events.rows[0].changed_by).toBe(ids.bookingStaff);

      const tours = await tx.query("update public.tours set name = 'X' returning id");
      expect(tours.rows).toHaveLength(0);
      const deleted = await tx.query("delete from public.bookings returning id");
      expect(deleted.rows).toHaveLength(0);
    });
  });

  it("admins manage prices but cannot manage staff profiles", async () => {
    await as(db, user(ids.admin), async (tx) => {
      const prices = await tx.query(
        "update public.tour_prices set amount = amount + 1 where currency = 'USD' returning id",
      );
      expect(prices.rows.length).toBeGreaterThan(0);
    });
    await expect(
      as(db, user(ids.admin), (tx) =>
        tx.query(
          `insert into public.profiles (id, full_name, role) values ('${ids.noProfile}', 'Me', 'super_admin')`,
        ),
      ),
    ).rejects.toThrow(RLS_VIOLATION);
    await as(db, user(ids.admin), async (tx) => {
      const promoted = await tx.query(
        `update public.profiles set role = 'super_admin' where id = '${ids.admin}' returning id`,
      );
      expect(promoted.rows).toHaveLength(0);
    });
  });

  it("super admins manage profiles but cannot remove the last super admin", async () => {
    await as(db, user(ids.superAdmin), async (tx) => {
      const created = await tx.query(
        `insert into public.profiles (id, full_name, role) values ('${ids.noProfile}', 'New Editor', 'content_editor') returning id`,
      );
      expect(created.rows).toHaveLength(1);
    });
    await expect(
      as(db, user(ids.superAdmin), (tx) =>
        tx.query(
          `update public.profiles set role = 'admin' where id = '${ids.superAdmin}'`,
        ),
      ),
    ).rejects.toThrow("cannot_remove_last_super_admin");
  });

  it("signed-in users without a staff profile are treated as visitors", async () => {
    await as(db, user(ids.noProfile), async (tx) => {
      expect(await count(tx, "select 1 from public.bookings")).toBe(0);
      expect(
        await count(tx, "select 1 from public.tours where slug = 'draft-tour'"),
      ).toBe(0);
      const updated = await tx.query("update public.tours set name = 'X' returning id");
      expect(updated.rows).toHaveLength(0);
    });
  });

  it("deactivated staff lose all staff access", async () => {
    await as(db, user(ids.inactiveAdmin), async (tx) => {
      expect(await count(tx, "select 1 from public.bookings")).toBe(0);
      const prices = await tx.query(
        "update public.tour_prices set amount = 1 returning id",
      );
      expect(prices.rows).toHaveLength(0);
    });
  });

  it("only content managers can upload media", async () => {
    await as(db, user(ids.editor), async (tx) => {
      const { rows } = await tx.query(
        "insert into storage.objects (bucket_id, name) values ('media', 'tours/a.jpg') returning id",
      );
      expect(rows).toHaveLength(1);
    });
    await expect(
      as(db, user(ids.bookingStaff), (tx) =>
        tx.query(
          "insert into storage.objects (bucket_id, name) values ('media', 'tours/b.jpg')",
        ),
      ),
    ).rejects.toThrow(RLS_VIOLATION);
  });
});
