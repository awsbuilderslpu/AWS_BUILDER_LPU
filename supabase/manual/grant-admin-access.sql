-- ============================================================================
-- GRANT ADMINISTRATOR ACCESS TO SPECIFIC USERS
-- ============================================================================
-- Accounts:
--   1. parambrar862@gmail.com
--   2. jpshashank200@gmail.com
--
-- Instructions:
--   Run this script in the Supabase SQL Editor (Dashboard > SQL Editor > New query).
--   Note: Both accounts must have signed in or registered with their email first.
-- ============================================================================

-- 1. Promote users to active root Administrator in public.user_roles
insert into public.user_roles (user_id, role, is_active, updated_at)
select id, 'administrator'::public.app_role, true, now()
from auth.users
where lower(email) in ('parambrar862@gmail.com', 'jpshashank200@gmail.com')
on conflict (user_id) do update
set
  role = 'administrator',
  is_active = true,
  updated_at = now();

-- 2. Approve registration records in public.registrations
insert into public.registrations (user_id, status, reviewed_at, updated_at)
select id, 'approved'::public.registration_status, now(), now()
from auth.users
where lower(email) in ('parambrar862@gmail.com', 'jpshashank200@gmail.com')
on conflict (user_id) do update
set
  status = 'approved',
  reviewed_at = now(),
  updated_at = now();

-- 3. Verify the updated roles and registration statuses
select
  u.id,
  u.email,
  r.role,
  r.is_active,
  reg.status as registration_status,
  r.updated_at
from auth.users u
left join public.user_roles r on r.user_id = u.id
left join public.registrations reg on reg.user_id = u.id
where lower(u.email) in ('parambrar862@gmail.com', 'jpshashank200@gmail.com');

