import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { PGlite, type Transaction } from "@electric-sql/pglite";

const root = join(import.meta.dirname, "..");

/** Fresh in-process Postgres with Supabase stubs, all migrations and the dev seed. */
export async function createTestDatabase(): Promise<PGlite> {
  const db = new PGlite();
  await db.exec(readFileSync(join(root, "tests", "supabase-stubs.sql"), "utf8"));

  const migrationsDir = join(root, "migrations");
  const migrations = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of migrations) {
    try {
      await db.exec(readFileSync(join(migrationsDir, file), "utf8"));
    } catch (error) {
      throw new Error(`Migration ${file} failed: ${(error as Error).message}`);
    }
  }

  await db.exec(readFileSync(join(root, "seed.sql"), "utf8"));
  return db;
}

export type Actor =
  | { role: "anon" }
  | { role: "authenticated"; userId: string }
  | { role: "service_role" }
  | { role: "superuser" };

export const anon: Actor = { role: "anon" };
export const user = (userId: string): Actor => ({ role: "authenticated", userId });
export const superuser: Actor = { role: "superuser" };
/** The website server (service-role key): bypasses RLS, needs explicit grants. */
export const service: Actor = { role: "service_role" };

/**
 * Runs `fn` as the given actor inside a transaction that is always rolled
 * back, so tests never leak state into each other.
 */
export async function as<T>(
  db: PGlite,
  actor: Actor,
  fn: (tx: Transaction) => Promise<T>,
): Promise<T> {
  let result: T | undefined;
  const rollback = new Error("__rollback__");
  try {
    await db.transaction(async (tx) => {
      if (actor.role !== "superuser") {
        const claims =
          actor.role === "authenticated"
            ? { sub: actor.userId, role: "authenticated" }
            : { role: actor.role };
        await tx.query("select set_config('request.jwt.claims', $1, true)", [
          JSON.stringify(claims),
        ]);
        await tx.exec(`set local role ${actor.role}`);
      }
      result = await fn(tx);
      throw rollback;
    });
  } catch (error) {
    if (error !== rollback) throw error;
  }
  return result as T;
}

/** Commits changes as superuser (used for test fixtures). */
export async function setup(db: PGlite, sql: string): Promise<void> {
  await db.exec(sql);
}
