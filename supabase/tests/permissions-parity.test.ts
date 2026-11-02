import type { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";

import { can, type Permission, type StaffRole } from "@/lib/auth/permissions";

import { as, createTestDatabase, setup, user } from "./db-harness";

/**
 * The app's permission map (used for UI and server-action checks) must agree
 * with the database role helpers that RLS actually enforces.
 */
const dbHelperFor: Partial<Record<Permission, string>> = {
  "dashboard.view": "private.is_staff()",
  "content.manage": "private.can_manage_content()",
  "content.delete": "private.is_admin()",
  "prices.manage": "private.can_manage_prices()",
  "bookings.manage": "private.can_manage_bookings()",
  "settings.manage": "private.is_admin()",
  "staff.manage": "private.is_super_admin()",
};

const roles: StaffRole[] = ["super_admin", "admin", "content_editor", "booking_staff"];
const idFor = (i: number) => `00000000-0000-4000-9000-00000000000${i + 1}`;

let db: PGlite;

beforeAll(async () => {
  db = await createTestDatabase();
  await setup(
    db,
    roles
      .map(
        (role, i) => `insert into auth.users (id) values ('${idFor(i)}');
          insert into public.profiles (id, full_name, role) values ('${idFor(i)}', '${role}', '${role}');`,
      )
      .join("\n"),
  );
}, 60_000);

describe("app permissions match database role helpers", () => {
  for (const [i, role] of roles.entries()) {
    for (const [permission, helper] of Object.entries(dbHelperFor)) {
      it(`${role} → ${permission}`, async () => {
        const { rows } = await as(db, user(idFor(i)), (tx) =>
          tx.query<{ allowed: boolean }>(`select ${helper} as allowed`),
        );
        expect(rows[0].allowed).toBe(can(role, permission as Permission));
      });
    }
  }
});
