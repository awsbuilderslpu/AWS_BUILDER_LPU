-- Migration 014: Announcements and Notification Management
-- Run order: 14
-- Description: Announcements & notifications table, RLS policies, and triggers.
-- Safe to run twice: Yes.

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  type text not null default 'announcement', -- 'announcement', 'event', 'blog', 'alert'
  href text,
  target_audience text not null default 'all', -- 'all', 'members', 'staff'
  priority text not null default 'normal', -- 'normal', 'high', 'urgent'
  is_published boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  author_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint announcements_type_check check (type in ('announcement', 'event', 'blog', 'alert')),
  constraint announcements_priority_check check (priority in ('normal', 'high', 'urgent')),
  constraint announcements_audience_check check (target_audience in ('all', 'members', 'staff'))
);

create index if not exists idx_announcements_published_created 
  on public.announcements (is_published, created_at desc);

-- Updated_at trigger
drop trigger if exists announcements_set_updated_at on public.announcements;
create trigger announcements_set_updated_at before update on public.announcements
  for each row execute function private.set_updated_at();

-- RLS
alter table public.announcements enable row level security;
revoke all on public.announcements from public, anon, authenticated;

-- Public read for published announcements targeted to 'all'
drop policy if exists announcements_select_public on public.announcements;
create policy announcements_select_public on public.announcements
  for select to public
  using (is_published = true and target_audience = 'all');

-- Authenticated users read published announcements for 'all' and 'members'
drop policy if exists announcements_select_authenticated on public.announcements;
create policy announcements_select_authenticated on public.announcements
  for select to authenticated
  using (
    is_published = true and (
      target_audience in ('all', 'members') 
      or (target_audience = 'staff' and (select private.is_staff()))
    )
  );

-- Staff users have full access (select, insert, update, delete)
drop policy if exists announcements_staff_all on public.announcements;
create policy announcements_staff_all on public.announcements
  for all to authenticated
  using ((select private.is_staff()))
  with check ((select private.is_staff()));

grant select on public.announcements to anon, authenticated;
grant insert, update, delete on public.announcements to authenticated;

-- Enable Realtime for announcements if publication exists
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables 
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'announcements'
    ) then
      alter publication supabase_realtime add table public.announcements;
    end if;
  end if;
end $$;

-- Seed initial announcements if table is newly created and empty
insert into public.announcements (title, description, type, href, target_audience, priority, is_published, author_name)
select
  'AWS Cloud Practitioner Workshop',
  'Hands-on labs on EC2, S3 & IAM. Seats filling fast!',
  'event',
  '/events',
  'all',
  'normal',
  true,
  'Admin'
where not exists (select 1 from public.announcements limit 1);

insert into public.announcements (title, description, type, href, target_audience, priority, is_published, author_name)
select
  'Cloud Builder Hackathon 2026',
  'Registrations are officially open for all LPU students.',
  'announcement',
  '/events',
  'all',
  'high',
  true,
  'Admin'
where (select count(*) from public.announcements) = 1;

insert into public.announcements (title, description, type, href, target_audience, priority, is_published, author_name)
select
  'New Blog: AWS Beginner Guide',
  'Learn how to deploy your first full-stack application.',
  'blog',
  '/blogs',
  'all',
  'normal',
  true,
  'Admin'
where (select count(*) from public.announcements) = 2;

