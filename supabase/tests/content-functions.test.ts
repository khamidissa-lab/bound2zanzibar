import type { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";

import { anon, as, createTestDatabase, setup, user } from "./db-harness";

const editor = "00000000-0000-4000-a000-000000000001";
const admin = "00000000-0000-4000-a000-000000000002";

const prices = JSON.stringify([
  {
    market: "international",
    customer_type: "adult",
    currency: "usd",
    amount: 99,
    unit_label: "",
    is_illustrative: false,
  },
  { market: "resident", customer_type: "adult", currency: "TZS", amount: 150000 },
]);

let db: PGlite;

beforeAll(async () => {
  db = await createTestDatabase();
  await setup(
    db,
    `insert into auth.users (id) values ('${editor}'), ('${admin}');
     insert into public.profiles (id, full_name, role) values
       ('${editor}', 'Editor', 'content_editor'), ('${admin}', 'Admin', 'admin');`,
  );
}, 60_000);

const tourId = (slug: string) => `(select id from public.tours where slug = '${slug}')`;
const pkgId = (slug: string) => `(select id from public.packages where slug = '${slug}')`;

describe("set_tour_prices", () => {
  it("lets admins replace a tour's prices atomically", async () => {
    await as(db, user(admin), async (tx) => {
      await tx.query(
        `select public.set_tour_prices(${tourId("stone-town-city-tour")}, $1::jsonb)`,
        [prices],
      );
      const { rows } = await tx.query<{
        market: string;
        currency: string;
        amount: string;
        unit_label: string;
        is_illustrative: boolean;
      }>(
        `select market, currency, amount, unit_label, is_illustrative from public.tour_prices
         where tour_id = ${tourId("stone-town-city-tour")} order by market::text`,
      );
      expect(rows).toHaveLength(2);
      expect(rows[1]).toMatchObject({
        market: "resident",
        currency: "TZS",
        unit_label: "per person",
        is_illustrative: true,
      });
      expect(rows[0]).toMatchObject({ currency: "USD", is_illustrative: false });
    });
  });

  it("rejects content editors and leaves existing prices untouched", async () => {
    await expect(
      as(db, user(editor), (tx) =>
        tx.query(
          `select public.set_tour_prices(${tourId("stone-town-city-tour")}, $1::jsonb)`,
          [prices],
        ),
      ),
    ).rejects.toThrow(/row-level security/);
    const { rows } = await db.query(
      `select 1 from public.tour_prices where tour_id = ${tourId("stone-town-city-tour")}`,
    );
    expect(rows.length).toBe(4); // seed: adult + child for two markets
  });

  it("is not callable by visitors", async () => {
    await expect(
      as(db, anon, (tx) =>
        tx.query(`select public.set_tour_prices(gen_random_uuid(), '[]'::jsonb)`),
      ),
    ).rejects.toThrow(/permission denied/);
  });
});

describe("set_package_details", () => {
  it("lets content editors replace itinerary, tours and destinations together", async () => {
    await as(db, user(editor), async (tx) => {
      await tx.query(
        `select public.set_package_details(
           ${pkgId("zanzibar-highlights-4-days")}, $1::jsonb,
           array[${tourId("prison-island-tour")}],
           array[(select id from public.destinations where slug = 'mnemba'),
                 (select id from public.destinations where slug = 'stone-town')])`,
        [
          JSON.stringify([
            { day_number: 1, title: "Arrive", meals: [], overnight: " " },
            {
              day_number: 2,
              title: "Explore",
              description: "Island day",
              meals: ["Breakfast"],
              overnight: "Stone Town",
            },
          ]),
        ],
      );
      const days = await tx.query<{ day_number: number; overnight: string | null }>(
        `select day_number, overnight from public.package_itinerary_days
         where package_id = ${pkgId("zanzibar-highlights-4-days")} order by day_number`,
      );
      expect(days.rows).toEqual([
        { day_number: 1, overnight: null },
        { day_number: 2, overnight: "Stone Town" },
      ]);
      const tours = await tx.query(
        `select 1 from public.package_tours where package_id = ${pkgId("zanzibar-highlights-4-days")}`,
      );
      expect(tours.rows).toHaveLength(1);
      const dests = await tx.query<{ slug: string }>(
        `select d.slug from public.package_destinations pd join public.destinations d on d.id = pd.destination_id
         where pd.package_id = ${pkgId("zanzibar-highlights-4-days")} order by pd.sort_order`,
      );
      expect(dests.rows.map((r) => r.slug)).toEqual(["mnemba", "stone-town"]);
    });
  });

  it("rolls back everything when one part is invalid", async () => {
    await expect(
      as(db, user(editor), (tx) =>
        tx.query(
          `select public.set_package_details(${pkgId("zanzibar-highlights-4-days")}, $1::jsonb, '{}', '{}')`,
          [
            JSON.stringify([
              { day_number: 1, title: "A" },
              { day_number: 1, title: "Duplicate" },
            ]),
          ],
        ),
      ),
    ).rejects.toThrow(/duplicate key/);
    const { rows } = await db.query(
      `select 1 from public.package_itinerary_days where package_id = ${pkgId("zanzibar-highlights-4-days")}`,
    );
    expect(rows).toHaveLength(4); // seed itinerary intact
  });
});

describe("set_tour_gallery", () => {
  it("stores images in the given order", async () => {
    await as(db, user(editor), async (tx) => {
      await tx.query(
        `select public.set_tour_gallery(${tourId("jozani-forest-tour")}, $1::jsonb)`,
        [
          JSON.stringify([
            { storage_path: "tours/b.jpg", alt_text: "Second" },
            { storage_path: "tours/a.jpg", alt_text: "First" },
          ]),
        ],
      );
      const { rows } = await tx.query<{ storage_path: string; sort_order: number }>(
        `select storage_path, sort_order from public.tour_images
         where tour_id = ${tourId("jozani-forest-tour")} order by sort_order`,
      );
      expect(rows).toEqual([
        { storage_path: "tours/b.jpg", sort_order: 0 },
        { storage_path: "tours/a.jpg", sort_order: 1 },
      ]);
    });
  });
});
