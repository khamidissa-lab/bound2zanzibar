import type { PGlite, Transaction } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";

import { anon, as, createTestDatabase, setup, superuser, user } from "./db-harness";

const bookingStaff = "00000000-0000-4000-a000-000000000021";
const editor = "00000000-0000-4000-a000-000000000022";

let db: PGlite;

beforeAll(async () => {
  db = await createTestDatabase();
  await setup(
    db,
    `insert into auth.users (id) values ('${bookingStaff}'), ('${editor}');
     insert into public.profiles (id, full_name, role) values
       ('${bookingStaff}', 'Bookings', 'booking_staff'),
       ('${editor}', 'Editor', 'content_editor');`,
  );
}, 60_000);

type Args = {
  email?: string;
  destinations?: string[];
  start?: string | null;
  end?: string | null;
  budget?: number | null;
  currency?: string | null;
  interests?: string[];
};

function submit(tx: Transaction, a: Args = {}) {
  return tx.query<{ submit_journey_request: string }>(
    `select public.submit_journey_request(
       p_customer_name => 'Test Traveller', p_email => $1, p_adults => 2, p_children => 1,
       p_destinations => $2::text[], p_start_date => $3::date, p_end_date => $4::date,
       p_accommodation => 'mid_range', p_budget_amount => $5, p_budget_currency => $6,
       p_interests => $7::text[], p_special_requirements => 'Vegetarian meals')`,
    [
      a.email ?? "journey@example.com",
      a.destinations ?? ["stone-town", "serengeti-ngorongoro"],
      a.start === undefined ? "2099-01-01" : a.start,
      a.end === undefined ? null : a.end,
      a.budget ?? null,
      a.currency ?? null,
      a.interests ?? ["family", "safari"],
    ],
  );
}

// Dates relative to "today" in the database.
const inDays = async (tx: Transaction, days: number) =>
  (
    await tx.query<{ d: string }>(
      `select to_char((now() at time zone 'Africa/Dar_es_Salaam')::date + $1::int, 'YYYY-MM-DD') d`,
      [days],
    )
  ).rows[0].d;

describe("submit_journey_request", () => {
  it("saves a request from a visitor and returns only a reference", async () => {
    await as(db, anon, async (tx) => {
      const start = await inDays(tx, 60);
      const end = await inDays(tx, 70);
      const { rows } = await submit(tx, { start, end, budget: 2500, currency: "usd" });
      expect(rows[0].submit_journey_request).toMatch(/^JRN-\d{4}-[0-9A-F]{8}$/);
    });
  });

  it("never lets visitors read requests", async () => {
    await expect(
      as(db, anon, (tx) => tx.query("select * from public.journey_requests")),
    ).rejects.toThrow(/permission denied/);
  });

  it("rejects unknown destinations, bad dates, half a budget and odd interests", async () => {
    const cases: [Args, RegExp][] = [
      [{ destinations: ["atlantis"] }, /journey_invalid_destinations/],
      [{ start: "2020-01-01" }, /journey_invalid_dates/],
      [{ start: null, end: "2099-01-05" }, /journey_invalid_dates/],
      [{ budget: 1000, currency: null }, /journey_invalid_budget/],
      [{ interests: ["DROP TABLE"] }, /journey_invalid_interests/],
    ];
    for (const [args, error] of cases) {
      await expect(
        as(db, anon, async (tx) => {
          const start = args.start === undefined ? await inDays(tx, 30) : args.start;
          return submit(tx, { ...args, start });
        }),
      ).rejects.toThrow(error);
    }
  });

  it("rejects an end date before the start date", async () => {
    await expect(
      as(db, anon, async (tx) =>
        submit(tx, { start: await inDays(tx, 40), end: await inDays(tx, 35) }),
      ),
    ).rejects.toThrow(/journey_invalid_dates/);
  });
});

describe("managing journey requests", () => {
  it("lets booking staff read and update, but not content editors", async () => {
    await as(db, superuser, async (tx) => {
      await tx.exec("set local role anon");
      await tx.query(
        "select set_config('request.jwt.claims', '{\"role\":\"anon\"}', true)",
      );
      const ref = (await submit(tx, { start: await inDays(tx, 20) })).rows[0]
        .submit_journey_request;

      await tx.exec("reset role");
      await tx.query("select set_config('request.jwt.claims', $1, true)", [
        JSON.stringify({ sub: editor, role: "authenticated" }),
      ]);
      await tx.exec("set local role authenticated");
      const hidden = await tx.query(
        "select 1 from public.journey_requests where reference = $1",
        [ref],
      );
      expect(hidden.rows).toHaveLength(0);

      await tx.exec("reset role");
      await tx.query("select set_config('request.jwt.claims', $1, true)", [
        JSON.stringify({ sub: bookingStaff, role: "authenticated" }),
      ]);
      await tx.exec("set local role authenticated");
      const { rows } = await tx.query<{ destinations: string[]; interests: string[] }>(
        "update public.journey_requests set status = 'quoted' where reference = $1 returning destinations, interests",
        [ref],
      );
      expect(rows[0].destinations.sort()).toEqual(["serengeti-ngorongoro", "stone-town"]);
      expect(rows[0].interests.sort()).toEqual(["family", "safari"]);

      // The activity log records the status change but no personal details.
      await tx.exec("reset role");
      const log = await tx.query<{
        details: { status?: unknown; email?: unknown } | null;
      }>(
        "select details from public.activity_log where entity = 'journey_requests' order by occurred_at desc, id desc limit 1",
      );
      expect(log.rows[0].details?.status).toEqual({ from: "new", to: "quoted" });
    });
  });
});
