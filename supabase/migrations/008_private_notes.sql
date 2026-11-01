-- Migration 008: Admin-Only Registration Notes
-- Run order: 8
-- Description: Moves admin_note from public.registrations to an admin-only table public.registration_notes,
--              updates public.admin_registrations view, public.review_registration function,
--              and private.guard_registration_owner trigger function, then drops the old column.
-- Safe to run twice: Yes (re-runnable DDL, conditional migrations, and idempotent policies).

-- ============================================================================
-- 1. Table: public.registration_notes
-- ============================================================================
-- If legacy registration_notes (from migration 002 with author_id) exists, drop it
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'registration_notes' and column_name = 'author_id'
  ) then
    drop table public.registration_notes cascade;
  end if;
end $$;

create table if not exists public.registration_notes (
  registration_id uuid primary key references public.registrations (id) on delete cascade,
  note text not null,
  updated_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now(),
  constraint registration_notes_len check (char_length(note) between 1 and 2000)
);

alter table public.registration_notes enable row level security;
revoke all on public.registration_notes from public, anon, authenticated;
grant select, insert, update, delete on public.registration_notes to authenticated;

-- Drop legacy policies from migration 004 if present
drop policy if exists registration_notes_select_staff on public.registration_notes;
drop policy if exists registration_notes_insert_staff on public.registration_notes;
drop policy if exists registration_notes_update_author on public.registration_notes;
drop policy if exists registration_notes_delete_admin on public.registration_notes;

-- Admin-only policies
drop policy if exists registration_notes_admin_select on public.registration_notes;
create policy registration_notes_admin_select on public.registration_notes
  for select to authenticated
  using ((select private.is_admin()));

drop policy if exists registration_notes_admin_insert on public.registration_notes;
create policy registration_notes_admin_insert on public.registration_notes
  for insert to authenticated
  with check ((select private.is_admin()));

drop policy if exists registration_notes_admin_update on public.registration_notes;
create policy registration_notes_admin_update on public.registration_notes
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

drop policy if exists registration_notes_admin_delete on public.registration_notes;
create policy registration_notes_admin_delete on public.registration_notes
  for delete to authenticated
  using ((select private.is_admin()));

create or replace function private.stamp_registration_note()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_by := (select auth.uid());
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function private.stamp_registration_note() from public, anon, authenticated;

drop trigger if exists stamp_note on public.registration_notes;
create trigger stamp_note before insert or update on public.registration_notes
  for each row execute function private.stamp_registration_note();

-- ============================================================================
-- 2. Copy existing notes (while registrations.admin_note still exists)
-- ============================================================================
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'registrations' and column_name = 'admin_note'
  ) then
    execute '
      insert into public.registration_notes (registration_id, note)
      select id, left(btrim(admin_note), 2000)
      from public.registrations
      where admin_note is not null and btrim(admin_note) <> ''''
      on conflict do nothing;
    ';
  end if;
end $$;

-- ============================================================================
-- 3. View: public.admin_registrations
-- Invoker security ensures callers only see rows their RLS policies permit.
-- Note is joined from admin-only public.registration_notes.
-- ============================================================================
create or replace view public.admin_registrations
with (security_invoker = true) as
select
  r.id, r.user_id, r.status, r.requested_role, n.note as admin_note, r.applied_at, r.reviewed_by, r.reviewed_at,
  p.first_name, p.last_name,
  btrim(p.first_name || ' ' || p.last_name) as full_name,
  p.email, p.phone_country_code, p.phone_number, p.registration_number, p.date_of_birth,
  p.university, p.programme, p.department, p.study_year, p.semester, p.graduation_year,
  p.interests, p.terms_accepted_at
from public.registrations r
join public.profiles p on p.id = r.user_id
left join public.registration_notes n on n.registration_id = r.id;

revoke all on public.admin_registrations from public, anon, authenticated;
grant select on public.admin_registrations to authenticated;

-- ============================================================================
-- 4. Function: public.review_registration()
-- Updates registrations.status and writes note to public.registration_notes.
-- ============================================================================
create or replace function public.review_registration(
  p_id uuid, p_action text, p_note text default null, p_role public.app_role default null
) returns public.registration_status
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_reg public.registrations%rowtype;
  v_status public.registration_status;
  v_role public.app_role;
  v_note text := nullif(btrim(coalesce(p_note, '')), '');
  v_rows integer;
begin
  if not (select private.is_admin()) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if p_action is null or p_action not in ('approve', 'reject', 'archive', 'reopen', 'restore') then
    raise exception 'invalid_action' using errcode = 'P0001';
  end if;
  if v_note is not null and char_length(v_note) > 2000 then
    raise exception 'note_too_long' using errcode = 'P0001';
  end if;

  select * into v_reg from public.registrations where id = p_id for update;
  if not found then
    raise exception 'not_found' using errcode = 'P0002';
  end if;

  if p_action = 'approve' and v_reg.status = 'pending' then
    v_status := 'approved'::public.registration_status;
  elsif p_action = 'reject' and v_reg.status = 'pending' then
    v_status := 'rejected'::public.registration_status;
  elsif p_action = 'archive' and v_reg.status in ('pending', 'approved', 'rejected') then
    v_status := 'archived'::public.registration_status;
  elsif p_action = 'reopen' and v_reg.status = 'rejected' then
    v_status := 'pending'::public.registration_status;
  elsif p_action = 'restore' and v_reg.status = 'archived' then
    select r.role into v_role from public.user_roles r where r.user_id = v_reg.user_id;
    v_status := case when v_role is null or v_role = 'participant'
      then 'pending'::public.registration_status
      else 'approved'::public.registration_status end;
  else
    raise exception 'invalid_transition' using errcode = 'P0001';
  end if;

  if p_action = 'approve' then
    if p_role is null or p_role not in ('student', 'participant', 'member', 'core') then
      raise exception 'invalid_role' using errcode = 'P0001';
    end if;
    update public.user_roles set role = p_role where user_id = v_reg.user_id;
    get diagnostics v_rows = row_count;
    if v_rows <> 1 then
      raise exception 'role_update_failed' using errcode = 'P0001';
    end if;
  end if;

  update public.registrations
     set status = v_status
   where id = p_id;
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then
    raise exception 'update_failed' using errcode = 'P0001';
  end if;

  if v_note is not null then
    insert into public.registration_notes (registration_id, note)
    values (p_id, v_note)
    on conflict (registration_id) do update
    set note = excluded.note;
  end if;

  return v_status;
end;
$$;

revoke all on function public.review_registration(uuid, text, text, public.app_role) from public, anon;
grant execute on function public.review_registration(uuid, text, text, public.app_role) to authenticated;

-- ============================================================================
-- 5. Trigger Function: private.guard_registration_owner()
-- Prevents non-admins from changing id, user_id, status, applied_at,
-- reviewed_by, or reviewed_at on public.registrations.
-- Only requested_role may change for non-admin callers (no mention of admin_note).
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

revoke execute on function private.guard_registration_owner() from public, anon, authenticated;

-- ============================================================================
-- 6. Drop old registrations.admin_note and grant update(status)
-- ============================================================================
alter table public.registrations drop column if exists admin_note;
grant update (status) on public.registrations to authenticated;

