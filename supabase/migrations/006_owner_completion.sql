-- Migration 006: Self-Completion Security & Profile Locks
-- Run order: 6
-- Description: Enables members to complete their own profiles and pending registration details
--              without granting administrative powers or allowing alteration of locked identity fields.
-- Safe to run twice: Yes (uses CREATE OR REPLACE FUNCTION, DROP POLICY IF EXISTS, DROP TRIGGER IF EXISTS, and REVOKE/GRANT statements).

-- ============================================================================
-- 1. Function: private.guard_profile_identity()
-- Allows setting registration_number, date_of_birth, and terms_accepted_at
-- once from NULL, but permanently locks them against modification thereafter.
-- Protects id and email against any modifications by non-admins.
-- ============================================================================
create or replace function private.guard_profile_identity()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  is_caller_admin boolean;
begin
  if auth.uid() is not null then
    select exists (
      select 1
      from public.user_roles
      where user_id = auth.uid()
        and role in ('administrator', 'admin')
        and is_active = true
    ) into is_caller_admin;

    if not coalesce(is_caller_admin, false) then
      -- id and email are completely immutable for non-admin callers
      if old.id is distinct from new.id
         or old.email is distinct from new.email then
        raise exception 'Cannot modify protected identity fields (id, email)';
      end if;

      -- registration_number, date_of_birth, terms_accepted_at can only be set from NULL
      if old.registration_number is not null and old.registration_number is distinct from new.registration_number then
        raise exception 'Cannot modify registration_number once set';
      end if;

      if old.date_of_birth is not null and old.date_of_birth is distinct from new.date_of_birth then
        raise exception 'Cannot modify date_of_birth once set';
      end if;

      if old.terms_accepted_at is not null and old.terms_accepted_at is distinct from new.terms_accepted_at then
        raise exception 'Cannot modify terms_accepted_at once set';
      end if;
    end if;
  end if;
  return new;
end;
$$;

-- Ensure the trigger is active on public.profiles
drop trigger if exists guard_profile_identity_trigger on public.profiles;
create trigger guard_profile_identity_trigger
  before update on public.profiles
  for each row
  execute function private.guard_profile_identity();

-- ============================================================================
-- 2. Column Grants
-- Grant authenticated users column-level update on terms_accepted_at and requested_role
-- ============================================================================
grant update (terms_accepted_at) on public.profiles to authenticated;
grant update (requested_role) on public.registrations to authenticated;

-- ============================================================================
-- 3. Row Level Security Policy on public.registrations
-- Permits members to update their own pending registration (holding requested_role)
-- ============================================================================
drop policy if exists registrations_update_own_pending on public.registrations;
create policy registrations_update_own_pending on public.registrations
  for update to authenticated
  using (
    user_id = (select auth.uid())
    and status = 'pending'::public.registration_status
  )
  with check (
    user_id = (select auth.uid())
    and status = 'pending'::public.registration_status
  );

-- ============================================================================
-- 4. Trigger Function: private.guard_registration_owner()
-- Prevents non-admins from changing id, user_id, status, admin_note, applied_at,
-- reviewed_by, or reviewed_at on public.registrations.
-- Only requested_role may change for non-admin callers.
-- ============================================================================
create or replace function private.guard_registration_owner()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  is_caller_admin boolean;
begin
  if auth.uid() is not null then
    select exists (
      select 1
      from public.user_roles
      where user_id = auth.uid()
        and role in ('administrator', 'admin')
        and is_active = true
    ) into is_caller_admin;

    if not coalesce(is_caller_admin, false) then
      if old.id is distinct from new.id
         or old.user_id is distinct from new.user_id
         or old.status is distinct from new.status
         or old.admin_note is distinct from new.admin_note
         or old.applied_at is distinct from new.applied_at
         or old.reviewed_by is distinct from new.reviewed_by
         or old.reviewed_at is distinct from new.reviewed_at then
        raise exception 'Only requested_role may be updated by registration owner';
      end if;
    end if;
  end if;
  return new;
end;
$$;

-- Trigger name 'a_guard_registration_owner_trigger' ensures it sorts before
-- 'set_registrations_updated_at' and 'stamp_registration_review_trigger' so it fires first.
drop trigger if exists a_guard_registration_owner_trigger on public.registrations;
create trigger a_guard_registration_owner_trigger
  before update on public.registrations
  for each row
  execute function private.guard_registration_owner();

-- ============================================================================
-- 5. Revoke direct execute on internal trigger functions
-- ============================================================================
revoke execute on function private.guard_profile_identity() from public, anon, authenticated;
revoke execute on function private.guard_registration_owner() from public, anon, authenticated;

