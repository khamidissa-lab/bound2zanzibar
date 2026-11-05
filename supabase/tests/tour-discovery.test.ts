import type { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";

import { createTestDatabase } from "./db-harness";

let db: PGlite;

beforeAll(async () => {
  db = await createTestDatabase();
}, 60_000);

const update = (sql: string) => db.exec(sql);

describe("tour length and travel styles", () => {
  it("accepts known styles on tours and packages", async () => {
    await update(
      `update public.tours set length = 'full_day', travel_styles = '{family,wildlife}' where slug = 'jozani-forest-tour';
       update public.packages set travel_styles = '{luxury}' where slug = 'zanzibar-highlights-4-days';`,
    );
    const { rows } = await db.query<{ length: string; travel_styles: string[] }>(
      "select length, travel_styles from public.tours where slug = 'jozani-forest-tour'",
    );
    expect(rows[0]).toEqual({
      length: "full_day",
      travel_styles: ["family", "wildlife"],
    });
  });

  it("rejects unknown or repeated styles", async () => {
    await expect(
      update(
        `update public.tours set travel_styles = '{spa}' where slug = 'jozani-forest-tour'`,
      ),
    ).rejects.toThrow(/tours_travel_styles_valid/);
    await expect(
      update(
        `update public.packages set travel_styles = '{family,family}' where slug = 'zanzibar-highlights-4-days'`,
      ),
    ).rejects.toThrow(/packages_travel_styles_valid/);
  });

  it("rejects an unknown length", async () => {
    await expect(
      update(
        `update public.tours set length = 'weekend' where slug = 'jozani-forest-tour'`,
      ),
    ).rejects.toThrow();
  });
});
