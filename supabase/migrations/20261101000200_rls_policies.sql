-- =============================================================================
-- BOUND TO ZANZIBAR — authorization: role helpers, RLS and policies
--
-- Role matrix (staff only; visitors are the `anon` role and have no accounts):
--   super_admin    everything, including staff profiles and deleting bookings
--   admin          content, prices, bookings, enquiries, settings, media
--   content_editor content (tours, destinations, packages, blog, testimonials, media)
--   booking_staff  bookings and enquiries; read-only content
-- Any authenticated user WITHOUT an active profile is treated like a visitor.
-- =============================================================================

grant usage on schema private to anon, authenticated;

-- Role of the current user, or NULL for visitors / non-staff / deactivated staff.
-- SECURITY DEFINER so policies on `profiles` do not recurse.
create function private.current_staff_role()
returns public.staff_role
language sql
stable
security definer
set search_path = ''
as $$
  select p.role
  from public.profiles p
  where p.id = (select auth.uid()) and p.is_active;
$$;

create function private.has_role(variadic allowed public.staff_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(private.current_staff_role() = any (allowed), false);
$$;

create function private.is_staff()
returns boolean
language sql stable security definer set search_path = ''
as $$ select private.current_staff_role() is not null; $$;

create function private.is_super_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$ select private.has_role('super_admin'); $$;

create function private.is_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$ select private.has_role('super_admin', 'admin'); $$;

create function private.can_manage_content()
returns boolean
language sql stable security definer set search_path = ''
as $$ select private.has_role('super_admin', 'admin', 'content_editor'); $$;

create function private.can_manage_prices()
returns boolean
language sql stable security definer set search_path = ''
as $$ select private.has_role('super_admin', 'admin'); $$;

create function private.can_manage_bookings()
returns boolean
language sql stable security definer set search_path = ''
as $$ select private.has_role('super_admin', 'admin', 'booking_staff'); $$;

-- -----------------------------------------------------------------------------
-- Enable RLS on every table in the exposed schema
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.currencies enable row level security;
alter table public.tour_categories enable row level security;
alter table public.destinations enable row level security;
alter table public.tours enable row level security;
alter table public.tour_images enable row level security;
alter table public.packages enable row level security;
alter table public.package_itinerary_days enable row level security;
alter table public.package_tours enable row level security;
alter table public.package_destinations enable row level security;
alter table public.tour_prices enable row level security;
alter table public.package_prices enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_status_events enable row level security;
alter table public.blog_posts enable row level security;
alter table public.testimonials enable row level security;
alter table public.inquiries enable row level security;
alter table public.site_settings enable row level security;

-- Defence in depth: visitors have no table privileges at all on private data.
-- Public booking requests and enquiries go through validated RPC functions.
revoke all on public.profiles, public.bookings, public.booking_status_events, public.inquiries
  from anon;

-- -----------------------------------------------------------------------------
-- Profiles
-- -----------------------------------------------------------------------------
create policy "Staff read own profile; admins read all"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select private.is_admin()));

create policy "Super admins create profiles"
  on public.profiles for insert to authenticated
  with check ((select private.is_super_admin()));

create policy "Super admins update profiles"
  on public.profiles for update to authenticated
  using ((select private.is_super_admin()))
  with check ((select private.is_super_admin()));

create policy "Super admins delete profiles"
  on public.profiles for delete to authenticated
  using ((select private.is_super_admin()));

-- Never allow the last active super admin to be demoted, deactivated or removed.
create function private.protect_last_super_admin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.role = 'super_admin' and old.is_active
     and (tg_op = 'DELETE' or new.role <> 'super_admin' or not new.is_active)
     and (select count(*) from public.profiles
          where role = 'super_admin' and is_active and id <> old.id) = 0 then
    raise exception 'cannot_remove_last_super_admin';
  end if;
  return coalesce(new, old);
end;
$$;

create trigger protect_last_super_admin
  before update or delete on public.profiles
  for each row execute function private.protect_last_super_admin();

-- -----------------------------------------------------------------------------
-- Reference data
-- -----------------------------------------------------------------------------
create policy "Anyone reads active currencies"
  on public.currencies for select to anon, authenticated
  using (is_active or (select private.is_staff()));

create policy "Admins manage currencies"
  on public.currencies for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy "Anyone reads active categories"
  on public.tour_categories for select to anon, authenticated
  using (is_active or (select private.is_staff()));

create policy "Content managers insert categories"
  on public.tour_categories for insert to authenticated
  with check ((select private.can_manage_content()));

create policy "Content managers update categories"
  on public.tour_categories for update to authenticated
  using ((select private.can_manage_content()))
  with check ((select private.can_manage_content()));

create policy "Admins delete categories"
  on public.tour_categories for delete to authenticated
  using ((select private.is_admin()));

-- -----------------------------------------------------------------------------
-- Publishable content: destinations, tours, packages, blog posts.
-- Visitors see published rows; staff see everything; content managers write;
-- only admins hard-delete (editors archive instead).
-- -----------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['destinations', 'tours', 'packages', 'blog_posts'] loop
    execute format(
      'create policy "Visitors read published %1$s" on public.%1$I
         for select to anon, authenticated
         using (status = ''published'' or (select private.is_staff()))', t);
    execute format(
      'create policy "Content managers insert %1$s" on public.%1$I
         for insert to authenticated
         with check ((select private.can_manage_content()))', t);
    execute format(
      'create policy "Content managers update %1$s" on public.%1$I
         for update to authenticated
         using ((select private.can_manage_content()))
         with check ((select private.can_manage_content()))', t);
    execute format(
      'create policy "Admins delete %1$s" on public.%1$I
         for delete to authenticated
         using ((select private.is_admin()))', t);
  end loop;
end;
$$;

-- Keep published_at in sync with status.
create function private.sync_published_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$;

create trigger sync_published_at before insert or update on public.destinations
  for each row execute function private.sync_published_at();
create trigger sync_published_at before insert or update on public.tours
  for each row execute function private.sync_published_at();
create trigger sync_published_at before insert or update on public.packages
  for each row execute function private.sync_published_at();
create trigger sync_published_at before insert or update on public.blog_posts
  for each row execute function private.sync_published_at();

-- -----------------------------------------------------------------------------
-- Child content tables: visible when the parent is published.
-- The EXISTS subqueries run with the caller's rights, so parent RLS applies.
-- -----------------------------------------------------------------------------
create policy "Visitors read images of published tours"
  on public.tour_images for select to anon, authenticated
  using (exists (select 1 from public.tours t where t.id = tour_id));

create policy "Visitors read itinerary of published packages"
  on public.package_itinerary_days for select to anon, authenticated
  using (exists (select 1 from public.packages p where p.id = package_id));

create policy "Visitors read published package tours"
  on public.package_tours for select to anon, authenticated
  using (
    exists (select 1 from public.packages p where p.id = package_id)
    and exists (select 1 from public.tours t where t.id = tour_id)
  );

create policy "Visitors read published package destinations"
  on public.package_destinations for select to anon, authenticated
  using (
    exists (select 1 from public.packages p where p.id = package_id)
    and exists (select 1 from public.destinations d where d.id = destination_id)
  );

do $$
declare
  t text;
begin
  foreach t in array array['tour_images', 'package_itinerary_days', 'package_tours', 'package_destinations'] loop
    execute format(
      'create policy "Content managers insert %1$s" on public.%1$I
         for insert to authenticated
         with check ((select private.can_manage_content()))', t);
    execute format(
      'create policy "Content managers update %1$s" on public.%1$I
         for update to authenticated
         using ((select private.can_manage_content()))
         with check ((select private.can_manage_content()))', t);
    execute format(
      'create policy "Content managers delete %1$s" on public.%1$I
         for delete to authenticated
         using ((select private.can_manage_content()))', t);
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- Prices: visitors see active prices of published items; only admins write.
-- -----------------------------------------------------------------------------
create policy "Visitors read active prices of published tours"
  on public.tour_prices for select to anon, authenticated
  using (
    (is_active and exists (select 1 from public.tours t where t.id = tour_id and t.status = 'published'))
    or (select private.is_staff())
  );

create policy "Visitors read active prices of published packages"
  on public.package_prices for select to anon, authenticated
  using (
    (is_active and exists (select 1 from public.packages p where p.id = package_id and p.status = 'published'))
    or (select private.is_staff())
  );

do $$
declare
  t text;
begin
  foreach t in array array['tour_prices', 'package_prices'] loop
    execute format(
      'create policy "Price managers insert %1$s" on public.%1$I
         for insert to authenticated
         with check ((select private.can_manage_prices()))', t);
    execute format(
      'create policy "Price managers update %1$s" on public.%1$I
         for update to authenticated
         using ((select private.can_manage_prices()))
         with check ((select private.can_manage_prices()))', t);
    execute format(
      'create policy "Price managers delete %1$s" on public.%1$I
         for delete to authenticated
         using ((select private.can_manage_prices()))', t);
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- Bookings: staff only. Visitors submit via public.submit_booking_request().
-- -----------------------------------------------------------------------------
create policy "Booking staff read bookings"
  on public.bookings for select to authenticated
  using ((select private.can_manage_bookings()));

create policy "Booking staff create bookings"
  on public.bookings for insert to authenticated
  with check ((select private.can_manage_bookings()));

create policy "Booking staff update bookings"
  on public.bookings for update to authenticated
  using ((select private.can_manage_bookings()))
  with check ((select private.can_manage_bookings()));

create policy "Super admins delete bookings"
  on public.bookings for delete to authenticated
  using ((select private.is_super_admin()));

-- Reference and creation time are immutable once created.
create function private.protect_booking_identity()
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

create trigger protect_booking_identity before update on public.bookings
  for each row execute function private.protect_booking_identity();

-- Record every status change, attributed to the signed-in staff member.
create function private.log_booking_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.booking_status_events (booking_id, from_status, to_status, changed_by)
    values (new.id, null, new.status, (select auth.uid()));
  elsif new.status is distinct from old.status then
    insert into public.booking_status_events (booking_id, from_status, to_status, changed_by)
    values (new.id, old.status, new.status, (select auth.uid()));
  end if;
  return new;
end;
$$;

create trigger log_booking_status_change after insert or update of status on public.bookings
  for each row execute function private.log_booking_status_change();

create policy "Booking staff read status history"
  on public.booking_status_events for select to authenticated
  using ((select private.can_manage_bookings()));
-- No insert/update/delete policies: history is written only by the trigger.

-- -----------------------------------------------------------------------------
-- Enquiries: staff only. Visitors submit via public.submit_inquiry().
-- -----------------------------------------------------------------------------
create policy "Booking staff read enquiries"
  on public.inquiries for select to authenticated
  using ((select private.can_manage_bookings()));

create policy "Booking staff update enquiries"
  on public.inquiries for update to authenticated
  using ((select private.can_manage_bookings()))
  with check ((select private.can_manage_bookings()));

create policy "Admins delete enquiries"
  on public.inquiries for delete to authenticated
  using ((select private.is_admin()));

-- -----------------------------------------------------------------------------
-- Testimonials: only approved reviews are public; content managers moderate.
-- -----------------------------------------------------------------------------
create policy "Visitors read approved testimonials"
  on public.testimonials for select to anon, authenticated
  using (is_approved or (select private.is_staff()));

create policy "Content managers manage testimonials"
  on public.testimonials for all to authenticated
  using ((select private.can_manage_content()))
  with check ((select private.can_manage_content()));

-- -----------------------------------------------------------------------------
-- Site settings: public keys readable by all; admins write.
-- -----------------------------------------------------------------------------
create policy "Visitors read public settings"
  on public.site_settings for select to anon, authenticated
  using (is_public or (select private.is_staff()));

create policy "Admins manage settings"
  on public.site_settings for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));
