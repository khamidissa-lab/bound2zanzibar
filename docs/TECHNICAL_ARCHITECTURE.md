# Technical Architecture

## Recommended architecture
Next.js App Router application using TypeScript. Public pages use Server Components by default. Interactive filters, forms and admin widgets use Client Components only where needed. Server Actions or Route Handlers perform validated mutations. Supabase provides PostgreSQL, Auth and Storage.

## Layers
- `src/app`: route segments, layouts, pages and route handlers
- `src/components`: shared UI and domain components
- `src/lib/supabase`: browser/server clients and generated database types
- `src/lib/validation`: Zod schemas
- `src/services`: domain operations and data access
- `src/types`: shared application types
- `supabase/migrations`: SQL schema and RLS policies
- `supabase/seed.sql`: development-only sample data, clearly labelled

## Suggested route organization
- `src/app/(public)/page.tsx`
- `src/app/(public)/tours/page.tsx`
- `src/app/(public)/tours/[slug]/page.tsx`
- `src/app/(public)/packages/page.tsx`
- `src/app/(public)/packages/[slug]/page.tsx`
- `src/app/(public)/destinations/[slug]/page.tsx`
- `src/app/(public)/travel-guide/[slug]/page.tsx`
- `src/app/(public)/booking/[type]/[slug]/page.tsx`
- `src/app/admin/...`
- `src/app/api/...` only where a Route Handler is appropriate

## Data access
Keep Supabase queries in server-side service modules. Do not place privileged database access in client components. Use generated Supabase TypeScript types where feasible. Validate input at trust boundaries.

## Authentication and authorization
- Supabase Auth for admin sign-in.
- Profiles table maps auth user ID to role.
- Roles: `super_admin`, `admin`, `booking_staff`, `content_editor`.
- Check permissions on the server for every admin action.
- Enforce equivalent access restrictions using RLS.
- Public read access only to published content.
- Never trust role values supplied by the browser.

## Environment variables
Use `.env.example` with placeholders:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; avoid unless necessary)
- `NEXT_PUBLIC_SITE_URL`
- Optional email provider variables only after selection

Do not create a real `.env.local` with fake credentials. Do not commit secrets.

## Deployment
An official Tanzanian hosting provider running the Next.js app as a Node.js server (`next build` + `next start`, Node 20.9+) — not Vercel. Supabase hosted project for database/auth/storage. Configure environment variables on the host. Apply reviewed migrations to production; do not use development seed data in production.

## Observability and quality
Use structured server logs without personal data/secrets. Add lint, typecheck, tests and production build scripts. Document database backup and restore considerations.
