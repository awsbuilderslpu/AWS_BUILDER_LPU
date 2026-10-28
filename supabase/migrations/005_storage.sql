-- Migration 005: Storage Buckets and Storage Security Policies
-- Run order: 5
-- Description: Configures avatars, covers, event-images, and blog-images storage buckets
--              and attaches fine-grained access policies on storage.objects.
-- Safe to run twice: Yes (uses ON CONFLICT DO UPDATE for buckets, DROP POLICY IF EXISTS before CREATE POLICY).

-- ============================================================================
-- 1. Configure Storage Buckets
-- ============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', false, 2097152, array['image/jpeg', 'image/png', 'image/webp']::text[]),
  ('covers', 'covers', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']::text[]),
  ('event-images', 'event-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']::text[]),
  ('blog-images', 'blog-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']::text[])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ============================================================================
-- 2. Policies for avatars Bucket (Private, Owner folder: <user_id>/<file_name>)
-- ============================================================================
drop policy if exists avatars_owner_select on storage.objects;
create policy avatars_owner_select on storage.objects
  for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists avatars_owner_insert on storage.objects;
create policy avatars_owner_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists avatars_owner_update on storage.objects;
create policy avatars_owner_update on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists avatars_owner_delete on storage.objects;
create policy avatars_owner_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists avatars_admin_select on storage.objects;
create policy avatars_admin_select on storage.objects
  for select to authenticated
  using (bucket_id = 'avatars' and (select private.is_staff()));

-- ============================================================================
-- 3. Policies for covers Bucket (Private, Owner folder: <user_id>/<file_name>)
-- ============================================================================
drop policy if exists covers_owner_select on storage.objects;
create policy covers_owner_select on storage.objects
  for select to authenticated
  using (bucket_id = 'covers' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists covers_owner_insert on storage.objects;
create policy covers_owner_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'covers' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists covers_owner_update on storage.objects;
create policy covers_owner_update on storage.objects
  for update to authenticated
  using (bucket_id = 'covers' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'covers' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists covers_owner_delete on storage.objects;
create policy covers_owner_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'covers' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists covers_admin_select on storage.objects;
create policy covers_admin_select on storage.objects
  for select to authenticated
  using (bucket_id = 'covers' and (select private.is_staff()));

-- ============================================================================
-- 4. Policies for event-images and blog-images Buckets (Public read via URL; Staff management)
-- ============================================================================
drop policy if exists staff_media_select on storage.objects;
create policy staff_media_select on storage.objects
  for select to authenticated
  using (bucket_id in ('event-images', 'blog-images') and (select private.is_staff()));

drop policy if exists staff_media_insert on storage.objects;
create policy staff_media_insert on storage.objects
  for insert to authenticated
  with check (bucket_id in ('event-images', 'blog-images') and (select private.is_staff()));

drop policy if exists staff_media_update on storage.objects;
create policy staff_media_update on storage.objects
  for update to authenticated
  using (bucket_id in ('event-images', 'blog-images') and (select private.is_staff()))
  with check (bucket_id in ('event-images', 'blog-images') and (select private.is_staff()));

drop policy if exists staff_media_delete on storage.objects;
create policy staff_media_delete on storage.objects
  for delete to authenticated
  using (bucket_id in ('event-images', 'blog-images') and (select private.is_staff()));
