-- ============================================================================
-- Supabase Row Level Security & Database Foundation Audit Queries
-- Run these queries in the Supabase SQL Editor after applying migrations 001-005.
-- ============================================================================

-- 1 tables in schema public with row level security off (expect: no rows)
select
  schemaname,
  tablename,
  rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'profiles',
    'user_roles',
    'registrations',
    'registration_notes',
    'events',
    'event_registrations',
    'posts',
    'contact_messages',
    'newsletter_subscribers'
  )
  and rowsecurity = false;

-- 2 every policy in schemas public and storage (schemaname, tablename, policyname, roles, cmd), ordered
select
  schemaname,
  tablename,
  policyname,
  roles,
  cmd
from pg_policies
where schemaname in ('public', 'storage')
order by schemaname, tablename, policyname;

-- 3 security definer functions in public or private that do not set search_path (expect: no rows)
select
  n.nspname as schema_name,
  p.proname as function_name,
  p.prosecdef as is_security_definer,
  p.proconfig as config_settings
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname in ('public', 'private')
  and p.prosecdef = true
  and (
    p.proconfig is null
    or not exists (
      select 1
      from unnest(p.proconfig) as cfg
      where cfg like 'search_path=%'
    )
  );

-- 4 security definer functions in schema public (expect: no rows)
select
  n.nspname as schema_name,
  p.proname as function_name
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.prosecdef = true;

-- 5 storage.buckets: id, public, file_size_limit, allowed_mime_types (expect: avatars and covers private, event-images and blog-images public, image types only)
select
  id,
  public,
  file_size_limit,
  allowed_mime_types
from storage.buckets
where id in ('avatars', 'covers', 'event-images', 'blog-images')
order by id;

-- 6 privileges held by the anon role on all tables (expect: SELECT on events & posts; INSERT on contact_messages & newsletter_subscribers; NO access to profiles, user_roles, registrations, registration_notes, event_registrations)
select
  grantee,
  table_schema,
  table_name,
  privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in (
    'profiles',
    'user_roles',
    'registrations',
    'registration_notes',
    'events',
    'event_registrations',
    'posts',
    'contact_messages',
    'newsletter_subscribers'
  )
  and grantee = 'anon'
order by table_name, privilege_type;

-- 7 count of active administrators / admins in user_roles (expect: 0 now, 1 after the first admin is set)
select
  count(*) as active_admin_count
from public.user_roles
where role in ('administrator', 'admin')
  and is_active = true;
