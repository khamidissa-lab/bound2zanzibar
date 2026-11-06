import type { PGlite, Transaction } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";

import { anon, as, createTestDatabase, setup, superuser, user } from "./db-harness";

const admin = "00000000-0000-4000-a000-000000000011";
const bookingStaff = "00000000-0000-4000-a000-000000000012";
const editor = "00000000-0000-4000-a000-000000000013";
const tour = (slug: string) => `(select id from public.tours where slug = '${slug}')`;

let db: PGlite;

beforeAll(async () => {
  db = await createTestDatabase();
  await setup(
    db,
    `insert into auth.users (id) values ('${admin}'), ('${bookingStaff}'), ('${editor}');
     insert into public.profiles (id, full_name, role) values
       ('${admin}', 'Admin', 'admin'),
       ('${bookingStaff}', 'Bookings', 'booking_staff'),
       ('${editor}', 'Editor', 'content_editor');`,
  );
  // Two options on Stone Town: a per-person lunch (priced for residents in
  // TZS) and a per-booking transfer with no resident price.
  await as(db, user(admin), (tx) =>
    tx.query(
      `select public.set_tour_options(${tour("stone-town-city-tour")}, $1::jsonb)`,
      [
        JSON.stringify([
          {
            name: "Lunch",
            pricing: "per_person",
            prices: [{ market: "resident", currency: "TZS", amount: 10000 }],
          },
          {
            name: "Private transfer",
            pricing: "per_booking",
            prices: [{ market: "international", currency: "USD", amount: 30 }],
          },
        ]),
      ],
    ),
  );
  // as() rolls back, so commit the same options as a fixture.
  await setup(
    db,
    `insert into public.tour_options (id, tour_id, name, pricing, sort_order) values
       ('00000000-0000-4000-b000-000000000001', ${tour("stone-town-city-tour")}, 'Lunch', 'per_person', 0),
       ('00000000-0000-4000-b000-000000000002', ${tour("stone-town-city-tour")}, 'Private transfer', 'per_booking', 1),
       ('00000000-0000-4000-b000-000000000003', ${tour("prison-island-tour")}, 'Other tour option', 'per_person', 0);
     insert into public.tour_option_prices (option_id, market, currency, amount) values
       ('00000000-0000-4000-b000-000000000001', 'resident', 'TZS', 10000),
       ('00000000-0000-4000-b000-000000000002', 'international', 'USD', 30);`,
  );
}, 60_000);

const LUNCH = "00000000-0000-4000-b000-000000000001";
const TRANSFER = "00000000-0000-4000-b000-000000000002";
const OTHER_TOUR = "00000000-0000-4000-b000-000000000003";

async function book(tx: Transaction, options: string[], email: string) {
  const { rows } = await tx.query<{ reference: string }>(
    `select * from public.submit_booking_request(
       p_item_type => 'tour', p_item_slug => 'stone-town-city-tour',
       p_customer_name => 'Test Traveller', p_email => $1, p_phone => '+255 700 000 000',
       p_market => 'resident', p_currency => 'TZS',
       p_preferred_date => (now() + interval '30 days')::date,
       p_adults => 2, p_children => 1, p_option_ids => $2::uuid[])`,
    [email, options],
  );
  return rows[0].reference;
}

async function bookingRow(tx: Transaction, reference: string) {
  await tx.exec("reset role");
  const { rows } = await tx.query<{ quoted_total: string | null; options: unknown[] }>(
    "select quoted_total, options from public.bookings where reference = $1",
    [reference],
  );
  return rows[0];
}

describe("set_tour_options", () => {
  it("is limited to price managers", async () => {
    await expect(
      as(db, user(editor), (tx) =>
        tx.query(
          `select public.set_tour_options(${tour("stone-town-city-tour")}, '[{"name":"x"}]')`,
        ),
      ),
    ).rejects.toThrow();
  });
});

describe("booking with options", () => {
  it("adds per-person option prices to the quote and stores a snapshot", async () => {
    await as(db, anon, async (tx) => {
      const ref = await book(tx, [LUNCH], "options1@example.com");
      const row = await bookingRow(tx, ref);
      // Resident Stone Town: 2 × 50,000 + 1 × 30,000 + lunch 10,000 × 3 people.
      expect(Number(row.quoted_total)).toBe(160000);
      expect(row.options).toEqual([
        { name: "Lunch", pricing: "per_person", amount: 10000, total: 30000 },
      ]);
    });
  });

  it("leaves the quote to staff when an option has no price for the market", async () => {
    await as(db, anon, async (tx) => {
      const ref = await book(tx, [LUNCH, TRANSFER], "options2@example.com");
      const row = await bookingRow(tx, ref);
      expect(row.quoted_total).toBeNull();
      expect(row.options).toHaveLength(2);
    });
  });

  it("rejects options that belong to another tour", async () => {
    await expect(
      as(db, anon, (tx) => book(tx, [OTHER_TOUR], "options3@example.com")),
    ).rejects.toThrow(/booking_invalid_options/);
  });
});

describe("paid status", () => {
  async function confirmedBooking(tx: Transaction) {
    await tx.exec("set local role anon");
    await tx.query(
      "select set_config('request.jwt.claims', '{\"role\":\"anon\"}', true)",
    );
    const ref = await book(tx, [], `paid${Math.random()}@example.com`);
    await tx.exec("reset role");
    await tx.query(
      "update public.bookings set status = 'confirmed' where reference = $1",
      [ref],
    );
    const { rows } = await tx.query<{ id: string }>(
      "select id from public.bookings where reference = $1",
      [ref],
    );
    return rows[0].id;
  }

  it("can't be set until recorded payments cover the quote", async () => {
    await as(db, superuser, async (tx) => {
      const id = await confirmedBooking(tx);
      // Quote is 130,000 TZS (2 adults, 1 child, no options).
      await expect(
        tx.query("update public.bookings set status = 'paid' where id = $1", [id]),
      ).rejects.toThrow(/booking_payment_required/);
    });
  });

  it("is allowed once payments in the booking's currency cover the quote", async () => {
    await as(db, superuser, async (tx) => {
      const id = await confirmedBooking(tx);
      await tx.query(
        `insert into public.booking_payments (booking_id, amount, currency, method, paid_on)
         values ($1, 100000, 'TZS', 'mobile_money', current_date),
                ($1, 500, 'USD', 'card', current_date)`,
        [id],
      );
      // USD doesn't count towards a TZS quote.
      await expect(
        tx.query("update public.bookings set status = 'paid' where id = $1", [id]),
      ).rejects.toThrow(/booking_payment_required/);
    });
    await as(db, superuser, async (tx) => {
      const id = await confirmedBooking(tx);
      await tx.query(
        `insert into public.booking_payments (booking_id, amount, currency, method, paid_on)
         values ($1, 130000, 'TZS', 'bank_transfer', current_date)`,
        [id],
      );
      await tx.query("update public.bookings set status = 'paid' where id = $1", [id]);
      const { rows } = await tx.query<{ status: string }>(
        "select status from public.bookings where id = $1",
        [id],
      );
      expect(rows[0].status).toBe("paid");
    });
  });

  it("lets booking staff record payments but not content editors or visitors", async () => {
    // A committed booking, so other actors can target it by id.
    const fixed = "00000000-0000-4000-c000-000000000001";
    await setup(
      db,
      `insert into public.bookings (id, item_type, tour_id, customer_name, email, phone,
         market, preferred_date, adults, currency, status)
       values ('${fixed}', 'tour', ${tour("stone-town-city-tour")}, 'Fixture', 'f@example.com',
         '+255 700 000 000', 'resident', current_date + 30, 1, 'TZS', 'confirmed')
       on conflict (id) do nothing;`,
    );
    for (const actor of [user(editor), anon]) {
      await expect(
        as(db, actor, (tx) =>
          tx.query(
            `insert into public.booking_payments (booking_id, amount, currency, method, paid_on)
             values ($1, 1, 'TZS', 'cash', current_date)`,
            [fixed],
          ),
        ),
      ).rejects.toThrow();
    }
    await as(db, superuser, async (tx) => {
      const bookingId = await confirmedBooking(tx);
      await tx.query("select set_config('request.jwt.claims', $1, true)", [
        JSON.stringify({ sub: bookingStaff, role: "authenticated" }),
      ]);
      await tx.exec("set local role authenticated");
      await tx.query(
        `insert into public.booking_payments (booking_id, amount, currency, method, paid_on)
         values ($1, 1000, 'TZS', 'cash', current_date)`,
        [bookingId],
      );
      const { rows } = await tx.query<{ recorded_by: string }>(
        "select recorded_by from public.booking_payments where booking_id = $1",
        [bookingId],
      );
      expect(rows[0].recorded_by).toBe(bookingStaff);
    });
  });
});
