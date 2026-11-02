# Claude Code — Phase-by-Phase Prompts

Use these after the Master Prompt. Review each phase before asking Claude to continue.

## Phase 1 — Foundation
Implement Phase 1 from `docs/IMPLEMENTATION_PLAN.md` only. Inspect the repository first. Set up Next.js App Router, strict TypeScript, Tailwind and the shared design tokens. Build a responsive public shell with header, mobile navigation and footer. Use the BOUND TO ZANZIBAR Tropical Modern design direction. Do not connect a real Supabase project yet. Run lint, typecheck and build; report exact results.

## Phase 2 — Public pages
Implement Phase 2 only. Build polished, responsive public pages for home, tours, tour details, destinations, packages, safari, travel guide, about and contact. Use a centralized sample-data layer with explicit sample labels. Ensure cards and navigation work. Do not invent genuine reviews, business details or confirmed prices. Add metadata and appropriate empty states. Run checks and summarize.

## Phase 3 — Database
Implement Phase 3 only. Create reviewed PostgreSQL migrations based on `docs/DATABASE_SCHEMA.md`. Prefer normalized price tables with proper foreign keys if appropriate. Add indexes, constraints, enums and RLS policies. Add development seed data only. Create `.env.example` and Supabase setup documentation. Do not fabricate credentials. Explain each policy and how to test it.

## Phase 4 — Admin security
Implement Phase 4 only. Add Supabase Auth admin login, profiles and roles. Protect admin routes and server actions. Enforce permissions server-side and in RLS. Do not rely on client-side hiding. Document how the first super-admin is securely provisioned without a public sign-up loophole.

## Phase 5 — CMS
Implement Phase 5 only. Build functional CRUD for tours, categories, destinations, market prices, packages, package itinerary days and blog posts. Add Supabase Storage media uploads with validation. Ensure public pages read published database content. Add loading, success, error and empty states.

## Phase 6 — Booking
Implement Phase 6 only. Build booking request forms for tours and packages. Validate with Zod on the server, save a pending request, generate a unique reference, and show a request-received page. Build admin list/detail/filter/status update and restricted CSV export. Test that public users cannot read booking records.

## Phase 7 — Communications and polish
Implement Phase 7 only. Add email only if the owner has selected and configured a provider and sender domain. Add WhatsApp links only after a verified number is supplied. Complete SEO, accessibility, performance and responsive reviews. Avoid fake tracking or notification functionality.

## Phase 8 — Deployment
Implement Phase 8 only. Add or complete automated tests, run lint/typecheck/build, review RLS and secret handling, and prepare Vercel/Supabase deployment instructions. Do not deploy to a live domain or alter production data without explicit owner approval.
