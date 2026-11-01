-- Migration 009: Member Admin View, Functions & Audit Log
-- Run order: 9
-- Description: Creates public.admin_members security-invoker view,
--              set_member_role, set_member_active, and remove_member admin functions,
--              and public.admin_audit_log with security definer triggers on user_roles and registrations.
-- Safe to run twice: Yes (re-runnable DDL, CREATE OR REPLACE, DROP IF EXISTS).

-- ============================================================================
-- 1. View: public.admin_members
-- Invoker security ensures callers only see rows their RLS policies permit.
-- A member is an approved registration, or holds any role above participant.
-- ============================================================================
create or replace view public.admin_members
with (security_invoker = true) as
select
  ur.user_id,
  r.id as registration_id,
  ur.role,
  ur.is_active,
  r.status as registration_status,
  n.note as admin_note,
  coalesce(r.reviewed_at, p.created_at) as member_since,
  p.first_name, p.last_name,
  btrim(p.first_name || ' ' || p.last_name) as full_name,
  p.email, p.phone_country_code, p.phone_number, p.registration_number,
  p.university, p.programme, p.department, p.study_year, p.semester, p.graduation_year,
  p.interests, p.skills, p.headline, p.bio, p.location,
  p.linkedin_url, p.github_url, p.website_url, p.instagram_url, p.youtube_url
from public.user_roles ur
join public.profiles p on p.id = ur.user_id
left join public.registrations r on r.user_id = ur.user_id
left join public.registration_notes n on n.registration_id = r.id
where r.status = 'approved' or ur.role <> 'participant';

revoke all on public.admin_members from public, anon, authenticated;
grant select on public.admin_members to authenticated;

-- ============================================================================
-- 2. Function: public.set_member_role(p_user_id uuid, p_role public.app_role)
-- ============================================================================
create or replace function public.set_member_role(p_user_id uuid, p_role public.app_role)
returns public.app_role
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_role public.app_role;
  v_active boolean;
  v_status public.registration_status;
  v_rows integer;
begin
  if not (select private.is_admin()) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if p_user_id is null or p_role is null then
    raise exception 'invalid_input' using errcode = 'P0001';
  end if;
  if p_user_id = (select auth.uid()) then
    raise exception 'cannot_change_self' using errcode = 'P0001';
  end if;

  select ur.role, ur.is_active, r.status
    into v_role, v_active, v_status
    from public.user_roles ur
    left join public.registrations r on r.user_id = ur.user_id
   where ur.user_id = p_user_id
   for update of ur;
  if not found then
    raise exception 'not_found' using errcode = 'P0002';
  end if;
  if not (coalesce(v_status = 'approved', false) or v_role <> 'participant') then
    raise exception 'not_a_member' using errcode = 'P0001';
  end if;
  if p_role = v_role then
    raise exception 'no_change' using errcode = 'P0001';
  end if;
  if p_role = 'admin' and not (coalesce(v_status = 'approved', false) and v_active) then
    raise exception 'admin_requires_approved_active' using errcode = 'P0001';
  end if;
  if v_role = 'admin' and v_active and not exists (
       select 1 from public.user_roles o
        where o.role = 'admin' and o.is_active and o.user_id <> p_user_id) then
    raise exception 'last_admin' using errcode = 'P0001';
  end if;

  update public.user_roles set role = p_role where user_id = p_user_id;
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then
    raise exception 'update_failed' using errcode = 'P0001';
  end if;
  return p_role;
end;
$$;

revoke all on function public.set_member_role(uuid, public.app_role) from public, anon;
grant execute on function public.set_member_role(uuid, public.app_role) to authenticated;

-- ============================================================================
-- 3. Function: public.set_member_active(p_user_id uuid, p_active boolean)
-- ============================================================================
create or replace function public.set_member_active(p_user_id uuid, p_active boolean)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_role public.app_role;
  v_active boolean;
  v_status public.registration_status;
  v_rows integer;
begin
  if not (select private.is_admin()) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if p_user_id is null or p_active is null then
    raise exception 'invalid_input' using errcode = 'P0001';
  end if;
  if p_user_id = (select auth.uid()) then
    raise exception 'cannot_change_self' using errcode = 'P0001';
  end if;

  select ur.role, ur.is_active, r.status
    into v_role, v_active, v_status
    from public.user_roles ur
    left join public.registrations r on r.user_id = ur.user_id
   where ur.user_id = p_user_id
   for update of ur;
  if not found then
    raise exception 'not_found' using errcode = 'P0002';
  end if;
  if not (coalesce(v_status = 'approved', false) or v_role <> 'participant') then
    raise exception 'not_a_member' using errcode = 'P0001';
  end if;
  if p_active = v_active then
    raise exception 'no_change' using errcode = 'P0001';
  end if;
  if v_role = 'admin' and v_active and not p_active and not exists (
       select 1 from public.user_roles o
        where o.role = 'admin' and o.is_active and o.user_id <> p_user_id) then
    raise exception 'last_admin' using errcode = 'P0001';
  end if;

  update public.user_roles set is_active = p_active where user_id = p_user_id;
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then
    raise exception 'update_failed' using errcode = 'P0001';
  end if;
  return p_active;
end;
$$;

revoke all on function public.set_member_active(uuid, boolean) from public, anon;
grant execute on function public.set_member_active(uuid, boolean) to authenticated;

-- ============================================================================
-- 4. Function: public.remove_member(p_user_id uuid)
-- ============================================================================
create or replace function public.remove_member(p_user_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_role public.app_role;
  v_active boolean;
  v_status public.registration_status;
  v_rows integer;
begin
  if not (select private.is_admin()) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if p_user_id is null then
    raise exception 'invalid_input' using errcode = 'P0001';
  end if;
  if p_user_id = (select auth.uid()) then
    raise exception 'cannot_change_self' using errcode = 'P0001';
  end if;

  select ur.role, ur.is_active, r.status
    into v_role, v_active, v_status
    from public.user_roles ur
    left join public.registrations r on r.user_id = ur.user_id
   where ur.user_id = p_user_id
   for update of ur;
  if not found then
    raise exception 'not_found' using errcode = 'P0002';
  end if;
  if not (coalesce(v_status = 'approved', false) or v_role <> 'participant') then
    raise exception 'not_a_member' using errcode = 'P0001';
  end if;
  if v_role = 'admin' then
    raise exception 'demote_admin_first' using errcode = 'P0001';
  end if;

  update public.user_roles set role = 'participant' where user_id = p_user_id;
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then
    raise exception 'update_failed' using errcode = 'P0001';
  end if;

  update public.registrations
     set status = 'archived'
   where user_id = p_user_id and status <> 'archived';
end;
$$;

revoke all on function public.remove_member(uuid) from public, anon;
grant execute on function public.remove_member(uuid) to authenticated;

-- ============================================================================
-- 5. Table: public.admin_audit_log
-- Append-only audit log for role, active status, and registration status changes.
-- ============================================================================
create table if not exists public.admin_audit_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  actor_id uuid,
  target_user_id uuid,
  action text not null,
  old_value text,
  new_value text
);

create index if not exists idx_admin_audit_log_target_at on public.admin_audit_log (target_user_id, at desc);

alter table public.admin_audit_log enable row level security;
revoke all on public.admin_audit_log from public, anon, authenticated;
grant select on public.admin_audit_log to authenticated;

drop policy if exists admin_audit_log_admin_select on public.admin_audit_log;
create policy admin_audit_log_admin_select on public.admin_audit_log
  for select to authenticated
  using ((select private.is_admin()));

-- ============================================================================
-- 6. Trigger Functions: Audit Triggers
-- Security definer triggers write audit entries on user_roles and registrations updates.
-- ============================================================================
create or replace function private.audit_user_roles()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.role is distinct from new.role then
    insert into public.admin_audit_log (actor_id, target_user_id, action, old_value, new_value)
    values ((select auth.uid()), new.user_id, 'role_changed', old.role::text, new.role::text);
  end if;
  if old.is_active is distinct from new.is_active then
    insert into public.admin_audit_log (actor_id, target_user_id, action, old_value, new_value)
    values ((select auth.uid()), new.user_id, 'active_changed', old.is_active::text, new.is_active::text);
  end if;
  return null;
end;
$$;

revoke all on function private.audit_user_roles() from public, anon, authenticated;

drop trigger if exists audit_user_roles_trigger on public.user_roles;
create trigger audit_user_roles_trigger
  after update on public.user_roles
  for each row execute function private.audit_user_roles();

create or replace function private.audit_registrations()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.status is distinct from new.status then
    insert into public.admin_audit_log (actor_id, target_user_id, action, old_value, new_value)
    values ((select auth.uid()), new.user_id, 'registration_status_changed', old.status::text, new.status::text);
  end if;
  return null;
end;
$$;

revoke all on function private.audit_registrations() from public, anon, authenticated;

drop trigger if exists audit_registrations_trigger on public.registrations;
create trigger audit_registrations_trigger
  after update on public.registrations
  for each row execute function private.audit_registrations();

