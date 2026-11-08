-- Migration 018: Contact Messages Resume Storage & Policies
-- Run order: 18
-- Description: Configures resumes storage bucket for contact form attachments and attaches security policies.
-- Safe to run twice.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resumes',
  'resumes',
  false,
  5242880,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/octet-stream'
  ]::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Allow public / anon to upload resumes to the resumes bucket
drop policy if exists resumes_insert_public on storage.objects;
create policy resumes_insert_public on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'resumes');

-- Allow staff (admin, captain, core) to read/download resumes
drop policy if exists resumes_select_staff on storage.objects;
create policy resumes_select_staff on storage.objects
  for select to authenticated
  using (bucket_id = 'resumes' and (select private.is_staff()));

-- Allow staff to delete resumes
drop policy if exists resumes_delete_admin on storage.objects;
create policy resumes_delete_admin on storage.objects
  for delete to authenticated
  using (bucket_id = 'resumes' and (select private.is_staff()));

