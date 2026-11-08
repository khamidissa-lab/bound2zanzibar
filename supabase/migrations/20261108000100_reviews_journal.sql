-- =============================================================================
-- Phase 8: verified customer reviews and the travel journal.
--
-- Reviews: only a customer whose booking is COMPLETED can review, through a
-- private link (bookings.review_token), once per booking. Every review waits
-- for staff approval; visitors only ever see approved reviews.
--
-- Journal: article categories, featured flag, author name and related tours.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Review invitations: a secret token is created when a booking is completed.
-- -----------------------------------------------------------------------------
alter table public.bookings add column review_token uuid unique;

create function private.issue_review_token()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'completed' and new.review_token is null then
    new.review_token := gen_random_uuid();
  end if;
  return new;
end;
$$;

create trigger issue_review_token before insert or update of status on public.bookings
  for each row execute function private.issue_review_token();

revoke all on function private.issue_review_token() from public;

-- -----------------------------------------------------------------------------
-- Reviews
-- -----------------------------------------------------------------------------
create type public.review_status as enum ('pending', 'approved', 'rejected');

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings (id) on delete cascade,
  tour_id uuid references public.tours (id) on delete set null,
  package_id uuid references public.packages (id) on delete set null,
  rating smallint not null check (rating between 1 and 5),
  title text check (char_length(title) <= 120),
  body text not null check (char_length(body) between 10 and 2000),
  display_name text not null check (char_length(display_name) between 2 and 60),
  country text check (char_length(country) <= 60),
  locale text not null default 'en' check (locale ~ '^[a-z]{2}$'),
  status public.review_status not null default 'pending',
  moderated_by uuid references auth.users (id) on delete set null,
  moderated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index reviews_tour_idx on public.reviews (tour_id) where status = 'approved';
create index reviews_package_idx on public.reviews (package_id) where status = 'approved';
create index reviews_status_idx on public.reviews (status, created_at desc);

create trigger set_updated_at before update on public.reviews
  for each row execute function private.set_updated_at();

alter table public.reviews enable row level security;

-- Visitors see approved reviews, and only their public columns (never the
-- booking link or moderation details).
revoke all on public.reviews from anon;
grant select (id, tour_id, package_id, rating, title, body, display_name, country, locale, status, created_at)
  on public.reviews to anon;

create policy "Visitors read approved reviews"
  on public.reviews for select to anon, authenticated
  using (status = 'approved' or (select private.can_manage_content()));

create policy "Content managers moderate reviews"
  on public.reviews for update to authenticated
  using ((select private.can_manage_content()))
  with check ((select private.can_manage_content()));

create policy "Content managers delete reviews"
  on public.reviews for delete to authenticated
  using ((select private.can_manage_content()));
-- No insert policy: reviews are created only by public.submit_review().

-- Moderation records who approved or rejected, and when.
create function private.stamp_review_moderation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    new.moderated_by := (select auth.uid());
    new.moderated_at := now();
  end if;
  -- What the customer wrote and which booking it belongs to never change.
  new.booking_id := old.booking_id;
  new.created_at := old.created_at;
  return new;
end;
$$;

create trigger stamp_review_moderation before update on public.reviews
  for each row execute function private.stamp_review_moderation();

revoke all on function private.stamp_review_moderation() from public;

create trigger log_activity after update or delete on public.reviews
  for each row execute function private.log_row_activity();

-- What the review page needs to greet the customer; nothing else is revealed.
create function public.get_review_invitation(p_token uuid)
returns table (first_name text, item_name text, already_reviewed boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select split_part(b.customer_name, ' ', 1),
         coalesce(t.name, p.name),
         exists (select 1 from public.reviews r where r.booking_id = b.id)
  from public.bookings b
  left join public.tours t on t.id = b.tour_id
  left join public.packages p on p.id = b.package_id
  where b.review_token = p_token and b.status = 'completed';
$$;

create function public.submit_review(
  p_token uuid,
  p_rating integer,
  p_body text,
  p_display_name text,
  p_title text default null,
  p_country text default null,
  p_locale text default 'en'
)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_booking public.bookings;
begin
  select * into v_booking from public.bookings b
  where b.review_token = p_token and b.status = 'completed';
  if v_booking.id is null then
    raise exception 'review_invalid_link';
  end if;
  if exists (select 1 from public.reviews r where r.booking_id = v_booking.id) then
    raise exception 'review_already_submitted';
  end if;
  if p_rating is null or p_rating not between 1 and 5 then
    raise exception 'review_invalid_rating';
  end if;
  if p_body is null or char_length(btrim(p_body)) not between 10 and 2000 then
    raise exception 'review_invalid_body';
  end if;
  if p_display_name is null or char_length(btrim(p_display_name)) not between 2 and 60 then
    raise exception 'review_invalid_name';
  end if;
  if char_length(p_title) > 120 or char_length(p_country) > 60 then
    raise exception 'review_text_too_long';
  end if;

  insert into public.reviews (
    booking_id, tour_id, package_id, rating, title, body, display_name, country, locale
  ) values (
    v_booking.id, v_booking.tour_id, v_booking.package_id, p_rating,
    nullif(btrim(p_title), ''), btrim(p_body), btrim(p_display_name),
    nullif(btrim(p_country), ''),
    case when p_locale ~ '^[a-z]{2}$' then p_locale else 'en' end
  );
end;
$$;

revoke all on function public.get_review_invitation(uuid) from public;
grant execute on function public.get_review_invitation(uuid) to anon, authenticated;
revoke all on function public.submit_review(uuid, integer, text, text, text, text, text) from public;
grant execute on function public.submit_review(uuid, integer, text, text, text, text, text)
  to anon, authenticated;

-- -----------------------------------------------------------------------------
-- Travel journal
-- -----------------------------------------------------------------------------
alter table public.blog_posts
  add column category text not null default 'travel-tips'
    constraint blog_posts_category_valid check (category in (
      'zanzibar-guide', 'things-to-do', 'safari-guides', 'travel-tips',
      'culture-history', 'beach-islands'
    )),
  add column is_featured boolean not null default false,
  add column author_name text constraint blog_posts_author_name_length check (char_length(author_name) <= 80);

create table public.blog_post_tours (
  post_id uuid not null references public.blog_posts (id) on delete cascade,
  tour_id uuid not null references public.tours (id) on delete cascade,
  sort_order integer not null default 0,
  primary key (post_id, tour_id)
);

alter table public.blog_post_tours enable row level security;

-- Like package tours: visible when both the article and the tour are visible.
create policy "Visitors read published article tours"
  on public.blog_post_tours for select to anon, authenticated
  using (
    exists (select 1 from public.blog_posts p where p.id = post_id)
    and exists (select 1 from public.tours t where t.id = tour_id)
  );

do $$
begin
  execute 'create policy "Content managers insert blog_post_tours" on public.blog_post_tours
     for insert to authenticated with check ((select private.can_manage_content()))';
  execute 'create policy "Content managers delete blog_post_tours" on public.blog_post_tours
     for delete to authenticated using ((select private.can_manage_content()))';
end;
$$;

-- Replaces an article's related tours in one step.
create function public.set_blog_post_tours(p_post_id uuid, p_tour_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if cardinality(coalesce(p_tour_ids, '{}')) > 12 then
    raise exception 'too_many_related_tours';
  end if;
  delete from public.blog_post_tours where post_id = p_post_id;
  insert into public.blog_post_tours (post_id, tour_id, sort_order)
  select p_post_id, x.tour_id, x.ord::integer - 1
  from unnest(coalesce(p_tour_ids, '{}')) with ordinality as x(tour_id, ord);
end;
$$;

revoke all on function public.set_blog_post_tours(uuid, uuid[]) from public, anon;
grant execute on function public.set_blog_post_tours(uuid, uuid[]) to authenticated;
