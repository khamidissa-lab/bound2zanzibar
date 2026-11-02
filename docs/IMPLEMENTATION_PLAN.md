# Implementation Plan

Work in the following phases. Do not skip security or testing to make the UI look complete.

## Phase 1 — Foundation
- Inspect repository
- Initialize Next.js App Router + TypeScript + Tailwind
- Configure linting and formatting
- Set up folder structure
- Add design tokens, fonts and global styles
- Build responsive public layout shell and navigation
- Add `.env.example` and README setup instructions
- Verify lint, typecheck and build

## Phase 2 — Public experience
- Build homepage sections
- Build tours listing and detail pages
- Build destinations and packages pages
- Build safari and travel guide pages
- Add sample content clearly marked as sample
- Add SEO metadata and responsive states

## Phase 3 — Supabase foundation
- Create Supabase client utilities
- Add SQL migrations and constraints
- Enable RLS and add policies
- Add generated/maintained TypeScript database types
- Add safe development seed data
- Document Supabase project setup

## Phase 4 — Admin authentication and authorization
- Admin login
- Profile/role model
- Protected admin layouts and server-side authorization
- RLS validation
- Unauthorized and forbidden states

## Phase 5 — Content management
- Tours/categories CRUD
- Destinations CRUD
- Market prices CRUD
- Packages and itinerary CRUD
- Blog posts CRUD
- Media upload to Supabase Storage
- Publish/draft workflows

## Phase 6 — Booking management
- Public booking request form
- Server-side validation
- Secure booking insert
- Reference number
- Admin booking list/detail/filter/status updates
- CSV export for authorized roles
- Customer privacy controls

## Phase 7 — Communications and polish
- Email notifications only after provider configuration
- WhatsApp contact links using verified business number
- SEO sitemap/robots/Open Graph
- Accessibility review
- Performance and image optimization
- Error/loading/empty states

## Phase 8 — Quality and deployment
- Unit/integration tests for critical logic
- RLS/security tests and manual policy review
- Typecheck, lint and production build
- Deploy to a staging site on the Tanzanian host
- Configure production Supabase and environment variables
- Owner acceptance testing
- Production launch checklist

## Rules
- At the end of each phase, summarize changed files and test results.
- Do not proceed past missing credentials or unresolved business decisions.
- Never use production data as development seed data.
- Do not state a feature is complete if it is only a visual mockup.
