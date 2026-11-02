-- =============================================================================
-- BOUND TO ZANZIBAR — admin content helpers
--
-- Atomic "replace the set" operations used by the admin editors. They run as
-- SECURITY INVOKER: the caller's RLS policies apply to every row they touch,
-- so a content editor calling set_tour_prices() fails exactly as a direct
-- insert would, and the whole call rolls back.
-- =============================================================================

-- Replace all prices of a tour.
-- p_prices: [{ market, customer_type, currency, amount, unit_label, is_illustrative, is_active }]
create function public.set_tour_prices(p_tour_id uuid, p_prices jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if jsonb_typeof(p_prices) <> 'array' then
    raise exception 'prices_must_be_array';
  end if;
  delete from public.tour_prices where tour_id = p_tour_id;
  insert into public.tour_prices
    (tour_id, market, customer_type, currency, amount, unit_label, is_illustrative, is_active)
  select p_tour_id, x.market, x.customer_type, upper(x.currency), x.amount,
         coalesce(nullif(btrim(x.unit_label), ''), 'per person'),
         coalesce(x.is_illustrative, true), coalesce(x.is_active, true)
  from jsonb_to_recordset(p_prices) as x(
    market public.market, customer_type public.customer_type, currency text,
    amount numeric, unit_label text, is_illustrative boolean, is_active boolean);
end;
$$;

-- Replace all prices of a package.
create function public.set_package_prices(p_package_id uuid, p_prices jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if jsonb_typeof(p_prices) <> 'array' then
    raise exception 'prices_must_be_array';
  end if;
  delete from public.package_prices where package_id = p_package_id;
  insert into public.package_prices
    (package_id, market, customer_type, currency, amount, unit_label, is_illustrative, is_active)
  select p_package_id, x.market, x.customer_type, upper(x.currency), x.amount,
         coalesce(nullif(btrim(x.unit_label), ''), 'per person sharing'),
         coalesce(x.is_illustrative, true), coalesce(x.is_active, true)
  from jsonb_to_recordset(p_prices) as x(
    market public.market, customer_type public.customer_type, currency text,
    amount numeric, unit_label text, is_illustrative boolean, is_active boolean);
end;
$$;

-- Replace a package's itinerary, included tours and destinations together.
-- p_itinerary: [{ day_number, title, description, meals: text[], overnight }]
create function public.set_package_details(
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
begin
  if jsonb_typeof(p_itinerary) <> 'array' then
    raise exception 'itinerary_must_be_array';
  end if;

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
end;
$$;

-- Replace a tour's gallery. p_images: [{ storage_path, alt_text }]
create function public.set_tour_gallery(p_tour_id uuid, p_images jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if jsonb_typeof(p_images) <> 'array' then
    raise exception 'images_must_be_array';
  end if;
  delete from public.tour_images where tour_id = p_tour_id;
  insert into public.tour_images (tour_id, storage_path, alt_text, sort_order)
  select p_tour_id, x.storage_path, x.alt_text, (ord - 1)::integer
  from rows from (jsonb_to_recordset(p_images) as (storage_path text, alt_text text))
    with ordinality as x(storage_path, alt_text, ord);
end;
$$;

-- Staff only: visitors must not be able to call these, even though RLS would block them.
revoke all on function public.set_tour_prices(uuid, jsonb) from public, anon;
revoke all on function public.set_package_prices(uuid, jsonb) from public, anon;
revoke all on function public.set_package_details(uuid, jsonb, uuid[], uuid[]) from public, anon;
revoke all on function public.set_tour_gallery(uuid, jsonb) from public, anon;
grant execute on function public.set_tour_prices(uuid, jsonb) to authenticated;
grant execute on function public.set_package_prices(uuid, jsonb) to authenticated;
grant execute on function public.set_package_details(uuid, jsonb, uuid[], uuid[]) to authenticated;
grant execute on function public.set_tour_gallery(uuid, jsonb) to authenticated;
