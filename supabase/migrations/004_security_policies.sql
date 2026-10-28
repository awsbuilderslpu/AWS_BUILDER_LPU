-- Migration 004: Helper Functions, Row Level Security, Grants and Table Policies
-- Run order: 4
-- Description: Creates private security helper functions, enables RLS across all tables,
--              establishes least-privilege SQL grants, and defines fine-grained access policies.
-- Safe to run twice: Yes (uses CREATE OR REPLACE FUNCTION, DROP POLICY IF EXISTS, and REVOKE/GRANT statements).

-- ============================================================================
-- 1. Helper Functions in schema private
-- ============================================================================

-- Returns the caller's active role, or null
create or replace function private.current_app_role()
returns public.app_role
language plpgsql
security definer
stable
set search_path = ''
as $$
declare
  user_role public.app_role;
begin
  select u.role
  into user_role
  from public.user_roles u
  where u.user_id = auth.uid()
    and u.is_active = true;

  return user_role;
end;
$$;

-- Returns true if the caller is an active Administrator (full control)
create or replace function private.is_administrator()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select coalesce(private.current_app_role() = 'administrator'::public.app_role, false);
$$;

-- Returns true if the caller is an active Admin or Administrator
create or replace function private.is_admin()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select coalesce(private.current_app_role() in ('administrator'::public.app_role, 'admin'::public.app_role), false);
$$;

-- Returns true if the caller is a Captain, Admin, or Administrator
create or replace function private.is_captain()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select coalesce(private.current_app_role() in ('administrator'::public.app_role, 'admin'::public.app_role, 'captain'::public.app_role), false);
$$;

-- Returns true if the caller is Staff (Core, Captain, Admin, or Administrator)
create or replace function private.is_staff()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select coalesce(private.current_app_role() in ('administrator'::public.app_role, 'admin'::public.app_role, 'captain'::public.app_role, 'core'::public.app_role), false);
$$;

-- Returns true if the caller is an approved active member
create or replace function private.is_approved_member()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.registrations r
    join public.user_roles u on u.user_id = r.user_id
    where r.user_id = auth.uid()
      and r.status = 'approved'::public.registration_status
      and u.is_active = true
  );
$$;

-- Revoke helper execute from public and anon, grant only to authenticated
revoke all on function private.current_app_role() from public, anon;
grant execute on function private.current_app_role() to authenticated;

revoke all on function private.is_administrator() from public, anon;
grant execute on function private.is_administrator() to authenticated;

revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

revoke all on function private.is_captain() from public, anon;
grant execute on function private.is_captain() to authenticated;

revoke all on function private.is_staff() from public, anon;
grant execute on function private.is_staff() to authenticated;

revoke all on function private.is_approved_member() from public, anon;
grant execute on function private.is_approved_member() to authenticated;

-- ============================================================================
-- 2. Enable Row Level Security Across All Tables
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.registrations enable row level security;
alter table public.registration_notes enable row level security;
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;
alter table public.posts enable row level security;
alter table public.contact_messages enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- ============================================================================
-- 3. Revoke Default Privileges & Apply Granular SQL Grants
-- ============================================================================
revoke all on table public.profiles from anon, authenticated;
revoke all on table public.user_roles from anon, authenticated;
revoke all on table public.registrations from anon, authenticated;
revoke all on table public.registration_notes from anon, authenticated;
revoke all on table public.events from anon, authenticated;
revoke all on table public.event_registrations from anon, authenticated;
revoke all on table public.posts from anon, authenticated;
revoke all on table public.contact_messages from anon, authenticated;
revoke all on table public.newsletter_subscribers from anon, authenticated;

-- Profiles: Authenticated read; Column-level update (no ID or Email update)
grant select on table public.profiles to authenticated;
grant update (
  first_name,
  last_name,
  phone_country_code,
  phone_number,
  registration_number,
  university,
  programme,
  department,
  study_year,
  semester,
  graduation_year,
  date_of_birth,
  interests,
  skills,
  headline,
  bio,
  location,
  linkedin_url,
  github_url,
  website_url,
  instagram_url,
  youtube_url,
  avatar_path,
  cover_path
) on table public.profiles to authenticated;

-- User Roles: Authenticated select; update restricted
grant select, update on table public.user_roles to authenticated;

-- Registrations: Authenticated select; update status & admin_note
grant select on table public.registrations to authenticated;
grant update (status, admin_note) on table public.registrations to authenticated;

-- Registration Notes: Authenticated CRUD (guarded by staff policies)
grant select, insert, update, delete on table public.registration_notes to authenticated;

-- Events: Public read; Staff insert, update, delete
grant select on table public.events to anon, authenticated;
grant insert, update, delete on table public.events to authenticated;

-- Event Registrations: Authenticated CRUD
grant select, insert, update, delete on table public.event_registrations to authenticated;

-- Posts: Public read; Staff insert, update, delete
grant select on table public.posts to anon, authenticated;
grant insert, update, delete on table public.posts to authenticated;

-- Contact Messages: Public insert; Staff management (NO public reads!)
grant insert on table public.contact_messages to anon, authenticated;
grant select, update, delete on table public.contact_messages to authenticated;

-- Newsletter Subscribers: Public insert; Staff management (NO public reads!)
grant insert on table public.newsletter_subscribers to anon, authenticated;
grant select, update, delete on table public.newsletter_subscribers to authenticated;

-- ============================================================================
-- 4. Policies on public.profiles
-- ============================================================================
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

drop policy if exists profiles_select_staff on public.profiles;
create policy profiles_select_staff on public.profiles
  for select to authenticated
  using ((select private.is_staff()));

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists profiles_update_admin on public.profiles;
create policy profiles_update_admin on public.profiles
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- ============================================================================
-- 5. Policies on public.user_roles
-- ============================================================================
drop policy if exists user_roles_select_own on public.user_roles;
create policy user_roles_select_own on public.user_roles
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists user_roles_select_staff on public.user_roles;
create policy user_roles_select_staff on public.user_roles
  for select to authenticated
  using ((select private.is_staff()));

drop policy if exists user_roles_update_hierarchy on public.user_roles;
create policy user_roles_update_hierarchy on public.user_roles
  for update to authenticated
  using ((select private.is_captain()))
  with check ((select private.is_captain()));

-- ============================================================================
-- 6. Policies on public.registrations
-- ============================================================================
drop policy if exists registrations_select_own on public.registrations;
create policy registrations_select_own on public.registrations
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists registrations_select_staff on public.registrations;
create policy registrations_select_staff on public.registrations
  for select to authenticated
  using ((select private.is_staff()));

drop policy if exists registrations_update_staff on public.registrations;
create policy registrations_update_staff on public.registrations
  for update to authenticated
  using ((select private.is_staff()))
  with check ((select private.is_staff()));

-- ============================================================================
-- 7. Policies on public.registration_notes
-- ============================================================================
drop policy if exists registration_notes_select_staff on public.registration_notes;
create policy registration_notes_select_staff on public.registration_notes
  for select to authenticated
  using ((select private.is_staff()));

drop policy if exists registration_notes_insert_staff on public.registration_notes;
create policy registration_notes_insert_staff on public.registration_notes
  for insert to authenticated
  with check (author_id = (select auth.uid()) and (select private.is_staff()));

drop policy if exists registration_notes_update_author on public.registration_notes;
create policy registration_notes_update_author on public.registration_notes
  for update to authenticated
  using (author_id = (select auth.uid()) and (select private.is_staff()))
  with check (author_id = (select auth.uid()) and (select private.is_staff()));

drop policy if exists registration_notes_delete_admin on public.registration_notes;
create policy registration_notes_delete_admin on public.registration_notes
  for delete to authenticated
  using ((select private.is_admin()));

-- ============================================================================
-- 8. Policies on public.events
-- ============================================================================
drop policy if exists events_select_published on public.events;
create policy events_select_published on public.events
  for select to anon, authenticated
  using (status = 'published'::public.event_status and (published_at is null or published_at <= now()));

drop policy if exists events_select_staff on public.events;
create policy events_select_staff on public.events
  for select to authenticated
  using ((select private.is_staff()));

drop policy if exists events_insert_staff on public.events;
create policy events_insert_staff on public.events
  for insert to authenticated
  with check ((select private.is_staff()));

drop policy if exists events_update_staff on public.events;
create policy events_update_staff on public.events
  for update to authenticated
  using ((select private.is_staff()))
  with check ((select private.is_staff()));

drop policy if exists events_delete_staff on public.events;
create policy events_delete_staff on public.events
  for delete to authenticated
  using ((select private.is_staff()));

-- ============================================================================
-- 9. Policies on public.event_registrations
-- ============================================================================
drop policy if exists event_registrations_select_own on public.event_registrations;
create policy event_registrations_select_own on public.event_registrations
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists event_registrations_select_staff on public.event_registrations;
create policy event_registrations_select_staff on public.event_registrations
  for select to authenticated
  using ((select private.is_staff()));

drop policy if exists event_registrations_insert_own on public.event_registrations;
create policy event_registrations_insert_own on public.event_registrations
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists event_registrations_update_own on public.event_registrations;
create policy event_registrations_update_own on public.event_registrations
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists event_registrations_update_staff on public.event_registrations;
create policy event_registrations_update_staff on public.event_registrations
  for update to authenticated
  using ((select private.is_staff()))
  with check ((select private.is_staff()));

drop policy if exists event_registrations_delete_own on public.event_registrations;
create policy event_registrations_delete_own on public.event_registrations
  for delete to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists event_registrations_delete_staff on public.event_registrations;
create policy event_registrations_delete_staff on public.event_registrations
  for delete to authenticated
  using ((select private.is_staff()));

-- ============================================================================
-- 10. Policies on public.posts
-- ============================================================================
drop policy if exists posts_select_published on public.posts;
create policy posts_select_published on public.posts
  for select to anon, authenticated
  using (status = 'published'::public.post_status and (published_at is null or published_at <= now()));

drop policy if exists posts_select_staff on public.posts;
create policy posts_select_staff on public.posts
  for select to authenticated
  using ((select private.is_staff()));

drop policy if exists posts_insert_staff on public.posts;
create policy posts_insert_staff on public.posts
  for insert to authenticated
  with check ((select private.is_staff()));

drop policy if exists posts_update_staff on public.posts;
create policy posts_update_staff on public.posts
  for update to authenticated
  using ((select private.is_staff()))
  with check ((select private.is_staff()));

drop policy if exists posts_delete_staff on public.posts;
create policy posts_delete_staff on public.posts
  for delete to authenticated
  using ((select private.is_staff()));

-- ============================================================================
-- 11. Policies on public.contact_messages
-- Public can submit messages; Only Staff can read or manage submissions
-- ============================================================================
drop policy if exists contact_messages_insert_public on public.contact_messages;
create policy contact_messages_insert_public on public.contact_messages
  for insert to anon, authenticated
  with check (true);

drop policy if exists contact_messages_select_staff on public.contact_messages;
create policy contact_messages_select_staff on public.contact_messages
  for select to authenticated
  using ((select private.is_staff()));

drop policy if exists contact_messages_update_staff on public.contact_messages;
create policy contact_messages_update_staff on public.contact_messages
  for update to authenticated
  using ((select private.is_staff()))
  with check ((select private.is_staff()));

drop policy if exists contact_messages_delete_admin on public.contact_messages;
create policy contact_messages_delete_admin on public.contact_messages
  for delete to authenticated
  using ((select private.is_admin()));

-- ============================================================================
-- 12. Policies on public.newsletter_subscribers
-- Public can subscribe; Only Staff can view or manage subscriber list
-- ============================================================================
drop policy if exists newsletter_insert_public on public.newsletter_subscribers;
create policy newsletter_insert_public on public.newsletter_subscribers
  for insert to anon, authenticated
  with check (true);

drop policy if exists newsletter_select_staff on public.newsletter_subscribers;
create policy newsletter_select_staff on public.newsletter_subscribers
  for select to authenticated
  using ((select private.is_staff()));

drop policy if exists newsletter_update_staff on public.newsletter_subscribers;
create policy newsletter_update_staff on public.newsletter_subscribers
  for update to authenticated
  using ((select private.is_staff()))
  with check ((select private.is_staff()));

drop policy if exists newsletter_delete_admin on public.newsletter_subscribers;
create policy newsletter_delete_admin on public.newsletter_subscribers
  for delete to authenticated
  using ((select private.is_admin()));
