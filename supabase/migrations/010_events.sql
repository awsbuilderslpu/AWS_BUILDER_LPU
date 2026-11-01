-- Migration 010: Events Table, Security Policies, Column Grants & Triggers
-- Run order: 10
-- Description: Establishes the production events table with lifecycle timestamps,
--              column-level least-privilege grants (protecting meeting URLs and creator metadata),
--              fine-grained RLS policies separating public and staff access paths,
--              and automatic created_by / updated_by tracking triggers.
-- Safe to run twice: Yes (re-runnable DDL, DROP IF EXISTS, and CREATE OR REPLACE).

-- ============================================================================
-- 1. Table: public.events
-- ============================================================================

-- If legacy placeholder table from migration 002 exists, replace it cleanly
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'events' and column_name = 'start_date'
  ) then
    drop table public.events cascade;
  end if;
end $$;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null,
  description jsonb not null default '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb,
  location_mode text not null,
  venue text,
  meeting_url text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  registration_enabled boolean not null default false,
  registration_deadline timestamptz,
  banner_path text,
  is_published boolean not null default false,
  archived_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_slug_format check (slug ~ '^[a-z0-9][a-z0-9-]{2,79}$'),
  constraint events_title_length check (char_length(title) between 3 and 120),
  constraint events_category_values check (category in ('workshop', 'hackathon', 'talk', 'competition', 'community')),
  constraint events_location_values check (location_mode in ('on_campus', 'online', 'hybrid')),
  constraint events_location_fields check (
    (location_mode = 'on_campus' and venue is not null)
    or (location_mode = 'online' and meeting_url is not null)
    or (location_mode = 'hybrid' and venue is not null and meeting_url is not null)
  ),
  constraint events_venue_length check (venue is null or char_length(venue) between 1 and 200),
  constraint events_meeting_url_format check (meeting_url is null or (meeting_url ~ '^https://' and char_length(meeting_url) <= 300)),
  constraint events_time_order check (ends_at > starts_at),
  constraint events_deadline_order check (registration_deadline is null or registration_deadline <= starts_at),
  constraint events_banner_format check (banner_path is null or banner_path ~ '^[0-9]{4}/(0[1-9]|1[0-2])/[0-9a-f-]{36}\.(webp|jpg)$'),
  constraint events_description_size check (octet_length(description::text) <= 60000)
);

-- ============================================================================
-- 2. Indexes
-- ============================================================================
create index if not exists events_starts_at_idx on public.events (starts_at);
create index if not exists events_is_published_archived_at_idx on public.events (is_published, archived_at);

-- ============================================================================
-- 3. Row Level Security & Column Grants
-- ============================================================================
alter table public.events enable row level security;

revoke all on public.events from public, anon, authenticated;

-- Anon role receives select on safe public columns only (never created_by, updated_by, or meeting_url)
grant select (
  id, slug, title, category, description, location_mode, venue,
  starts_at, ends_at, registration_enabled, registration_deadline,
  banner_path, is_published, archived_at, created_at, updated_at
) on public.events to anon;

-- Authenticated users receive select on all columns
grant select on public.events to authenticated;

-- Staff insert privileges (slug, title, category, description, location_mode, venue, meeting_url, starts_at, ends_at, registration_enabled, registration_deadline, banner_path, is_published)
grant insert (
  slug, title, category, description, location_mode, venue, meeting_url,
  starts_at, ends_at, registration_enabled, registration_deadline,
  banner_path, is_published
) on public.events to authenticated;

-- Staff update privileges (slug is never updatable so URLs stay stable)
grant update (
  title, category, description, location_mode, venue, meeting_url,
  starts_at, ends_at, registration_enabled, registration_deadline,
  banner_path, is_published, archived_at
) on public.events to authenticated;

-- ============================================================================
-- 4. Policies
-- Separate public and staff policies: never combine with OR across anon and staff
-- No delete policy: events are archived, never deleted through API
-- ============================================================================
drop policy if exists events_select_published on public.events;
drop policy if exists events_delete_staff on public.events;

drop policy if exists events_select_public on public.events;
create policy events_select_public on public.events
  for select
  to anon, authenticated
  using (is_published and archived_at is null);

drop policy if exists events_select_staff on public.events;
create policy events_select_staff on public.events
  for select
  to authenticated
  using ((select private.is_staff()));

drop policy if exists events_insert_staff on public.events;
create policy events_insert_staff on public.events
  for insert
  to authenticated
  with check ((select private.is_staff()));

drop policy if exists events_update_staff on public.events;
create policy events_update_staff on public.events
  for update
  to authenticated
  using ((select private.is_staff()))
  with check ((select private.is_staff()));

-- ============================================================================
-- 5. Trigger Functions & Triggers
-- ============================================================================
create or replace function private.stamp_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.created_by := (select auth.uid());
  end if;
  new.updated_by := (select auth.uid());
  return new;
end;
$$;

revoke all on function private.stamp_event() from public, anon, authenticated;

drop trigger if exists stamp_event on public.events;
create trigger stamp_event
  before insert or update on public.events
  for each row execute function private.stamp_event();

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
  before update on public.events
  for each row execute function private.set_updated_at();

