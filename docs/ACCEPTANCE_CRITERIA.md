# Acceptance Criteria

## Public experience
- Navigation works on mobile, tablet and desktop.
- All public pages have meaningful page titles and metadata.
- Tour and package detail pages use stable slugs.
- Search/filter controls work against actual available content.
- Prices display from configured database records and clearly identify market/currency.
- No fake testimonials, fake ratings or invented company details are presented as genuine.
- Forms have accessible labels, validation and helpful errors.

## Booking
- Valid request can be submitted and saved.
- Invalid dates, zero/negative party sizes and malformed email/phone inputs are rejected.
- Successful submission displays a reference number.
- Submission is labelled pending/request received, not confirmed.
- Public visitors cannot retrieve other customers' bookings.
- Admin can find and update a booking.
- Internal notes are never exposed to public users.

## Admin
- Unauthenticated users cannot access protected admin data.
- Role permissions are enforced on server and database.
- CRUD actions persist to Supabase.
- Destructive actions require confirmation.
- Dashboard numbers come from database queries.
- Empty states appear when there is no data.
- CSV export is permission-restricted.

## Engineering
- `npm run lint` passes.
- TypeScript typecheck passes.
- Production build passes.
- No secrets are committed.
- RLS is enabled on all exposed tables.
- Service-role key is not bundled into client code.
- README explains local setup, migrations, seed data and deployment.
