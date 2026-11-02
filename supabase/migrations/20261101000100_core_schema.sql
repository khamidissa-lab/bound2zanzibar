-- =============================================================================
-- BOUND TO ZANZIBAR — core schema
-- Tables, enums, constraints and indexes. Row Level Security is enabled and
-- policies are defined in the next migration.
-- =============================================================================

-- Internal helpers live in `private`, which is NOT exposed through the
-- Supabase Data API (only `public` is), so they cannot be called over HTTP.
create schema if not exists private;

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
create type public.staff_role as enum ('super_admin', 'admin', 'booking_staff', 'content_editor');
create type public.publish_status as enum ('draft', 'published', 'archived');
create type public.market as enum ('resident', 'east_african', 'international');
create type public.customer_type as enum ('adult', 'child', 'group');
create type public.difficulty_level as enum ('easy', 'moderate', 'challenging');
create type public.destination_region as enum ('zanzibar', 'mainland');
create type public.booking_item_type as enum ('tour', 'package');
create type public.booking_status as enum ('pending', 'confirmed', 'rejected', 'cancelled', 'completed');
create type public.inquiry_status as enum ('new', 'in_progress', 'closed');

-- -----------------------------------------------------------------------------
-- Shared trigger: maintain updated_at
-- -----------------------------------------------------------------------------
create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Staff profiles (one per staff auth user; customers do not have accounts)
-- -----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (char_length(full_name) between 1 and 120),
  role public.staff_role not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Reference data
-- -----------------------------------------------------------------------------
create table public.currencies (
  code char(3) primary key check (code ~ '^[A-Z]{3}$'),
  name text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0
);

-- Initial supported currencies (reference data, not sample content).
insert into public.currencies (code, name, sort_order) values
  ('USD', 'US dollar', 1),
  ('TZS', 'Tanzanian shilling', 2);

create table public.tour_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Destinations
-- -----------------------------------------------------------------------------
create table public.destinations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  region public.destination_region not null,
  short_description text not null default '',
  -- Paragraphs separated by a blank line.
  description text not null default '',
  highlights text[] not null default '{}',
  cover_image_path text,
  cover_image_alt text,
  is_featured boolean not null default false,
  status public.publish_status not null default 'draft',
  published_at timestamptz,
  seo_title text check (char_length(seo_title) <= 70),
  seo_description text check (char_length(seo_description) <= 170),
  is_sample boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index destinations_status_idx on public.destinations (status);

-- -----------------------------------------------------------------------------
-- Tours / experiences
-- -----------------------------------------------------------------------------
create table public.tours (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.tour_categories (id) on delete set null,
  destination_id uuid references public.destinations (id) on delete set null,
  name text not null check (char_length(name) between 1 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  short_description text not null default '',
  -- Paragraphs separated by a blank line.
  description text not null default '',
  duration_text text not null default '',
  highlights text[] not null default '{}',
  inclusions text[] not null default '{}',
  exclusions text[] not null default '{}',
  what_to_bring text[] not null default '{}',
  meeting_point text,
  difficulty public.difficulty_level,
  suitability text,
  cover_image_path text,
  cover_image_alt text,
  is_featured boolean not null default false,
  status public.publish_status not null default 'draft',
  published_at timestamptz,
  seo_title text check (char_length(seo_title) <= 70),
  seo_description text check (char_length(seo_description) <= 170),
  is_sample boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tours_status_idx on public.tours (status);
create index tours_category_id_idx on public.tours (category_id);
create index tours_destination_id_idx on public.tours (destination_id);

create table public.tour_images (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours (id) on delete cascade,
  storage_path text not null,
  alt_text text not null check (char_length(alt_text) between 1 and 200),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index tour_images_tour_id_idx on public.tour_images (tour_id);

-- -----------------------------------------------------------------------------
-- Packages (multi-day trips)
-- -----------------------------------------------------------------------------
create table public.packages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  short_description text not null default '',
  description text not null default '',
  days integer not null check (days between 1 and 60),
  nights integer not null check (nights >= 0),
  accommodation_description text not null default '',
  transfers_description text not null default '',
  meals_description text not null default '',
  inclusions text[] not null default '{}',
  exclusions text[] not null default '{}',
  terms text[] not null default '{}',
  is_safari boolean not null default false,
  is_featured boolean not null default false,
  cover_image_path text,
  cover_image_alt text,
  status public.publish_status not null default 'draft',
  published_at timestamptz,
  seo_title text check (char_length(seo_title) <= 70),
  seo_description text check (char_length(seo_description) <= 170),
  is_sample boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint packages_nights_le_days check (nights <= days)
);

create index packages_status_idx on public.packages (status);

create table public.package_itinerary_days (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.packages (id) on delete cascade,
  day_number integer not null check (day_number >= 1),
  title text not null check (char_length(title) between 1 and 160),
  description text not null default '',
  meals text[] not null default '{}',
  overnight text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (package_id, day_number)
);

create table public.package_tours (
  package_id uuid not null references public.packages (id) on delete cascade,
  tour_id uuid not null references public.tours (id) on delete cascade,
  day_number integer check (day_number >= 1),
  primary key (package_id, tour_id)
);

create index package_tours_tour_id_idx on public.package_tours (tour_id);

create table public.package_destinations (
  package_id uuid not null references public.packages (id) on delete cascade,
  destination_id uuid not null references public.destinations (id) on delete cascade,
  sort_order integer not null default 0,
  primary key (package_id, destination_id)
);

create index package_destinations_destination_id_idx on public.package_destinations (destination_id);

-- -----------------------------------------------------------------------------
-- Market prices. Separate tables (rather than a polymorphic item_id) so every
-- price has a real foreign key. Prices are native per currency: the database
-- never converts between currencies.
-- -----------------------------------------------------------------------------
create table public.tour_prices (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours (id) on delete cascade,
  market public.market not null,
  customer_type public.customer_type not null,
  currency char(3) not null references public.currencies (code),
  amount numeric(12, 2) not null check (amount >= 0),
  unit_label text not null default 'per person',
  is_illustrative boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tour_id, market, customer_type, currency)
);

create table public.package_prices (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.packages (id) on delete cascade,
  market public.market not null,
  customer_type public.customer_type not null,
  currency char(3) not null references public.currencies (code),
  amount numeric(12, 2) not null check (amount >= 0),
  unit_label text not null default 'per person sharing',
  is_illustrative boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (package_id, market, customer_type, currency)
);

create index package_prices_package_id_idx on public.package_prices (package_id);

-- -----------------------------------------------------------------------------
-- Booking requests. A row is a REQUEST until staff confirm it.
-- -----------------------------------------------------------------------------
create function private.generate_booking_reference()
returns text
language sql
volatile
set search_path = ''
as $$
  -- e.g. BTZ-2611-7F3A9C1E. Not a secret: nothing is retrievable by reference
  -- without staff access.
  select 'BTZ-' || to_char(now() at time zone 'Africa/Dar_es_Salaam', 'YYMM') || '-'
    || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
$$;

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default private.generate_booking_reference(),
  item_type public.booking_item_type not null,
  tour_id uuid references public.tours (id) on delete restrict,
  package_id uuid references public.packages (id) on delete restrict,
  customer_name text not null check (char_length(customer_name) between 2 and 120),
  email text not null check (
    char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  ),
  phone text not null check (char_length(phone) between 6 and 40),
  market public.market not null,
  preferred_date date not null,
  adults integer not null check (adults between 1 and 100),
  children integer not null default 0 check (children between 0 and 100),
  pickup_location text check (char_length(pickup_location) <= 300),
  message text check (char_length(message) <= 2000),
  currency char(3) not null references public.currencies (code),
  -- Snapshot at submission time; never recalculated from live prices.
  quoted_total numeric(12, 2) check (quoted_total >= 0),
  status public.booking_status not null default 'pending',
  -- Staff-only. Never exposed publicly (bookings have no public read access).
  internal_notes text check (char_length(internal_notes) <= 5000),
  source text not null default 'website',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_item_matches_type check (
    (item_type = 'tour' and tour_id is not null and package_id is null)
    or (item_type = 'package' and package_id is not null and tour_id is null)
  )
);

create index bookings_status_idx on public.bookings (status);
create index bookings_preferred_date_idx on public.bookings (preferred_date);
create index bookings_created_at_idx on public.bookings (created_at desc);
create index bookings_tour_id_idx on public.bookings (tour_id);
create index bookings_package_id_idx on public.bookings (package_id);
create index bookings_email_created_idx on public.bookings (lower(email), created_at desc);

-- Audit trail of status changes (written by trigger, read by booking staff).
create table public.booking_status_events (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  from_status public.booking_status,
  to_status public.booking_status not null,
  changed_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index booking_status_events_booking_id_idx on public.booking_status_events (booking_id);

-- -----------------------------------------------------------------------------
-- Travel guide / blog
-- -----------------------------------------------------------------------------
create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 200),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  excerpt text not null default '',
  -- Structured body: [{ "heading": string, "paragraphs": string[] }, ...]
  body jsonb not null default '[]' check (jsonb_typeof(body) = 'array'),
  tags text[] not null default '{}',
  reading_minutes integer check (reading_minutes between 1 and 120),
  cover_image_path text,
  cover_image_alt text,
  author_profile_id uuid references public.profiles (id) on delete set null,
  status public.publish_status not null default 'draft',
  published_at timestamptz,
  seo_title text check (char_length(seo_title) <= 70),
  seo_description text check (char_length(seo_description) <= 170),
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index blog_posts_status_published_idx on public.blog_posts (status, published_at desc);

-- -----------------------------------------------------------------------------
-- Testimonials (moderated; only approved, genuine reviews are public)
-- -----------------------------------------------------------------------------
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  customer_display_name text not null check (char_length(customer_display_name) between 1 and 80),
  content text not null check (char_length(content) between 1 and 2000),
  rating smallint check (rating between 1 and 5),
  source text,
  is_approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- General enquiries (contact form)
-- -----------------------------------------------------------------------------
create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (
    char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  ),
  phone text check (char_length(phone) <= 40),
  subject text check (char_length(subject) <= 200),
  message text not null check (char_length(message) between 1 and 4000),
  status public.inquiry_status not null default 'new',
  internal_notes text check (char_length(internal_notes) <= 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index inquiries_status_created_idx on public.inquiries (status, created_at desc);
create index inquiries_email_created_idx on public.inquiries (lower(email), created_at desc);

-- -----------------------------------------------------------------------------
-- Site settings (contact details, social links, display options).
-- Only rows flagged is_public are readable by visitors.
-- -----------------------------------------------------------------------------
create table public.site_settings (
  key text primary key check (key ~ '^[a-z0-9_.]+$'),
  value jsonb not null,
  is_public boolean not null default false,
  description text,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

-- -----------------------------------------------------------------------------
-- updated_at triggers
-- -----------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'tour_categories', 'destinations', 'tours', 'packages',
    'package_itinerary_days', 'tour_prices', 'package_prices', 'bookings',
    'blog_posts', 'testimonials', 'inquiries', 'site_settings'
  ] loop
    execute format(
      'create trigger set_updated_at before update on public.%I
         for each row execute function private.set_updated_at()', t);
  end loop;
end;
$$;
