# Supabase Setup

How to create the database for Bound to Zanzibar, what the security model is, and how it is tested.

> **Status:** the schema, security policies and tests are ready. The website still reads from the sample data layer until Phase 5 switches `src/services/content.ts` to Supabase.

## 1. Create a project

1. Sign in at [supabase.com](https://supabase.com) and create a project.
   - **Region:** pick the closest available region to your visitors (for East Africa, a European or South African region is usually closest).
   - Save the database password in a password manager.
2. In **Project Settings → API Keys**, copy:
   - the **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - the **publishable key** → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - the **secret / service-role key** → `SUPABASE_SERVICE_ROLE_KEY` (server-only; optional for now)
3. Put them in `.env.local` (never commit it) and later in your hosting provider's environment settings for the Node.js app.

## 2. Turn off public sign-ups

Customers do not have accounts; only staff sign in. In **Authentication → Sign In / Providers**, disable **"Allow new users to sign up"**. Staff are invited instead (see step 5).

Even if sign-ups were left on, a new account would have **no staff profile** and would be treated exactly like a visitor. The tests prove this.

### 2b. Auth URLs and email links

Staff invitations and password resets are emailed links that land on `/auth/confirm`, which verifies the one-time token and opens **My account** so the person can set a password.

1. **Authentication → URL Configuration**
   - **Site URL:** your site, e.g. `https://boundtozanzibar.com` (use `http://localhost:3005` for local development).
   - **Redirect URLs:** add `http://localhost:3005/**` and your production URL followed by `/**`.
2. **Authentication → Emails → Templates.** Change the link in these two templates:
   - **Invite user:**
     ```
     {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/admin/account
     ```
   - **Reset password:**
     ```
     {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/admin/account
     ```
3. Supabase's built-in email sender is heavily rate-limited and meant for testing. Before launch, set up a custom SMTP sender under **Authentication → Emails → SMTP Settings** (Phase 7).

`/auth/confirm` only continues to pages under `/admin`; anything else in `next` is ignored, so the link can't be abused as an open redirect.

## 3. Apply the migrations

Using the Supabase CLI (no global install needed):

```bash
npx supabase login
npx supabase init             # creates supabase/config.toml if missing; keep existing files
npx supabase link --project-ref <your-project-ref>
npx supabase db push          # applies supabase/migrations/* in order
```

Alternatively, paste each file in `supabase/migrations/` into the dashboard **SQL Editor**, in filename order.

| Migration                        | What it does                                                  |
| -------------------------------- | ------------------------------------------------------------- |
| `…000100_core_schema.sql`        | Enums, tables, constraints, indexes, `updated_at` triggers    |
| `…000200_rls_policies.sql`       | Role helpers, RLS on every table, access policies, audit log  |
| `…000300_public_submissions.sql` | Validated booking-request and enquiry functions for visitors  |
| `…000400_storage_media.sql`      | Public `media` bucket for images (5 MB, JPEG/PNG/WebP/AVIF)   |
| `…20261102000100_admin_content_functions.sql` | Atomic save helpers for prices, itineraries and galleries |
| `…20261102000200_tour_more_details.sql` | Tour "More details": what to expect, good to know, FAQs |
| `…20261103000100_activity_log.sql` | Append-only staff activity log (see 5f) |

## 4. (Development only) load sample content

`supabase/seed.sql` contains the sample tours, destinations, packages and articles, all flagged `is_sample = true` with **illustrative** prices. It is generated from `src/data/sample/` by `npm run db:seed:generate`.

- Local development: `npx supabase db reset` applies migrations and the seed.
- A hosted **staging** project: run `seed.sql` in the SQL Editor if you want sample content.
  The seed has no photos (it only stores alt text). Run `npm run db:photos` afterwards: it
  uploads the photos in `public/images` (credited in `docs/PHOTO_CREDITS.md`) to the `media`
  bucket under `sample/` and links them to the sample items by slug. It only touches rows
  still flagged `is_sample`, so photos set in the admin are kept. Public pages cache content
  for a few hours; restart the server (or save any item in the admin) to see the change.
- **Never load the seed into production.** Real content is entered through the admin (Phase 5).

## 5. Create the first super admin

There is deliberately no sign-up flow that grants staff access. Provision the first super admin once, by hand:

1. **Authentication → Users → Add user → Send invitation** (or create the user with a password) for the owner's email.
2. Copy the new user's **UID**, then run in the **SQL Editor** (which runs with owner privileges):

   ```sql
   insert into public.profiles (id, full_name, role)
   values ('<user-uid>', 'Owner Name', 'super_admin');
   ```

3. Sign in at `/admin/login`. If you created the user with an invitation, follow the email link first to choose a password.

After that, the super admin can invite other staff from **Admin → Staff**. Invitations need `SUPABASE_SERVICE_ROLE_KEY` on the server. Without it, add users in the dashboard and create their profile with the SQL above. The database refuses to demote, deactivate or delete the **last** active super admin.

## 5b. How admin access is enforced

Four independent layers. Hiding a link is never the protection.

1. **Proxy** (`src/proxy.ts`): refreshes the session cookie and sends signed-out visitors to `/admin/login`. It's an early redirect only, not the permission check.
2. **Every admin page** calls `requireStaffPage(permission)`. Every **Server Action** calls `authorizeAction(permission)` before doing anything (`src/lib/auth/session.ts`). Both verify the session with Supabase Auth and load the profile fresh on every request.
3. **Row Level Security** in the database applies to every query, whatever the app does.
4. **Tests:** `supabase/tests/permissions-parity.test.ts` checks that the app's permission map (`src/lib/auth/permissions.ts`) matches the database role functions for every role.

Signed-in users without an active staff profile are sent to `/admin/no-access`. Pages a role can't use show an **access denied** state.

## 5c. Managing content (Phase 5)

Once `NEXT_PUBLIC_SUPABASE_URL` and the publishable key are set, **the public website reads from the database automatically**. Without them it shows the built-in sample content.

- **What visitors see:** only published tours, destinations, packages and articles, plus active prices and categories. These reads run as a visitor, are cached, and refresh straight after every admin save (otherwise hourly).
- **Editors:** Admin → Tours (with categories, prices and gallery), Destinations, Packages (itinerary, linked tours and destinations, prices), Travel guide and Media.
- **Status:** **Draft** is hidden, **Published** is live, **Archived** is hidden but kept. Content editors archive; only admins can delete permanently. Items with booking requests can't be deleted.
- **Prices:** only admins can change them. Each row is a market (International, Tanzania resident or East African) × traveller type × currency. Tick **Sample?** to label a price as illustrative on the website.
- **Media:** upload in Admin → Media (JPEG, PNG, WebP or AVIF, up to 5 MB), then choose the photo in an editor. Uploads go straight from the browser to the `media` bucket using the staff member's own session, so the bucket's limits and storage policies apply.
- **Sample content:** anything saved through the admin is marked as real (`is_sample = false`). If you loaded the development seed into a project, replace or archive the sample items before launch.
- **Empty database:** if a hosted project has no content yet, the public pages show their "coming soon" empty states.

## 5d. Booking requests (Phase 6)

- **Visitors** fill in `/book` (or click **Request to book** on a tour or package). The server validates the form with Zod, then calls `public.submit_booking_request`, which re-validates, snapshots the matching price and saves a **pending** request. The visitor sees a reference like `BTZ-2611-7F3A9C1E` on `/book/received`; that page only echoes the reference and never looks anything up.
- **Spam:** a hidden honeypot field, plus the function's limits (5 requests per email per hour, 100 site-wide per 10 minutes).
- **Staff** (super admin, admin, booking staff) use **Admin → Bookings**: filter by status, tour/package, travel dates or search by reference, name, email or phone; open a booking to change its status and keep internal notes. Allowed changes: pending → confirmed / rejected / cancelled; confirmed → completed / cancelled; finished bookings can be reopened. Every status change is logged with who made it.
- **CSV export** (Export CSV button) is limited to super admins and admins and exports the current filters. Cells are protected against spreadsheet formula injection. Treat exported files as customer data: don't email or share them unnecessarily.
- **Privacy:** visitors can't read any booking, status history or internal notes — the tables have no public read policy (covered by `supabase/tests/rls.test.ts`).
- **Development preview:** `/admin/preview/bookings` shows the booking screens with clearly labelled example data, in `npm run dev` only (404 in production).

## 5e. Enquiries and WhatsApp (Phase 7)

- **Contact form** (`/contact`) saves messages through `public.submit_inquiry` (validated with Zod first; honeypot field; 5 per email per hour). Staff read and answer them in **Admin → Enquiries**: filter by New / In progress / Closed, search, reply by email or WhatsApp, and keep internal notes.
- **WhatsApp:** the owner confirmed on 2026-11-02 that +255 622 341 233 is the business WhatsApp number. It is set once in `src/config/site.ts` (`contact.whatsapp`) and used for every "Chat on WhatsApp" link.
- **No email alerts yet:** new requests and enquiries are not emailed to the team. Check the admin, or add an email provider later (Phase 7 follow-up once a domain and sender address exist).
- **SEO:** `/sitemap.xml` and `/robots.txt` are generated from published content. Set `NEXT_PUBLIC_SITE_URL` to the live domain so they (and share links) use it.

## 5f. Activity log

Migration `20261103000100_activity_log.sql` adds `public.activity_log`, shown in **Admin → Activity log** to admins and super admins only.

- **What is recorded:** creating, editing and deleting tours, packages, destinations, tour categories, guide articles, reviews, settings and staff accounts; every price save (one entry with the before and after prices); booking and enquiry updates; sign-ins, sign-outs, password changes and booking CSV exports. Each entry stores who did it, their role at the time, when, and which fields changed.
- **How:** database triggers and `SECURITY DEFINER` functions write the entries, so the app cannot skip or fake them. Staff-only events the database cannot see (sign-in, sign-out, password change, export) go through `public.log_staff_event`, which accepts only those four actions from active staff.
- **Tamper-proof:** no role can insert, edit or delete entries through the API, and an update trigger blocks edits even for the database owner.
- **Privacy:** booking and enquiry entries store only the names of changed fields and status values, never customer names, contact details or notes. Export entries store the row count and status filter, not the search text.
- **Not recorded:** failed sign-in attempts (see **Authentication → Logs** in the Supabase dashboard), visitors' booking requests and enquiries (they appear in their own inboxes), and changes made directly in the Supabase dashboard's SQL editor.
- **Retention:** entries are kept indefinitely. To trim, run as the owner in the SQL editor, for example: `delete from public.activity_log where occurred_at < now() - interval '2 years';`

## 6. Security model

Visitors use the `anon` role. Staff are `authenticated` users with an **active** row in `profiles`.

| Role             | Content (tours, destinations, packages, blog, reviews, media) | Prices | Bookings & enquiries | Settings | Staff profiles |
| ---------------- | ------------------------------------------------------------- | ------ | -------------------- | -------- | -------------- |
| Visitor          | Read **published** only                                       | Read active prices of published items | **Submit only**, via functions | Read public keys | — |
| `content_editor` | Read all, create, edit, archive                               | Read   | —                    | Read     | Own profile    |
| `booking_staff`  | Read all                                                      | Read   | Read, create, update | Read     | Own profile    |
| `admin`          | Full, including delete                                        | Manage | Read, create, update; delete enquiries | Manage | Read all |
| `super_admin`    | Full                                                          | Manage | Full, including delete | Manage | Manage        |

Key points:

- **RLS is enabled on every table**, and a test fails if any table is added without it.
- **Visitors have no table access to bookings, enquiries, profiles or the booking audit log**, not even insert. They can only call:
  - `submit_booking_request(...)`, which validates the input, checks that the tour or package is published, rate-limits by email (5 per hour) and globally, snapshots a quote from configured prices, saves the request as **pending**, and returns only `{ reference, status }`.
  - `submit_inquiry(...)`, which does the same for contact enquiries.
- Errors use stable keys (for example `booking_invalid_date` or `booking_rate_limited`) that the app maps to friendly messages; they never include other people's data.
- `internal_notes` on bookings and enquiries is readable only by booking staff and admins.
- Booking references and creation times cannot be changed. Every status change is recorded in `booking_status_events` with the staff member who made it.
- Prices are stored **per currency** (`TZS`, `USD`, extendable via the `currencies` table) and never converted. Markets: `resident`, `east_african`, `international`. Customer types: `adult`, `child`, `group`.
- Every staff change is recorded in the append-only `activity_log` (section 5f).
- Helper functions live in the `private` schema, which is not exposed over the Data API.
- The service-role key bypasses RLS. It is only used by `src/lib/supabase/admin.ts`, which imports `server-only`, so it cannot be bundled into browser code.

## 7. Testing the policies

```bash
npm test
```

The tests run the **real migrations and seed** against PGlite (PostgreSQL compiled to WebAssembly, in-process; no Docker or credentials needed). `supabase/tests/supabase-stubs.sql` recreates the parts of Supabase the migrations rely on: the `anon`, `authenticated` and `service_role` roles, `auth.uid()` from JWT claims, the storage tables, and Supabase's default grants. Each test runs as a specific role inside a transaction that is rolled back.

What's covered:

- RLS enabled on every table; the seed loads with sample flags and illustrative prices.
- **Visitors:**
  - see only published content and prices;
  - cannot read, insert or change bookings, enquiries or profiles;
  - cannot edit content or upload media.
- **Booking requests:**
  - a valid request returns only a reference and is saved as pending with a correct quote;
  - invalid party sizes, past dates, bad emails or phones, unknown currencies and draft or unknown tours are rejected;
  - repeated requests from one email are rate-limited.
- **Each staff role** can do exactly what the table above says. Signed-in users without a profile, and deactivated staff, get visitor access only.
- **Super admins:** the last one cannot be demoted.
- **Types:** `database.types.ts` matches the migrations.

The suite was checked against deliberately broken policies to confirm that it fails when protections are removed.

To test against a hosted project as well, use **Authentication → Policies** and the SQL Editor's **role switcher** (run as `anon`), or call the API with the publishable key: `select` on `bookings` must return a permission error.

## 8. TypeScript types

`src/lib/supabase/database.types.ts` is generated from the migrations:

```bash
npm run db:types
```

Once a project is linked you can use the official generator instead:

```bash
npx supabase gen types typescript --project-id <ref> > src/lib/supabase/database.types.ts
```

## 9. Changing the schema

1. Add a new timestamped file in `supabase/migrations/`; never edit a migration that has already been applied to a hosted project.
2. If you add a table, enable RLS and add policies in the same migration; `npm test` will fail otherwise.
3. Run `npm run db:types`, `npm run db:seed:generate` and `npm test`.
4. Apply with `npx supabase db push`, first to staging, then to production.

## 10. Backups

Supabase takes daily backups on paid plans; point-in-time recovery is an add-on. Before launch, confirm the plan's backup retention, and test a restore on a staging project.
