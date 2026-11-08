-- =============================================================================
-- "Design Your Zanzibar Journey": custom trip requests for a personalised
-- quotation. Like booking requests, visitors submit only through a validated
-- SECURITY DEFINER function and can never read the table; booking staff
-- manage them in the admin.
-- =============================================================================

create type public.journey_status as enum ('new', 'in_progress', 'quoted', 'closed');
create type public.accommodation_level as enum (
  'budget', 'mid_range', 'luxury', 'mixed', 'not_sure'
);

create function private.generate_journey_reference()
returns text
language sql
volatile
set search_path = ''
as $$
  -- e.g. JRN-2611-7F3A9C1E, the same shape as booking references.
  select 'JRN-' || to_char(now() at time zone 'Africa/Dar_es_Salaam', 'YYMM') || '-'
    || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
$$;

create table public.journey_requests (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default private.generate_journey_reference(),
  customer_name text not null check (char_length(customer_name) between 2 and 120),
  email text not null check (
    char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  ),
  phone text check (char_length(phone) <= 40),
  country text check (char_length(country) <= 80),
  -- Destination slugs chosen from the published destinations.
  destinations text[] not null default '{}' check (cardinality(destinations) <= 20),
  start_date date,
  end_date date,
  flexible_dates boolean not null default false,
  adults integer not null check (adults between 1 and 50),
  children integer not null default 0 check (children between 0 and 50),
  accommodation public.accommodation_level not null default 'not_sure',
  budget_amount numeric(12, 2) check (budget_amount > 0),
  budget_currency char(3) references public.currencies (code),
  -- Travel styles and tour categories the visitor is interested in.
  interests text[] not null default '{}' check (cardinality(interests) <= 20),
  special_requirements text check (char_length(special_requirements) <= 2000),
  message text check (char_length(message) <= 2000),
  locale text not null default 'en' check (locale ~ '^[a-z]{2}$'),
  status public.journey_status not null default 'new',
  internal_notes text check (char_length(internal_notes) <= 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint journey_dates_ordered check (end_date is null or start_date is null or end_date >= start_date),
  constraint journey_budget_complete check ((budget_amount is null) = (budget_currency is null))
);
create index journey_requests_created_idx on public.journey_requests (created_at desc);
create index journey_requests_status_idx on public.journey_requests (status);

create trigger set_updated_at before update on public.journey_requests
  for each row execute function private.set_updated_at();

alter table public.journey_requests enable row level security;
revoke all on public.journey_requests from anon;

create policy "Booking staff read journey requests"
  on public.journey_requests for select to authenticated
  using ((select private.can_manage_bookings()));
create policy "Booking staff update journey requests"
  on public.journey_requests for update to authenticated
  using ((select private.can_manage_bookings()))
  with check ((select private.can_manage_bookings()));
create policy "Admins delete journey requests"
  on public.journey_requests for delete to authenticated
  using ((select private.is_admin()));

-- The reference and creation time never change.
create function private.protect_journey_identity()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.reference := old.reference;
  new.created_at := old.created_at;
  return new;
end;
$$;

create trigger protect_journey_identity before update on public.journey_requests
  for each row execute function private.protect_journey_identity();

-- -----------------------------------------------------------------------------
-- Public submission.
-- -----------------------------------------------------------------------------
create function public.submit_journey_request(
  p_customer_name text,
  p_email text,
  p_adults integer,
  p_children integer default 0,
  p_phone text default null,
  p_country text default null,
  p_destinations text[] default '{}',
  p_start_date date default null,
  p_end_date date default null,
  p_flexible_dates boolean default false,
  p_accommodation public.accommodation_level default 'not_sure',
  p_budget_amount numeric default null,
  p_budget_currency text default null,
  p_interests text[] default '{}',
  p_special_requirements text default null,
  p_message text default null,
  p_locale text default 'en'
)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_email text := lower(btrim(p_email));
  v_name text := btrim(p_customer_name);
  v_today date := (now() at time zone 'Africa/Dar_es_Salaam')::date;
  v_destinations text[] := coalesce(p_destinations, '{}');
  v_interests text[] := coalesce(p_interests, '{}');
  v_currency text := nullif(upper(btrim(p_budget_currency)), '');
  v_reference text;
begin
  if v_name is null or char_length(v_name) not between 2 and 120 then
    raise exception 'journey_invalid_name';
  end if;
  if v_email is null or char_length(v_email) > 254 or v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'journey_invalid_email';
  end if;
  if p_phone is not null and btrim(p_phone) <> '' and btrim(p_phone) !~ '^\+?[0-9 ()-]{6,40}$' then
    raise exception 'journey_invalid_phone';
  end if;
  if p_adults is null or p_adults not between 1 and 50
     or coalesce(p_children, 0) not between 0 and 50 then
    raise exception 'journey_invalid_party_size';
  end if;
  if (p_start_date is not null and (p_start_date < v_today or p_start_date > v_today + 730))
     or (p_end_date is not null and p_start_date is null)
     or (p_end_date is not null and (p_end_date < p_start_date or p_end_date > p_start_date + 90)) then
    raise exception 'journey_invalid_dates';
  end if;
  if cardinality(v_destinations) > 20 or exists (
    select 1 from unnest(v_destinations) s
    where not exists (
      select 1 from public.destinations d where d.slug = s and d.status = 'published'
    )
  ) then
    raise exception 'journey_invalid_destinations';
  end if;
  if cardinality(v_interests) > 20
     or exists (select 1 from unnest(v_interests) i where i !~ '^[a-z0-9_-]{1,40}$') then
    raise exception 'journey_invalid_interests';
  end if;
  if (p_budget_amount is null) <> (v_currency is null)
     or (p_budget_amount is not null and (p_budget_amount <= 0 or p_budget_amount > 1000000000))
     or (v_currency is not null and not exists (
       select 1 from public.currencies c where c.code = v_currency and c.is_active)) then
    raise exception 'journey_invalid_budget';
  end if;
  if char_length(p_country) > 80 or char_length(p_special_requirements) > 2000
     or char_length(p_message) > 2000 then
    raise exception 'journey_text_too_long';
  end if;

  if (select count(*) from public.journey_requests j
      where lower(j.email) = v_email and j.created_at > now() - interval '1 hour') >= 5
     or (select count(*) from public.journey_requests j
         where j.created_at > now() - interval '10 minutes') >= 100 then
    raise exception 'journey_rate_limited';
  end if;

  insert into public.journey_requests (
    customer_name, email, phone, country, destinations, start_date, end_date,
    flexible_dates, adults, children, accommodation, budget_amount, budget_currency,
    interests, special_requirements, message, locale
  ) values (
    v_name, v_email, nullif(btrim(p_phone), ''), nullif(btrim(p_country), ''),
    (select coalesce(array_agg(distinct s), '{}') from unnest(v_destinations) s),
    p_start_date, p_end_date, coalesce(p_flexible_dates, false), p_adults,
    coalesce(p_children, 0), coalesce(p_accommodation, 'not_sure'), p_budget_amount,
    v_currency,
    (select coalesce(array_agg(distinct i), '{}') from unnest(v_interests) i),
    nullif(btrim(p_special_requirements), ''), nullif(btrim(p_message), ''),
    case when p_locale ~ '^[a-z]{2}$' then p_locale else 'en' end
  )
  returning reference into v_reference;

  return v_reference;
end;
$$;

revoke all on function public.submit_journey_request(
  text, text, integer, integer, text, text, text[], date, date, boolean,
  public.accommodation_level, numeric, text, text[], text, text, text
) from public;
grant execute on function public.submit_journey_request(
  text, text, integer, integer, text, text, text[], date, date, boolean,
  public.accommodation_level, numeric, text, text[], text, text, text
) to anon, authenticated;

revoke all on function private.generate_journey_reference() from public;
grant execute on function private.generate_journey_reference() to authenticated;
revoke all on function private.protect_journey_identity() from public;

-- -----------------------------------------------------------------------------
-- Activity log: staff changes to journey requests are logged like bookings,
-- treating them as personal data (only the status keeps before/after values).
-- -----------------------------------------------------------------------------
create or replace function private.log_row_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  old_row jsonb := case when tg_op <> 'INSERT' then to_jsonb(old) end;
  new_row jsonb := case when tg_op <> 'DELETE' then to_jsonb(new) end;
  r jsonb := coalesce(new_row, old_row);
  personal boolean := tg_table_name in ('bookings', 'inquiries', 'journey_requests');
  fields text[] := '{}';
  changes jsonb := '{}';
  k text;
begin
  if tg_op = 'UPDATE' then
    for k in select jsonb_object_keys(new_row) loop
      continue when k in ('updated_at', 'updated_by', 'published_at');
      if new_row -> k is distinct from old_row -> k then
        fields := fields || k;
        -- Keep short before/after values; long text is recorded as "changed" only.
        if (not personal or k = 'status')
           and length((old_row -> k)::text) <= 200
           and length((new_row -> k)::text) <= 200 then
          changes := changes || jsonb_build_object(
            k, jsonb_build_object('from', old_row -> k, 'to', new_row -> k));
        end if;
      end if;
    end loop;
    if cardinality(fields) = 0 then
      return null;
    end if;
  end if;

  perform private.write_activity(
    case tg_op when 'INSERT' then 'created' when 'UPDATE' then 'updated' else 'deleted' end,
    tg_table_name,
    coalesce(r ->> 'id', r ->> 'key'),
    case
      when tg_table_name = 'inquiries' then nullif(r ->> 'subject', '')
      else coalesce(r ->> 'reference', r ->> 'name', r ->> 'title', r ->> 'full_name', r ->> 'key')
    end,
    fields,
    nullif(changes, '{}'::jsonb)
  );
  return null;
end;
$$;

create trigger log_activity after update or delete on public.journey_requests
  for each row execute function private.log_row_activity();
