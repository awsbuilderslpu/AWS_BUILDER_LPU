-- Migration 002: Tables, Constraints, Indexes and Guard Triggers
-- Run order: 2
-- Description: Creates all application tables (user_roles, profiles, registrations, registration_notes,
--              events, event_registrations, posts, contact_messages, newsletter_subscribers),
--              indexes, updated_at triggers, and business logic guard functions.
-- Safe to run twice: Yes (uses IF NOT EXISTS, DROP TRIGGER IF EXISTS, and CREATE OR REPLACE FUNCTION).

-- ============================================================================
-- 1. Table: public.user_roles
-- ============================================================================
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'participant',
  is_active boolean not null default true,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================================
-- 2. Table: public.profiles
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  email text,
  phone_country_code text,
  phone_number text,
  registration_number text,
  university text,
  programme text,
  department text,
  study_year text,
  semester text,
  date_of_birth date,
  graduation_year integer,
  interests text[] not null default '{}',
  skills text[] not null default '{}',
  headline text,
  bio text,
  location text,
  linkedin_url text,
  github_url text,
  website_url text,
  instagram_url text,
  youtube_url text,
  avatar_path text,
  cover_path text,
  terms_accepted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint check_profiles_first_name check (char_length(first_name) <= 60),
  constraint check_profiles_last_name check (char_length(last_name) <= 60),
  constraint check_profiles_bio check (bio is null or char_length(bio) <= 1000),
  constraint check_profiles_headline check (headline is null or char_length(headline) <= 120),
  constraint check_profiles_location check (location is null or char_length(location) <= 120),
  constraint check_profiles_email check (email is null or char_length(email) <= 200),
  constraint check_profiles_phone_country_code check (phone_country_code is null or char_length(phone_country_code) <= 200),
  constraint check_profiles_phone_number check (phone_number is null or char_length(phone_number) <= 200),
  constraint check_profiles_registration_number check (registration_number is null or char_length(registration_number) <= 200),
  constraint check_profiles_university check (university is null or char_length(university) <= 200),
  constraint check_profiles_programme check (programme is null or char_length(programme) <= 200),
  constraint check_profiles_department check (department is null or char_length(department) <= 200),
  constraint check_profiles_study_year check (study_year is null or char_length(study_year) <= 200),
  constraint check_profiles_semester check (semester is null or char_length(semester) <= 200),
  constraint check_profiles_avatar_path check (avatar_path is null or char_length(avatar_path) <= 200),
  constraint check_profiles_cover_path check (cover_path is null or char_length(cover_path) <= 200),
  constraint check_profiles_linkedin_url check (linkedin_url is null or (char_length(linkedin_url) <= 300 and linkedin_url ~* '^https?://')),
  constraint check_profiles_github_url check (github_url is null or (char_length(github_url) <= 300 and github_url ~* '^https?://')),
  constraint check_profiles_website_url check (website_url is null or (char_length(website_url) <= 300 and website_url ~* '^https?://')),
  constraint check_profiles_instagram_url check (instagram_url is null or (char_length(instagram_url) <= 300 and instagram_url ~* '^https?://')),
  constraint check_profiles_youtube_url check (youtube_url is null or (char_length(youtube_url) <= 300 and youtube_url ~* '^https?://')),
  constraint check_profiles_graduation_year check (graduation_year is null or (graduation_year between 2000 and 2100)),
  constraint check_profiles_interests_count check (cardinality(interests) <= 20),
  constraint check_profiles_skills_count check (cardinality(skills) <= 20)
);

-- ============================================================================
-- 3. Table: public.registrations
-- ============================================================================
create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  status public.registration_status not null default 'pending',
  requested_role public.app_role not null default 'student',
  admin_note text,
  applied_at timestamptz default now(),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  updated_at timestamptz default now(),
  constraint check_registrations_admin_note check (admin_note is null or char_length(admin_note) <= 2000)
);

-- ============================================================================
-- 4. Table: public.registration_notes
-- ============================================================================
create table if not exists public.registration_notes (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  note text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint check_registration_notes_length check (char_length(note) between 1 and 2000)
);

-- ============================================================================
-- 5. Table: public.events
-- ============================================================================
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  content text,
  category public.event_category not null default 'community',
  status public.event_status not null default 'draft',
  start_date timestamptz not null,
  end_date timestamptz,
  registration_deadline timestamptz,
  location text not null,
  location_type text not null default 'in-person',
  image_path text,
  capacity integer,
  registration_count integer not null default 0,
  is_featured boolean not null default false,
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint check_events_slug check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(slug) <= 120),
  constraint check_events_title check (char_length(title) between 3 and 200),
  constraint check_events_description check (char_length(description) between 10 and 2000),
  constraint check_events_content check (content is null or char_length(content) <= 50000),
  constraint check_events_end_date check (end_date is null or end_date >= start_date),
  constraint check_events_registration_deadline check (registration_deadline is null or registration_deadline <= start_date),
  constraint check_events_location check (char_length(location) between 2 and 200),
  constraint check_events_location_type check (location_type in ('in-person', 'virtual', 'hybrid')),
  constraint check_events_image_path check (image_path is null or char_length(image_path) <= 300),
  constraint check_events_capacity check (capacity is null or capacity > 0),
  constraint check_events_registration_count check (registration_count >= 0)
);

-- ============================================================================
-- 6. Table: public.event_registrations
-- ============================================================================
create table if not exists public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'confirmed',
  registered_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint check_event_reg_status check (status in ('confirmed', 'waitlisted', 'cancelled', 'attended')),
  constraint uq_event_registrations_event_user unique (event_id, user_id)
);

-- ============================================================================
-- 7. Table: public.posts
-- ============================================================================
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content text not null default '',
  category text not null default 'Community',
  topics text[] not null default '{}',
  author_id uuid references auth.users(id) on delete set null,
  author_name text,
  cover_image_path text,
  read_time_minutes integer,
  is_featured boolean not null default false,
  status public.post_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint check_posts_slug check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(slug) <= 140),
  constraint check_posts_title check (char_length(title) between 3 and 200),
  constraint check_posts_excerpt check (excerpt is null or char_length(excerpt) <= 500),
  constraint check_posts_content check (char_length(content) <= 100000),
  constraint check_posts_category check (char_length(category) between 2 and 60),
  constraint check_posts_topics check (cardinality(topics) <= 10),
  constraint check_posts_author_name check (author_name is null or char_length(author_name) <= 100),
  constraint check_posts_cover_image check (cover_image_path is null or char_length(cover_image_path) <= 300),
  constraint check_posts_read_time check (read_time_minutes is null or (read_time_minutes between 1 and 120))
);

-- ============================================================================
-- 8. Table: public.contact_messages
-- ============================================================================
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  registration_number text,
  university text,
  subject text not null,
  message text not null,
  resume_path text,
  status text not null default 'new',
  assigned_to uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint check_contact_name check (char_length(name) between 2 and 100),
  constraint check_contact_email check (email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$' and char_length(email) <= 200),
  constraint check_contact_phone check (phone is null or char_length(phone) <= 30),
  constraint check_contact_reg_num check (registration_number is null or char_length(registration_number) <= 50),
  constraint check_contact_university check (university is null or char_length(university) <= 100),
  constraint check_contact_subject check (char_length(subject) between 2 and 200),
  constraint check_contact_message check (char_length(message) between 10 and 3000),
  constraint check_contact_resume_path check (resume_path is null or char_length(resume_path) <= 300),
  constraint check_contact_status check (status in ('new', 'read', 'in_progress', 'resolved', 'archived'))
);

-- ============================================================================
-- 9. Table: public.newsletter_subscribers
-- ============================================================================
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  is_active boolean not null default true,
  subscribed_at timestamptz default now(),
  unsubscribed_at timestamptz,
  constraint check_newsletter_email check (email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$' and char_length(email) <= 200)
);

-- ============================================================================
-- Indexes for Performance and Query Optimization
-- ============================================================================
create index if not exists idx_user_roles_role on public.user_roles (role);
create index if not exists idx_profiles_registration_number on public.profiles (registration_number);
create index if not exists idx_registrations_status_applied_at on public.registrations (status, applied_at desc);
create index if not exists idx_registration_notes_reg_id on public.registration_notes (registration_id, created_at desc);
create index if not exists idx_events_status_start_date on public.events (status, start_date);
create index if not exists idx_events_slug on public.events (slug);
create index if not exists idx_event_reg_event on public.event_registrations (event_id, status);
create index if not exists idx_event_reg_user on public.event_registrations (user_id);
create index if not exists idx_posts_status_published_at on public.posts (status, published_at desc);
create index if not exists idx_posts_slug on public.posts (slug);
create index if not exists idx_contact_messages_status_created on public.contact_messages (status, created_at desc);
create index if not exists idx_newsletter_subscribers_email on public.newsletter_subscribers (email);
create index if not exists idx_newsletter_subscribers_is_active on public.newsletter_subscribers (is_active);

-- ============================================================================
-- Updated_at Triggers for All Tables Having updated_at
-- ============================================================================
drop trigger if exists set_user_roles_updated_at on public.user_roles;
create trigger set_user_roles_updated_at before update on public.user_roles
  for each row execute function private.set_updated_at();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles
  for each row execute function private.set_updated_at();

drop trigger if exists set_registrations_updated_at on public.registrations;
create trigger set_registrations_updated_at before update on public.registrations
  for each row execute function private.set_updated_at();

drop trigger if exists set_registration_notes_updated_at on public.registration_notes;
create trigger set_registration_notes_updated_at before update on public.registration_notes
  for each row execute function private.set_updated_at();

drop trigger if exists set_events_updated_at on public.events;
create trigger set_events_updated_at before update on public.events
  for each row execute function private.set_updated_at();

drop trigger if exists set_event_registrations_updated_at on public.event_registrations;
create trigger set_event_registrations_updated_at before update on public.event_registrations
  for each row execute function private.set_updated_at();

drop trigger if exists set_posts_updated_at on public.posts;
create trigger set_posts_updated_at before update on public.posts
  for each row execute function private.set_updated_at();

drop trigger if exists set_contact_messages_updated_at on public.contact_messages;
create trigger set_contact_messages_updated_at before update on public.contact_messages
  for each row execute function private.set_updated_at();

-- ============================================================================
-- Trigger Function: private.guard_user_roles()
-- Enforces the role delegation hierarchy and prevents removing the last admin:
-- - Administrator: full control.
-- - Admin: can appoint/promote Captains, Core, Members. Cannot modify Admins/Administrators.
-- - Captain: can appoint/promote Core, Members. Cannot modify Captains, Admins, Administrators.
-- - Core/Members/Participants: cannot modify any user role.
-- ============================================================================
create or replace function private.guard_user_roles()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  active_admin_count integer;
  caller_role public.app_role;
begin
  -- 1. Protect against demoting, deactivating, or deleting the last active Administrator/Admin
  if tg_op in ('UPDATE', 'DELETE') then
    if old.role in ('administrator', 'admin') and old.is_active = true then
      if (tg_op = 'DELETE') or (new.role not in ('administrator', 'admin') or new.is_active <> true) then
        select count(*)
        into active_admin_count
        from public.user_roles
        where role in ('administrator', 'admin')
          and is_active = true
          and user_id <> old.user_id;

        if active_admin_count = 0 then
          raise exception 'Cannot demote, deactivate or delete the last active administrator';
        end if;
      end if;
    end if;
  end if;

  -- 2. Enforce delegation hierarchy if called by a signed-in user
  if auth.uid() is not null then
    select role into caller_role
    from public.user_roles
    where user_id = auth.uid()
      and is_active = true;

    if caller_role is null then
      raise exception 'Unauthorized: caller has no active role';
    end if;

    if tg_op = 'UPDATE' then
      new.updated_by = auth.uid();

      if caller_role = 'administrator' then
        -- Administrator has full control
        null;

      elsif caller_role = 'admin' then
        -- Admin can appoint or promote Captains and below
        if old.role in ('administrator', 'admin') and old.user_id <> auth.uid() then
          raise exception 'Admins cannot modify Administrators or other Admins';
        end if;
        if new.role in ('administrator', 'admin') and old.role not in ('administrator', 'admin') then
          raise exception 'Only an Administrator can appoint or promote Admins or Administrators';
        end if;

      elsif caller_role = 'captain' then
        -- Captain can appoint or promote Core and below
        if old.role in ('administrator', 'admin', 'captain') then
          raise exception 'Captains cannot modify Captains, Admins, or Administrators';
        end if;
        if new.role in ('administrator', 'admin', 'captain') then
          raise exception 'Only an Admin or Administrator can appoint Captains';
        end if;

      else
        raise exception 'Insufficient privileges to modify user roles';
      end if;

      return new;

    elsif tg_op = 'DELETE' then
      if caller_role = 'administrator' then
        null;
      elsif caller_role = 'admin' then
        if old.role in ('administrator', 'admin') then
          raise exception 'Admins cannot delete Administrators or Admins';
        end if;
      elsif caller_role = 'captain' then
        if old.role in ('administrator', 'admin', 'captain') then
          raise exception 'Captains cannot delete Captains, Admins, or Administrators';
        end if;
      else
        raise exception 'Insufficient privileges to delete user roles';
      end if;

      return old;
    end if;
  else
    -- Direct SQL / superuser context
    if tg_op = 'UPDATE' then
      return new;
    elsif tg_op = 'DELETE' then
      return old;
    end if;
  end if;

  return null;
end;
$$;

drop trigger if exists guard_user_roles_trigger on public.user_roles;
create trigger guard_user_roles_trigger
  before update or delete on public.user_roles
  for each row
  execute function private.guard_user_roles();

-- ============================================================================
-- Trigger Function: private.stamp_registration_review()
-- Stamps reviewed_by and reviewed_at when registration status transitions
-- ============================================================================
create or replace function private.stamp_registration_review()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if old.status is distinct from new.status then
    new.reviewed_by = auth.uid();
    new.reviewed_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists stamp_registration_review_trigger on public.registrations;
create trigger stamp_registration_review_trigger
  before update on public.registrations
  for each row
  execute function private.stamp_registration_review();

-- ============================================================================
-- Trigger Function: private.guard_profile_identity()
-- Prevents non-admin signed-in users from modifying core identity fields
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
      if old.id is distinct from new.id
         or old.email is distinct from new.email
         or old.registration_number is distinct from new.registration_number
         or old.date_of_birth is distinct from new.date_of_birth then
        raise exception 'Cannot modify protected identity fields (id, email, registration_number, date_of_birth)';
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists guard_profile_identity_trigger on public.profiles;
create trigger guard_profile_identity_trigger
  before update on public.profiles
  for each row
  execute function private.guard_profile_identity();

-- ============================================================================
-- Trigger Function: private.handle_event_registration()
-- Concurrency-safe event registration capacity & deadline validator
-- Uses SELECT ... FOR UPDATE to lock the event row during insert/status update,
-- ensuring serialized capacity counts without race conditions.
-- ============================================================================
create or replace function private.handle_event_registration()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event record;
begin
  if tg_op = 'INSERT' then
    -- Lock event row against concurrent sign-ups
    select
      status,
      start_date,
      registration_deadline,
      capacity,
      registration_count
    into v_event
    from public.events
    where id = new.event_id
    for update;

    if not found then
      raise exception 'Event not found';
    end if;

    if v_event.status <> 'published'::public.event_status then
      raise exception 'Registrations are only open for published events';
    end if;

    if now() > coalesce(v_event.registration_deadline, v_event.start_date) then
      raise exception 'Event registration deadline has passed';
    end if;

    if new.status = 'confirmed' then
      if v_event.capacity is not null and v_event.registration_count >= v_event.capacity then
        raise exception 'Event has reached full capacity';
      end if;

      update public.events
      set registration_count = registration_count + 1
      where id = new.event_id;
    end if;

    return new;

  elsif tg_op = 'UPDATE' then
    if old.event_id <> new.event_id then
      raise exception 'Cannot change event_id of an existing registration';
    end if;

    if old.status <> new.status then
      select
        capacity,
        registration_count
      into v_event
      from public.events
      where id = new.event_id
      for update;

      if old.status = 'confirmed' and new.status in ('cancelled', 'waitlisted') then
        update public.events
        set registration_count = greatest(0, registration_count - 1)
        where id = new.event_id;
      elsif old.status in ('cancelled', 'waitlisted') and new.status = 'confirmed' then
        if v_event.capacity is not null and v_event.registration_count >= v_event.capacity then
          raise exception 'Cannot confirm registration: event is at full capacity';
        end if;
        update public.events
        set registration_count = registration_count + 1
        where id = new.event_id;
      end if;
    end if;

    return new;

  elsif tg_op = 'DELETE' then
    if old.status = 'confirmed' then
      update public.events
      set registration_count = greatest(0, registration_count - 1)
      where id = old.event_id;
    end if;
    return old;
  end if;

  return null;
end;
$$;

drop trigger if exists event_registration_capacity_trigger on public.event_registrations;
create trigger event_registration_capacity_trigger
  before insert or update or delete on public.event_registrations
  for each row
  execute function private.handle_event_registration();
