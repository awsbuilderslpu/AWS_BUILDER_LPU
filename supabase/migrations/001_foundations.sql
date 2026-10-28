-- Migration 001: Foundations
-- Run order: 1
-- Description: Creates private schema, custom enum types, and generic updated_at trigger function.
-- Safe to run twice: Yes (uses IF NOT EXISTS, DO blocks with duplicate_object handlers, and CREATE OR REPLACE FUNCTION).

-- 1. Private schema for internal/helper functions (isolated from PostgREST / Data API)
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

-- 2. Custom Enum: public.app_role
-- Supports hierarchy: Administrator (full control) -> Admin (appoints Captains) -> Captain (appoints Core) -> Core -> Member -> Student -> Participant
do $$
begin
  create type public.app_role as enum ('administrator', 'admin', 'captain', 'core', 'member', 'student', 'participant');
exception
  when duplicate_object then null;
end $$;

-- 3. Custom Enum: public.registration_status
do $$
begin
  create type public.registration_status as enum ('pending', 'approved', 'rejected', 'archived');
exception
  when duplicate_object then null;
end $$;

-- 4. Custom Enum: public.event_status
do $$
begin
  create type public.event_status as enum ('draft', 'scheduled', 'published', 'cancelled', 'completed');
exception
  when duplicate_object then null;
end $$;

-- 5. Custom Enum: public.event_category
do $$
begin
  create type public.event_category as enum ('workshop', 'hackathon', 'talk', 'competition', 'community');
exception
  when duplicate_object then null;
end $$;

-- 6. Custom Enum: public.post_status
do $$
begin
  create type public.post_status as enum ('draft', 'scheduled', 'published', 'archived');
exception
  when duplicate_object then null;
end $$;

-- 7. Trigger function to update the updated_at column
create or replace function private.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
