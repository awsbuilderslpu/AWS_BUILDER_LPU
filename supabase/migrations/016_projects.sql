-- Migration 016: Projects Management
-- Run order: 16
-- Description: Projects table, RLS policies, triggers, and storage bucket configuration.
-- Safe to run twice: Yes.

-- 1. Create Projects Table
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  tagline text not null,
  description text not null,
  category text not null,
  status text not null default 'Ongoing',
  featured boolean not null default false,
  image text not null default '/images/projects/thefleetfly.jpg',
  tech_stack text[] not null default '{}',
  aws_services text[] not null default '{}',
  author jsonb not null default '{"name": ""}'::jsonb,
  team jsonb not null default '[]'::jsonb,
  start_date text not null default '',
  end_date text,
  date text,
  github_url text,
  demo_url text,
  stats jsonb not null default '{"likes": 0, "views": "0", "rating": 5.0}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_slug_format check (slug ~ '^[a-z0-9][a-z0-9-]{1,99}$'),
  constraint projects_title_length check (char_length(title) between 2 and 150),
  constraint projects_status_values check (status in ('Ongoing', 'Completed', 'Under Review', 'Archived'))
);

create index if not exists idx_projects_status_featured 
  on public.projects (status, featured, created_at desc);

create index if not exists idx_projects_category 
  on public.projects (category);

-- 2. Updated_at Trigger
drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at before update on public.projects
  for each row execute function private.set_updated_at();

-- 3. Row Level Security
alter table public.projects enable row level security;
revoke all on public.projects from public, anon, authenticated;

-- Public can read all active projects (or staff can read all)
drop policy if exists projects_select_public on public.projects;
create policy projects_select_public on public.projects
  for select to public
  using (status <> 'Archived' or (select private.is_staff()));

-- Authenticated staff have full access (select, insert, update, delete)
drop policy if exists projects_staff_all on public.projects;
create policy projects_staff_all on public.projects
  for all to authenticated
  using ((select private.is_staff()))
  with check ((select private.is_staff()));

grant select on public.projects to anon, authenticated;
grant insert, update, delete on public.projects to authenticated;

-- 4. Storage Bucket Configuration for project-images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('project-images', 'project-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']::text[])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists project_media_public_select on storage.objects;
create policy project_media_public_select on storage.objects
  for select to public
  using (bucket_id = 'project-images');

drop policy if exists project_media_staff_manage on storage.objects;
create policy project_media_staff_manage on storage.objects
  for all to authenticated
  using (bucket_id = 'project-images' and (select private.is_staff()))
  with check (bucket_id = 'project-images' and (select private.is_staff()));

