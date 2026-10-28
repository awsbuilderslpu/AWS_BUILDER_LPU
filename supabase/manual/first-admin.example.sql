-- ============================================================================
-- FIRST ADMINISTRATOR BOOTSTRAP TEMPLATE (EXAMPLE - DO NOT RUN AS IS)
-- ============================================================================
-- Run ONCE in the Supabase SQL Editor after you have signed up and verified your email.
-- Replace 'your-email@example.com' with your actual verified email address.
-- This manual SQL update is the ONLY way the root Administrator can be created.
-- No public form, sign-up option, or application code path can create an Administrator.
-- ============================================================================

-- 1. Promote your user to active root Administrator
update public.user_roles
set
  role = 'administrator',
  is_active = true,
  updated_at = now()
where user_id = (
  select id
  from auth.users
  where email = 'your-email@example.com'
);

-- 2. Approve your registration record
update public.registrations
set
  status = 'approved',
  admin_note = 'Initial administrator bootstrap promotion',
  reviewed_at = now(),
  updated_at = now()
where user_id = (
  select id
  from auth.users
  where email = 'your-email@example.com'
);

-- 3. Verify active administrators and admins
select
  u.email,
  r.role,
  r.is_active,
  r.updated_at
from public.user_roles r
join auth.users u on u.id = r.user_id
where r.role in ('administrator', 'admin')
  and r.is_active = true;

-- ============================================================================
-- DEMOTE AN ADMIN (COMMENTED TEMPLATE - DO NOT RUN UNLESS INTENDED)
-- Note: The database guard trigger will prevent demoting the last remaining active administrator.
-- Ensure at least one other active administrator exists before executing this demotion.
-- ============================================================================
/*
update public.user_roles
set
  role = 'student',
  is_active = true,
  updated_at = now()
where user_id = (
  select id
  from auth.users
  where email = 'admin-to-demote@example.com'
);
*/
