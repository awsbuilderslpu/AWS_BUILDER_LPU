-- ============================================================================
-- Supabase Row Level Security & Database Foundation Audit Queries
-- Run these queries in the Supabase SQL Editor after applying migrations 001-011.
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
    'blogs',
    'contact_messages',
    'newsletter_subscribers',
    'admin_audit_log'
  )
  and rowsecurity = false;

-- 2 every policy in schemas public and storage (schemaname, tablename, policyname, roles, cmd), ordered (expect: exactly 4 policies on public.registrations)
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

-- 6 privileges held by the anon role on table-level grants (expect: SELECT on posts; INSERT on contact_messages & newsletter_subscribers; NO table-level access to events, profiles, user_roles, registrations, registration_notes, event_registrations, admin_registrations, admin_members, admin_audit_log, blogs)
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
    'event_registrations',
    'posts',
    'blogs',
    'contact_messages',
    'newsletter_subscribers',
    'admin_registrations',
    'admin_members',
    'admin_audit_log'
  )
  and grantee = 'anon'
order by table_name, privilege_type;

-- 7 count of active administrators / admins in user_roles (expect: 0 now, 1 after the first admin is set)
select
  count(*) as active_admin_count
from public.user_roles
where role in ('administrator', 'admin')
  and is_active = true;

-- 8 views in schema public that are not security_invoker (expect: no rows)
select
  c.relname as view_name,
  c.reloptions
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'v'
  and (
    c.reloptions is null
    or not ('security_invoker=true' = any(c.reloptions))
  );

-- 9 functions in schema public with their security type (expect: review_registration, set_member_role, set_member_active, remove_member and set_featured_blog, none security definer)
select
  p.proname as function_name,
  p.prosecdef as is_security_definer
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
order by p.proname;

-- 10 columns named admin_note in any table of schema public (expect: no rows)
select
  table_schema,
  table_name,
  column_name
from information_schema.columns
where table_schema = 'public'
  and column_name = 'admin_note';

-- 11 policies on registration_notes (expect 4, all to authenticated) and on admin_audit_log (expect 1, select only)
select
  schemaname,
  tablename,
  policyname,
  roles,
  cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('registration_notes', 'admin_audit_log')
order by tablename, policyname;

-- 12 privileges held by anon on events (expect: only select, and only the 16 listed columns; no insert, update or delete, and no created_by, updated_by or meeting_url)
select
  grantee,
  table_schema,
  table_name,
  column_name,
  privilege_type
from information_schema.column_privileges
where table_schema = 'public'
  and table_name = 'events'
  and grantee = 'anon'
order by column_name, privilege_type;

-- 13 policies on public.events (expect 4: events_select_public, events_select_staff, events_insert_staff, events_update_staff; no delete policy)
select
  schemaname,
  tablename,
  policyname,
  roles,
  cmd
from pg_policies
where schemaname = 'public'
  and tablename = 'events'
order by policyname;

-- 14 policies on public.blogs (expect 4: blogs_select_public, blogs_select_staff, blogs_insert_staff, blogs_update_staff; no delete policy)
select
  schemaname,
  tablename,
  policyname,
  roles,
  cmd
from pg_policies
where schemaname = 'public'
  and tablename = 'blogs'
order by policyname;

-- 15 columns granted to anon or authenticated on public.blogs (expect exactly the 17 columns in the select grant; no author_id, created_by or updated_by)
select
  grantee,
  table_schema,
  table_name,
  column_name,
  privilege_type
from information_schema.column_privileges
where table_schema = 'public'
  and table_name = 'blogs'
  and grantee in ('anon', 'authenticated')
order by grantee, column_name, privilege_type;

-- 16 the unique index blogs_one_featured_idx exists (expect: 1 row with indisunique = true)
select
  indexname,
  indexdef
from pg_indexes
where schemaname = 'public'
  and tablename = 'blogs'
  and indexname = 'blogs_one_featured_idx';
