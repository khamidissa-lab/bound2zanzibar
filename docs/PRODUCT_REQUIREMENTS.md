# Product Requirements — BOUND TO ZANZIBAR

## Product vision
A responsive tourism website that helps Tanzanian, East African and international travellers discover Zanzibar experiences and Tanzania safari packages, understand prices and inclusions, and submit booking requests. Staff manage content, prices and reservations through a secure admin area.

## Goals
- Present the brand professionally and build visitor trust.
- Make tours, destinations and packages easy to discover.
- Support different customer markets and currencies.
- Convert interest into traceable booking requests.
- Let authorized staff update website content without developer involvement.
- Provide a foundation that can grow into payments, multilingual content and richer analytics.

## User groups
- Public visitor / prospective traveller
- Customer who submits a booking request
- Content administrator
- Booking/operations staff
- Super administrator

## MVP scope
### Public
- Home, About, Tours, Tour Detail, Destinations, Packages, Safari, Travel Guide, Contact
- Search/filter tours by category, destination, duration and market
- Tour and package details
- Market-specific price display
- Booking request form
- Responsive navigation and footer
- SEO metadata and share previews

### Admin
- Secure login
- Role-based route and action protection
- Dashboard with real data/empty states
- Tours and categories management
- Destinations management
- Packages and itinerary management
- Booking management and status updates
- Blog post management
- Media upload
- Market-specific pricing management

## Later enhancements
- Online payments (after provider selection)
- Email and WhatsApp notifications
- Multilingual content (English first; Swahili/French/German later)
- Currency conversion using a trusted live source
- Customer accounts and booking history
- Audio guides
- Advanced analytics and visitor tracking
- Newsletter automation

## Important business rules
- Booking form submission creates a request, not a confirmed reservation.
- Price, currency and market must come from database configuration.
- Sample prices, testimonials and contact information must be labelled as samples/placeholders.
- Tour availability must not be represented as real-time unless a real availability system is implemented.
- Admin exports and customer data are restricted to authorized staff.
- Do not publish unverified supplier, hotel or transport claims.

## Non-functional requirements
- Mobile-first responsive UI
- Accessible forms and navigation
- Fast page loading and optimized imagery
- SEO-friendly public pages
- Secure authentication and database policies
- Maintainable TypeScript code
- Error, loading and empty states
- Backups and deployment configuration documented
