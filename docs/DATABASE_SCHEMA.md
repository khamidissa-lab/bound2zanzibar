# Proposed Database Schema

This is a logical starting schema. Claude Code should turn it into reviewed PostgreSQL migrations, add constraints/indexes and implement RLS. Use UUID primary keys and `created_at` / `updated_at` timestamps where appropriate.

## Tables

### profiles
- `id` UUID PK referencing `auth.users.id`
- `full_name` text
- `role` enum: `super_admin`, `admin`, `booking_staff`, `content_editor`
- `created_at`, `updated_at`

### tour_categories
- `id` UUID PK
- `name` text
- `slug` unique text
- `description` text nullable
- `sort_order` integer
- `is_active` boolean

### destinations
- `id` UUID PK
- `name` text
- `slug` unique text
- `short_description` text
- `description` text
- `region` text nullable
- `cover_image` text nullable
- `is_published` boolean

### tours
- `id` UUID PK
- `category_id` FK nullable
- `destination_id` FK nullable
- `name` text
- `slug` unique text
- `short_description` text
- `description` text
- `duration_text` text
- `highlights` jsonb or related child table
- `inclusions` jsonb
- `exclusions` jsonb
- `what_to_bring` jsonb
- `meeting_point` text nullable
- `cover_image` text nullable
- `gallery` jsonb or `tour_images` relation
- `difficulty` text nullable
- `is_published` boolean
- `seo_title`, `seo_description`
- `created_at`, `updated_at`

### tour_images
- `id` UUID PK
- `tour_id` FK
- `storage_path` text
- `alt_text` text
- `sort_order` integer

### market_prices
- `id` UUID PK
- `item_type` enum: `tour`, `package`
- `item_id` UUID
- `market` enum/text: `resident`, `east_african`, `international`
- `customer_type` enum/text: `adult`, `child`, `group` (where applicable)
- `currency` char(3), initially TZS or USD
- `amount` numeric(12,2)
- `is_active` boolean
- unique constraint on item, market, customer type and currency as appropriate

Note: A polymorphic `item_id` has no conventional FK. Claude Code may instead implement separate `tour_prices` and `package_prices` tables for stronger referential integrity. Prefer the normalized approach if it simplifies constraints.

### packages
- `id` UUID PK
- `name` text
- `slug` unique text
- `short_description` text
- `description` text
- `days` integer
- `nights` integer
- `accommodation_description` text
- `transfers_description` text
- `meals_description` text
- `inclusions` jsonb
- `exclusions` jsonb
- `cover_image` text nullable
- `is_published` boolean
- `seo_title`, `seo_description`
- `created_at`, `updated_at`

### package_itinerary_days
- `id` UUID PK
- `package_id` FK
- `day_number` integer
- `title` text
- `description` text
- `meals` text nullable
- `overnight` text nullable
- unique `(package_id, day_number)`

### package_tours
- `package_id` FK
- `tour_id` FK
- `day_number` integer nullable
- composite primary key

### bookings
- `id` UUID PK
- `reference` unique text
- `item_type` enum: `tour`, `package`
- `tour_id` FK nullable
- `package_id` FK nullable
- `customer_name` text
- `email` text
- `phone` text
- `market` text
- `preferred_date` date
- `adults` integer
- `children` integer
- `pickup_location` text nullable
- `message` text nullable
- `currency` char(3)
- `quoted_total` numeric nullable (snapshot, not a live price lookup)
- `status` enum: `pending`, `confirmed`, `rejected`, `cancelled`, `completed`
- `internal_notes` text nullable
- `created_at`, `updated_at`

Ensure exactly one of `tour_id` or `package_id` is set, consistent with `item_type`. Do not expose internal notes publicly.

### blog_posts
- `id` UUID PK
- `title` text
- `slug` unique text
- `excerpt` text
- `body` text or structured content
- `cover_image` text nullable
- `author_profile_id` FK nullable
- `status` enum: `draft`, `published`
- `published_at` timestamptz nullable
- `seo_title`, `seo_description`
- `created_at`, `updated_at`

### testimonials
- `id` UUID PK
- `customer_display_name` text
- `content` text
- `rating` smallint with 1–5 constraint
- `source` text nullable
- `is_approved` boolean default false
- `created_at`

### inquiries
- `id` UUID PK
- `name` text
- `email` text
- `phone` text nullable
- `subject` text nullable
- `message` text
- `status` text
- `created_at`

### site_settings
- key text PK
- value jsonb
- updated_at timestamptz

## Security notes
- Enable RLS on every table.
- Public can select only published tours, destinations, packages and published blog posts.
- Public can insert booking requests and inquiries only with strict validation/rate limiting; public cannot select all bookings.
- Public cannot read profiles, internal notes, customer lists or site settings containing private data.
- Admin permissions are role-based and checked server-side and in RLS.
- Storage buckets: public read for published marketing images; write/delete only for authorized staff.
- Avoid storing payment card data.
- Add indexes for slugs, status, preferred_date, created_at and foreign keys.
