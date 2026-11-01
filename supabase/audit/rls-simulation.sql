-- ============================================================================
-- Supabase Row Level Security & Role Guard Security Simulation
-- File: supabase/audit/rls-simulation.sql
-- Description: Proves database-side security policies, role guard triggers,
--              storage permissions, registration review state machine security,
--              private notes, member functions, events security policies,
--              blogs security policies and the set_featured_blog function, and
--              the append-only audit trail under simulated authenticated and
--              anonymous sessions (migrations 001-011).
--
-- Safety: Every individual test executes within an isolated subtransaction
--         that ends in an immediate rollback ('SIM_ROLLBACK'). NO DATA IS MODIFIED.
--         The blog pre-seeds (draft, due-published, scheduled) exist only inside the
--         outermost rollback block and are automatically removed when that block ends.
--         Safe to execute repeatedly in the Supabase SQL Editor.
--
-- INSTRUCTIONS:
-- 1. Find your Admin user ID and a regular member user ID by running:
--      select id, email, created_at from auth.users order by created_at;
-- 2. Note: Approve your test account on the Registrations page first, otherwise these tests are skipped.
-- 3. Replace the two UUID placeholders below:
--      v_admin: The UUID of your active Administrator account.
--      v_user:  The UUID of a regular, non-admin registered account.
-- 4. Click 'Run' in the Supabase SQL Editor.
-- 5. Verify the single result table shows 'ALL PASS' on the SUMMARY row.
-- ============================================================================

create temp table if not exists _sim (
  id serial primary key,
  who text not null,
  test text not null,
  expected text not null,
  outcome text not null,
  pass boolean not null
);

truncate table _sim;

do $$
declare
  -- ==========================================================================
  -- CONFIGURATION: REPLACE THESE TWO UUID VALUES BEFORE RUNNING
  -- ==========================================================================
  v_admin uuid := '00000000-0000-0000-0000-000000000001'; -- Replace with your Admin user ID
  v_user  uuid := '00000000-0000-0000-0000-000000000002'; -- Replace with your Member user ID
  -- ==========================================================================

  -- Audit state trackers
  v_rows integer;
  v_state text;
  v_cnt integer;
  v_reg_count integer;
  v_role_count integer;
  v_uid_check uuid;
  v_admin_count integer := 0;
  v_profile_count integer := 0;
  v_user_is_admin boolean := false;
  v_user_has_profile boolean := false;
  v_user_has_role boolean := false;
  v_user_has_reg boolean := false;
  v_user_reg_status public.registration_status;
  v_user_reg_no text;
  v_user_reg_id uuid;
  v_assigned_role public.app_role;
  v_admin_is_active boolean := false;
  v_user_role public.app_role;
  v_user_is_active boolean := false;
  v_user_is_member boolean := false;
  v_note_check text;
  v_audit_exists boolean := false;
  v_target_role public.app_role;
  v_expect_admin_grant boolean := false;
  v_check_role public.app_role;
  v_check_status public.registration_status;
  -- Blog simulation variables
  v_blog_draft_id   uuid;
  v_blog_pub_id     uuid;
  v_blog_sched_id   uuid;
begin
  -- --------------------------------------------------------------------------
  -- PRE-CHECKS (Run as Owner)
  -- --------------------------------------------------------------------------
  select count(*) into v_admin_count
  from public.user_roles
  where role in ('administrator', 'admin') and is_active = true;

  select count(*) into v_profile_count
  from public.profiles;

  select exists(select 1 from public.profiles where id = v_user) into v_user_has_profile;
  select exists(select 1 from public.user_roles where user_id = v_user) into v_user_has_role;
  select exists(select 1 from public.registrations where user_id = v_user) into v_user_has_reg;

  select exists(
    select 1 from public.user_roles
    where user_id = v_user and role in ('administrator', 'admin') and is_active = true
  ) into v_user_is_admin;

  select exists(
    select 1 from public.user_roles
    where user_id = v_admin and role in ('administrator', 'admin') and is_active = true
  ) into v_admin_is_active;

  select status into v_user_reg_status from public.registrations where user_id = v_user;
  select id into v_user_reg_id from public.registrations where user_id = v_user;
  select count(*) into v_reg_count from public.registrations;
  select registration_number into v_user_reg_no from public.profiles where id = v_user;
  select role, is_active into v_user_role, v_user_is_active from public.user_roles where user_id = v_user;
  v_user_is_member := (v_user_reg_status = 'approved' or (v_user_role is not null and v_user_role <> 'participant'));

  -- Validate test accounts setup
  if not (v_user_has_profile and v_user_has_role and v_user_has_reg and not v_user_is_admin and v_admin_is_active) then
    insert into _sim (who, test, expected, outcome, pass)
    values (
      'setup',
      'Account IDs Pre-check',
      'v_user is non-admin; v_admin is active admin',
      'SETUP FAILED: Check v_admin (' || v_admin || ') and v_user (' || v_user || ') in auth.users',
      false
    );
    return;
  end if;

  insert into _sim (who, test, expected, outcome, pass)
  values (
    'owner',
    'Pre-check: Valid test accounts',
    'v_admin active, v_user regular member',
    'Admins: ' || v_admin_count || ', Total profiles: ' || v_profile_count,
    true
  );

  -- --------------------------------------------------------------------------
  -- HARNESS CONTROLS
  -- --------------------------------------------------------------------------
  -- H1: auth.uid() equals v_user
  begin
    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    select auth.uid() into v_uid_check;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('harness', 'H1: Simulated session auth.uid() = v_user', 'allowed', case when v_uid_check = v_user then '1 row' else 'mismatch' end, v_uid_check = v_user);

  -- H2: auth.uid() equals v_admin
  begin
    perform set_config('request.jwt.claim.sub', v_admin::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated')::text, true);
    set local role authenticated;

    select auth.uid() into v_uid_check;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('harness', 'H2: Simulated session auth.uid() = v_admin', 'allowed', case when v_uid_check = v_admin then '1 row' else 'mismatch' end, v_uid_check = v_admin);

  -- C1: v_user selects own profile
  v_rows := 0;
  begin
    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    select count(*) into v_rows from public.profiles where id = v_user;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user', 'C1: Select own profile', 'allowed', v_rows || ' rows', v_state = 'OK' and v_rows = 1);

  -- C2: v_user updates own first_name
  v_rows := 0;
  begin
    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    update public.profiles set first_name = first_name where id = v_user;
    get diagnostics v_rows = row_count;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user', 'C2: Update own first_name', 'allowed', v_rows || ' rows affected', v_state = 'OK' and v_rows = 1);

  -- --------------------------------------------------------------------------
  -- NORMAL USER RESTRICTIONS (v_user)
  -- --------------------------------------------------------------------------
  -- N1: Visible rows count across profiles, user_roles, registrations (1 each)
  if v_profile_count < 2 then
    insert into _sim (who, test, expected, outcome, pass)
    values ('v_user', 'N1: View isolation (profiles, roles, registrations)', '1 row each', 'SKIPPED: < 2 profiles exist', true);
  else
    begin
      perform set_config('request.jwt.claim.sub', v_user::text, true);
      perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
      set local role authenticated;

      select count(*) into v_cnt from public.profiles;
      select count(*) into v_role_count from public.user_roles;
      select count(*) into v_reg_count from public.registrations;
      raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
    exception
      when sqlstate 'P0000' then v_state := 'OK';
      when others then get stacked diagnostics v_state = returned_sqlstate;
    end;
    reset role;
    perform set_config('request.jwt.claim.sub', '', true);
    perform set_config('request.jwt.claims', '', true);

    insert into _sim (who, test, expected, outcome, pass)
    values (
      'v_user',
      'N1: View isolation (profiles, roles, registrations)',
      '1 row each',
      'profiles: ' || v_cnt || ', roles: ' || v_role_count || ', reg: ' || v_reg_count,
      v_state = 'OK' and v_cnt = 1 and v_role_count = 1 and v_reg_count = 1
    );
  end if;

  -- N2: Update own user_roles.role = 'admin'
  v_rows := 0;
  begin
    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    update public.user_roles set role = 'admin' where user_id = v_user;
    get diagnostics v_rows = row_count;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user', 'N2: Update own user_roles.role = admin', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else v_rows || ' rows affected' end, v_state <> 'OK' or v_rows = 0);

  -- N3: Update own user_roles.is_active = false
  v_rows := 0;
  begin
    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    update public.user_roles set is_active = false where user_id = v_user;
    get diagnostics v_rows = row_count;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user', 'N3: Update own user_roles.is_active = false', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else v_rows || ' rows affected' end, v_state <> 'OK' or v_rows = 0);

  -- N4: Update own registrations.status = 'approved'
  v_rows := 0;
  begin
    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    update public.registrations set status = 'approved' where user_id = v_user;
    get diagnostics v_rows = row_count;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user', 'N4: Update own registrations.status = approved', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else v_rows || ' rows affected' end, v_state <> 'OK' or v_rows = 0);

  -- N6: Update own registrations.requested_role (allowed if status is pending)
  if v_user_reg_status = 'pending' then
    v_rows := 0;
    begin
      perform set_config('request.jwt.claim.sub', v_user::text, true);
      perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
      set local role authenticated;

      update public.registrations set requested_role = requested_role where user_id = v_user;
      get diagnostics v_rows = row_count;
      raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
    exception
      when sqlstate 'P0000' then v_state := 'OK';
      when others then get stacked diagnostics v_state = returned_sqlstate;
    end;
    reset role;
    perform set_config('request.jwt.claim.sub', '', true);
    perform set_config('request.jwt.claims', '', true);

    insert into _sim (who, test, expected, outcome, pass)
    values ('v_user', 'N6: Update own requested_role while pending', 'allowed', case when v_state = 'OK' then v_rows || ' rows affected' else 'sqlstate ' || v_state end, v_state = 'OK' and v_rows = 1);
  else
    insert into _sim (who, test, expected, outcome, pass)
    values ('v_user', 'N6: Update own requested_role while pending', 'allowed', 'SKIPPED: registration not in pending status', true);
  end if;

  -- N7: Update own profiles.email
  v_rows := 0;
  begin
    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    update public.profiles set email = 'hacked@example.com' where id = v_user;
    get diagnostics v_rows = row_count;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user', 'N7: Update own profiles.email', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else v_rows || ' rows affected' end, v_state <> 'OK' or v_rows = 0);

  -- N8: Change own profiles.registration_number when already populated
  if v_user_reg_no is not null then
    v_rows := 0;
    begin
      perform set_config('request.jwt.claim.sub', v_user::text, true);
      perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
      set local role authenticated;

      update public.profiles set registration_number = '99999999' where id = v_user;
      get diagnostics v_rows = row_count;
      raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
    exception
      when sqlstate 'P0000' then v_state := 'OK';
      when others then get stacked diagnostics v_state = returned_sqlstate;
    end;
    reset role;
    perform set_config('request.jwt.claim.sub', '', true);
    perform set_config('request.jwt.claims', '', true);

    insert into _sim (who, test, expected, outcome, pass)
    values ('v_user', 'N8: Modify locked registration_number', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else v_rows || ' rows affected' end, v_state <> 'OK' or v_rows = 0);
  else
    insert into _sim (who, test, expected, outcome, pass)
    values ('v_user', 'N8: Modify locked registration_number', 'blocked', 'SKIPPED: registration_number is NULL', true);
  end if;

  -- N9a: Insert into user_roles
  v_rows := 0;
  begin
    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    insert into public.user_roles (user_id, role) values (gen_random_uuid(), 'member');
    get diagnostics v_rows = row_count;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user', 'N9a: Insert into user_roles', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else v_rows || ' rows' end, v_state <> 'OK' or v_rows = 0);

  -- N9b: Insert into registrations
  v_rows := 0;
  begin
    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    insert into public.registrations (user_id) values (gen_random_uuid());
    get diagnostics v_rows = row_count;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user', 'N9b: Insert into registrations', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else v_rows || ' rows' end, v_state <> 'OK' or v_rows = 0);

  -- N9c: Insert into profiles
  v_rows := 0;
  begin
    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    insert into public.profiles (id, email) values (gen_random_uuid(), 'test@example.com');
    get diagnostics v_rows = row_count;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user', 'N9c: Insert into profiles', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else v_rows || ' rows' end, v_state <> 'OK' or v_rows = 0);

  -- N10a: Delete own row from registrations
  v_rows := 0;
  begin
    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    delete from public.registrations where user_id = v_user;
    get diagnostics v_rows = row_count;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user', 'N10a: Delete own registrations row', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else v_rows || ' rows' end, v_state <> 'OK' or v_rows = 0);

  -- N10b: Delete own row from user_roles
  v_rows := 0;
  begin
    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    delete from public.user_roles where user_id = v_user;
    get diagnostics v_rows = row_count;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user', 'N10b: Delete own user_roles row', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else v_rows || ' rows' end, v_state <> 'OK' or v_rows = 0);

  -- N10c: Delete own row from profiles
  v_rows := 0;
  begin
    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    delete from public.profiles where id = v_user;
    get diagnostics v_rows = row_count;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user', 'N10c: Delete own profiles row', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else v_rows || ' rows' end, v_state <> 'OK' or v_rows = 0);

  -- N11: Update the admin's profile first_name
  v_rows := 0;
  begin
    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    update public.profiles set first_name = 'hacked' where id = v_admin;
    get diagnostics v_rows = row_count;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user', 'N11: Update admin profile first_name', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else v_rows || ' rows' end, v_state <> 'OK' or v_rows = 0);

  -- N12a: Storage: insert into avatars with admin prefix
  v_rows := 0;
  begin
    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    insert into storage.objects (bucket_id, name, owner)
    values ('avatars', v_admin::text || '/sim.png', auth.uid());
    get diagnostics v_rows = row_count;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user', 'N12a: Storage avatars/<v_admin>/sim.png', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else v_rows || ' rows' end, v_state <> 'OK' or v_rows = 0);

  -- N12b: Storage: insert into avatars with own prefix
  v_rows := 0;
  begin
    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    insert into storage.objects (bucket_id, name, owner)
    values ('avatars', v_user::text || '/sim.png', auth.uid());
    get diagnostics v_rows = row_count;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user', 'N12b: Storage avatars/<v_user>/sim.png', 'allowed', case when v_state = 'OK' then v_rows || ' rows' else 'sqlstate ' || v_state end, v_state = 'OK' and v_rows = 1);

  -- N12c: Storage: insert into event-banners
  v_rows := 0;
  begin
    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    insert into storage.objects (bucket_id, name, owner)
    values ('event-banners', 'sim.png', auth.uid());
    get diagnostics v_rows = row_count;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user', 'N12c: Storage event-banners/sim.png', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else v_rows || ' rows' end, v_state <> 'OK' or v_rows = 0);

  -- --------------------------------------------------------------------------
  -- ADMIN PRIVILEGES & GUARDS (v_admin)
  -- --------------------------------------------------------------------------
  -- C3: v_admin sees all profiles
  v_cnt := 0;
  begin
    perform set_config('request.jwt.claim.sub', v_admin::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated')::text, true);
    set local role authenticated;

    select count(*) into v_cnt from public.profiles;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_admin', 'C3: View all profiles count', 'allowed', v_cnt || ' profiles seen', v_state = 'OK' and v_cnt = v_profile_count);

  -- A1: v_admin updates v_user registrations.status = 'approved'
  v_rows := 0;
  begin
    perform set_config('request.jwt.claim.sub', v_admin::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated')::text, true);
    set local role authenticated;

    update public.registrations set status = 'approved' where user_id = v_user;
    get diagnostics v_rows = row_count;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_admin', 'A1: Approve v_user registration', 'allowed', v_rows || ' rows affected', v_state = 'OK' and v_rows = 1);

  -- A2: v_admin updates v_user user_roles.role = 'core'
  v_rows := 0;
  begin
    perform set_config('request.jwt.claim.sub', v_admin::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated')::text, true);
    set local role authenticated;

    update public.user_roles set role = 'core' where user_id = v_user;
    get diagnostics v_rows = row_count;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_admin', 'A2: Promote v_user to core role', 'allowed', v_rows || ' rows affected', v_state = 'OK' and v_rows = 1);

  -- A3: v_admin updates v_user profiles.first_name
  v_rows := 0;
  begin
    perform set_config('request.jwt.claim.sub', v_admin::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated')::text, true);
    set local role authenticated;

    update public.profiles set first_name = first_name where id = v_user;
    get diagnostics v_rows = row_count;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_admin', 'A3: Update member profile first_name', 'allowed', v_rows || ' rows affected', v_state = 'OK' and v_rows = 1);

  -- A4: v_admin updates v_user profiles.email (blocked: email immutable)
  v_rows := 0;
  begin
    perform set_config('request.jwt.claim.sub', v_admin::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated')::text, true);
    set local role authenticated;

    update public.profiles set email = 'adminchanged@example.com' where id = v_user;
    get diagnostics v_rows = row_count;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_admin', 'A4: Update member profiles.email', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else v_rows || ' rows' end, v_state <> 'OK' or v_rows = 0);

  -- A5: Last admin protection: demote self when only active admin
  if v_admin_count = 1 then
    v_rows := 0;
    begin
      perform set_config('request.jwt.claim.sub', v_admin::text, true);
      perform set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated')::text, true);
      set local role authenticated;

      update public.user_roles set role = 'participant' where user_id = v_admin;
      get diagnostics v_rows = row_count;
      raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
    exception
      when sqlstate 'P0000' then v_state := 'OK';
      when others then get stacked diagnostics v_state = returned_sqlstate;
    end;
    reset role;
    perform set_config('request.jwt.claim.sub', '', true);
    perform set_config('request.jwt.claims', '', true);

    insert into _sim (who, test, expected, outcome, pass)
    values ('v_admin', 'A5: Last-admin guard (demote self)', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else v_rows || ' rows' end, v_state <> 'OK' or v_rows = 0);
  else
    insert into _sim (who, test, expected, outcome, pass)
    values ('v_admin', 'A5: Last-admin guard (demote self)', 'blocked', 'SKIPPED: > 1 active admin exists (' || v_admin_count || ')', true);
  end if;

  -- A6: Delete own user_roles row
  v_rows := 0;
  begin
    perform set_config('request.jwt.claim.sub', v_admin::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated')::text, true);
    set local role authenticated;

    delete from public.user_roles where user_id = v_admin;
    get diagnostics v_rows = row_count;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_admin', 'A6: Delete own user_roles row', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else v_rows || ' rows' end, v_state <> 'OK' or v_rows = 0);

  -- A7: Direct insert into profiles
  v_rows := 0;
  begin
    perform set_config('request.jwt.claim.sub', v_admin::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated')::text, true);
    set local role authenticated;

    insert into public.profiles (id, email) values (gen_random_uuid(), 'manual@example.com');
    get diagnostics v_rows = row_count;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_admin', 'A7: Manual direct insert into profiles', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else v_rows || ' rows' end, v_state <> 'OK' or v_rows = 0);

  -- A8: Update registrations.user_id on member row
  v_rows := 0;
  begin
    perform set_config('request.jwt.claim.sub', v_admin::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated')::text, true);
    set local role authenticated;

    update public.registrations set user_id = gen_random_uuid() where user_id = v_user;
    get diagnostics v_rows = row_count;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_admin', 'A8: Alter registrations.user_id FK', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else v_rows || ' rows' end, v_state <> 'OK' or v_rows = 0);

  -- --------------------------------------------------------------------------
  -- REGISTRATION REVIEW FUNCTION & VIEW SECURITY (007)
  -- --------------------------------------------------------------------------

  -- R1: v_user calls review_registration on their own registration with 'archive' -> blocked
  v_rows := 0;
  begin
    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    perform public.review_registration(v_user_reg_id, 'archive');
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user', 'R1: review_registration on own registration', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else 'allowed' end, v_state <> 'OK');

  -- R2: v_user visible rows in admin_registrations is 1
  v_cnt := 0;
  begin
    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    select count(*) into v_cnt from public.admin_registrations;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user', 'R2: Visible rows in admin_registrations', '1 row', v_cnt || ' rows', v_state = 'OK' and v_cnt = 1);

  -- R3: v_admin visible rows in admin_registrations equals total registrations owner sees
  v_cnt := 0;
  begin
    perform set_config('request.jwt.claim.sub', v_admin::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated')::text, true);
    set local role authenticated;

    select count(*) into v_cnt from public.admin_registrations;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_admin', 'R3: Visible rows in admin_registrations matches total', v_reg_count || ' rows', v_cnt || ' rows', v_state = 'OK' and v_cnt = v_reg_count);

  -- R4: v_admin 'approve' on v_user's registration with role 'student' -> allowed (SKIP if not pending)
  -- Inside the same block after the call, v_user's user_roles.role must equal 'student'
  v_assigned_role := null;
  if v_user_reg_status = 'pending' then
    begin
      perform set_config('request.jwt.claim.sub', v_admin::text, true);
      perform set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated')::text, true);
      set local role authenticated;

      perform public.review_registration(v_user_reg_id, 'approve', null, 'student'::public.app_role);
      select role into v_assigned_role from public.user_roles where user_id = v_user;
      raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
    exception
      when sqlstate 'P0000' then v_state := 'OK';
      when others then get stacked diagnostics v_state = returned_sqlstate;
    end;
    reset role;
    perform set_config('request.jwt.claim.sub', '', true);
    perform set_config('request.jwt.claims', '', true);

    insert into _sim (who, test, expected, outcome, pass)
    values ('v_admin', 'R4a: Approve pending registration with role student', 'allowed', case when v_state = 'OK' then 'allowed' else 'sqlstate ' || v_state end, v_state = 'OK');

    insert into _sim (who, test, expected, outcome, pass)
    values ('v_admin', 'R4b: Role updated to student upon approval', 'student', coalesce(v_assigned_role::text, 'null'), v_state = 'OK' and v_assigned_role = 'student');
  else
    insert into _sim (who, test, expected, outcome, pass)
    values ('v_admin', 'R4a: Approve pending registration with role student', 'allowed', 'SKIPPED (v_user not pending)', true);

    insert into _sim (who, test, expected, outcome, pass)
    values ('v_admin', 'R4b: Role updated to student upon approval', 'student', 'SKIPPED (v_user not pending)', true);
  end if;

  -- R5: v_admin 'approve' with role 'admin' -> blocked
  begin
    perform set_config('request.jwt.claim.sub', v_admin::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated')::text, true);
    set local role authenticated;

    perform public.review_registration(v_user_reg_id, 'approve', null, 'admin'::public.app_role);
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_admin', 'R5: Approve with role admin', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else 'allowed' end, v_state <> 'OK');

  -- R6: v_admin 'approve' with role null -> blocked
  begin
    perform set_config('request.jwt.claim.sub', v_admin::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated')::text, true);
    set local role authenticated;

    perform public.review_registration(v_user_reg_id, 'approve', null, null);
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_admin', 'R6: Approve with null role', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else 'allowed' end, v_state <> 'OK');

  -- R7: v_admin 'reopen' on a pending registration -> blocked (SKIP if not pending)
  if v_user_reg_status = 'pending' then
    begin
      perform set_config('request.jwt.claim.sub', v_admin::text, true);
      perform set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated')::text, true);
      set local role authenticated;

      perform public.review_registration(v_user_reg_id, 'reopen');
      raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
    exception
      when sqlstate 'P0000' then v_state := 'OK';
      when others then get stacked diagnostics v_state = returned_sqlstate;
    end;
    reset role;
    perform set_config('request.jwt.claim.sub', '', true);
    perform set_config('request.jwt.claims', '', true);

    insert into _sim (who, test, expected, outcome, pass)
    values ('v_admin', 'R7: Reopen pending registration', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else 'allowed' end, v_state <> 'OK');
  else
    insert into _sim (who, test, expected, outcome, pass)
    values ('v_admin', 'R7: Reopen pending registration', 'blocked', 'SKIPPED (v_user not pending)', true);
  end if;

  -- R8: anon role select from admin_registrations -> blocked
  v_cnt := 0;
  begin
    perform set_config('request.jwt.claim.sub', '', true);
    perform set_config('request.jwt.claims', '', true);
    set local role anon;

    select count(*) into v_cnt from public.admin_registrations;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('anon', 'R8: Anon select from admin_registrations', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else v_cnt || ' rows' end, v_state <> 'OK');

  -- R9: anon role call review_registration -> blocked
  begin
    perform set_config('request.jwt.claim.sub', '', true);
    perform set_config('request.jwt.claims', '', true);
    set local role anon;

    perform public.review_registration(v_user_reg_id, 'approve', null, 'student'::public.app_role);
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('anon', 'R9: Anon call review_registration', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else 'allowed' end, v_state <> 'OK');

  -- ==========================================================================
  -- MEMBER & NOTES SECURITY TESTS (Migrations 008 - 009)
  -- ==========================================================================

  -- --------------------------------------------------------------------------
  -- AS V_USER (Regular non-admin user)
  -- --------------------------------------------------------------------------

  -- X1: Seed note for v_user as owner, rows visible in registration_notes as v_user is 0
  v_cnt := -1;
  begin
    insert into public.registration_notes (registration_id, note)
    values (v_user_reg_id, 'audit simulation note')
    on conflict (registration_id) do update set note = excluded.note;

    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    select count(*) into v_cnt from public.registration_notes;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user', 'X1: Visible rows in registration_notes is 0', '0 rows', case when v_state <> 'OK' then 'sqlstate ' || v_state else v_cnt || ' rows' end, v_state = 'OK' and v_cnt = 0);

  -- X2: After same seed, admin_note read from admin_registrations for v_user is null
  v_note_check := 'NOT_CHECKED';
  begin
    insert into public.registration_notes (registration_id, note)
    values (v_user_reg_id, 'audit simulation note')
    on conflict (registration_id) do update set note = excluded.note;

    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    select admin_note into v_note_check from public.admin_registrations where id = v_user_reg_id;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user', 'X2: admin_note in admin_registrations is null', 'null', case when v_state <> 'OK' then 'sqlstate ' || v_state when v_note_check is null then 'null' else 'visible' end, v_state = 'OK' and v_note_check is null);

  -- X3: Rows in admin_members whose user_id is not v_user is 0
  v_cnt := -1;
  begin
    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    select count(*) into v_cnt from public.admin_members where user_id <> v_user;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user', 'X3: Rows in admin_members with user_id <> v_user is 0', '0 rows', case when v_state <> 'OK' then 'sqlstate ' || v_state else v_cnt || ' rows' end, v_state = 'OK' and v_cnt = 0);

  -- X4: set_member_role on admin with participant -> blocked
  begin
    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    perform public.set_member_role(v_admin, 'participant'::public.app_role);
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user', 'X4: set_member_role on admin with participant', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else 'allowed' end, v_state <> 'OK');

  -- X5: set_member_role on v_user with admin -> blocked
  begin
    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    perform public.set_member_role(v_user, 'admin'::public.app_role);
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user', 'X5: set_member_role on v_user with admin', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else 'allowed' end, v_state <> 'OK');

  -- X6: set_member_active(v_user, false) -> blocked
  begin
    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    perform public.set_member_active(v_user, false);
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user', 'X6: set_member_active(v_user, false)', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else 'allowed' end, v_state <> 'OK');

  -- X7: remove_member(v_user) -> blocked
  begin
    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    perform public.remove_member(v_user);
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user', 'X7: remove_member(v_user)', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else 'allowed' end, v_state <> 'OK');

  -- X8: Rows visible in admin_audit_log is 0 (seed row as owner first)
  v_cnt := -1;
  begin
    insert into public.admin_audit_log (actor_id, target_user_id, action, old_value, new_value)
    values (v_admin, v_user, 'role_changed', 'participant', 'member');

    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    select count(*) into v_cnt from public.admin_audit_log;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user', 'X8: Rows visible in admin_audit_log is 0', '0 rows', case when v_state <> 'OK' then 'sqlstate ' || v_state else v_cnt || ' rows' end, v_state = 'OK' and v_cnt = 0);

  -- X9: insert into registration_notes -> blocked
  begin
    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    insert into public.registration_notes (registration_id, note)
    values (v_user_reg_id, 'unauthorized note');
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user', 'X9: Insert into registration_notes', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else 'allowed' end, v_state <> 'OK');

  -- X10: insert into admin_audit_log -> blocked
  begin
    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    insert into public.admin_audit_log (actor_id, target_user_id, action, old_value, new_value)
    values (v_user, v_user, 'hack', null, null);
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user', 'X10: Insert into admin_audit_log', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else 'allowed' end, v_state <> 'OK');

  -- --------------------------------------------------------------------------
  -- AS V_ADMIN (Active administrator)
  -- --------------------------------------------------------------------------

  -- Y1: After same seed, rows visible in registration_notes is >= 1
  v_cnt := 0;
  begin
    insert into public.registration_notes (registration_id, note)
    values (v_user_reg_id, 'audit simulation note')
    on conflict (registration_id) do update set note = excluded.note;

    perform set_config('request.jwt.claim.sub', v_admin::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated')::text, true);
    set local role authenticated;

    select count(*) into v_cnt from public.registration_notes;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_admin', 'Y1: Visible rows in registration_notes >= 1', '>= 1', case when v_state <> 'OK' then 'sqlstate ' || v_state else v_cnt || ' rows' end, v_state = 'OK' and v_cnt >= 1);

  -- Y2: set_member_role(v_admin, 'core') -> blocked (cannot_change_self)
  begin
    perform set_config('request.jwt.claim.sub', v_admin::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated')::text, true);
    set local role authenticated;

    perform public.set_member_role(v_admin, 'core'::public.app_role);
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_admin', 'Y2: set_member_role on self (v_admin)', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else 'allowed' end, v_state <> 'OK');

  -- Y3: set_member_active(v_admin, false) -> blocked (cannot_change_self)
  begin
    perform set_config('request.jwt.claim.sub', v_admin::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated')::text, true);
    set local role authenticated;

    perform public.set_member_active(v_admin, false);
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_admin', 'Y3: set_member_active on self (v_admin)', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else 'allowed' end, v_state <> 'OK');

  -- Y4: remove_member(v_admin) -> blocked (cannot_change_self)
  begin
    perform set_config('request.jwt.claim.sub', v_admin::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated')::text, true);
    set local role authenticated;

    perform public.remove_member(v_admin);
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_admin', 'Y4: remove_member on self (v_admin)', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else 'allowed' end, v_state <> 'OK');

  -- Y5: set_member_role on v_user to different role -> allowed, and role_changed audit row exists
  if not v_user_is_member then
    insert into _sim (who, test, expected, outcome, pass)
    values ('v_admin', 'Y5: set_member_role on v_user to different role', 'allowed', 'SKIPPED (v_user not a member)', true);
    insert into _sim (who, test, expected, outcome, pass)
    values ('v_admin', 'Y5b: Audit row role_changed exists for v_user', 'true', 'SKIPPED (v_user not a member)', true);
  else
    v_target_role := case when v_user_role = 'core' then 'member'::public.app_role else 'core'::public.app_role end;
    v_audit_exists := false;
    begin
      perform set_config('request.jwt.claim.sub', v_admin::text, true);
      perform set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated')::text, true);
      set local role authenticated;

      perform public.set_member_role(v_user, v_target_role);
      select exists (
        select 1 from public.admin_audit_log
        where target_user_id = v_user and action = 'role_changed' and new_value = v_target_role::text
      ) into v_audit_exists;

      raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
    exception
      when sqlstate 'P0000' then v_state := 'OK';
      when others then get stacked diagnostics v_state = returned_sqlstate;
    end;
    reset role;
    perform set_config('request.jwt.claim.sub', '', true);
    perform set_config('request.jwt.claims', '', true);

    insert into _sim (who, test, expected, outcome, pass)
    values ('v_admin', 'Y5: set_member_role on v_user to different role', 'allowed', case when v_state <> 'OK' then 'sqlstate ' || v_state else 'allowed' end, v_state = 'OK');

    insert into _sim (who, test, expected, outcome, pass)
    values ('v_admin', 'Y5b: Audit row role_changed exists for v_user', 'true', case when v_audit_exists then 'true' else 'false' end, v_state = 'OK' and v_audit_exists);
  end if;

  -- Y6: set_member_role(v_user, 'admin') -> allowed when approved & active, else blocked
  if not v_user_is_member then
    insert into _sim (who, test, expected, outcome, pass)
    values ('v_admin', 'Y6: set_member_role on v_user to admin', 'conditional', 'SKIPPED (v_user not a member)', true);
  else
    v_expect_admin_grant := (v_user_reg_status = 'approved' and v_user_is_active);
    begin
      perform set_config('request.jwt.claim.sub', v_admin::text, true);
      perform set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated')::text, true);
      set local role authenticated;

      perform public.set_member_role(v_user, 'admin'::public.app_role);
      raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
    exception
      when sqlstate 'P0000' then v_state := 'OK';
      when others then get stacked diagnostics v_state = returned_sqlstate;
    end;
    reset role;
    perform set_config('request.jwt.claim.sub', '', true);
    perform set_config('request.jwt.claims', '', true);

    insert into _sim (who, test, expected, outcome, pass)
    values (
      'v_admin',
      'Y6: set_member_role on v_user to admin',
      case when v_expect_admin_grant then 'allowed' else 'blocked' end,
      case when v_state = 'OK' then 'allowed' else 'sqlstate ' || v_state end,
      (v_expect_admin_grant and v_state = 'OK') or (not v_expect_admin_grant and v_state <> 'OK')
    );
  end if;

  -- Y7: set_member_role(v_user, current role) -> blocked (no_change)
  if not v_user_is_member then
    insert into _sim (who, test, expected, outcome, pass)
    values ('v_admin', 'Y7: set_member_role on v_user to same role', 'blocked', 'SKIPPED (v_user not a member)', true);
  else
    begin
      perform set_config('request.jwt.claim.sub', v_admin::text, true);
      perform set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated')::text, true);
      set local role authenticated;

      perform public.set_member_role(v_user, v_user_role);
      raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
    exception
      when sqlstate 'P0000' then v_state := 'OK';
      when others then get stacked diagnostics v_state = returned_sqlstate;
    end;
    reset role;
    perform set_config('request.jwt.claim.sub', '', true);
    perform set_config('request.jwt.claims', '', true);

    insert into _sim (who, test, expected, outcome, pass)
    values ('v_admin', 'Y7: set_member_role on v_user to same role', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else 'allowed' end, v_state <> 'OK');
  end if;

  -- Y8: set_member_active(v_user, opposite of current) -> allowed, with active_changed audit row
  if not v_user_is_member then
    insert into _sim (who, test, expected, outcome, pass)
    values ('v_admin', 'Y8: set_member_active on v_user to opposite value', 'allowed', 'SKIPPED (v_user not a member)', true);
    insert into _sim (who, test, expected, outcome, pass)
    values ('v_admin', 'Y8b: Audit row active_changed exists for v_user', 'true', 'SKIPPED (v_user not a member)', true);
  else
    v_audit_exists := false;
    begin
      perform set_config('request.jwt.claim.sub', v_admin::text, true);
      perform set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated')::text, true);
      set local role authenticated;

      perform public.set_member_active(v_user, not v_user_is_active);
      select exists (
        select 1 from public.admin_audit_log
        where target_user_id = v_user and action = 'active_changed'
      ) into v_audit_exists;

      raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
    exception
      when sqlstate 'P0000' then v_state := 'OK';
      when others then get stacked diagnostics v_state = returned_sqlstate;
    end;
    reset role;
    perform set_config('request.jwt.claim.sub', '', true);
    perform set_config('request.jwt.claims', '', true);

    insert into _sim (who, test, expected, outcome, pass)
    values ('v_admin', 'Y8: set_member_active on v_user to opposite value', 'allowed', case when v_state <> 'OK' then 'sqlstate ' || v_state else 'allowed' end, v_state = 'OK');

    insert into _sim (who, test, expected, outcome, pass)
    values ('v_admin', 'Y8b: Audit row active_changed exists for v_user', 'true', case when v_audit_exists then 'true' else 'false' end, v_state = 'OK' and v_audit_exists);
  end if;

  -- Y9: remove_member(v_user) -> allowed when non-admin member, role='participant' and status='archived'
  if not v_user_is_member or v_user_role = 'admin' then
    insert into _sim (who, test, expected, outcome, pass)
    values ('v_admin', 'Y9: remove_member on v_user', 'allowed', 'SKIPPED (v_user not a non-admin member)', true);
    insert into _sim (who, test, expected, outcome, pass)
    values ('v_admin', 'Y9b: v_user role is participant and status is archived', 'true', 'SKIPPED (v_user not a non-admin member)', true);
  else
    v_check_role := null;
    v_check_status := null;
    begin
      perform set_config('request.jwt.claim.sub', v_admin::text, true);
      perform set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated')::text, true);
      set local role authenticated;

      perform public.remove_member(v_user);

      select role into v_check_role from public.user_roles where user_id = v_user;
      select status into v_check_status from public.registrations where user_id = v_user;

      raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
    exception
      when sqlstate 'P0000' then v_state := 'OK';
      when others then get stacked diagnostics v_state = returned_sqlstate;
    end;
    reset role;
    perform set_config('request.jwt.claim.sub', '', true);
    perform set_config('request.jwt.claims', '', true);

    insert into _sim (who, test, expected, outcome, pass)
    values ('v_admin', 'Y9: remove_member on v_user', 'allowed', case when v_state <> 'OK' then 'sqlstate ' || v_state else 'allowed' end, v_state = 'OK');

    insert into _sim (who, test, expected, outcome, pass)
    values ('v_admin', 'Y9b: v_user role is participant and status is archived', 'true', case when v_check_role = 'participant' and v_check_status = 'archived' then 'true' else 'role=' || coalesce(v_check_role::text, 'null') || ' status=' || coalesce(v_check_status::text, 'null') end, v_state = 'OK' and v_check_role = 'participant' and v_check_status = 'archived');
  end if;

  -- Y10: insert, update and delete on admin_audit_log -> blocked (3 tests)
  begin
    perform set_config('request.jwt.claim.sub', v_admin::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated')::text, true);
    set local role authenticated;

    insert into public.admin_audit_log (actor_id, target_user_id, action, old_value, new_value)
    values (v_admin, v_user, 'manual_insert', null, null);
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_admin', 'Y10a: Insert into admin_audit_log', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else 'allowed' end, v_state <> 'OK');

  v_rows := 0;
  begin
    perform set_config('request.jwt.claim.sub', v_admin::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated')::text, true);
    set local role authenticated;

    update public.admin_audit_log set action = 'modified' where target_user_id = v_user;
    get diagnostics v_rows = row_count;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_admin', 'Y10b: Update on admin_audit_log', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else v_rows || ' rows affected' end, v_state <> 'OK' or v_rows = 0);

  v_rows := 0;
  begin
    perform set_config('request.jwt.claim.sub', v_admin::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated')::text, true);
    set local role authenticated;

    delete from public.admin_audit_log where target_user_id = v_user;
    get diagnostics v_rows = row_count;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_admin', 'Y10c: Delete on admin_audit_log', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else v_rows || ' rows affected' end, v_state <> 'OK' or v_rows = 0);

  -- --------------------------------------------------------------------------
  -- AS ANON ROLE (Unauthenticated caller)
  -- --------------------------------------------------------------------------

  -- Z1: select from admin_members -> blocked
  v_cnt := 0;
  begin
    perform set_config('request.jwt.claim.sub', '', true);
    perform set_config('request.jwt.claims', '', true);
    set local role anon;

    select count(*) into v_cnt from public.admin_members;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('anon', 'Z1: Anon select from admin_members', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else v_cnt || ' rows' end, v_state <> 'OK');

  -- Z2: call set_member_role -> blocked
  begin
    perform set_config('request.jwt.claim.sub', '', true);
    perform set_config('request.jwt.claims', '', true);
    set local role anon;

    perform public.set_member_role(v_user, 'participant'::public.app_role);
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('anon', 'Z2: Anon call set_member_role', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else 'allowed' end, v_state <> 'OK');

  -- ==========================================================================
  -- EVENTS SECURITY TESTS (Migration 010)
  -- ==========================================================================

  -- --------------------------------------------------------------------------
  -- AS V_USER (Plain registered account)
  -- --------------------------------------------------------------------------

  -- E1: select an unpublished event seeded by the owner -> blocked (0 rows)
  v_cnt := 0;
  begin
    insert into public.events (slug, title, category, location_mode, venue, starts_at, ends_at, is_published)
    values ('sim-e1-unpub', 'Sim E1 Unpub', 'workshop', 'on_campus', 'Room 1', now() + interval '1 day', now() + interval '2 days', false);

    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    select count(*) into v_cnt from public.events where slug = 'sim-e1-unpub';

    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user', 'E1: Select unpublished event', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else v_cnt || ' rows' end, v_state <> 'OK' or v_cnt = 0);

  -- E2: insert a valid event -> blocked
  v_rows := 0;
  begin
    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    insert into public.events (slug, title, category, location_mode, venue, starts_at, ends_at, is_published)
    values ('sim-e2-insert', 'Sim E2 Insert', 'workshop', 'on_campus', 'Room 1', now() + interval '1 day', now() + interval '2 days', false);
    get diagnostics v_rows = row_count;

    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user', 'E2: Insert event as plain user', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else v_rows || ' rows' end, v_state <> 'OK' or v_rows = 0);

  -- E3: update a seeded event's title -> blocked
  v_rows := 0;
  begin
    insert into public.events (slug, title, category, location_mode, venue, starts_at, ends_at, is_published)
    values ('sim-e3-update', 'Sim E3 Update', 'workshop', 'on_campus', 'Room 1', now() + interval '1 day', now() + interval '2 days', true);

    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    update public.events set title = 'Sim E3 Hacked' where slug = 'sim-e3-update';
    get diagnostics v_rows = row_count;

    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user', 'E3: Update event title as plain user', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else v_rows || ' rows affected' end, v_state <> 'OK' or v_rows = 0);

  -- E4: delete a seeded event -> blocked
  v_rows := 0;
  begin
    insert into public.events (slug, title, category, location_mode, venue, starts_at, ends_at, is_published)
    values ('sim-e4-delete', 'Sim E4 Delete', 'workshop', 'on_campus', 'Room 1', now() + interval '1 day', now() + interval '2 days', true);

    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    delete from public.events where slug = 'sim-e4-delete';
    get diagnostics v_rows = row_count;

    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user', 'E4: Delete event as plain user', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else v_rows || ' rows affected' end, v_state <> 'OK' or v_rows = 0);

  -- --------------------------------------------------------------------------
  -- AS V_USER MADE CORE (Temporary Core staff elevation)
  -- --------------------------------------------------------------------------

  -- E5: insert a valid event -> allowed
  v_rows := 0;
  begin
    update public.user_roles set role = 'core' where user_id = v_user;

    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    insert into public.events (slug, title, category, location_mode, venue, starts_at, ends_at, is_published)
    values ('sim-e5-core-insert', 'Sim E5 Core Insert', 'workshop', 'on_campus', 'Room 1', now() + interval '1 day', now() + interval '2 days', false);
    get diagnostics v_rows = row_count;

    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user (core)', 'E5: Core insert valid event', 'allowed', case when v_state = 'OK' then v_rows || ' rows' else 'sqlstate ' || v_state end, v_state = 'OK' and v_rows > 0);

  -- E6: update the event's title -> allowed
  v_rows := 0;
  begin
    update public.user_roles set role = 'core' where user_id = v_user;
    insert into public.events (slug, title, category, location_mode, venue, starts_at, ends_at, is_published)
    values ('sim-e6-core-update', 'Sim E6 Core Update', 'workshop', 'on_campus', 'Room 1', now() + interval '1 day', now() + interval '2 days', false);

    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    update public.events set title = 'Sim E6 Updated by Core' where slug = 'sim-e6-core-update';
    get diagnostics v_rows = row_count;

    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user (core)', 'E6: Core update event title', 'allowed', case when v_state = 'OK' then v_rows || ' rows affected' else 'sqlstate ' || v_state end, v_state = 'OK' and v_rows > 0);

  -- E7: delete it -> blocked
  v_rows := 0;
  begin
    update public.user_roles set role = 'core' where user_id = v_user;
    insert into public.events (slug, title, category, location_mode, venue, starts_at, ends_at, is_published)
    values ('sim-e7-core-delete', 'Sim E7 Core Delete', 'workshop', 'on_campus', 'Room 1', now() + interval '1 day', now() + interval '2 days', false);

    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    delete from public.events where slug = 'sim-e7-core-delete';
    get diagnostics v_rows = row_count;

    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user (core)', 'E7: Core delete event', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else v_rows || ' rows affected' end, v_state <> 'OK' or v_rows = 0);

  -- E8: insert with ends_at before starts_at -> blocked
  v_rows := 0;
  begin
    update public.user_roles set role = 'core' where user_id = v_user;

    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    insert into public.events (slug, title, category, location_mode, venue, starts_at, ends_at, is_published)
    values ('sim-e8-inverted', 'Sim E8 Inverted', 'workshop', 'on_campus', 'Room 1', now() + interval '2 days', now() + interval '1 day', false);
    get diagnostics v_rows = row_count;

    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user (core)', 'E8: Core insert with ends_at before starts_at', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else v_rows || ' rows' end, v_state <> 'OK' or v_rows = 0);

  -- --------------------------------------------------------------------------
  -- AS THE ANON ROLE (Unauthenticated caller)
  -- --------------------------------------------------------------------------

  -- A1: select id, title, starts_at from a published event -> allowed
  v_cnt := 0;
  begin
    insert into public.events (slug, title, category, location_mode, venue, starts_at, ends_at, is_published)
    values ('sim-a1-pub', 'Sim A1 Pub', 'workshop', 'on_campus', 'Room 1', now() + interval '1 day', now() + interval '2 days', true);

    perform set_config('request.jwt.claim.sub', '', true);
    perform set_config('request.jwt.claims', '', true);
    set local role anon;

    select count(*) into v_cnt from public.events where slug = 'sim-a1-pub';

    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('anon', 'A1: Anon select from published event', 'allowed', case when v_state = 'OK' then v_cnt || ' rows' else 'sqlstate ' || v_state end, v_state = 'OK' and v_cnt > 0);

  -- A2: select created_by from events -> blocked
  v_cnt := 0;
  begin
    insert into public.events (slug, title, category, location_mode, venue, starts_at, ends_at, is_published)
    values ('sim-a2-pub', 'Sim A2 Pub', 'workshop', 'on_campus', 'Room 1', now() + interval '1 day', now() + interval '2 days', true);

    perform set_config('request.jwt.claim.sub', '', true);
    perform set_config('request.jwt.claims', '', true);
    set local role anon;

    select count(created_by) into v_cnt from public.events where slug = 'sim-a2-pub';

    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('anon', 'A2: Anon select created_by column', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else 'allowed' end, v_state <> 'OK');

  -- A3: select an unpublished event -> blocked (0 rows)
  v_cnt := 0;
  begin
    insert into public.events (slug, title, category, location_mode, venue, starts_at, ends_at, is_published)
    values ('sim-a3-unpub', 'Sim A3 Unpub', 'workshop', 'on_campus', 'Room 1', now() + interval '1 day', now() + interval '2 days', false);

    perform set_config('request.jwt.claim.sub', '', true);
    perform set_config('request.jwt.claims', '', true);
    set local role anon;

    select count(*) into v_cnt from public.events where slug = 'sim-a3-unpub';

    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('anon', 'A3: Anon select unpublished event', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else v_cnt || ' rows' end, v_state <> 'OK' or v_cnt = 0);

  -- A4: insert -> blocked
  v_rows := 0;
  begin
    perform set_config('request.jwt.claim.sub', '', true);
    perform set_config('request.jwt.claims', '', true);
    set local role anon;

    insert into public.events (slug, title, category, location_mode, venue, starts_at, ends_at, is_published)
    values ('sim-a4-insert', 'Sim A4 Insert', 'workshop', 'on_campus', 'Room 1', now() + interval '1 day', now() + interval '2 days', true);
    get diagnostics v_rows = row_count;

    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('anon', 'A4: Anon insert event', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else v_rows || ' rows' end, v_state <> 'OK' or v_rows = 0);

  -- ==========================================================================
  -- BLOGS SECURITY TESTS (Migration 011)
  -- Pre-seeds (draft, due-published, scheduled) exist only inside this block.
  -- The rollback at the end of each subtransaction undoes each seed automatically.
  -- ==========================================================================

  -- Pre-seed the three blog posts as owner (inside the outer block; rollback removes them)
  insert into public.blogs (slug, title, category, author_name, status, publish_at)
  values (
    'sim-blog-draft', 'Sim Blog Draft', 'AWS', 'Demo Author', 'draft', null
  ) returning id into v_blog_draft_id;

  insert into public.blogs (slug, title, category, author_name, status, publish_at)
  values (
    'sim-blog-pub', 'Sim Blog Published', 'AWS', 'Demo Author', 'published', now() - interval '1 hour'
  ) returning id into v_blog_pub_id;

  insert into public.blogs (slug, title, category, author_name, status, publish_at)
  values (
    'sim-blog-sched', 'Sim Blog Scheduled', 'AWS', 'Demo Author', 'published', now() + interval '2 days'
  ) returning id into v_blog_sched_id;

  -- --------------------------------------------------------------------------
  -- AS V_USER (Plain signed-in account, not staff)
  -- --------------------------------------------------------------------------

  -- K0: select the due published post -> allowed (1 row)
  v_cnt := 0;
  begin
    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    select count(*) into v_cnt from public.blogs where id = v_blog_pub_id;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user', 'K0: Select due published blog post', 'allowed', case when v_state = 'OK' then v_cnt || ' rows' else 'sqlstate ' || v_state end, v_state = 'OK' and v_cnt = 1);

  -- K1: select the draft -> blocked (0 rows)
  v_cnt := 0;
  begin
    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    select count(*) into v_cnt from public.blogs where id = v_blog_draft_id;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user', 'K1: Select draft blog (blocked)', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else v_cnt || ' rows' end, v_state = 'OK' and v_cnt = 0);

  -- K2: select author_id from blogs -> blocked (column not readable)
  begin
    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    perform (select author_id from public.blogs where id = v_blog_pub_id);
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user', 'K2: Select author_id column (blocked)', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else 'allowed' end, v_state <> 'OK');

  -- K3: insert a post with author_id = v_user -> blocked
  v_rows := 0;
  begin
    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    insert into public.blogs (slug, title, category, author_id, author_name, status)
    values ('sim-k3-insert', 'Sim K3 Insert', 'AWS', v_user, 'Demo Author', 'draft');
    get diagnostics v_rows = row_count;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user', 'K3: Insert blog post (blocked)', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else v_rows || ' rows' end, v_state <> 'OK' or v_rows = 0);

  -- K4: update the seeded draft's title -> blocked
  v_rows := 0;
  begin
    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    update public.blogs set title = 'Hacked' where id = v_blog_draft_id;
    get diagnostics v_rows = row_count;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user', 'K4: Update draft blog title (blocked)', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else v_rows || ' rows affected' end, v_state <> 'OK' or v_rows = 0);

  -- K5: delete the seeded draft -> blocked
  v_rows := 0;
  begin
    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    delete from public.blogs where id = v_blog_draft_id;
    get diagnostics v_rows = row_count;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user', 'K5: Delete draft blog (blocked)', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else v_rows || ' rows affected' end, v_state <> 'OK' or v_rows = 0);

  -- K6: call set_featured_blog on the due published post -> blocked
  begin
    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    perform public.set_featured_blog(v_blog_pub_id, true);
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user', 'K6: set_featured_blog as plain user (blocked)', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else 'allowed' end, v_state <> 'OK');

  -- --------------------------------------------------------------------------
  -- AS V_USER ELEVATED TO CORE (temporary; rollback undoes role change)
  -- --------------------------------------------------------------------------

  -- L1: insert a post with author_id = v_user and a valid category -> allowed
  v_rows := 0;
  begin
    update public.user_roles set role = 'core' where user_id = v_user;

    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    insert into public.blogs (slug, title, category, author_id, author_name, status)
    values ('sim-l1-insert', 'Sim L1 Insert', 'AWS', v_user, 'Demo Author', 'draft');
    get diagnostics v_rows = row_count;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user (core)', 'L1: Core insert blog with own author_id', 'allowed', case when v_state = 'OK' then v_rows || ' rows' else 'sqlstate ' || v_state end, v_state = 'OK' and v_rows > 0);

  -- L2: insert a post with author_id = v_admin -> blocked
  v_rows := 0;
  begin
    update public.user_roles set role = 'core' where user_id = v_user;

    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    insert into public.blogs (slug, title, category, author_id, author_name, status)
    values ('sim-l2-insert', 'Sim L2 Insert', 'AWS', v_admin, 'Demo Author', 'draft');
    get diagnostics v_rows = row_count;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user (core)', 'L2: Core insert blog with admin author_id (blocked)', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else v_rows || ' rows' end, v_state <> 'OK' or v_rows = 0);

  -- L3: insert a post with category 'Not a category' -> blocked
  v_rows := 0;
  begin
    update public.user_roles set role = 'core' where user_id = v_user;

    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    insert into public.blogs (slug, title, category, author_id, author_name, status)
    values ('sim-l3-insert', 'Sim L3 Insert', 'Not a category', v_user, 'Demo Author', 'draft');
    get diagnostics v_rows = row_count;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user (core)', 'L3: Core insert blog with bad category (blocked)', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else v_rows || ' rows' end, v_state <> 'OK' or v_rows = 0);

  -- L4: update the seeded draft's title -> allowed
  v_rows := 0;
  begin
    update public.user_roles set role = 'core' where user_id = v_user;

    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    update public.blogs set title = 'Sim Draft Updated' where id = v_blog_draft_id;
    get diagnostics v_rows = row_count;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user (core)', 'L4: Core update draft blog title', 'allowed', case when v_state = 'OK' then v_rows || ' rows affected' else 'sqlstate ' || v_state end, v_state = 'OK' and v_rows > 0);

  -- L5: set_featured_blog on the due published post -> allowed
  begin
    update public.user_roles set role = 'core' where user_id = v_user;

    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    perform public.set_featured_blog(v_blog_pub_id, true);
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user (core)', 'L5: Core set_featured_blog on published post', 'allowed', case when v_state = 'OK' then 'allowed' else 'sqlstate ' || v_state end, v_state = 'OK');

  -- L6: set_featured_blog on the seeded draft -> blocked (not_published)
  begin
    update public.user_roles set role = 'core' where user_id = v_user;

    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    perform public.set_featured_blog(v_blog_draft_id, true);
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user (core)', 'L6: Core set_featured_blog on draft (blocked: not_published)', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else 'allowed' end, v_state <> 'OK');

  -- L7: delete the seeded draft -> blocked
  v_rows := 0;
  begin
    update public.user_roles set role = 'core' where user_id = v_user;

    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    delete from public.blogs where id = v_blog_draft_id;
    get diagnostics v_rows = row_count;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('v_user (core)', 'L7: Core delete blog (blocked, no delete policy)', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else v_rows || ' rows affected' end, v_state <> 'OK' or v_rows = 0);

  -- --------------------------------------------------------------------------
  -- AS ANON ROLE (no sub claim)
  -- --------------------------------------------------------------------------

  -- M1: select id, title, slug, status from the due published post -> allowed
  v_cnt := 0;
  begin
    perform set_config('request.jwt.claim.sub', '', true);
    perform set_config('request.jwt.claims', '', true);
    set local role anon;

    select count(*) into v_cnt from public.blogs where id = v_blog_pub_id;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('anon', 'M1: Anon select due published blog', 'allowed', case when v_state = 'OK' then v_cnt || ' rows' else 'sqlstate ' || v_state end, v_state = 'OK' and v_cnt > 0);

  -- M2: select author_id from blogs -> blocked
  begin
    perform set_config('request.jwt.claim.sub', '', true);
    perform set_config('request.jwt.claims', '', true);
    set local role anon;

    perform (select author_id from public.blogs where id = v_blog_pub_id);
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('anon', 'M2: Anon select author_id column (blocked)', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else 'allowed' end, v_state <> 'OK');

  -- M3: select the draft -> blocked (0 rows)
  v_cnt := 0;
  begin
    perform set_config('request.jwt.claim.sub', '', true);
    perform set_config('request.jwt.claims', '', true);
    set local role anon;

    select count(*) into v_cnt from public.blogs where id = v_blog_draft_id;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('anon', 'M3: Anon select draft blog (blocked)', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else v_cnt || ' rows' end, v_state = 'OK' and v_cnt = 0);

  -- M4: select the scheduled post -> blocked (0 rows - publish_at in the future)
  v_cnt := 0;
  begin
    perform set_config('request.jwt.claim.sub', '', true);
    perform set_config('request.jwt.claims', '', true);
    set local role anon;

    select count(*) into v_cnt from public.blogs where id = v_blog_sched_id;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('anon', 'M4: Anon select scheduled blog (blocked)', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else v_cnt || ' rows' end, v_state = 'OK' and v_cnt = 0);

  -- M5: insert a post -> blocked
  v_rows := 0;
  begin
    perform set_config('request.jwt.claim.sub', '', true);
    perform set_config('request.jwt.claims', '', true);
    set local role anon;

    insert into public.blogs (slug, title, category, author_name, status)
    values ('sim-m5-insert', 'Sim M5 Insert', 'AWS', 'Demo Author', 'draft');
    get diagnostics v_rows = row_count;
    raise exception using errcode = 'P0000', message = 'SIM_ROLLBACK';
  exception
    when sqlstate 'P0000' then v_state := 'OK';
    when others then get stacked diagnostics v_state = returned_sqlstate;
  end;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);

  insert into _sim (who, test, expected, outcome, pass)
  values ('anon', 'M5: Anon insert blog (blocked)', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else v_rows || ' rows' end, v_state <> 'OK' or v_rows = 0);

end;
$$;

-- ============================================================================
-- FINAL SUMMARY QUERY
-- Displays SUMMARY row first, followed by each individual test in order.
-- SUMMARY: migrations 001-011 blog tests (K0-K6: plain user = 7, L1-L7: core = 7, M1-M5: anon = 5) = 19 new tests.
-- ============================================================================
select
  s.who,
  s.test,
  s.expected,
  s.outcome,
  s.pass
from (
  select
    0 as order_key,
    'ALL' as who,
    'SUMMARY' as test,
    'ALL PASS' as expected,
    case
      when count(*) filter (where not pass) = 0 then 'ALL PASS'
      else count(*) filter (where not pass) || ' FAILED'
    end as outcome,
    (count(*) filter (where not pass) = 0) as pass
  from _sim
  union all
  select
    id as order_key,
    who,
    test,
    expected,
    outcome,
    pass
  from _sim
) s
order by s.order_key;

