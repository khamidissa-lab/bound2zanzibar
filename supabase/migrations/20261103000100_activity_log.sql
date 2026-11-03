-- =============================================================================
-- BOUND TO ZANZIBAR — staff activity log
--
-- An append-only record of what staff change in the admin: content, prices,
-- bookings, enquiries, settings and staff accounts, plus sign-ins, sign-outs,
-- password changes and booking exports.
--
-- Rows are written by database triggers and SECURITY DEFINER functions, so the
-- app cannot skip or forge them. Only admins and super admins can read the log;
-- nobody can change or delete entries through the API.
--
-- Personal data is kept out on purpose: for bookings and enquiries only the
-- names of changed fields (and status values) are stored, never customer
-- details or notes.
-- =============================================================================

create table public.activity_log (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  actor_id uuid references auth.users (id) on delete set null,
  -- Snapshot so entries stay readable after a staff account is removed.
  actor_name text,
  actor_role public.staff_role,
  action text not null check (
    action in (
      'created', 'updated', 'deleted',
      'signed_in', 'signed_out', 'password_changed', 'bookings_exported'
    )
  ),
  entity text not null check (entity ~ '^[a-z_]+$'),
  entity_id text,
  entity_label text check (char_length(entity_label) <= 200),
  changed_fields text[] not null default '{}',
  details jsonb check (details is null or jsonb_typeof(details) = 'object')
);

create index activity_log_occurred_at_idx on public.activity_log (occurred_at desc);
create index activity_log_entity_idx on public.activity_log (entity, occurred_at desc);
create index activity_log_actor_idx on public.activity_log (actor_id, occurred_at desc);

alter table public.activity_log enable row level security;

create policy "Admins read the activity log"
  on public.activity_log for select to authenticated
  using ((select private.is_admin()));
-- No insert/update/delete policies, and no table privileges either.
revoke insert, update, delete, truncate on public.activity_log from anon, authenticated;

-- Entries are never edited, not even by the table owner.
create function private.activity_log_append_only()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'activity_log_is_append_only';
end;
$$;

create trigger activity_log_append_only before update on public.activity_log
  for each row execute function private.activity_log_append_only();

-- -----------------------------------------------------------------------------
-- Writer. Logs only signed-in users and server (service-role) calls, so seeds,
-- migrations and visitors' booking requests do not fill the log.
-- -----------------------------------------------------------------------------
create function private.write_activity(
  p_action text,
  p_entity text,
  p_entity_id text,
  p_label text,
  p_fields text[] default '{}',
  p_details jsonb default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  jwt_role text := nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role';
begin
  if uid is null and jwt_role is distinct from 'service_role' then
    return;
  end if;

  insert into public.activity_log
    (actor_id, actor_name, actor_role, action, entity, entity_id, entity_label,
     changed_fields, details)
  select uid, p.full_name, p.role, p_action, p_entity, p_entity_id, left(p_label, 200),
         coalesce(p_fields, '{}'), p_details
  from (select 1) as one
  left join public.profiles p on p.id = uid;
end;
$$;

revoke all on function private.write_activity(text, text, text, text, text[], jsonb) from public, anon;
-- Called by the SECURITY INVOKER admin helpers below, which run as the caller.
grant execute on function private.write_activity(text, text, text, text, text[], jsonb) to authenticated;

-- -----------------------------------------------------------------------------
-- Row changes on the main admin tables.
-- -----------------------------------------------------------------------------
create function private.log_row_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  old_row jsonb := case when tg_op <> 'INSERT' then to_jsonb(old) end;
  new_row jsonb := case when tg_op <> 'DELETE' then to_jsonb(new) end;
  r jsonb := coalesce(new_row, old_row);
  personal boolean := tg_table_name in ('bookings', 'inquiries');
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

do $$
declare
  t text;
begin
  foreach t in array array[
    'tours', 'packages', 'destinations', 'tour_categories', 'blog_posts',
    'testimonials', 'site_settings', 'profiles'
  ] loop
    execute format(
      'create trigger log_activity after insert or update or delete on public.%I
         for each row execute function private.log_row_activity()', t);
  end loop;
  -- Visitors create bookings and enquiries; only staff changes are logged.
  foreach t in array array['bookings', 'inquiries'] loop
    execute format(
      'create trigger log_activity after update or delete on public.%I
         for each row execute function private.log_row_activity()', t);
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- The "replace the set" helpers delete and re-insert rows. Log each save once,
-- and only when something actually changed. Prices keep before/after values.
-- -----------------------------------------------------------------------------
create or replace function public.set_tour_prices(p_tour_id uuid, p_prices jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  before_prices jsonb;
  after_prices jsonb;
begin
  if jsonb_typeof(p_prices) <> 'array' then
    raise exception 'prices_must_be_array';
  end if;
  select coalesce(jsonb_agg(jsonb_build_object(
           'market', market, 'customer_type', customer_type, 'currency', currency,
           'amount', amount, 'is_active', is_active)
           order by market, customer_type, currency), '[]')
    into before_prices
    from public.tour_prices where tour_id = p_tour_id;

  delete from public.tour_prices where tour_id = p_tour_id;
  insert into public.tour_prices
    (tour_id, market, customer_type, currency, amount, unit_label, is_illustrative, is_active)
  select p_tour_id, x.market, x.customer_type, upper(x.currency), x.amount,
         coalesce(nullif(btrim(x.unit_label), ''), 'per person'),
         coalesce(x.is_illustrative, true), coalesce(x.is_active, true)
  from jsonb_to_recordset(p_prices) as x(
    market public.market, customer_type public.customer_type, currency text,
    amount numeric, unit_label text, is_illustrative boolean, is_active boolean);

  select coalesce(jsonb_agg(jsonb_build_object(
           'market', market, 'customer_type', customer_type, 'currency', currency,
           'amount', amount, 'is_active', is_active)
           order by market, customer_type, currency), '[]')
    into after_prices
    from public.tour_prices where tour_id = p_tour_id;

  if before_prices is distinct from after_prices then
    perform private.write_activity(
      'updated', 'tour_prices', p_tour_id::text,
      (select name from public.tours where id = p_tour_id),
      array['prices'],
      jsonb_build_object('before', before_prices, 'after', after_prices));
  end if;
end;
$$;

create or replace function public.set_package_prices(p_package_id uuid, p_prices jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  before_prices jsonb;
  after_prices jsonb;
begin
  if jsonb_typeof(p_prices) <> 'array' then
    raise exception 'prices_must_be_array';
  end if;
  select coalesce(jsonb_agg(jsonb_build_object(
           'market', market, 'customer_type', customer_type, 'currency', currency,
           'amount', amount, 'is_active', is_active)
           order by market, customer_type, currency), '[]')
    into before_prices
    from public.package_prices where package_id = p_package_id;

  delete from public.package_prices where package_id = p_package_id;
  insert into public.package_prices
    (package_id, market, customer_type, currency, amount, unit_label, is_illustrative, is_active)
  select p_package_id, x.market, x.customer_type, upper(x.currency), x.amount,
         coalesce(nullif(btrim(x.unit_label), ''), 'per person sharing'),
         coalesce(x.is_illustrative, true), coalesce(x.is_active, true)
  from jsonb_to_recordset(p_prices) as x(
    market public.market, customer_type public.customer_type, currency text,
    amount numeric, unit_label text, is_illustrative boolean, is_active boolean);

  select coalesce(jsonb_agg(jsonb_build_object(
           'market', market, 'customer_type', customer_type, 'currency', currency,
           'amount', amount, 'is_active', is_active)
           order by market, customer_type, currency), '[]')
    into after_prices
    from public.package_prices where package_id = p_package_id;

  if before_prices is distinct from after_prices then
    perform private.write_activity(
      'updated', 'package_prices', p_package_id::text,
      (select name from public.packages where id = p_package_id),
      array['prices'],
      jsonb_build_object('before', before_prices, 'after', after_prices));
  end if;
end;
$$;

create or replace function public.set_package_details(
  p_package_id uuid,
  p_itinerary jsonb,
  p_tour_ids uuid[],
  p_destination_ids uuid[]
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  before_details jsonb;
  after_details jsonb;
begin
  if jsonb_typeof(p_itinerary) <> 'array' then
    raise exception 'itinerary_must_be_array';
  end if;

  select jsonb_build_object(
    'itinerary', (select coalesce(jsonb_agg(to_jsonb(d) - 'id' - 'created_at' - 'updated_at'
                    order by d.day_number), '[]')
                  from public.package_itinerary_days d where d.package_id = p_package_id),
    'tours', (select coalesce(jsonb_agg(t.tour_id order by t.tour_id), '[]')
              from public.package_tours t where t.package_id = p_package_id),
    'destinations', (select coalesce(jsonb_agg(pd.destination_id order by pd.sort_order), '[]')
                     from public.package_destinations pd where pd.package_id = p_package_id))
    into before_details;

  delete from public.package_itinerary_days where package_id = p_package_id;
  insert into public.package_itinerary_days (package_id, day_number, title, description, meals, overnight)
  select p_package_id, x.day_number, x.title, coalesce(x.description, ''),
         coalesce(x.meals, '{}'), nullif(btrim(x.overnight), '')
  from jsonb_to_recordset(p_itinerary) as x(
    day_number integer, title text, description text, meals text[], overnight text);

  delete from public.package_tours where package_id = p_package_id;
  insert into public.package_tours (package_id, tour_id)
  select p_package_id, t from unnest(coalesce(p_tour_ids, '{}')) as t;

  delete from public.package_destinations where package_id = p_package_id;
  insert into public.package_destinations (package_id, destination_id, sort_order)
  select p_package_id, d, ord - 1
  from unnest(coalesce(p_destination_ids, '{}')) with ordinality as u(d, ord);

  select jsonb_build_object(
    'itinerary', (select coalesce(jsonb_agg(to_jsonb(d) - 'id' - 'created_at' - 'updated_at'
                    order by d.day_number), '[]')
                  from public.package_itinerary_days d where d.package_id = p_package_id),
    'tours', (select coalesce(jsonb_agg(t.tour_id order by t.tour_id), '[]')
              from public.package_tours t where t.package_id = p_package_id),
    'destinations', (select coalesce(jsonb_agg(pd.destination_id order by pd.sort_order), '[]')
                     from public.package_destinations pd where pd.package_id = p_package_id))
    into after_details;

  if before_details is distinct from after_details then
    perform private.write_activity(
      'updated', 'packages', p_package_id::text,
      (select name from public.packages where id = p_package_id),
      array(select k from jsonb_object_keys(after_details) as k
            where before_details -> k is distinct from after_details -> k order by k));
  end if;
end;
$$;

create or replace function public.set_tour_gallery(p_tour_id uuid, p_images jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  before_images jsonb;
  after_images jsonb;
begin
  if jsonb_typeof(p_images) <> 'array' then
    raise exception 'images_must_be_array';
  end if;
  select coalesce(jsonb_agg(jsonb_build_array(storage_path, alt_text) order by sort_order), '[]')
    into before_images from public.tour_images where tour_id = p_tour_id;

  delete from public.tour_images where tour_id = p_tour_id;
  insert into public.tour_images (tour_id, storage_path, alt_text, sort_order)
  select p_tour_id, x.storage_path, x.alt_text, (ord - 1)::integer
  from rows from (jsonb_to_recordset(p_images) as (storage_path text, alt_text text))
    with ordinality as x(storage_path, alt_text, ord);

  select coalesce(jsonb_agg(jsonb_build_array(storage_path, alt_text) order by sort_order), '[]')
    into after_images from public.tour_images where tour_id = p_tour_id;

  if before_images is distinct from after_images then
    perform private.write_activity(
      'updated', 'tours', p_tour_id::text,
      (select name from public.tours where id = p_tour_id),
      array['gallery']);
  end if;
end;
$$;

-- -----------------------------------------------------------------------------
-- Events the database cannot see on its own (called by the app's server code
-- with the staff member's session).
-- -----------------------------------------------------------------------------
create function public.log_staff_event(p_action text, p_details jsonb default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not (select private.is_staff()) then
    raise exception 'not_staff' using errcode = '42501';
  end if;
  if p_action not in ('signed_in', 'signed_out', 'password_changed', 'bookings_exported') then
    raise exception 'invalid_action';
  end if;
  if p_details is not null
     and (jsonb_typeof(p_details) <> 'object' or length(p_details::text) > 1000) then
    raise exception 'invalid_details';
  end if;

  perform private.write_activity(
    p_action,
    case when p_action = 'bookings_exported' then 'bookings' else 'account' end,
    (select auth.uid())::text,
    null,
    '{}',
    p_details);
end;
$$;

revoke all on function public.log_staff_event(text, jsonb) from public, anon;
grant execute on function public.log_staff_event(text, jsonb) to authenticated;
