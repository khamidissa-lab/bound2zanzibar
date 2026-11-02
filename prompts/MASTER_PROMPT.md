# MASTER PROMPT — BOUND TO ZANZIBAR

Act as a senior product designer, senior full-stack engineer and technical lead. Build a production-minded tourism and travel website called **BOUND TO ZANZIBAR**. Work directly in the current project folder.

Do not merely describe the implementation. Inspect the repository, make a short plan, then implement the application in small, testable phases. Before making major architectural assumptions, check the project files. If the repository is empty, initialize the project using the stack below. Keep the code maintainable and explain important decisions briefly.

## 1. Business and audience

BOUND TO ZANZIBAR is a tourism, travel and experiences brand based in Zanzibar, Tanzania. It serves:
- Tanzanian residents
- East African travellers
- International tourists
- Couples and honeymooners
- Families and groups
- Adventure and culture seekers

The brand should feel welcoming, trustworthy, locally knowledgeable and professional. It should support both affordable local travel and international travel. Do not position the company as luxury-only.

Suggested tagline: **Your Journey Begins in Zanzibar.**

Do not invent real company contact details, registration numbers, office addresses, supplier partnerships, reviews, awards or credentials. Use clearly labelled placeholders where the owner must provide verified information.

## 2. Required stack

Use:
- Next.js with App Router
- TypeScript with strict mode
- React
- Tailwind CSS
- shadcn/ui for suitable accessible primitives
- Supabase PostgreSQL for the database
- Supabase Auth for admin authentication
- Supabase Storage for tour and destination images
- Zod for validating forms and server inputs
- React Hook Form where form complexity warrants it
- Lucide React icons
- Vercel as the deployment target

Use the current stable compatible versions at implementation time. Prefer official documentation and avoid deprecated APIs. Do not add libraries without a clear reason.

## 3. Design direction

Use **Tropical Modern** with minimalist restraint:
- Ocean blue / deep navy for structure and trust
- Turquoise as the main accent
- Warm white backgrounds
- Soft sand / beige neutral surfaces
- Small champagne-gold accents only where appropriate
- Large, high-quality destination photography
- Clear typography and generous spacing
- Strong mobile-first layouts
- Subtle, purposeful motion; respect reduced-motion preferences

The result must not look like a generic dashboard template or a clone of another tourism website. Create a distinctive visual system for this brand.

Suggested starting tokens (adjust thoughtfully):
- Deep ocean: #073B4C
- Ocean blue: #0B6073
- Turquoise: #19A7A1
- Warm white: #FAFAF7
- Sand: #EDE3D2
- Muted text: #64748B
- Gold accent: #C6A15B

Use CSS variables/design tokens rather than scattering hex values through components. Ensure accessible colour contrast.

## 4. Public website pages

Build responsive pages:
1. Home
2. About
3. Tours / Experiences listing
4. Tour detail page using a slug
5. Destinations listing and detail pages
6. Tour packages listing and package detail pages
7. Tanzania safari experiences
8. Travel guide / blog listing and article detail
9. Contact
10. Booking flow / booking request confirmation
11. Privacy policy and terms placeholders

Main navigation:
- Home
- Zanzibar Tours
- Safari
- Packages
- Destinations
- Travel Guide
- About
- Contact
- Book Now (prominent CTA)

Homepage sections:
- Hero with destination image/video fallback, concise headline, supporting copy and clear CTAs
- Search / trip discovery panel
- Featured Zanzibar experiences
- Popular destinations
- Zanzibar + Tanzania safari feature
- Multi-day packages
- Why travel with us
- Guest testimonials (only sample-labelled until genuine reviews are supplied)
- Travel guide articles
- Newsletter signup (only if implemented with consent and secure handling)
- Footer with verified contact placeholders and social links placeholders

## 5. Tourism content model

Seed clearly labelled sample records for experiences such as:
- Stone Town City Tour
- Prison Island Tour
- Spice Farm Tour
- Jozani Forest Tour
- Mnemba Island Snorkelling
- Safari Blue / Menai Bay
- Nakupenda Sandbank
- Sunset or traditional dhow cruise
- Nungwi and Kendwa beach experience
- Kizimkazi dolphin experience

Safari and package content should also be supported. Do not publish unverified operational claims or exact live availability.

Each tour should support:
- Name, slug, short and full descriptions
- Category and destination
- Duration
- Highlights
- Included / excluded items
- What to bring
- Meeting point / pickup notes
- Gallery images and cover image
- Difficulty / suitability where relevant
- Published/draft status
- Market-specific prices and currency
- SEO title and description

Packages should support multiple days/nights, itinerary by day, accommodation description, transfers, meals, included tours, exclusions, pricing and terms.

## 6. Pricing and market support

Support at least:
- Tanzanian resident / local market
- International market

Prices must be database-driven and configurable by market, currency and customer type where needed. Support TZS and USD initially. Do not hard-code sample prices in components. Label sample prices as illustrative until owner approval.

Never silently convert currencies using a fixed or guessed exchange rate. If conversion is shown, use a clearly identified exchange-rate source and timestamp, or show the configured native price only.

The admin must be able to update prices without changing code. Include adult and child price fields where applicable.

## 7. Booking workflow

Create a clear booking-request flow:
1. Visitor selects a tour or package.
2. Visitor enters preferred date, adults, children, contact details, pickup/location notes and optional message.
3. Validate input on the server using Zod.
4. Save the booking request to Supabase.
5. Show a reference number and a clear **request received / pending confirmation** message.
6. Notify admins through an appropriate notification mechanism if configured.
7. Admin can review and change status to pending, confirmed, rejected, cancelled or completed.
8. Customer email confirmation is optional until an email provider and verified sender are configured.

Do not imply that a booking is confirmed merely because a form was submitted. Do not collect payment card details directly. Keep payment integration as a later phase using a suitable provider after the owner chooses one.

Add basic spam protection/rate limiting where practical. Do not expose customer personal data publicly.

## 8. Admin area

Create protected admin routes with role-based access:
- Dashboard overview
- Tours CRUD
- Tour categories
- Destinations CRUD
- Packages and package itinerary management
- Bookings management
- Customer records (minimum necessary personal data)
- Blog posts CRUD
- Testimonials moderation
- Image/media management
- Site settings (contact details, social links, currency display options)

Dashboard metrics should be calculated from real database records, not hard-coded decorative numbers. If no records exist, show helpful empty states.

Admin capabilities:
- Create, edit, publish/unpublish and archive tours
- Manage market-specific prices
- Manage package itineraries and inclusions
- View booking details and update booking status
- Search/filter bookings by status and date
- Export bookings to CSV only for authorized admins
- Upload and select images
- Manage SEO fields

Use confirmation dialogs for destructive actions. Provide loading, error, success and empty states.

## 9. Supabase and security requirements

Create a documented Supabase setup:
- SQL migrations under `supabase/migrations/`
- Typed database access where practical
- Environment variable example in `.env.example`
- Server-side Supabase client and browser client separated
- Auth middleware/protection appropriate to the current Next.js version
- RLS enabled for every table exposed through Supabase APIs
- Policies based on authenticated user role
- Public users can read only published public content and submit booking requests
- Public users cannot read all bookings or customer records
- Only authorized admins can manage content, prices and bookings
- Service-role key must remain server-only and never be imported into client components

Do not assume that hiding an admin page is sufficient security. Enforce authorization on the server and in database policies.

Use safe error messages; do not leak SQL errors, secrets or personal information.

## 10. Engineering standards

- TypeScript strict mode; avoid `any`. Explain any unavoidable exception.
- Reusable components and clear separation of concerns.
- Server Components by default; use Client Components only for interactivity.
- Validate all untrusted input on the server.
- Use semantic HTML and accessible labels.
- Responsive layouts from mobile to desktop.
- Optimize images and use appropriate Next.js image handling.
- Add metadata, Open Graph tags, sitemap and robots configuration.
- Add sensible loading and error boundaries.
- Avoid fake functionality: buttons must work or be clearly disabled/labeled as coming soon.
- No secrets in source control.
- Add linting and useful tests.
- Include a useful README with setup, environment variables, migrations, seed process and deployment steps.

## 11. Delivery approach

Follow `docs/IMPLEMENTATION_PLAN.md` and `prompts/PHASE_PROMPTS.md`.

Start by:
1. Inspecting the repository and reporting what exists.
2. Proposing the implementation plan.
3. Initializing or adapting the app.
4. Building the design system and public shell.
5. Implementing the public pages using clearly marked sample content.
6. Creating Supabase schema/migrations and RLS.
7. Integrating real database reads and admin CRUD.
8. Implementing booking workflow.
9. Testing, fixing and documenting.

Do not attempt to build every feature in one giant unreviewed change. After each phase:
- Summarize files changed
- List commands run
- Report test/build results honestly
- Identify any required owner configuration
- Stop for review if a business decision, credential, payment provider or factual company detail is required

## 12. First task

Begin with repository inspection. Then create a concise task checklist and implement **Phase 1 only** from the implementation plan. Do not fabricate credentials or connect to a real Supabase project without the owner supplying credentials.
