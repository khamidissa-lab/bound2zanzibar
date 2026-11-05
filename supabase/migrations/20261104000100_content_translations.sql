-- =============================================================================
-- BOUND TO ZANZIBAR — translations of public content
--
-- English lives in the content tables themselves. Each other language is one
-- row per item here, holding the translated fields as a JSON object (same
-- field names as the domain types, e.g. {"name": …, "description": […]}).
-- Missing fields fall back to English on the website.
--
-- `is_machine` marks AI-drafted text; saving in the admin marks it reviewed.
-- Visitors read translations of published content only; content managers
-- write them through set_content_translation(), which logs one activity entry.
-- =============================================================================

create table public.content_translations (
  id uuid primary key default gen_random_uuid(),
  entity text not null
    check (entity in ('tours', 'packages', 'destinations', 'blog_posts', 'tour_categories')),
  entity_id uuid not null,
  locale text not null check (locale in ('fr', 'de', 'it', 'ar', 'tr')),
  fields jsonb not null default '{}'
    check (jsonb_typeof(fields) = 'object' and pg_column_size(fields) < 200000),
  is_machine boolean not null default true,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (entity, entity_id, locale)
);

create index content_translations_locale_idx
  on public.content_translations (locale, entity);

create trigger set_updated_at before update on public.content_translations
  for each row execute function private.set_updated_at();

alter table public.content_translations enable row level security;

create policy "Visitors read translations of published content"
  on public.content_translations for select to anon, authenticated
  using (
    (select private.is_staff())
    or case entity
      when 'tours' then exists (
        select 1 from public.tours t where t.id = entity_id and t.status = 'published')
      when 'packages' then exists (
        select 1 from public.packages p where p.id = entity_id and p.status = 'published')
      when 'destinations' then exists (
        select 1 from public.destinations d where d.id = entity_id and d.status = 'published')
      when 'blog_posts' then exists (
        select 1 from public.blog_posts b where b.id = entity_id and b.status = 'published')
      when 'tour_categories' then exists (
        select 1 from public.tour_categories c where c.id = entity_id and c.is_active)
      else false
    end
  );

create policy "Content managers insert translations"
  on public.content_translations for insert to authenticated
  with check ((select private.can_manage_content()));

create policy "Content managers update translations"
  on public.content_translations for update to authenticated
  using ((select private.can_manage_content()))
  with check ((select private.can_manage_content()));

create policy "Content managers delete translations"
  on public.content_translations for delete to authenticated
  using ((select private.can_manage_content()));

revoke all on public.content_translations from anon, authenticated;
grant select on public.content_translations to anon, authenticated;
grant insert, update, delete on public.content_translations to authenticated;

-- Save one item's translation (RLS applies: security invoker). Logs once,
-- against the item itself, only when something changed.
create function public.set_content_translation(
  p_entity text,
  p_entity_id uuid,
  p_locale text,
  p_fields jsonb,
  p_is_machine boolean default false
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  before_row public.content_translations;
  label text;
begin
  if jsonb_typeof(p_fields) <> 'object' then
    raise exception 'fields_must_be_object';
  end if;

  select * into before_row from public.content_translations
    where entity = p_entity and entity_id = p_entity_id and locale = p_locale;

  insert into public.content_translations
    (entity, entity_id, locale, fields, is_machine, updated_by)
  values (p_entity, p_entity_id, p_locale, p_fields, p_is_machine, (select auth.uid()))
  on conflict (entity, entity_id, locale) do update
    set fields = excluded.fields,
        is_machine = excluded.is_machine,
        updated_by = excluded.updated_by;

  if before_row.id is null
     or before_row.fields is distinct from p_fields
     or before_row.is_machine is distinct from p_is_machine then
    label := case p_entity
      when 'tours' then (select name from public.tours where id = p_entity_id)
      when 'packages' then (select name from public.packages where id = p_entity_id)
      when 'destinations' then (select name from public.destinations where id = p_entity_id)
      when 'blog_posts' then (select title from public.blog_posts where id = p_entity_id)
      when 'tour_categories' then (select name from public.tour_categories where id = p_entity_id)
    end;
    perform private.write_activity(
      'updated', p_entity, p_entity_id::text, label,
      array['translation (' || p_locale || ')']);
  end if;
end;
$$;

revoke all on function public.set_content_translation(text, uuid, text, jsonb, boolean)
  from public, anon;
grant execute on function public.set_content_translation(text, uuid, text, jsonb, boolean)
  to authenticated;
