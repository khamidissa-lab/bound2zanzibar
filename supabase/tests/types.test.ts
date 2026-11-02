import { readFileSync } from "node:fs";

import { expect, it } from "vitest";

import { DATABASE_TYPES_PATH, renderDatabaseTypes } from "../../scripts/db-types";
import { createTestDatabase } from "./db-harness";

it("database.types.ts matches the migrations (run `npm run db:types` if this fails)", async () => {
  const db = await createTestDatabase();
  const expected = await renderDatabaseTypes(db);
  await db.close();
  const actual = readFileSync(DATABASE_TYPES_PATH, "utf8").replace(/\r\n/g, "\n");
  expect(actual).toBe(expected);
}, 60_000);
