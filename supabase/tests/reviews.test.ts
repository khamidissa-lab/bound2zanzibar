import type { PGlite, Transaction } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";

import { anon, as, createTestDatabase, setup, superuser, user } from "./db-harness";

const editor = "00000000-0000-4000-a000-000000000031";
const bookingStaff = "00000000-0000-4000-a000-000000000032";
const COMPLETED = "00000000-0000-4000-c000-000000000101";
const CONFIRMED = "00000000-0000-4000-c000-000000000102";

let db: PGlite;
let token: string;

beforeAll(async () => {
  db = await createTestDatabase();
  await setup(
    db,
    `insert into auth.users (id) values ('${editor}'), ('${bookingStaff}');
     insert into public.profiles (id, full_name, role) values
       ('${editor}', 'Editor', 'content_editor'),
       ('${bookingStaff}', 'Bookings', 'booking_staff');
     insert into public.bookings (id, item_type, tour_id, customer_name, email, phone,
       market, preferred_date, adults, currency, status)
     values
       ('${COMPLETED}', 'tour', (select id from public.tours where slug = 'stone-town-city-tour'),
        'Amina Hassan', 'amina@example.com', '+255 700 000 000', 'resident',
        current_date + 5, 2, 'TZS', 'confirmed'),
       ('${CONFIRMED}', 'tour', (select id from public.tours where slug = 'stone-town-city-tour'),
        'Juma Ali', 'juma@example.com', '+255 700 000 001', 'resident',
        current_date + 5, 2, 'TZS', 'confirmed');
     update public.bookings set status = 'completed' where id = '${COMPLETED}';`,
  );
  const { rows } = await db.query<{ review_token: string }>(
    `select review_token from public.bookings where id = '${COMPLETED}'`,
  );
  token = rows[0].review_token;
}, 60_000);

const submit = (tx: Transaction, t: string, rating = 5) =>
  tx.query(
    `select public.submit_review(p_token => $1::uuid, p_rating => $2,
       p_body => 'Wonderful walk through Stone Town with a great guide.',
       p_display_name => 'Amina H.', p_title => 'Loved it', p_country => 'Tanzania')`,
    [t, rating],
  );

describe("review invitations", () => {
  it("gives completed bookings a private review link, and others none", async () => {
    expect(token).toMatch(/^[0-9a-f-]{36}$/);
    const { rows } = await db.query<{ review_token: string | null }>(
      `select review_token from public.bookings where id = '${CONFIRMED}'`,
    );
    expect(rows[0].review_token).toBeNull();
  });

  it("greets the customer by first name without revealing anything else", async () => {
    await as(db, anon, async (tx) => {
      const { rows } = await tx.query(
        "select * from public.get_review_invitation($1::uuid)",
        [token],
      );
      expect(rows).toEqual([
        {
          first_name: "Amina",
          item_name: "Stone Town City Tour",
          already_reviewed: false,
        },
      ]);
      const none = await tx.query(
        "select * from public.get_review_invitation(gen_random_uuid())",
      );
      expect(none.rows).toHaveLength(0);
    });
  });
});

describe("submit_review", () => {
  it("saves one pending review per completed booking", async () => {
    await as(db, anon, async (tx) => {
      await submit(tx, token);
      await expect(submit(tx, token)).rejects.toThrow(/review_already_submitted/);
    });
  });

  it("rejects unknown links and bad ratings", async () => {
    await expect(
      as(db, anon, (tx) => submit(tx, "00000000-0000-4000-8000-000000000000")),
    ).rejects.toThrow(/review_invalid_link/);
    await expect(as(db, anon, (tx) => submit(tx, token, 6))).rejects.toThrow(
      /review_invalid_rating/,
    );
  });
});

describe("reading and moderating reviews", () => {
  it("shows visitors only approved reviews and only public columns", async () => {
    await as(db, superuser, async (tx) => {
      await tx.exec("set local role anon");
      await tx.query(
        "select set_config('request.jwt.claims', '{\"role\":\"anon\"}', true)",
      );
      await submit(tx, token);
      const pending = await tx.query("select id from public.reviews");
      expect(pending.rows).toHaveLength(0);

      await tx.exec("reset role");
      await tx.query("update public.reviews set status = 'approved'");
      await tx.exec("set local role anon");
      const approved = await tx.query<{ rating: number; display_name: string }>(
        "select rating, display_name from public.reviews",
      );
      expect(approved.rows).toEqual([{ rating: 5, display_name: "Amina H." }]);
      await expect(tx.query("select booking_id from public.reviews")).rejects.toThrow(
        /permission denied/,
      );
    });
  });

  it("lets content editors moderate, but not booking staff, and records who did it", async () => {
    await as(db, superuser, async (tx) => {
      await tx.exec("set local role anon");
      await tx.query(
        "select set_config('request.jwt.claims', '{\"role\":\"anon\"}', true)",
      );
      await submit(tx, token);
      await tx.exec("reset role");

      const asUser = async (id: string) => {
        await tx.exec("reset role");
        await tx.query("select set_config('request.jwt.claims', $1, true)", [
          JSON.stringify({ sub: id, role: "authenticated" }),
        ]);
        await tx.exec("set local role authenticated");
      };

      await asUser(bookingStaff);
      const blocked = await tx.query(
        "update public.reviews set status = 'approved' returning id",
      );
      expect(blocked.rows).toHaveLength(0);

      await asUser(editor);
      const { rows } = await tx.query<{ moderated_by: string }>(
        "update public.reviews set status = 'approved' returning moderated_by",
      );
      expect(rows[0].moderated_by).toBe(editor);
    });
  });
});

describe("related tours on articles", () => {
  it("lets content editors set an article's related tours", async () => {
    await as(db, user(editor), async (tx) => {
      const post = await tx.query<{ id: string }>(
        "select id from public.blog_posts order by slug limit 1",
      );
      const postId = post.rows[0].id;
      await tx.query(
        `select public.set_blog_post_tours($1,
           array[(select id from public.tours where slug = 'spice-farm-tour')])`,
        [postId],
      );
      const { rows } = await tx.query(
        "select tour_id from public.blog_post_tours where post_id = $1",
        [postId],
      );
      // The previous related tours are replaced, not added to.
      expect(rows).toHaveLength(1);
    });
  });
});
