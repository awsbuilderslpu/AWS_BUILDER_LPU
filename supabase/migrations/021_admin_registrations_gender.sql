-- Migration 021: Add gender and missing profile fields to admin views
-- Run order: 21
-- Description: Updates public.admin_registrations and public.admin_members views to include p.gender and p.date_of_birth.
-- Safe to run twice: Yes.

-- 1. Drop and recreate public.admin_registrations
drop view if exists public.admin_registrations cascade;

create view public.admin_registrations
with (security_invoker = true) as
select
  r.id, r.user_id, r.status, r.requested_role, n.note as admin_note, r.applied_at, r.reviewed_by, r.reviewed_at,
  p.first_name, p.last_name,
  btrim(p.first_name || ' ' || p.last_name) as full_name,
  p.email, p.phone_country_code, p.phone_number, p.registration_number, p.date_of_birth,
  p.gender,
  p.university, p.programme, p.department, p.study_year, p.semester, p.graduation_year,
  p.interests, p.terms_accepted_at
from public.registrations r
join public.profiles p on p.id = r.user_id
left join public.registration_notes n on n.registration_id = r.id;

revoke all on public.admin_registrations from public, anon, authenticated;
grant select on public.admin_registrations to authenticated;

-- 2. Drop and recreate public.admin_members
drop view if exists public.admin_members cascade;

create view public.admin_members
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
  p.email, p.phone_country_code, p.phone_number, p.registration_number, p.date_of_birth,
  p.gender,
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
