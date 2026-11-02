-- Migration 013: Member Profiles, Opt-in, Admin-only Public Titles & Public Member Directory
-- Run order: 13
-- Description: Member profiles: public opt-in, admin-only public titles, the public member directory.
-- Safe to run twice: Yes. Run after 012.

alter table public.profiles add column if not exists is_public_profile boolean not null default false;
alter table public.profiles add column if not exists public_title text;

alter table public.profiles drop constraint if exists profiles_public_title_length;
alter table public.profiles add constraint profiles_public_title_length
  check (public_title is null or char_length(public_title) between 2 and 80);

alter table public.profiles drop constraint if exists profiles_avatar_path_format;
alter table public.profiles add constraint profiles_avatar_path_format
  check (avatar_path is null or avatar_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(webp|jpg)$');

alter table public.profiles drop constraint if exists profiles_cover_path_format;
alter table public.profiles add constraint profiles_cover_path_format
  check (cover_path is null or cover_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(webp|jpg)$');

grant update (is_public_profile) on public.profiles to authenticated;

create or replace function public.set_member_public_title(p_user_id uuid, p_title text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_title text := nullif(btrim(coalesce(p_title, '')), '');
  v_member boolean;
  v_rows integer;
begin
  if not (select private.is_admin()) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if p_user_id is null then
    raise exception 'invalid_input' using errcode = 'P0001';
  end if;
  if v_title is not null and char_length(v_title) not between 2 and 80 then
    raise exception 'invalid_input' using errcode = 'P0001';
  end if;

  select exists (
    select 1
      from public.registrations r
      join public.user_roles ur on ur.user_id = r.user_id
     where r.user_id = p_user_id and r.status = 'approved' and ur.is_active
  ) into v_member;
  if not v_member then
    raise exception 'not_a_member' using errcode = 'P0001';
  end if;

  update public.profiles set public_title = v_title where id = p_user_id;
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then
    raise exception 'update_failed' using errcode = 'P0001';
  end if;
  return v_title;
end;
$$;

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
  youtube_url text
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
         p.youtube_url
    from public.profiles p
    join public.user_roles ur on ur.user_id = p.id
    join public.registrations r on r.user_id = p.id
   where p.is_public_profile
     and ur.is_active
     and r.status = 'approved'
   order by btrim(p.first_name || ' ' || p.last_name)
   limit 200;
$$;

revoke all on function public.set_member_public_title(uuid, text) from public, anon;
grant execute on function public.set_member_public_title(uuid, text) to authenticated;
revoke all on function public.public_member_directory() from public;
grant execute on function public.public_member_directory() to anon, authenticated;

