-- 011_blogs.sql
-- Blogs: the table, its security rules, the featured-post function and its triggers.
-- Safe to run twice. Run after 010.

create table if not exists public.blogs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  category text not null,
  tags text[] not null default '{}',
  body jsonb not null default '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb,
  read_minutes integer not null default 1,
  featured_image_path text,
  author_id uuid references auth.users (id) on delete set null,
  author_name text not null,
  meta_title text,
  meta_description text,
  status text not null default 'draft',
  publish_at timestamptz,
  is_featured boolean not null default false,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint blogs_slug_format check (slug ~ '^[a-z0-9][a-z0-9-]{2,79}$'),
  constraint blogs_title_length check (char_length(title) between 3 and 120),
  constraint blogs_excerpt_length check (excerpt is null or char_length(excerpt) <= 200),
  constraint blogs_category_values check (category in ('AWS', 'Cloud Computing', 'Tutorials', 'Community', 'Career', 'Projects', 'Architecture', 'Cloud Security', 'Student Guide', 'Development')),
  constraint blogs_tags_limit check (cardinality(tags) <= 10),
  constraint blogs_read_minutes_range check (read_minutes between 1 and 240),
  constraint blogs_image_format check (featured_image_path is null or featured_image_path ~ '^[0-9]{4}/(0[1-9]|1[0-2])/[0-9a-f-]{36}\.(webp|jpg)$'),
  constraint blogs_author_name_length check (char_length(author_name) between 2 and 80),
  constraint blogs_meta_title_length check (meta_title is null or char_length(meta_title) <= 70),
  constraint blogs_meta_description_length check (meta_description is null or char_length(meta_description) <= 160),
  constraint blogs_status_values check (status in ('draft', 'published', 'archived')),
  constraint blogs_published_has_date check (status <> 'published' or publish_at is not null),
  constraint blogs_body_size check (octet_length(body::text) <= 120000)
);

create index if not exists blogs_status_publish_idx on public.blogs (status, publish_at desc);
create unique index if not exists blogs_one_featured_idx on public.blogs (is_featured) where is_featured;

alter table public.blogs enable row level security;
revoke all on public.blogs from public, anon, authenticated;
grant select (id, slug, title, excerpt, category, tags, body, read_minutes, featured_image_path, author_name, meta_title, meta_description, status, publish_at, is_featured, created_at, updated_at) on public.blogs to anon, authenticated;
grant insert (slug, title, excerpt, category, tags, body, read_minutes, featured_image_path, author_id, author_name, meta_title, meta_description, status, publish_at) on public.blogs to authenticated;
grant update (title, excerpt, category, tags, body, read_minutes, featured_image_path, author_name, meta_title, meta_description, status, publish_at, is_featured) on public.blogs to authenticated;

-- ============================================================================
-- Policies (dropped if exists before created)
-- ============================================================================

drop policy if exists blogs_select_public on public.blogs;
create policy blogs_select_public on public.blogs
  for select
  to anon, authenticated
  using (status = 'published' and publish_at <= now());

drop policy if exists blogs_select_staff on public.blogs;
create policy blogs_select_staff on public.blogs
  for select
  to authenticated
  using ((select private.is_staff()));

drop policy if exists blogs_insert_staff on public.blogs;
create policy blogs_insert_staff on public.blogs
  for insert
  to authenticated
  with check ((select private.is_staff()) and author_id = (select auth.uid()));

drop policy if exists blogs_update_staff on public.blogs;
create policy blogs_update_staff on public.blogs
  for update
  to authenticated
  using ((select private.is_staff()))
  with check ((select private.is_staff()));

-- No delete policy: posts are archived, never deleted through the API.

-- ============================================================================
-- Trigger Functions
-- ============================================================================

create or replace function private.stamp_blog()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.created_by := (select auth.uid());
  end if;
  new.updated_by := (select auth.uid());
  if new.status = 'published' and new.publish_at is null then
    new.publish_at := now();
  end if;
  return new;
end;
$$;

revoke execute on function private.stamp_blog() from public, anon, authenticated;

create or replace function private.guard_blog_featured()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status <> 'published' then
    new.is_featured := false;
  end if;
  return new;
end;
$$;

revoke execute on function private.guard_blog_featured() from public, anon, authenticated;

drop trigger if exists blogs_stamp on public.blogs;
create trigger blogs_stamp
  before insert or update on public.blogs
  for each row execute function private.stamp_blog();

drop trigger if exists blogs_guard_featured on public.blogs;
create trigger blogs_guard_featured
  before insert or update on public.blogs
  for each row execute function private.guard_blog_featured();

drop trigger if exists blogs_set_updated_at on public.blogs;
create trigger blogs_set_updated_at
  before update on public.blogs
  for each row execute function private.set_updated_at();

-- ============================================================================
-- set_featured_blog function
-- ============================================================================

create or replace function public.set_featured_blog(p_id uuid, p_featured boolean)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_status text;
  v_rows   integer;
begin
  if not (select private.is_staff()) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  if p_id is null or p_featured is null then
    raise exception 'invalid_input' using errcode = 'P0001';
  end if;

  select b.status into v_status
  from public.blogs b
  where b.id = p_id
  for update;

  if not found then
    raise exception 'not_found' using errcode = 'P0002';
  end if;

  if p_featured and v_status <> 'published' then
    raise exception 'not_published' using errcode = 'P0001';
  end if;

  if p_featured then
    update public.blogs
    set is_featured = false
    where is_featured and id <> p_id;
  end if;

  update public.blogs
  set is_featured = p_featured
  where id = p_id;

  get diagnostics v_rows = row_count;

  if v_rows <> 1 then
    raise exception 'update_failed' using errcode = 'P0001';
  end if;
end;
$$;

revoke all on function public.set_featured_blog(uuid, boolean) from public, anon;
grant execute on function public.set_featured_blog(uuid, boolean) to authenticated;

