-- ============================================================================
-- Supabase Row Level Security & Role Guard Security Simulation
-- File: supabase/audit/rls-simulation.sql
-- Description: Proves database-side security policies, role guard triggers,
--              and storage permissions under simulated 'authenticated' sessions.
--
-- Safety: Every individual test executes within an isolated subtransaction
--         that ends in an immediate rollback ('SIM_ROLLBACK'). NO DATA IS MODIFIED.
--         Safe to execute repeatedly in the Supabase SQL Editor.
--
-- INSTRUCTIONS:
-- 1. Find your Admin user ID and a regular member user ID by running:
--      select id, email, created_at from auth.users order by created_at;
-- 2. Replace the two UUID placeholders below:
--      v_admin: The UUID of your active Administrator account.
--      v_user:  The UUID of a regular, non-admin registered account.
-- 3. Click 'Run' in the Supabase SQL Editor.
-- 4. Verify the single result table shows 'ALL PASS' on the SUMMARY row.
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
  v_admin_is_active boolean := false;
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
  select registration_number into v_user_reg_no from public.profiles where id = v_user;

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

  -- N5: Update own registrations.admin_note
  v_rows := 0;
  begin
    perform set_config('request.jwt.claim.sub', v_user::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);
    set local role authenticated;

    update public.registrations set admin_note = 'simulated note' where user_id = v_user;
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
  values ('v_user', 'N5: Update own registrations.admin_note', 'blocked', case when v_state <> 'OK' then 'sqlstate ' || v_state else v_rows || ' rows affected' end, v_state <> 'OK' or v_rows = 0);

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

end;
$$;

-- ============================================================================
-- FINAL SUMMARY QUERY
-- Displays SUMMARY row first, followed by each individual test in order.
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

