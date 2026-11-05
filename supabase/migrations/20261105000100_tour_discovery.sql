-- =============================================================================
-- Tour discovery: filterable trip length and travel styles.
--
-- `length` is a coarse bucket for filtering; `duration_text` keeps the exact
-- wording shown to visitors. It is nullable so staff can leave it unset
-- (such tours are only hidden when a visitor filters by length).
-- =============================================================================

create type public.tour_length as enum ('hours', 'half_day', 'full_day', 'multi_day');

-- One shared list so tours and packages accept exactly the same styles.
create function private.valid_travel_styles(styles text[])
returns boolean
language sql
immutable
set search_path = ''
as $$
  select styles <@ array['luxury', 'adventure', 'romantic', 'family', 'cultural', 'relaxation', 'wildlife']::text[]
    and cardinality(styles) = cardinality(array(select distinct unnest(styles)));
$$;

alter table public.tours
  add column length public.tour_length,
  add column travel_styles text[] not null default '{}'
    constraint tours_travel_styles_valid check (private.valid_travel_styles(travel_styles));

alter table public.packages
  add column travel_styles text[] not null default '{}'
    constraint packages_travel_styles_valid check (private.valid_travel_styles(travel_styles));

create index tours_travel_styles_idx on public.tours using gin (travel_styles);
