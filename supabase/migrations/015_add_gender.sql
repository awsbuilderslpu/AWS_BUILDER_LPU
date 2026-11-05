-- Migration 015: Add gender column to profiles
-- Description: Adds gender column ('Male' | 'Female') to public.profiles, updates handle_new_user trigger, and grants update.

-- 1. Add gender column with check constraint
alter table public.profiles
  add column if not exists gender text;

alter table public.profiles
  drop constraint if exists check_profiles_gender;

alter table public.profiles
  add constraint check_profiles_gender
  check (gender is null or gender in ('Male', 'Female'));

-- 2. Grant update on gender to authenticated users
grant update (gender) on table public.profiles to authenticated;

-- 3. Update private.handle_new_user() to extract gender from metadata
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb;
  v_first_name text := '';
  v_last_name text := '';
  v_email text;
  v_phone_country_code text;
  v_phone_number text;
  v_registration_number text;
  v_university text;
  v_programme text;
  v_department text;
  v_study_year text;
  v_semester text;
  v_date_of_birth date;
  v_gender text;
  v_graduation_year integer;
  v_interests text[] := '{}'::text[];
  v_terms_accepted_at timestamptz;
  v_requested_role public.app_role := 'student';
  v_raw_dob text;
  v_raw_grad text;
  v_raw_role text;
  v_raw_interests jsonb;
begin
  meta := coalesce(new.raw_user_meta_data, '{}'::jsonb);

  -- Safe extraction of first_name & last_name (at most 60 chars)
  v_first_name := coalesce(left(trim(coalesce(meta->>'first_name', meta->>'given_name', '')), 60), '');
  v_last_name := coalesce(left(trim(coalesce(meta->>'last_name', meta->>'family_name', '')), 60), '');

  -- Safe extraction of email from auth.users (at most 200 chars)
  v_email := nullif(left(trim(coalesce(new.email, '')), 200), '');

  -- Text columns: trim, truncate to 200 chars, empty becomes null
  v_phone_country_code := nullif(left(trim(coalesce(meta->>'phone_country_code', '')), 200), '');
  v_phone_number := nullif(left(trim(coalesce(meta->>'phone_number', '')), 200), '');
  v_registration_number := nullif(left(trim(coalesce(meta->>'registration_number', '')), 200), '');
  v_university := nullif(left(trim(coalesce(meta->>'university', '')), 200), '');
  v_programme := nullif(left(trim(coalesce(meta->>'programme', '')), 200), '');
  v_department := nullif(left(trim(coalesce(meta->>'department', '')), 200), '');
  v_study_year := nullif(left(trim(coalesce(meta->>'study_year', '')), 200), '');
  v_semester := nullif(left(trim(coalesce(meta->>'semester', '')), 200), '');

  -- gender ('Male' or 'Female' only)
  v_gender := nullif(trim(coalesce(meta->>'gender', '')), '');
  if v_gender not in ('Male', 'Female') then
    v_gender := null;
  end if;

  -- date_of_birth ("YYYY-MM-DD") - invalid becomes null
  v_raw_dob := trim(coalesce(meta->>'date_of_birth', ''));
  if v_raw_dob ~ '^\d{4}-\d{2}-\d{2}$' then
    begin
      v_date_of_birth := v_raw_dob::date;
    exception
      when others then
        v_date_of_birth := null;
    end;
  else
    v_date_of_birth := null;
  end if;

  -- graduation_year (2000-2100) - bad number or out of bounds becomes null
  v_raw_grad := trim(coalesce(meta->>'graduation_year', ''));
  if v_raw_grad ~ '^\d+$' then
    begin
      v_graduation_year := v_raw_grad::integer;
      if v_graduation_year < 2000 or v_graduation_year > 2100 then
        v_graduation_year := null;
      end if;
    exception
      when others then
        v_graduation_year := null;
    end;
  else
    v_graduation_year := null;
  end if;

  -- interests: only if a JSON array (at most 20 items, each at most 40 characters)
  v_raw_interests := meta->'interests';
  if jsonb_typeof(v_raw_interests) = 'array' then
    begin
      select coalesce(array_agg(val), '{}'::text[])
      into v_interests
      from (
        select left(trim(elem), 40) as val
        from jsonb_array_elements_text(v_raw_interests) as elem
        where trim(elem) <> ''
        limit 20
      ) sub;
      if v_interests is null then
        v_interests := '{}'::text[];
      end if;
    exception
      when others then
        v_interests := '{}'::text[];
    end;
  end if;

  -- terms_accepted ("true" or true -> sets terms_accepted_at = now())
  if (meta->>'terms_accepted') = 'true' or (meta->'terms_accepted') = 'true'::jsonb then
    v_terms_accepted_at := now();
  else
    v_terms_accepted_at := null;
  end if;

  -- requested_role: only if valid enum value, otherwise default to 'student'
  v_raw_role := trim(coalesce(meta->>'requested_role', ''));
  if v_raw_role in ('administrator', 'admin', 'captain', 'core', 'member', 'student', 'participant') then
    v_requested_role := v_raw_role::public.app_role;
  else
    v_requested_role := 'student'::public.app_role;
  end if;

  -- 1. Insert Profile
  insert into public.profiles (
    id,
    first_name,
    last_name,
    email,
    phone_country_code,
    phone_number,
    registration_number,
    university,
    programme,
    department,
    study_year,
    semester,
    date_of_birth,
    gender,
    graduation_year,
    interests,
    terms_accepted_at
  ) values (
    new.id,
    v_first_name,
    v_last_name,
    v_email,
    v_phone_country_code,
    v_phone_number,
    v_registration_number,
    v_university,
    v_programme,
    v_department,
    v_study_year,
    v_semester,
    v_date_of_birth,
    v_gender,
    v_graduation_year,
    v_interests,
    v_terms_accepted_at
  ) on conflict (id) do nothing;

  -- 2. Insert User Role (ALWAYS default 'participant', active=true)
  insert into public.user_roles (
    user_id,
    role,
    is_active
  ) values (
    new.id,
    'participant',
    true
  ) on conflict (user_id) do nothing;

  -- 3. Insert Registration (status 'pending', holding requested_role)
  insert into public.registrations (
    user_id,
    status,
    requested_role
  ) values (
    new.id,
    'pending',
    v_requested_role
  ) on conflict (user_id) do nothing;

  return new;
end;
$$;

