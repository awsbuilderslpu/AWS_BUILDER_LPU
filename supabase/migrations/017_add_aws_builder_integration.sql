-- Migration 017: AWS Builder Integration
-- Run order: 17
-- Description: Adds aws_builder_url to profiles (and updates public_member_directory RPC), and adds source_url & source_platform to blogs for AWS Builder article syncing.
-- Safe to run twice. Run after 016.

-- 1. Add aws_builder_url to profiles
alter table public.profiles add column if not exists aws_builder_url text;

alter table public.profiles drop constraint if exists check_profiles_aws_builder_url;
alter table public.profiles add constraint check_profiles_aws_builder_url
  check (aws_builder_url is null or (char_length(aws_builder_url) <= 300 and aws_builder_url ~* '^https?://'));

grant select (aws_builder_url) on public.profiles to anon, authenticated;
grant update (aws_builder_url) on public.profiles to authenticated;

-- 2. Update public_member_directory RPC
drop function if exists public.public_member_directory();
create or replace function public.public_member_directory()
returns table (
  user_id uuid,
  full_name text,
  public_title text,
  access_role text,
  headline text,
  location text,
  skills text[],
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
         btrim(p.first_name || ' ' || p.last_name),
         p.public_title,
         ur.role::text,
         p.headline,
         p.location,
         p.skills,
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
     and r.status = 'approved'
   order by btrim(p.first_name || ' ' || p.last_name)
   limit 200;
$$;

revoke all on function public.public_member_directory() from public;
grant execute on function public.public_member_directory() to anon, authenticated;

-- 3. Add source_url, source_platform, and external_image_url to blogs
alter table public.blogs add column if not exists source_url text;
alter table public.blogs add column if not exists source_platform text default 'internal';
alter table public.blogs add column if not exists external_image_url text;

alter table public.blogs drop constraint if exists check_blogs_source_url;
alter table public.blogs add constraint check_blogs_source_url
  check (source_url is null or (char_length(source_url) <= 500 and source_url ~* '^https?://'));

grant select (source_url, source_platform, external_image_url) on public.blogs to anon, authenticated;
grant insert (source_url, source_platform, external_image_url) on public.blogs to authenticated;
grant update (source_url, source_platform, external_image_url) on public.blogs to authenticated;
