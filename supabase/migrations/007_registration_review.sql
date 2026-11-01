-- Migration 007: Registration Review View & Function
-- Run order: 7
-- Description: Creates public.admin_registrations security-invoker view and
--              public.review_registration transactional review function.
-- Safe to run twice: Yes (uses CREATE OR REPLACE VIEW, CREATE OR REPLACE FUNCTION, and REVOKE/GRANT statements).

-- ============================================================================
-- 1. View: public.admin_registrations
-- Invoker security ensures callers only see rows their RLS policies permit.
-- Admins see all registrations and member profiles; regular members see only their own.
-- ============================================================================
create or replace view public.admin_registrations
with (security_invoker = true) as
select
  r.id, r.user_id, r.status, r.requested_role, r.admin_note, r.applied_at, r.reviewed_by, r.reviewed_at,
  p.first_name, p.last_name,
  btrim(p.first_name || ' ' || p.last_name) as full_name,
  p.email, p.phone_country_code, p.phone_number, p.registration_number, p.date_of_birth,
  p.university, p.programme, p.department, p.study_year, p.semester, p.graduation_year,
  p.interests, p.terms_accepted_at
from public.registrations r
join public.profiles p on p.id = r.user_id;

revoke all on public.admin_registrations from public, anon, authenticated;
grant select on public.admin_registrations to authenticated;

-- ============================================================================
-- 2. Function: public.review_registration()
-- Executes the registration review state machine in SQL and, when approving,
-- updates user_roles in the exact same transaction.
-- Enforces: admin-only execution, valid state transitions, and role grants.
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
     set status = v_status, admin_note = coalesce(v_note, admin_note)
   where id = p_id;
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then
    raise exception 'update_failed' using errcode = 'P0001';
  end if;

  return v_status;
end;
$$;

revoke all on function public.review_registration(uuid, text, text, public.app_role) from public, anon;
grant execute on function public.review_registration(uuid, text, text, public.app_role) to authenticated;

