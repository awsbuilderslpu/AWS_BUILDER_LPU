-- 020_blogs_delete.sql
-- Allow staff members to delete blogs

grant delete on public.blogs to authenticated;

drop policy if exists blogs_delete_staff on public.blogs;
create policy blogs_delete_staff on public.blogs
  for delete
  to authenticated
  using ((select private.is_staff()));

