-- =============================================================================
-- Visitor intelligence: live visitors, activity timelines, voluntarily shared
-- contact details, lead scoring and follow-up for the admin.
--
-- Privacy model
--   * Individual tracking happens ONLY for visitors who accepted the consent
--     banner. They get a random first-party ID (no fingerprinting, no IP
--     address stored). Visitors who decline or haven't chosen are counted in
--     page_view_counts only (day, page, country, device), never as a profile.
--   * Contact details come only from forms the visitor submitted themselves.
--   * Everything is written by the website server through service-role-only
--     functions; the public API roles can neither read nor write any of it.
--   * Staff who handle bookings (super admin, admin, booking staff) can read it.
--   * Raw activity is purged after 13 months (purge_visitor_data).
-- =============================================================================

create function private.can_view_visitors()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.has_role('super_admin', 'admin', 'booking_staff');
$$;
revoke all on function private.can_view_visitors() from public;
grant execute on function private.can_view_visitors() to authenticated;

create type public.lead_status as enum (
  'new_lead', 'interested', 'high_potential', 'booking_started', 'booking_completed', 'follow_up'
);

-- -----------------------------------------------------------------------------
-- Tables
-- -----------------------------------------------------------------------------
create table public.visitors (
  -- Random ID from the visitor's first-party cookie (set after consent only).
  id uuid primary key,
  short_id text generated always as (upper(left(replace(id::text, '-', ''), 8))) stored,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  visit_count integer not null default 0 check (visit_count >= 0),
  page_views integer not null default 0 check (page_views >= 0),
  country char(2) check (country ~ '^[A-Z]{2}$'),
  region text check (char_length(region) <= 80),
  city text check (char_length(city) <= 80),
  device text not null default 'desktop' check (device in ('mobile', 'tablet', 'desktop')),
  browser text check (char_length(browser) <= 40),
  os text check (char_length(os) <= 40),
  -- Voluntarily submitted through a booking, enquiry, journey or newsletter form.
  name text check (char_length(name) <= 120),
  email text check (char_length(email) <= 254),
  phone text check (char_length(phone) <= 40),
  identified_at timestamptz,
  -- Lead management. Automatic unless staff set the status by hand.
  lead_status public.lead_status,
  lead_score integer not null default 0 check (lead_score between 0 and 100),
  lead_status_manual boolean not null default false,
  lead_updated_at timestamptz,
  assigned_to uuid references public.profiles (id) on delete set null
);
create index visitors_last_seen_idx on public.visitors (last_seen_at desc);
create index visitors_first_seen_idx on public.visitors (first_seen_at desc);
create index visitors_email_idx on public.visitors (lower(email)) where email is not null;
create index visitors_lead_idx on public.visitors (lead_status, lead_score desc)
  where lead_status is not null;

-- A visit: consecutive activity with gaps under 30 minutes.
create table public.visitor_sessions (
  id uuid primary key default gen_random_uuid(),
  visitor_id uuid not null references public.visitors (id) on delete cascade,
  started_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  -- Set when the tab is closed or navigates away from the site.
  ended_at timestamptz,
  visible boolean not null default true,
  landing_path text not null check (char_length(landing_path) <= 300),
  current_path text not null check (char_length(current_path) <= 300),
  current_title text check (char_length(current_title) <= 200),
  referrer_host text check (char_length(referrer_host) <= 120),
  utm_source text check (char_length(utm_source) <= 80),
  locale text check (locale ~ '^[a-z]{2}$'),
  page_views integer not null default 0 check (page_views >= 0)
);
create index visitor_sessions_visitor_idx on public.visitor_sessions (visitor_id, started_at desc);
create index visitor_sessions_last_seen_idx on public.visitor_sessions (last_seen_at desc);
create index visitor_sessions_started_idx on public.visitor_sessions (started_at);

create table public.visitor_events (
  id bigint generated always as identity primary key,
  visitor_id uuid not null references public.visitors (id) on delete cascade,
  session_id uuid references public.visitor_sessions (id) on delete cascade,
  occurred_at timestamptz not null default now(),
  type text not null check (type in (
    'page_view', 'booking_click', 'whatsapp_click', 'contact_click', 'booking_started',
    'booking_submitted', 'enquiry_submitted', 'journey_submitted', 'newsletter_subscribed'
  )),
  path text check (char_length(path) <= 300),
  title text check (char_length(title) <= 200),
  item_type text check (item_type in ('tour', 'package', 'destination', 'article')),
  item_slug text check (char_length(item_slug) <= 120),
  -- e.g. a booking reference for submissions.
  label text check (char_length(label) <= 200)
);
create index visitor_events_visitor_idx on public.visitor_events (visitor_id, occurred_at desc);
create index visitor_events_time_idx on public.visitor_events (occurred_at, type);
create index visitor_events_item_idx on public.visitor_events (item_type, item_slug, occurred_at)
  where item_slug is not null;

-- Every email / phone a visitor has submitted (a visitor may use several).
create table public.visitor_identities (
  id bigint generated always as identity primary key,
  visitor_id uuid not null references public.visitors (id) on delete cascade,
  kind text not null check (kind in ('email', 'phone')),
  value text not null check (char_length(value) between 3 and 254),
  source text not null check (source in ('booking', 'enquiry', 'journey', 'newsletter')),
  created_at timestamptz not null default now(),
  unique (visitor_id, kind, value)
);
create index visitor_identities_value_idx on public.visitor_identities (kind, value);

-- Aggregate page views from visitors who did NOT consent: no profile, no ID.
create table public.page_view_counts (
  day date not null,
  path text not null check (char_length(path) <= 300),
  country char(2) not null default 'ZZ' check (country ~ '^[A-Z]{2}$'),
  device text not null check (device in ('mobile', 'tablet', 'desktop')),
  views integer not null default 0 check (views >= 0),
  primary key (day, path, country, device)
);

-- Proof of each consent choice (kept 3 years). No personal data besides the ID.
create table public.consent_records (
  id bigint generated always as identity primary key,
  visitor_id uuid,
  choice text not null check (choice in ('accepted', 'declined', 'withdrawn')),
  policy_version text not null check (char_length(policy_version) <= 20),
  country char(2) check (country ~ '^[A-Z]{2}$'),
  created_at timestamptz not null default now()
);
create index consent_records_created_idx on public.consent_records (created_at desc);

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (
    char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  ),
  locale text not null default 'en' check (locale ~ '^[a-z]{2}$'),
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);

create table public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  visitor_id uuid not null references public.visitors (id) on delete cascade,
  kind text not null default 'note' check (kind in ('note', 'call', 'email', 'whatsapp', 'meeting')),
  body text not null check (char_length(body) between 1 and 2000),
  author_id uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
create index lead_notes_visitor_idx on public.lead_notes (visitor_id, created_at desc);

create table public.lead_tasks (
  id uuid primary key default gen_random_uuid(),
  visitor_id uuid not null references public.visitors (id) on delete cascade,
  title text not null check (char_length(title) between 2 and 200),
  due_date date,
  assigned_to uuid references public.profiles (id) on delete set null,
  done_at timestamptz,
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
create index lead_tasks_open_idx on public.lead_tasks (due_date) where done_at is null;
create index lead_tasks_visitor_idx on public.lead_tasks (visitor_id);

-- -----------------------------------------------------------------------------
-- Access: the public API roles get nothing; staff read through RLS.
-- -----------------------------------------------------------------------------
alter table public.visitors enable row level security;
alter table public.visitor_sessions enable row level security;
alter table public.visitor_events enable row level security;
alter table public.visitor_identities enable row level security;
alter table public.page_view_counts enable row level security;
alter table public.consent_records enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.lead_notes enable row level security;
alter table public.lead_tasks enable row level security;

revoke all on public.visitors, public.visitor_sessions, public.visitor_events,
  public.visitor_identities, public.page_view_counts, public.consent_records,
  public.newsletter_subscribers, public.lead_notes, public.lead_tasks
  from anon, authenticated;

grant select on public.visitors, public.visitor_sessions, public.visitor_events,
  public.visitor_identities, public.page_view_counts, public.consent_records,
  public.newsletter_subscribers, public.lead_notes, public.lead_tasks
  to authenticated;
-- Staff change only the lead fields; tracking data is written by the server.
grant update (lead_status, lead_status_manual, assigned_to) on public.visitors to authenticated;
grant delete on public.visitors to authenticated;
grant update (unsubscribed_at) on public.newsletter_subscribers to authenticated;
grant insert (visitor_id, kind, body) on public.lead_notes to authenticated;
grant delete on public.lead_notes to authenticated;
grant insert (visitor_id, title, due_date, assigned_to) on public.lead_tasks to authenticated;
grant update (title, due_date, assigned_to, done_at) on public.lead_tasks to authenticated;
grant delete on public.lead_tasks to authenticated;

create policy "Staff read visitors" on public.visitors for select to authenticated
  using ((select private.can_view_visitors()));
create policy "Staff manage leads" on public.visitors for update to authenticated
  using ((select private.can_view_visitors()))
  with check ((select private.can_view_visitors()));
-- Erasure requests: admins only.
create policy "Admins delete visitors" on public.visitors for delete to authenticated
  using ((select private.is_admin()));

create policy "Staff read sessions" on public.visitor_sessions for select to authenticated
  using ((select private.can_view_visitors()));
create policy "Staff read events" on public.visitor_events for select to authenticated
  using ((select private.can_view_visitors()));
create policy "Staff read identities" on public.visitor_identities for select to authenticated
  using ((select private.can_view_visitors()));
create policy "Staff read page counts" on public.page_view_counts for select to authenticated
  using ((select private.can_view_visitors()));
create policy "Admins read consent records" on public.consent_records for select to authenticated
  using ((select private.is_admin()));

create policy "Staff read subscribers" on public.newsletter_subscribers for select to authenticated
  using ((select private.can_view_visitors()));
create policy "Staff unsubscribe" on public.newsletter_subscribers for update to authenticated
  using ((select private.can_view_visitors()))
  with check ((select private.can_view_visitors()));

create policy "Staff read lead notes" on public.lead_notes for select to authenticated
  using ((select private.can_view_visitors()));
create policy "Staff add lead notes" on public.lead_notes for insert to authenticated
  with check ((select private.can_view_visitors()) and author_id = (select auth.uid()));
create policy "Authors or admins delete lead notes" on public.lead_notes for delete to authenticated
  using ((select private.can_view_visitors())
         and (author_id = (select auth.uid()) or (select private.is_admin())));

create policy "Staff read lead tasks" on public.lead_tasks for select to authenticated
  using ((select private.can_view_visitors()));
create policy "Staff add lead tasks" on public.lead_tasks for insert to authenticated
  with check ((select private.can_view_visitors()) and created_by = (select auth.uid()));
create policy "Staff update lead tasks" on public.lead_tasks for update to authenticated
  using ((select private.can_view_visitors()))
  with check ((select private.can_view_visitors()));
create policy "Staff delete lead tasks" on public.lead_tasks for delete to authenticated
  using ((select private.can_view_visitors()));

-- Staff setting a status by hand turns automatic classification off for that
-- visitor; clearing it (null) turns it back on.
create function private.stamp_lead_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.lead_status is distinct from old.lead_status
     or new.lead_status_manual is distinct from old.lead_status_manual then
    new.lead_updated_at := now();
  end if;
  return new;
end;
$$;
revoke all on function private.stamp_lead_change() from public;
create trigger stamp_lead_change before update on public.visitors
  for each row execute function private.stamp_lead_change();

-- -----------------------------------------------------------------------------
-- Lead classification
-- -----------------------------------------------------------------------------
create function private.refresh_lead(p_visitor_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v public.visitors;
  v_same_item integer;
  v_items integer;
  v_safaris integer;
  v_clicks integer;
  v_last_started timestamptz;
  v_last_submitted timestamptz;
  v_completed boolean;
  v_status public.lead_status;
  v_score integer;
begin
  select * into v from public.visitors where id = p_visitor_id;
  if not found or v.lead_status_manual then
    return;
  end if;

  select coalesce(max(n), 0), count(*) into v_same_item, v_items
  from (
    select count(*) n from public.visitor_events
    where visitor_id = p_visitor_id and type = 'page_view' and item_type in ('tour', 'package')
    group by item_type, item_slug
  ) s;

  select count(distinct e.item_type || ':' || e.item_slug) into v_safaris
  from public.visitor_events e
  left join public.tours t on e.item_type = 'tour' and t.slug = e.item_slug
  left join public.tour_categories c on c.id = t.category_id
  left join public.packages p on e.item_type = 'package' and p.slug = e.item_slug
  where e.visitor_id = p_visitor_id and e.type = 'page_view'
    and (c.slug = 'safari' or p.is_safari);

  select count(*) filter (where type in ('booking_click', 'whatsapp_click', 'contact_click')),
         max(occurred_at) filter (where type = 'booking_started'),
         max(occurred_at) filter (where type in ('booking_submitted', 'enquiry_submitted', 'journey_submitted'))
    into v_clicks, v_last_started, v_last_submitted
  from public.visitor_events where visitor_id = p_visitor_id;

  select exists (
    select 1 from public.bookings b
    join public.visitor_identities i
      on i.visitor_id = p_visitor_id and i.kind = 'email' and i.value = lower(b.email)
    where b.status in ('confirmed', 'paid', 'completed')
  ) into v_completed;

  v_status := case
    when v_completed then 'booking_completed'
    when v_last_started is not null
         and (v_last_submitted is null or v_last_started > v_last_submitted) then 'booking_started'
    when v_last_submitted is not null then 'follow_up'
    when v_same_item >= 3 or v_safaris >= 3 or (v_items >= 3 and v_clicks >= 1)
         or (v.visit_count >= 3 and v_items >= 2) then 'high_potential'
    when v_same_item >= 2 or v_items >= 2 or v_clicks >= 1 then 'interested'
    when v.email is not null then 'new_lead'
  end::public.lead_status;

  v_score := case
    when v_completed then 100
    else least(95,
      v_items * 5 + greatest(v_same_item - 1, 0) * 5 + v_safaris * 5 + v_clicks * 10
      + case when v_last_started is not null then 20 else 0 end
      + case when v_last_submitted is not null then 30 else 0 end
      + case when v.email is not null then 10 else 0 end
      + least(greatest(v.visit_count - 1, 0), 5) * 3)
  end;

  update public.visitors
  set lead_status = v_status, lead_score = v_score
  where id = p_visitor_id
    and (lead_status is distinct from v_status or lead_score <> v_score);
end;
$$;
revoke all on function private.refresh_lead(uuid) from public;

-- A booking being confirmed / paid / completed upgrades the matching lead.
create function private.refresh_leads_for_booking()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  r record;
begin
  for r in
    select distinct visitor_id from public.visitor_identities
    where kind = 'email' and value = lower(new.email)
  loop
    perform private.refresh_lead(r.visitor_id);
  end loop;
  return null;
end;
$$;
revoke all on function private.refresh_leads_for_booking() from public;
create trigger refresh_visitor_leads after update of status on public.bookings
  for each row when (old.status is distinct from new.status)
  execute function private.refresh_leads_for_booking();

-- -----------------------------------------------------------------------------
-- Writes from the website server (service role only)
-- -----------------------------------------------------------------------------
create function private.clean_text(p_value text, p_max integer)
returns text
language sql
immutable
set search_path = ''
as $$
  -- Trim, drop control characters and cap the length.
  select nullif(left(btrim(regexp_replace(p_value, '[[:cntrl:]]', '', 'g')), p_max), '');
$$;
revoke all on function private.clean_text(text, integer) from public;

create function public.track_visitor_event(
  p_visitor_id uuid,
  p_type text,
  p_path text default null,
  p_title text default null,
  p_item_type text default null,
  p_item_slug text default null,
  p_label text default null,
  p_referrer_host text default null,
  p_utm_source text default null,
  p_locale text default null,
  p_country text default null,
  p_region text default null,
  p_city text default null,
  p_device text default null,
  p_browser text default null,
  p_os text default null,
  p_visible boolean default true
)
returns uuid
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_path text := private.clean_text(p_path, 300);
  v_title text := private.clean_text(p_title, 200);
  v_country text := case when upper(p_country) ~ '^[A-Z]{2}$' and upper(p_country) not in ('XX', 'T1')
                         then upper(p_country) end;
  v_device text := case when p_device in ('mobile', 'tablet', 'desktop') then p_device else 'desktop' end;
  v_item_type text := case when p_item_type in ('tour', 'package', 'destination', 'article')
                           then p_item_type end;
  v_item_slug text := case when p_item_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(p_item_slug) <= 120
                           then p_item_slug end;
  v_session public.visitor_sessions;
  v_is_new_session boolean := false;
begin
  if p_visitor_id is null then
    raise exception 'visitor_required';
  end if;
  if p_type not in ('page_view', 'heartbeat', 'leave', 'booking_click', 'whatsapp_click',
                    'contact_click', 'booking_started') then
    raise exception 'visitor_invalid_event';
  end if;
  if v_path is not null and left(v_path, 1) <> '/' then
    v_path := null;
  end if;

  insert into public.visitors as v (id, country, region, city, device, browser, os)
  values (p_visitor_id, v_country, private.clean_text(p_region, 80),
          private.clean_text(p_city, 80), v_device, private.clean_text(p_browser, 40),
          private.clean_text(p_os, 40))
  on conflict (id) do update set
    last_seen_at = now(),
    country = coalesce(excluded.country, v.country),
    region = coalesce(excluded.region, v.region),
    city = coalesce(excluded.city, v.city),
    device = excluded.device,
    browser = coalesce(excluded.browser, v.browser),
    os = coalesce(excluded.os, v.os);

  select * into v_session from public.visitor_sessions
  where visitor_id = p_visitor_id and last_seen_at > now() - interval '30 minutes'
  order by last_seen_at desc
  limit 1
  for update;

  if p_type = 'leave' then
    if v_session.id is not null then
      update public.visitor_sessions
      set ended_at = now(), visible = false, last_seen_at = now()
      where id = v_session.id;
    end if;
    return v_session.id;
  end if;

  if v_session.id is null then
    if v_path is null then
      return null;
    end if;
    insert into public.visitor_sessions (
      visitor_id, landing_path, current_path, current_title, referrer_host, utm_source, locale
    ) values (
      p_visitor_id, v_path, v_path, v_title,
      private.clean_text(lower(p_referrer_host), 120), private.clean_text(p_utm_source, 80),
      case when p_locale ~ '^[a-z]{2}$' then p_locale end
    )
    returning * into v_session;
    v_is_new_session := true;
    update public.visitors set visit_count = visit_count + 1 where id = p_visitor_id;
  end if;

  if p_type = 'page_view' and v_path is not null then
    -- The same page reported twice within a few seconds counts once.
    if not exists (
      select 1 from public.visitor_events
      where session_id = v_session.id and type = 'page_view' and path = v_path
        and occurred_at > now() - interval '5 seconds'
    ) then
      insert into public.visitor_events (visitor_id, session_id, type, path, title, item_type, item_slug)
      values (p_visitor_id, v_session.id, 'page_view', v_path, v_title, v_item_type, v_item_slug);
      update public.visitors set page_views = page_views + 1 where id = p_visitor_id;
      update public.visitor_sessions set page_views = page_views + 1 where id = v_session.id;
    end if;
    update public.visitor_sessions
    set current_path = v_path, current_title = v_title, last_seen_at = now(),
        visible = coalesce(p_visible, true), ended_at = null
    where id = v_session.id;
  else
    update public.visitor_sessions
    set last_seen_at = now(), visible = coalesce(p_visible, true), ended_at = null
    where id = v_session.id;
    if p_type <> 'heartbeat' then
      insert into public.visitor_events (visitor_id, session_id, type, path, item_type, item_slug, label)
      values (p_visitor_id, v_session.id, p_type, v_path, v_item_type, v_item_slug,
              private.clean_text(p_label, 200));
    end if;
  end if;

  if p_type not in ('heartbeat') and (v_item_type in ('tour', 'package') or p_type <> 'page_view'
                                     or v_is_new_session) then
    perform private.refresh_lead(p_visitor_id);
  end if;
  return v_session.id;
end;
$$;

-- Links details the visitor typed into a form to their visitor record.
create function public.identify_visitor(
  p_visitor_id uuid,
  p_source text,
  p_email text,
  p_name text default null,
  p_phone text default null,
  p_reference text default null,
  p_item_type text default null,
  p_item_slug text default null
)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_email text := lower(btrim(p_email));
  v_phone text := private.clean_text(p_phone, 40);
  v_session uuid;
begin
  if p_source not in ('booking', 'enquiry', 'journey', 'newsletter') then
    raise exception 'visitor_invalid_source';
  end if;
  if v_email is null or char_length(v_email) > 254 or v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'visitor_invalid_email';
  end if;
  if not exists (select 1 from public.visitors where id = p_visitor_id) then
    return false;
  end if;

  update public.visitors set
    email = v_email,
    name = coalesce(private.clean_text(p_name, 120), name),
    phone = coalesce(v_phone, phone),
    identified_at = coalesce(identified_at, now()),
    last_seen_at = now()
  where id = p_visitor_id;

  insert into public.visitor_identities (visitor_id, kind, value, source)
  values (p_visitor_id, 'email', v_email, p_source)
  on conflict (visitor_id, kind, value) do nothing;
  if v_phone is not null and char_length(v_phone) >= 3 then
    insert into public.visitor_identities (visitor_id, kind, value, source)
    values (p_visitor_id, 'phone', v_phone, p_source)
    on conflict (visitor_id, kind, value) do nothing;
  end if;

  select id into v_session from public.visitor_sessions
  where visitor_id = p_visitor_id order by last_seen_at desc limit 1;

  insert into public.visitor_events (visitor_id, session_id, type, item_type, item_slug, label)
  values (
    p_visitor_id, v_session,
    case p_source
      when 'booking' then 'booking_submitted'
      when 'enquiry' then 'enquiry_submitted'
      when 'journey' then 'journey_submitted'
      else 'newsletter_subscribed'
    end,
    case when p_item_type in ('tour', 'package') then p_item_type end,
    case when p_item_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' then left(p_item_slug, 120) end,
    private.clean_text(p_reference, 200)
  );

  perform private.refresh_lead(p_visitor_id);
  return true;
end;
$$;

-- Counts a page view from a visitor without consent (no profile, no ID).
create function public.record_anonymous_view(p_path text, p_country text, p_device text)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_path text := private.clean_text(p_path, 300);
begin
  if v_path is null or left(v_path, 1) <> '/' then
    return;
  end if;
  insert into public.page_view_counts as c (day, path, country, device, views)
  values (
    (now() at time zone 'Africa/Dar_es_Salaam')::date,
    v_path,
    case when upper(p_country) ~ '^[A-Z]{2}$' and upper(p_country) not in ('XX', 'T1')
         then upper(p_country) else 'ZZ' end,
    case when p_device in ('mobile', 'tablet', 'desktop') then p_device else 'desktop' end,
    1
  )
  on conflict (day, path, country, device) do update set views = c.views + 1;
end;
$$;

-- Records a consent choice. Withdrawing consent erases the visitor's profile
-- and activity (bookings and enquiries they sent are kept as normal).
create function public.record_consent(
  p_visitor_id uuid,
  p_choice text,
  p_policy_version text,
  p_country text default null
)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  if p_choice not in ('accepted', 'declined', 'withdrawn') then
    raise exception 'consent_invalid_choice';
  end if;
  insert into public.consent_records (visitor_id, choice, policy_version, country)
  values (
    p_visitor_id, p_choice, left(coalesce(p_policy_version, ''), 20),
    case when upper(p_country) ~ '^[A-Z]{2}$' and upper(p_country) not in ('XX', 'T1')
         then upper(p_country) end
  );
  if p_choice = 'withdrawn' and p_visitor_id is not null then
    delete from public.visitors where id = p_visitor_id;
  end if;
end;
$$;

-- Newsletter sign-up (public form; consent is the explicit checkbox).
create function public.subscribe_newsletter(p_email text, p_locale text default 'en')
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_email text := lower(btrim(p_email));
begin
  if v_email is null or char_length(v_email) > 254 or v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'newsletter_invalid_email';
  end if;
  insert into public.newsletter_subscribers as s (email, locale)
  values (v_email, case when p_locale ~ '^[a-z]{2}$' then p_locale else 'en' end)
  on conflict (email) do update set unsubscribed_at = null, locale = excluded.locale,
    subscribed_at = case when s.unsubscribed_at is null then s.subscribed_at else now() end;
end;
$$;

-- Data retention. Raw activity 13 months; anonymous visitors without contact
-- details or staff notes 13 months; aggregates 25 months; consent proof 3 years.
create function public.purge_visitor_data()
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_events integer;
  v_sessions integer;
  v_visitors integer;
begin
  delete from public.visitor_events where occurred_at < now() - interval '13 months';
  get diagnostics v_events = row_count;
  delete from public.visitor_sessions where last_seen_at < now() - interval '13 months';
  get diagnostics v_sessions = row_count;
  delete from public.visitors v
  where v.last_seen_at < now() - interval '13 months'
    and v.email is null
    and not exists (select 1 from public.lead_notes n where n.visitor_id = v.id)
    and not exists (select 1 from public.lead_tasks t where t.visitor_id = v.id and t.done_at is null);
  get diagnostics v_visitors = row_count;
  delete from public.page_view_counts where day < current_date - interval '25 months';
  delete from public.consent_records where created_at < now() - interval '3 years';
  return jsonb_build_object('events', v_events, 'sessions', v_sessions, 'visitors', v_visitors);
end;
$$;

revoke all on function public.track_visitor_event(
  uuid, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, boolean
) from public, anon, authenticated;
grant execute on function public.track_visitor_event(
  uuid, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, boolean
) to service_role;
revoke all on function public.identify_visitor(uuid, text, text, text, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.identify_visitor(uuid, text, text, text, text, text, text, text)
  to service_role;
revoke all on function public.record_anonymous_view(text, text, text) from public, anon, authenticated;
grant execute on function public.record_anonymous_view(text, text, text) to service_role;
revoke all on function public.record_consent(uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.record_consent(uuid, text, text, text) to service_role;
revoke all on function public.purge_visitor_data() from public, anon, authenticated;
grant execute on function public.purge_visitor_data() to service_role;
revoke all on function public.subscribe_newsletter(text, text) from public;
grant execute on function public.subscribe_newsletter(text, text) to anon, authenticated;

-- -----------------------------------------------------------------------------
-- Analytics for the admin (runs as the signed-in staff member, under RLS).
-- -----------------------------------------------------------------------------
create function public.visitor_analytics(
  p_from timestamptz,
  p_to timestamptz,
  p_bucket text default 'day'
)
returns jsonb
language plpgsql
stable
set search_path = ''
as $$
declare
  v_bucket text := case when p_bucket in ('day', 'week', 'month') then p_bucket else 'day' end;
  v_result jsonb;
begin
  if not private.can_view_visitors() then
    raise exception 'not_allowed';
  end if;

  with s as (
    select * from public.visitor_sessions where started_at >= p_from and started_at < p_to
  ),
  e as (
    select * from public.visitor_events where occurred_at >= p_from and occurred_at < p_to
  ),
  vis as (
    select v.* from public.visitors v where v.id in (select visitor_id from s)
  ),
  item_views as (
    select e.item_type, e.item_slug, count(*) views, count(distinct e.visitor_id) visitors,
           coalesce(t.name, p.name) as name,
           coalesce(c.slug = 'safari', p.is_safari, false) as safari
    from e
    left join public.tours t on e.item_type = 'tour' and t.slug = e.item_slug
    left join public.tour_categories c on c.id = t.category_id
    left join public.packages p on e.item_type = 'package' and p.slug = e.item_slug
    where e.type = 'page_view' and e.item_type in ('tour', 'package')
    group by 1, 2, 5, 6
  )
  select jsonb_build_object(
    'visits', (select count(*) from s),
    'unique_visitors', (select count(*) from vis),
    'new_visitors', (select count(*) from vis where first_seen_at >= p_from),
    'returning_visitors', (
      select count(distinct s.visitor_id) from s
      where exists (select 1 from public.visitor_sessions o
                    where o.visitor_id = s.visitor_id and o.started_at < s.started_at)
    ),
    'identified_visitors', (select count(*) from vis where email is not null),
    'page_views', (select count(*) from e where type = 'page_view'),
    'anonymous_page_views', (
      select coalesce(sum(views), 0) from public.page_view_counts
      where day >= (p_from at time zone 'Africa/Dar_es_Salaam')::date
        and day < (p_to at time zone 'Africa/Dar_es_Salaam')::date
           + case when (p_to at time zone 'Africa/Dar_es_Salaam')::time > '00:00' then 1 else 0 end
    ),
    'avg_visit_seconds', (
      select coalesce(round(avg(extract(epoch from (last_seen_at - started_at)))), 0) from s
    ),
    'enquiries', (
      (select count(*) from public.inquiries where created_at >= p_from and created_at < p_to)
      + (select count(*) from public.journey_requests where created_at >= p_from and created_at < p_to)
    ),
    'booking_attempts', (select count(distinct visitor_id) from e where type = 'booking_started'),
    'booking_requests', (select count(*) from public.bookings where created_at >= p_from and created_at < p_to),
    'completed_bookings', (
      select count(*) from public.bookings
      where created_at >= p_from and created_at < p_to and status in ('confirmed', 'paid', 'completed')
    ),
    'potential_customers', (select count(*) from vis where lead_status is not null),
    'active_now', (
      select count(distinct visitor_id) from public.visitor_sessions
      where ended_at is null and last_seen_at > now() - interval '2 minutes'
    ),
    'series', (
      select coalesce(jsonb_agg(jsonb_build_object('bucket', b, 'visitors', n, 'visits', m) order by b), '[]')
      from (
        select date_trunc(v_bucket, started_at at time zone 'Africa/Dar_es_Salaam')::date b,
               count(distinct visitor_id) n, count(*) m
        from s group by 1
      ) x
    ),
    'countries', (
      select coalesce(jsonb_agg(jsonb_build_object('key', k, 'count', n) order by n desc, k), '[]')
      from (select coalesce(country, 'ZZ') k, count(*) n from vis group by 1 order by 2 desc limit 12) x
    ),
    'devices', (
      select coalesce(jsonb_agg(jsonb_build_object('key', device, 'count', n) order by n desc), '[]')
      from (select device, count(*) n from vis group by 1) x
    ),
    'browsers', (
      select coalesce(jsonb_agg(jsonb_build_object('key', k, 'count', n) order by n desc), '[]')
      from (select coalesce(browser, 'Other') k, count(*) n from vis group by 1 order by 2 desc limit 8) x
    ),
    'top_tours', (
      select coalesce(jsonb_agg(jsonb_build_object('slug', item_slug, 'name', coalesce(name, item_slug),
        'views', views, 'visitors', visitors) order by views desc), '[]')
      from (select * from item_views where item_type = 'tour' and not safari order by views desc limit 10) x
    ),
    'top_safaris', (
      select coalesce(jsonb_agg(jsonb_build_object('type', item_type, 'slug', item_slug,
        'name', coalesce(name, item_slug), 'views', views, 'visitors', visitors) order by views desc), '[]')
      from (select * from item_views where safari order by views desc limit 10) x
    ),
    'landing_pages', (
      select coalesce(jsonb_agg(jsonb_build_object('key', landing_path, 'count', n) order by n desc), '[]')
      from (select landing_path, count(*) n from s group by 1 order by 2 desc limit 8) x
    ),
    'referrers', (
      select coalesce(jsonb_agg(jsonb_build_object('key', k, 'count', n) order by n desc), '[]')
      from (select coalesce(referrer_host, 'direct') k, count(*) n from s group by 1 order by 2 desc limit 8) x
    ),
    'funnel', jsonb_build_object(
      'visitors', (select count(*) from vis),
      'viewed_item', (select count(distinct visitor_id) from e
                      where type = 'page_view' and item_type in ('tour', 'package')),
      'clicked', (select count(distinct visitor_id) from e
                  where type in ('booking_click', 'whatsapp_click', 'contact_click')),
      'started', (select count(distinct visitor_id) from e where type = 'booking_started'),
      'submitted', (select count(distinct visitor_id) from e
                    where type in ('booking_submitted', 'enquiry_submitted', 'journey_submitted')),
      'completed', (select count(*) from vis where lead_status = 'booking_completed')
    ),
    'leads', (
      select coalesce(jsonb_object_agg(lead_status, n), '{}')
      from (select lead_status, count(*) n from vis where lead_status is not null group by 1) x
    )
  ) into v_result;
  return v_result;
end;
$$;
revoke all on function public.visitor_analytics(timestamptz, timestamptz, text) from public, anon;
grant execute on function public.visitor_analytics(timestamptz, timestamptz, text) to authenticated;

-- -----------------------------------------------------------------------------
-- Staff names for notes and follow-ups (booking staff can't read other
-- profiles directly, so names are copied / listed by these helpers).
-- -----------------------------------------------------------------------------
alter table public.lead_notes
  add column author_name text check (char_length(author_name) <= 120);

create function private.stamp_note_author()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is not null then
    new.author_id := auth.uid();
    new.author_name := (select full_name from public.profiles where id = auth.uid());
  end if;
  return new;
end;
$$;
revoke all on function private.stamp_note_author() from public;
create trigger stamp_note_author before insert on public.lead_notes
  for each row execute function private.stamp_note_author();

create function public.lead_assignees()
returns table (id uuid, full_name text)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, p.full_name from public.profiles p
  where private.can_view_visitors()
    and p.is_active
    and p.role in ('super_admin', 'admin', 'booking_staff')
  order by p.full_name;
$$;
revoke all on function public.lead_assignees() from public, anon;
grant execute on function public.lead_assignees() to authenticated;

-- Staff hand a lead back to the automatic rules.
create function public.reset_lead_status(p_visitor_id uuid)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  if not private.can_view_visitors() then
    raise exception 'not_allowed';
  end if;
  update public.visitors set lead_status_manual = false where id = p_visitor_id;
  perform private.refresh_lead(p_visitor_id);
end;
$$;
revoke all on function public.reset_lead_status(uuid) from public, anon;
grant execute on function public.reset_lead_status(uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- Activity log: visitor exports and erasures are recorded like booking exports.
-- -----------------------------------------------------------------------------
alter table public.activity_log drop constraint activity_log_action_check;
alter table public.activity_log add constraint activity_log_action_check check (
  action in (
    'created', 'updated', 'deleted',
    'signed_in', 'signed_out', 'password_changed', 'bookings_exported',
    'visitors_exported', 'subscribers_exported', 'visitor_erased'
  )
);

create or replace function public.log_staff_event(p_action text, p_details jsonb default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not (select private.is_staff()) then
    raise exception 'not_staff' using errcode = '42501';
  end if;
  if p_action not in ('signed_in', 'signed_out', 'password_changed', 'bookings_exported',
                      'visitors_exported', 'subscribers_exported', 'visitor_erased') then
    raise exception 'invalid_action';
  end if;
  if p_details is not null
     and (jsonb_typeof(p_details) <> 'object' or length(p_details::text) > 1000) then
    raise exception 'invalid_details';
  end if;

  perform private.write_activity(
    p_action,
    case
      when p_action = 'bookings_exported' then 'bookings'
      when p_action in ('visitors_exported', 'visitor_erased') then 'visitors'
      when p_action = 'subscribers_exported' then 'newsletter_subscribers'
      else 'account'
    end,
    (select auth.uid())::text,
    null,
    '{}',
    p_details);
end;
$$;

-- -----------------------------------------------------------------------------
-- Live updates: the admin "Live visitors" page listens to session changes
-- (Supabase Realtime applies the RLS above, so only staff receive them).
-- -----------------------------------------------------------------------------
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.visitor_sessions;
  end if;
end;
$$;
