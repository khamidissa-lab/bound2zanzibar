# BOUND TO ZANZIBAR

Tourism and travel website for **Bound to Zanzibar** — Zanzibar tours, Tanzania safaris and multi-day packages for Tanzanian residents, East African travellers and international visitors.

> _Your Journey Begins in Zanzibar._

**Status:** Phase 7 (communications and polish) complete — WhatsApp contact, contact-form enquiries with an admin inbox, sitemap/robots/structured data, and an accessibility pass. Phase 6 (booking requests) before it: Visitors send booking requests for tours and packages and get a reference number; staff review, filter, update and export them in the admin. Content is managed in the admin and read from Supabase once it is configured (sample content until then). See [Build phases](#build-phases).

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Cache Components enabled) + React 19
- TypeScript (strict)
- Tailwind CSS v4 with CSS-variable design tokens
- [shadcn/ui](https://ui.shadcn.com) (Base UI primitives) + Lucide icons
- Supabase (PostgreSQL, Auth, Storage) — schema ready; see [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md)
- Zod / React Hook Form — _from the phases that add forms_
- Deployment target: an official Tanzanian hosting provider (Node.js server: `npm run build` + `npm run start`) — not Vercel

## Getting started

Requirements: Node.js 20.9+ (developed on Node 24) and npm.

```bash
npm install
cp .env.example .env.local   # then edit values; never commit .env.local
npm run dev                  # http://localhost:3000
```

No Supabase credentials are needed to run the site or the tests. To create the database, follow [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md).
**Admin dashboard preview (development only):** open `/admin/preview` while running `npm run dev` to review the dashboard without signing in. It uses the sample content; `/admin/preview?example=1` adds clearly labelled example bookings so the charts can be reviewed. The page returns 404 in production builds.

### Scripts

| Script                     | What it does                                                                  |
| -------------------------- | ----------------------------------------------------------------------------- |
| `npm run dev`              | Start the dev server                                                          |
| `npm run build`            | Production build                                                              |
| `npm run start`            | Serve the production build                                                    |
| `npm run lint`             | ESLint (Next.js core-web-vitals + TypeScript rules)                           |
| `npm run typecheck`        | Generate route types, then `tsc --noEmit`                                     |
| `npm run format`           | Format with Prettier (+ Tailwind class sorting)                               |
| `npm run format:check`     | Check formatting without writing                                              |
| `npm run check`            | Lint + typecheck + format check                                               |
| `npm test`                 | Unit tests + database security tests (real migrations on in-process Postgres) |
| `npm run db:types`         | Regenerate `src/lib/supabase/database.types.ts` from migrations               |
| `npm run db:seed:generate` | Regenerate the dev-only `supabase/seed.sql` from sample data                  |

### Environment variables

See [`.env.example`](.env.example).

| Variable                               | Scope       | Required from | Notes                                                                 |
| -------------------------------------- | ----------- | ------------- | --------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                 | public      | Phase 1       | Canonical URL for metadata. Defaults to localhost.                    |
| `NEXT_PUBLIC_SUPABASE_URL`             | public      | Phase 5       | Supabase project URL.                                                 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | public      | Phase 5       | Publishable (or legacy anon) key; safe in the browser because of RLS. |
| `SUPABASE_SERVICE_ROLE_KEY`            | server-only | If needed     | Never expose to the browser or commit it.                             |
| `ANTHROPIC_API_KEY`                    | server-only | Optional      | Turns on the visitor AI assistant ("Ask AI"). Set a spend limit.      |

## Project structure

```
src/
  app/
    layout.tsx            Root layout: fonts, global metadata
    globals.css           Design tokens + Tailwind theme
    not-found.tsx         Branded 404 (with public shell)
    (public)/             Public site (header + footer layout)
  components/
    layout/               Header, desktop/mobile nav, footer, logo
    shared/               Cross-page components
    ui/                   shadcn/ui primitives
  config/site.ts          Brand name, navigation, contact/social placeholders
  lib/                    Utilities (cn, site URL)
supabase/migrations/      SQL migrations: schema, RLS policies, submission functions, storage
supabase/seed.sql         Development-only sample data (generated)
supabase/tests/           RLS and schema tests (PGlite)
scripts/                  Seed and type generators
docs/                     Product, design and technical specifications
prompts/                  Build prompts used with Claude Code
```

- `src/lib/supabase`: Supabase clients (`server.ts`, `client.ts`, server-only `admin.ts`) and generated types.
- `src/lib/auth`: permission map, session and access checks (Data Access Layer), safe redirects.
- `src/lib/validation`: Zod schemas for every form and Server Action.
- `src/app/admin`: staff area (`/admin/login`; protected pages under `(protected)`); `src/proxy.ts` refreshes sessions.

The admin is at **`/admin`**. Setting up the first super admin is covered in [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md).

## Design system

Tokens live in [`src/app/globals.css`](src/app/globals.css) as CSS variables (`--brand-*`) and are exposed as Tailwind colours (`bg-ocean-deep`, `text-turquoise-deep`, `bg-sand`, …). shadcn semantic tokens (`primary`, `muted`, …) map onto the brand tokens.

- **Fonts:** Fraunces (display) + Manrope (body), self-hosted via `next/font`.
- **Colours come from the owner's logo:** navy `#022D38`, gold `#E2A725`, sea `#03A2BE`, sun `#FDA90B`. The bright sea is decorative only (≈3:1 with white); buttons and links use the deepened sea `#00758E` (≈5.3:1). The gold **Book Now** button uses navy text (≈6.8:1) like the logo's pill; white text on gold is never used. Muted text `#556274` passes AA on sand.
- **Logo files:** `public/brand/` holds the full logo, the emblem and the "BOUND 2 ZANZIBAR" wordmark (cropped from the supplied artwork); `src/app/icon.png`, `apple-icon.png` and `opengraph-image.png` are generated from it.
- **Motion:** subtle; all animation and transitions are reduced under `prefers-reduced-motion`.

## Content and placeholders

- **Contact details** live in `src/config/site.ts`. Owner-supplied: email, phone, Instagram. Anything still `null` (address, Facebook, TikTok) renders as **"To be supplied by owner"** — never fill with guessed values.
- **Sample content** (tours, destinations, packages, articles) lives in `src/data/sample/`. Every record has `isSample: true` and shows a "Sample" badge; every price has `isIllustrative: true`.
- **Data access** goes through `src/services/content.ts`: published content from Supabase (cached, refreshed on every admin save) when it is configured, otherwise the sample data. Pages never import either source directly. Admin editing is described in [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md#5c-managing-content-phase-5).
- **Images:** no licensed photos yet. `SceneImage` renders a labelled brand illustration when `src` is `null`, and switches to `next/image` once a photo URL is set.
- **Prices** are shown per market (International · USD / Tanzania resident · TZS) and never converted between currencies. The visitor's choice is remembered in their browser.
- **Booking:** `/book` sends a booking **request** (status pending) through the `submit_booking_request` database function and shows a reference number. Nothing is confirmed or charged online; staff confirm in Admin → Bookings. Without Supabase configured, the form explains that online requests open soon and points to email/phone.
- Privacy and Terms pages remain "being built" placeholders (`noindex`) until the owner supplies approved text.

## Build phases

Defined in [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md); prompts in [`prompts/PHASE_PROMPTS.md`](prompts/PHASE_PROMPTS.md).

1. ✅ Foundation — app scaffold, tooling, design tokens, public shell
2. ✅ Public experience — pages with clearly labelled sample content
3. ✅ Supabase foundation — migrations, RLS, types, dev seed, policy tests
4. ✅ Admin authentication and authorization — login, password reset, staff invites and roles, protected admin
5. ✅ Content management (CMS) — tours, categories, prices, destinations, packages + itineraries, travel guide, media
6. ✅ Booking management — request form, reference numbers, admin list/detail/status, restricted CSV export
7. ✅ Communications and polish — WhatsApp links, contact form + Enquiries inbox, sitemap, robots, share images, TravelAgency structured data, axe accessibility fixes (email alerts deferred until the owner chooses a provider)
8. Quality and deployment

## Security notes

- Never commit `.env.local`, service-role keys, passwords, payment secrets or customer data.
- RLS on every exposed Supabase table; the service-role key stays server-only.
- Bookings are **requests** until an authorized admin confirms them.
- Every staff change, price save, sign-in and booking export is written to a tamper-proof **activity log** (Admin → Activity log; admins only). See [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md#5f-activity-log).
- Security headers on every response: no framing (clickjacking), `nosniff`, a strict referrer policy, camera/microphone/location disabled, and HSTS in production. Admin pages are `noindex` and never cached.
- **Not built yet:** two-factor sign-in for staff. Supabase supports it, but the admin needs its own enrol and verify screens before it protects anything. Until then: long unique passwords, and give each person the lowest role they need.
