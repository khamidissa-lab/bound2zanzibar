-- =============================================================================
-- BOUND TO ZANZIBAR — Supabase Storage for marketing images
--
-- `media` is a public bucket: published images are served by public URL.
-- Only content managers can upload, replace or delete files, and staff are
-- the only ones who can list the bucket. Max 5 MB; common web image types.
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do nothing;

create policy "Staff list media"
  on storage.objects for select to authenticated
  using (bucket_id = 'media' and (select private.is_staff()));

create policy "Content managers upload media"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (select private.can_manage_content()));

create policy "Content managers update media"
  on storage.objects for update to authenticated
  using (bucket_id = 'media' and (select private.can_manage_content()))
  with check (bucket_id = 'media' and (select private.can_manage_content()));

create policy "Content managers delete media"
  on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (select private.can_manage_content()));
