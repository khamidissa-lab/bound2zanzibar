-- =============================================================================
-- BOUND TO ZANZIBAR — public submission functions
--
-- Visitors have NO direct table access to bookings or enquiries. They call
-- these SECURITY DEFINER functions, which validate input, apply basic rate
-- limits and return only what the visitor needs (a reference number).
-- The website also validates with Zod before calling them (Phase 6); these
-- checks are the last line of defence.
--
-- Errors are raised with stable message keys (e.g. 'booking_rate_limited')
-- that the app maps to friendly text. They never contain other users' data.
-- =============================================================================

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
  p_message text default null
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
  v_adult_price numeric;
  v_child_price numeric;
  v_quoted numeric;
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
  else
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

  -- Quote snapshot: only when every traveller has a configured price --------
  if v_adult_price is not null and (v_children = 0 or v_child_price is not null) then
    v_quoted := v_adult_price * p_adults + coalesce(v_child_price, 0) * v_children;
  end if;

  insert into public.bookings (
    item_type, tour_id, package_id, customer_name, email, phone, market,
    preferred_date, adults, children, pickup_location, message, currency,
    quoted_total, status, source
  ) values (
    p_item_type, v_tour_id, v_package_id, v_name, v_email, v_phone, p_market,
    p_preferred_date, p_adults, v_children, nullif(btrim(p_pickup_location), ''),
    nullif(btrim(p_message), ''), v_currency, v_quoted, 'pending', 'website'
  )
  returning * into v_booking;

  return query select v_booking.reference, v_booking.status;
end;
$$;

create function public.submit_inquiry(
  p_name text,
  p_email text,
  p_message text,
  p_phone text default null,
  p_subject text default null
)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_email text := lower(btrim(p_email));
begin
  if p_name is null or char_length(btrim(p_name)) not between 2 and 120 then
    raise exception 'inquiry_invalid_name';
  end if;
  if v_email is null or char_length(v_email) > 254 or v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'inquiry_invalid_email';
  end if;
  if p_message is null or char_length(btrim(p_message)) not between 1 and 4000 then
    raise exception 'inquiry_invalid_message';
  end if;
  if char_length(p_phone) > 40 or char_length(p_subject) > 200 then
    raise exception 'inquiry_text_too_long';
  end if;
  if (select count(*) from public.inquiries i
      where lower(i.email) = v_email and i.created_at > now() - interval '1 hour') >= 5 then
    raise exception 'inquiry_rate_limited';
  end if;

  insert into public.inquiries (name, email, phone, subject, message)
  values (btrim(p_name), v_email, nullif(btrim(p_phone), ''), nullif(btrim(p_subject), ''), btrim(p_message));
end;
$$;

-- Functions are executable by PUBLIC by default; grant explicitly instead.
revoke all on function public.submit_booking_request(
  public.booking_item_type, text, text, text, text, public.market, text, date,
  integer, integer, text, text
) from public;
grant execute on function public.submit_booking_request(
  public.booking_item_type, text, text, text, text, public.market, text, date,
  integer, integer, text, text
) to anon, authenticated;

revoke all on function public.submit_inquiry(text, text, text, text, text) from public;
grant execute on function public.submit_inquiry(text, text, text, text, text)
  to anon, authenticated;

-- Internal helpers must never be callable directly by API roles.
revoke all on function private.generate_booking_reference() from public;
-- Needed as the bookings.reference default when staff create bookings directly.
-- (The `private` schema is not exposed over the Data API.)
grant execute on function private.generate_booking_reference() to authenticated;
revoke all on function private.set_updated_at() from public;
revoke all on function private.sync_published_at() from public;
revoke all on function private.protect_booking_identity() from public;
revoke all on function private.protect_last_super_admin() from public;
revoke all on function private.log_booking_status_change() from public;
