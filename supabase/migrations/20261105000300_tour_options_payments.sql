-- =============================================================================
-- Tour options (priced add-ons chosen when booking) and recorded payments.
--
-- * tour_options / tour_option_prices: optional extras per tour, priced per
--   market and currency like tour prices, never converted.
-- * bookings.options: a snapshot of the chosen options at request time.
-- * booking_payments: payments staff have verified (bank transfer, mobile
--   money, ...). Nothing is charged online. A booking can only be marked
--   "paid" once recorded payments cover its quoted total.
-- =============================================================================

create type public.option_pricing as enum ('per_person', 'per_booking');

create table public.tour_options (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  description text check (char_length(description) <= 300),
  pricing public.option_pricing not null default 'per_person',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index tour_options_tour_idx on public.tour_options (tour_id, sort_order);

create table public.tour_option_prices (
  id uuid primary key default gen_random_uuid(),
  option_id uuid not null references public.tour_options (id) on delete cascade,
  market public.market not null,
  currency char(3) not null references public.currencies (code),
  amount numeric(12, 2) not null check (amount >= 0),
  unique (option_id, market, currency)
);

create trigger set_updated_at before update on public.tour_options
  for each row execute function private.set_updated_at();

alter table public.tour_options enable row level security;
alter table public.tour_option_prices enable row level security;

create policy "Visitors read active options of published tours"
  on public.tour_options for select to anon, authenticated
  using (
    (is_active and exists (select 1 from public.tours t where t.id = tour_id and t.status = 'published'))
    or (select private.is_staff())
  );

create policy "Visitors read prices of visible options"
  on public.tour_option_prices for select to anon, authenticated
  using (
    exists (
      select 1 from public.tour_options o join public.tours t on t.id = o.tour_id
      where o.id = option_id and o.is_active and t.status = 'published'
    )
    or (select private.is_staff())
  );

-- Options carry prices, so the same staff who manage prices manage options.
do $$
declare
  t text;
begin
  foreach t in array array['tour_options', 'tour_option_prices'] loop
    execute format(
      'create policy "Price managers insert %1$s" on public.%1$I
         for insert to authenticated with check ((select private.can_manage_prices()))', t);
    execute format(
      'create policy "Price managers update %1$s" on public.%1$I
         for update to authenticated
         using ((select private.can_manage_prices()))
         with check ((select private.can_manage_prices()))', t);
    execute format(
      'create policy "Price managers delete %1$s" on public.%1$I
         for delete to authenticated using ((select private.can_manage_prices()))', t);
  end loop;
end;
$$;

-- Replaces a tour's options and their prices in one step; logs one entry.
create function public.set_tour_options(p_tour_id uuid, p_options jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  o jsonb;
  new_id uuid;
  i integer := 0;
  before_options jsonb;
  after_options jsonb;
begin
  if jsonb_typeof(p_options) <> 'array' or jsonb_array_length(p_options) > 20 then
    raise exception 'options_invalid';
  end if;
  select private.tour_options_snapshot(p_tour_id) into before_options;

  delete from public.tour_options where tour_id = p_tour_id;
  for o in select * from jsonb_array_elements(p_options) loop
    insert into public.tour_options (tour_id, name, description, pricing, sort_order, is_active)
    values (
      p_tour_id, btrim(o ->> 'name'), nullif(btrim(o ->> 'description'), ''),
      coalesce((o ->> 'pricing')::public.option_pricing, 'per_person'), i,
      coalesce((o ->> 'is_active')::boolean, true)
    )
    returning id into new_id;
    insert into public.tour_option_prices (option_id, market, currency, amount)
    select new_id, x.market, upper(x.currency), x.amount
    from jsonb_to_recordset(coalesce(o -> 'prices', '[]')) as x(
      market public.market, currency text, amount numeric);
    i := i + 1;
  end loop;

  select private.tour_options_snapshot(p_tour_id) into after_options;
  if before_options is distinct from after_options then
    perform private.write_activity(
      'updated', 'tour_options', p_tour_id::text,
      (select name from public.tours where id = p_tour_id),
      array['options'],
      jsonb_build_object('before', before_options, 'after', after_options));
  end if;
end;
$$;

create function private.tour_options_snapshot(p_tour_id uuid)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'name', o.name, 'pricing', o.pricing, 'is_active', o.is_active,
    'prices', (select coalesce(jsonb_agg(jsonb_build_object(
                 'market', p.market, 'currency', p.currency, 'amount', p.amount)
                 order by p.market, p.currency), '[]')
               from public.tour_option_prices p where p.option_id = o.id))
    order by o.sort_order), '[]')
  from public.tour_options o where o.tour_id = p_tour_id;
$$;

revoke all on function public.set_tour_options(uuid, jsonb) from public, anon;
grant execute on function public.set_tour_options(uuid, jsonb) to authenticated;
revoke all on function private.tour_options_snapshot(uuid) from public;
grant execute on function private.tour_options_snapshot(uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- Bookings: chosen options are stored as a snapshot, so later price or name
-- changes never alter what the customer asked for.
-- -----------------------------------------------------------------------------
alter table public.bookings
  add column options jsonb not null default '[]'
    check (jsonb_typeof(options) = 'array' and jsonb_array_length(options) <= 20);

drop function public.submit_booking_request(
  public.booking_item_type, text, text, text, text, public.market, text, date,
  integer, integer, text, text
);

create function public.submit_booking_request(
  p_item_type public.booking_item_type,
  p_item_slug text,
  p_customer_name text,
  p_email text,
  p_phone text,
  p_market public.market,
  p_currency text,
  p_preferred_date date,
  p_adults integer,
  p_children integer default 0,
  p_pickup_location text default null,
  p_message text default null,
  p_option_ids uuid[] default '{}'
)
returns table (reference text, status public.booking_status)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_tour_id uuid;
  v_package_id uuid;
  v_email text := lower(btrim(p_email));
  v_name text := btrim(p_customer_name);
  v_phone text := btrim(p_phone);
  v_currency text := upper(btrim(p_currency));
  v_children integer := coalesce(p_children, 0);
  v_option_ids uuid[] := coalesce(p_option_ids, '{}');
  v_adult_price numeric;
  v_child_price numeric;
  v_quoted numeric;
  v_options jsonb := '[]';
  v_options_total numeric := 0;
  v_unpriced_options boolean := false;
  v_booking public.bookings;
begin
  -- Input validation -------------------------------------------------------
  if v_name is null or char_length(v_name) not between 2 and 120 then
    raise exception 'booking_invalid_name';
  end if;
  if v_email is null or char_length(v_email) > 254 or v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'booking_invalid_email';
  end if;
  if v_phone is null or v_phone !~ '^\+?[0-9 ()-]{6,40}$' then
    raise exception 'booking_invalid_phone';
  end if;
  if p_adults is null or p_adults not between 1 and 50 then
    raise exception 'booking_invalid_party_size';
  end if;
  if v_children not between 0 and 50 then
    raise exception 'booking_invalid_party_size';
  end if;
  if p_preferred_date is null
     or p_preferred_date < (now() at time zone 'Africa/Dar_es_Salaam')::date
     or p_preferred_date > (now() at time zone 'Africa/Dar_es_Salaam')::date + 730 then
    raise exception 'booking_invalid_date';
  end if;
  if char_length(p_pickup_location) > 300 or char_length(p_message) > 2000 then
    raise exception 'booking_text_too_long';
  end if;
  if not exists (select 1 from public.currencies c where c.code = v_currency and c.is_active) then
    raise exception 'booking_invalid_currency';
  end if;
  if cardinality(v_option_ids) > 20 then
    raise exception 'booking_invalid_options';
  end if;

  -- The item must exist and be published ---------------------------------
  if p_item_type = 'tour' then
    select t.id into v_tour_id from public.tours t
    where t.slug = p_item_slug and t.status = 'published';
    if v_tour_id is null then
      raise exception 'booking_item_unavailable';
    end if;
    select max(tp.amount) filter (where tp.customer_type = 'adult'),
           max(tp.amount) filter (where tp.customer_type = 'child')
      into v_adult_price, v_child_price
    from public.tour_prices tp
    where tp.tour_id = v_tour_id and tp.market = p_market
      and tp.currency = v_currency and tp.is_active;

    -- Every chosen option must be an active option of this tour.
    if cardinality(v_option_ids) > 0 then
      if (select count(*) from public.tour_options o
          where o.id = any (v_option_ids) and o.tour_id = v_tour_id and o.is_active)
         <> (select count(distinct x) from unnest(v_option_ids) x) then
        raise exception 'booking_invalid_options';
      end if;
      select
        coalesce(jsonb_agg(jsonb_build_object(
          'name', o.name, 'pricing', o.pricing, 'amount', p.amount,
          'total', case when p.amount is null then null
                        when o.pricing = 'per_booking' then p.amount
                        else p.amount * (p_adults + v_children) end)
          order by o.sort_order), '[]'),
        coalesce(sum(case when o.pricing = 'per_booking' then p.amount
                          else p.amount * (p_adults + v_children) end), 0),
        bool_or(p.amount is null)
        into v_options, v_options_total, v_unpriced_options
      from public.tour_options o
      left join public.tour_option_prices p
        on p.option_id = o.id and p.market = p_market and p.currency = v_currency
      where o.id = any (v_option_ids);
    end if;
  else
    if cardinality(v_option_ids) > 0 then
      raise exception 'booking_invalid_options';
    end if;
    select p.id into v_package_id from public.packages p
    where p.slug = p_item_slug and p.status = 'published';
    if v_package_id is null then
      raise exception 'booking_item_unavailable';
    end if;
    select max(pp.amount) filter (where pp.customer_type = 'adult'),
           max(pp.amount) filter (where pp.customer_type = 'child')
      into v_adult_price, v_child_price
    from public.package_prices pp
    where pp.package_id = v_package_id and pp.market = p_market
      and pp.currency = v_currency and pp.is_active;
  end if;

  -- Basic rate limiting -----------------------------------------------------
  if (select count(*) from public.bookings b
      where lower(b.email) = v_email and b.created_at > now() - interval '1 hour') >= 5 then
    raise exception 'booking_rate_limited';
  end if;
  if (select count(*) from public.bookings b
      where b.created_at > now() - interval '10 minutes') >= 100 then
    raise exception 'booking_rate_limited';
  end if;

  -- Quote snapshot: only when every traveller and every option has a price --
  if v_adult_price is not null and (v_children = 0 or v_child_price is not null)
     and not coalesce(v_unpriced_options, false) then
    v_quoted := v_adult_price * p_adults + coalesce(v_child_price, 0) * v_children
                + v_options_total;
  end if;

  insert into public.bookings (
    item_type, tour_id, package_id, customer_name, email, phone, market,
    preferred_date, adults, children, pickup_location, message, currency,
    quoted_total, options, status, source
  ) values (
    p_item_type, v_tour_id, v_package_id, v_name, v_email, v_phone, p_market,
    p_preferred_date, p_adults, v_children, nullif(btrim(p_pickup_location), ''),
    nullif(btrim(p_message), ''), v_currency, v_quoted, v_options, 'pending', 'website'
  )
  returning * into v_booking;

  return query select v_booking.reference, v_booking.status;
end;
$$;

revoke all on function public.submit_booking_request(
  public.booking_item_type, text, text, text, text, public.market, text, date,
  integer, integer, text, text, uuid[]
) from public;
grant execute on function public.submit_booking_request(
  public.booking_item_type, text, text, text, text, public.market, text, date,
  integer, integer, text, text, uuid[]
) to anon, authenticated;

-- -----------------------------------------------------------------------------
-- Payments recorded by staff after they have verified them.
-- -----------------------------------------------------------------------------
create type public.payment_method as enum (
  'bank_transfer', 'mobile_money', 'card', 'cash', 'other'
);

create table public.booking_payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  currency char(3) not null references public.currencies (code),
  method public.payment_method not null,
  reference text check (char_length(reference) <= 120),
  paid_on date not null,
  notes text check (char_length(notes) <= 1000),
  recorded_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);
create index booking_payments_booking_idx on public.booking_payments (booking_id, paid_on);

alter table public.booking_payments enable row level security;

create policy "Booking staff read payments"
  on public.booking_payments for select to authenticated
  using ((select private.can_manage_bookings()));
create policy "Booking staff record payments"
  on public.booking_payments for insert to authenticated
  with check ((select private.can_manage_bookings()));
-- Corrections are deletions by admins; payments are never edited in place.
create policy "Admins delete payments"
  on public.booking_payments for delete to authenticated
  using ((select private.is_admin()));

-- Who recorded a payment is always the signed-in user.
create function private.stamp_payment_recorder()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.recorded_by := (select auth.uid());
  new.created_at := now();
  return new;
end;
$$;

create trigger stamp_payment_recorder before insert on public.booking_payments
  for each row execute function private.stamp_payment_recorder();

create trigger log_activity after insert or delete on public.booking_payments
  for each row execute function private.log_row_activity();

/** Total recorded payments for a booking, in the booking's own currency. */
create function private.booking_paid_total(p_booking_id uuid)
returns numeric
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(sum(p.amount), 0)
  from public.booking_payments p
  join public.bookings b on b.id = p.booking_id
  where p.booking_id = p_booking_id and p.currency = b.currency;
$$;

-- "Paid" only when recorded payments cover the quote (or, without a quote,
-- at least one payment in the booking's currency has been recorded).
create function private.require_payment_for_paid()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  paid numeric;
begin
  if new.status = 'paid' and old.status is distinct from 'paid' then
    paid := private.booking_paid_total(new.id);
    if paid <= 0 or (new.quoted_total is not null and paid < new.quoted_total) then
      raise exception 'booking_payment_required';
    end if;
  end if;
  return new;
end;
$$;

create trigger require_payment_for_paid before update of status on public.bookings
  for each row execute function private.require_payment_for_paid();

revoke all on function private.stamp_payment_recorder() from public;
revoke all on function private.require_payment_for_paid() from public;
revoke all on function private.booking_paid_total(uuid) from public;
grant execute on function private.booking_paid_total(uuid) to authenticated;
