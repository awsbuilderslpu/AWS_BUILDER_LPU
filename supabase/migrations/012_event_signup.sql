-- Migration 012: Event Sign-Up, Capacity, Registrations & Meeting Links
-- Run order: 12
-- Description: Event sign-up: capacity, registrations, meeting links behind registration, staff counts.
-- Safe to run twice: Yes. Run after 011.

alter table public.events add column if not exists capacity integer;
alter table public.events drop constraint if exists events_capacity_range;
alter table public.events add constraint events_capacity_range
  check (capacity is null or capacity between 1 and 100000);

create table if not exists public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete restrict,
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'registered',
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_registrations_unique unique (event_id, user_id),
  constraint event_registrations_status_values check (status in ('registered', 'cancelled', 'attended'))
);

create index if not exists event_registrations_event_status_idx on public.event_registrations (event_id, status);
create index if not exists event_registrations_user_idx on public.event_registrations (user_id);

drop trigger if exists event_registrations_set_updated_at on public.event_registrations;
create trigger event_registrations_set_updated_at before update on public.event_registrations
  for each row execute function private.set_updated_at();

alter table public.event_registrations enable row level security;
revoke all on public.event_registrations from public, anon, authenticated;
grant select on public.event_registrations to authenticated;
grant update (status, cancelled_at) on public.event_registrations to authenticated;

drop policy if exists event_registrations_select_own on public.event_registrations;
create policy event_registrations_select_own on public.event_registrations
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists event_registrations_select_staff on public.event_registrations;
create policy event_registrations_select_staff on public.event_registrations
  for select to authenticated using ((select private.is_staff()));

drop policy if exists event_registrations_cancel_own on public.event_registrations;
create policy event_registrations_cancel_own on public.event_registrations
  for update to authenticated
  using (user_id = (select auth.uid()) and status = 'registered')
  with check (user_id = (select auth.uid()) and status = 'cancelled');

drop policy if exists event_registrations_update_admin on public.event_registrations;
create policy event_registrations_update_admin on public.event_registrations
  for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

create or replace function public.register_for_event(p_event_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_published boolean;
  v_archived timestamptz;
  v_enabled boolean;
  v_deadline timestamptz;
  v_starts timestamptz;
  v_capacity integer;
  v_status text;
  v_registered integer;
begin
  if v_uid is null then
    raise exception 'unauthenticated' using errcode = '42501';
  end if;
  if not (select private.is_approved_member()) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  perform pg_advisory_xact_lock(hashtext(p_event_id::text));

  select e.is_published, e.archived_at, e.registration_enabled,
         e.registration_deadline, e.starts_at, e.capacity
    into v_published, v_archived, v_enabled, v_deadline, v_starts, v_capacity
    from public.events e
   where e.id = p_event_id;
  if not found or not v_published or v_archived is not null then
    raise exception 'not_found' using errcode = 'P0002';
  end if;
  if not v_enabled or now() >= coalesce(v_deadline, v_starts) then
    return 'closed';
  end if;

  select r.status into v_status
    from public.event_registrations r
   where r.event_id = p_event_id and r.user_id = v_uid;
  if v_status in ('registered', 'attended') then
    return 'already_registered';
  end if;

  if v_capacity is not null then
    select count(*) into v_registered
      from public.event_registrations r
     where r.event_id = p_event_id and r.status = 'registered';
    if v_registered >= v_capacity then
      return 'full';
    end if;
  end if;

  insert into public.event_registrations (event_id, user_id, status)
  values (p_event_id, v_uid, 'registered')
  on conflict (event_id, user_id)
  do update set status = 'registered', cancelled_at = null;

  return 'registered';
end;
$$;

create or replace function public.cancel_event_registration(p_event_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_rows integer;
begin
  if v_uid is null then
    raise exception 'unauthenticated' using errcode = '42501';
  end if;

  update public.event_registrations r
     set status = 'cancelled', cancelled_at = now()
   where r.event_id = p_event_id
     and r.user_id = v_uid
     and r.status = 'registered'
     and exists (
       select 1 from public.events e
        where e.id = p_event_id and now() < e.ends_at
     );
  get diagnostics v_rows = row_count;

  if v_rows = 0 then
    return 'not_registered';
  end if;
  return 'cancelled';
end;
$$;

create or replace function public.event_meeting_link(p_event_id uuid)
returns text
language plpgsql
security definer
stable
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_link text;
begin
  if v_uid is null then
    return null;
  end if;

  select e.meeting_url into v_link
    from public.events e
   where e.id = p_event_id and e.is_published and e.archived_at is null;
  if not found then
    return null;
  end if;

  if (select private.is_staff())
     or exists (
       select 1 from public.event_registrations r
        where r.event_id = p_event_id and r.user_id = v_uid
          and r.status in ('registered', 'attended')
     ) then
    return v_link;
  end if;
  return null;
end;
$$;

create or replace function public.event_spots_left(p_event_id uuid)
returns integer
language plpgsql
security definer
stable
set search_path = ''
as $$
declare
  v_capacity integer;
  v_registered integer;
begin
  select e.capacity into v_capacity
    from public.events e
   where e.id = p_event_id and e.is_published and e.archived_at is null;
  if not found or v_capacity is null then
    return null;
  end if;

  select count(*) into v_registered
    from public.event_registrations r
   where r.event_id = p_event_id and r.status = 'registered';

  return greatest(v_capacity - v_registered, 0);
end;
$$;

create or replace function public.my_event_registration(p_event_id uuid)
returns text
language plpgsql
security definer
stable
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_status text;
begin
  if v_uid is null then
    return null;
  end if;
  select r.status into v_status
    from public.event_registrations r
   where r.event_id = p_event_id and r.user_id = v_uid;
  return v_status;
end;
$$;

create or replace function public.staff_event_counts()
returns table (event_id uuid, registered integer, attended integer)
language plpgsql
security definer
stable
set search_path = ''
as $$
begin
  if not (select private.is_staff()) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  return query
    select r.event_id,
           (count(*) filter (where r.status = 'registered'))::integer,
           (count(*) filter (where r.status = 'attended'))::integer
      from public.event_registrations r
     group by r.event_id;
end;
$$;

create or replace function public.staff_event_meeting_url(p_event_id uuid)
returns text
language plpgsql
security definer
stable
set search_path = ''
as $$
begin
  if not (select private.is_staff()) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  return (select e.meeting_url from public.events e where e.id = p_event_id);
end;
$$;

create or replace view public.admin_event_attendees
with (security_invoker = true) as
select
  r.id as registration_id, r.event_id, r.user_id, r.status, r.created_at, r.cancelled_at,
  btrim(p.first_name || ' ' || p.last_name) as full_name,
  p.email, p.registration_number, p.programme, p.study_year
from public.event_registrations r
join public.profiles p on p.id = r.user_id;

revoke all on public.admin_event_attendees from public, anon, authenticated;
grant select on public.admin_event_attendees to authenticated;

revoke select on public.events from authenticated;
grant select (id, slug, title, category, description, location_mode, venue, starts_at, ends_at,
  registration_enabled, registration_deadline, banner_path, is_published, archived_at, capacity,
  created_at, updated_at) on public.events to authenticated;
grant insert (capacity) on public.events to authenticated;
grant update (capacity) on public.events to authenticated;

revoke all on function public.register_for_event(uuid) from public, anon;
grant execute on function public.register_for_event(uuid) to authenticated;
revoke all on function public.cancel_event_registration(uuid) from public, anon;
grant execute on function public.cancel_event_registration(uuid) to authenticated;
revoke all on function public.event_meeting_link(uuid) from public, anon;
grant execute on function public.event_meeting_link(uuid) to authenticated;
revoke all on function public.my_event_registration(uuid) from public, anon;
grant execute on function public.my_event_registration(uuid) to authenticated;
revoke all on function public.staff_event_counts() from public, anon;
grant execute on function public.staff_event_counts() to authenticated;
revoke all on function public.staff_event_meeting_url(uuid) from public, anon;
grant execute on function public.staff_event_meeting_url(uuid) to authenticated;
revoke all on function public.event_spots_left(uuid) from public;
grant execute on function public.event_spots_left(uuid) to anon, authenticated;
