-- Migration 019: Profile Unique Links & Public Profiles
-- Run order: 19
-- Description: Adds username to profiles, enables public profile lookup RPC, updates member directory with username, and allows public reads of avatar/cover for public profiles.
-- Safe to run twice. Run after 018.

-- 1. Add username column to public.profiles
alter table public.profiles add column if not exists username text;

alter table public.profiles drop constraint if exists profiles_username_format;
alter table public.profiles add constraint profiles_username_format
  check (username is null or (char_length(username) between 3 and 30 and username ~* '^[a-z0-9_-]+$'));

create unique index if not exists profiles_username_lower_idx
  on public.profiles (lower(username))
  where username is not null;

grant select (username) on public.profiles to anon, authenticated;
grant update (username) on public.profiles to authenticated;

-- 2. Allow public read of avatars for public profiles
drop policy if exists avatars_public_profile_select on storage.objects;
create policy avatars_public_profile_select on storage.objects
  for select to anon, authenticated
  using (
    bucket_id = 'avatars' and exists (
      select 1 from public.profiles p
       where p.is_public_profile
         and p.avatar_path = name
    )
  );

-- 3. Allow public read of covers for public profiles
drop policy if exists covers_public_profile_select on storage.objects;
create policy covers_public_profile_select on storage.objects
  for select to anon, authenticated
  using (
    bucket_id = 'covers' and exists (
      select 1 from public.profiles p
       where p.is_public_profile
         and p.cover_path = name
    )
  );

-- 4. Update public_member_directory to include username and avatar_path
drop function if exists public.public_member_directory();
create or replace function public.public_member_directory()
returns table (
  user_id uuid,
  username text,
  full_name text,
  public_title text,
  access_role text,
  headline text,
  location text,
  skills text[],
  avatar_path text,
  linkedin_url text,
  github_url text,
  website_url text,
  instagram_url text,
  youtube_url text,
  aws_builder_url text
)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id,
         p.username,
         btrim(p.first_name || ' ' || p.last_name),
         p.public_title,
         ur.role::text,
         p.headline,
         p.location,
         p.skills,
         p.avatar_path,
         p.linkedin_url,
         p.github_url,
         p.website_url,
         p.instagram_url,
         p.youtube_url,
         p.aws_builder_url
    from public.profiles p
    join public.user_roles ur on ur.user_id = p.id
    join public.registrations r on r.user_id = p.id
   where p.is_public_profile
     and ur.is_active
     and r.status = 'approved';
$$;

grant execute on function public.public_member_directory() to anon, authenticated;

-- 5. Lookup individual public profile by identifier (UUID or username)
create or replace function public.get_public_member_profile(p_identifier text)
returns table (
  user_id uuid,
  username text,
  first_name text,
  last_name text,
  public_title text,
  access_role text,
  headline text,
  bio text,
  location text,
  university text,
  programme text,
  department text,
  study_year text,
  semester text,
  graduation_year integer,
  skills text[],
  interests text[],
  avatar_path text,
  cover_path text,
  linkedin_url text,
  github_url text,
  website_url text,
  instagram_url text,
  youtube_url text,
  aws_builder_url text,
  is_public_profile boolean,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_is_uuid boolean;
  v_uid uuid;
begin
  if p_identifier is null or btrim(p_identifier) = '' then
    return;
  end if;

  v_is_uuid := p_identifier ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
  if v_is_uuid then
    v_uid := p_identifier::uuid;
  end if;

  return query
  select p.id,
         p.username,
         p.first_name,
         p.last_name,
         p.public_title,
         ur.role::text,
         p.headline,
         p.bio,
         p.location,
         p.university,
         p.programme,
         p.department,
         p.study_year,
         p.semester,
         p.graduation_year,
         p.skills,
         p.interests,
         p.avatar_path,
         p.cover_path,
         p.linkedin_url,
         p.github_url,
         p.website_url,
         p.instagram_url,
         p.youtube_url,
         p.aws_builder_url,
         p.is_public_profile,
         p.created_at
    from public.profiles p
    left join public.user_roles ur on ur.user_id = p.id and ur.is_active
    left join public.registrations r on r.user_id = p.id
   where (
           (v_is_uuid and p.id = v_uid)
        or (lower(coalesce(p.username, '')) = lower(p_identifier))
         )
     and (
           (p.is_public_profile and r.status = 'approved')
        or (p.id = (select auth.uid()))
         )
   limit 1;
end;
$$;

grant execute on function public.get_public_member_profile(text) to anon, authenticated;

