# Supabase Backend Setup & Security Guide

Follow this guide step by step to initialize and verify the Supabase backend foundation for the AWS Cloud Community LPU platform.

---

### Step-by-Step Checklist

1. **Project Creation**
   - Create a new project in the [Supabase Dashboard](https://supabase.com/dashboard) (e.g. `aws-student-builders-group-lpu`).
   - Select a hosting region close to India (such as Mumbai / `ap-south-1` or Singapore / `ap-southeast-1`).
   - Store your database password securely in a password manager.

2. **Keys Configuration**
   - Navigate to **Project Settings > API Keys** (or **Settings > API**).
   - Copy the **Project URL** and the **Publishable Key** (`sb_publishable_...`).
   - Add them to your local `.env.local` file in the repository root:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
     NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
     ```
   - **DO NOT** copy or commit the `secret` or `service_role` key anywhere into this repository.
   - Restart your Next.js development server (`npm run dev`) after creating or editing `.env.local`.

3. **Authentication Settings**
   - In Supabase, navigate to **Authentication > Sign In / Providers > Email**.
   - Ensure **Confirm email** remains **ON** (enabled).
   - Set minimum password length to **8** or more characters.

4. **URL Configuration**
   - Navigate to **Authentication > URL Configuration**.
   - Set **Site URL** to: `http://localhost:3000`
   - Under **Redirect URLs**, add: `http://localhost:3000/**`
   - (The production URL will be added during deployment).

5. **Data API & Exposed Schemas**
   - Under **Settings > API** (Data API), ensure that exposed schemas remain set to **`public` only**.
   - **Never add `private`** to exposed schemas. Security helpers, audit triggers, and internal functions reside in `private` specifically to stay unreachable from PostgREST and the public Data API.

6. **Run SQL Migrations (in exact numerical order)**
   - Open the **SQL Editor** in your Supabase dashboard.
   - Run the migration files in [`supabase/migrations/`](file:///F:/AWS/AWS_BUILDER_LPU/supabase/migrations/) one by one:
     1. **`001_foundations.sql`** (Private schema, custom enums for roles, statuses, event/post publication, updated_at trigger function)
     2. **`002_tables.sql`** (All 9 application tables: `user_roles`, `profiles`, `registrations`, `registration_notes`, `events`, `event_registrations`, `posts`, `contact_messages`, `newsletter_subscribers`, indexes, and concurrency-safe capacity guards)
     3. **`003_new_user_trigger.sql`** (`handle_new_user` trigger on `auth.users`, trigger attachments, revoking execute privileges)
     4. **`004_security_policies.sql`** (Role evaluation helpers, RLS enabled on all 9 tables, table grants, and RLS policies)
     5. **`005_storage.sql`** (Buckets `avatars`, `covers`, `event-images`, `blog-images`, MIME restrictions, and storage RLS)
     6. **`006_owner_completion.sql`** (Lets people finish their own registration, sets column grants on terms_accepted_at and requested_role, and guards identity fields)
     7. **`007_registration_review.sql`** (Creates the `admin_registrations` view with `security_invoker = true` and the `review_registration` state machine function)
     8. **`008_private_notes.sql`** (Moves notes to admin-only `registration_notes` table, updates view and functions, drops `registrations.admin_note`)
     9. **`009_member_admin.sql`** (Creates `admin_members` view, member management functions `set_member_role`, `set_member_active`, `remove_member`, and append-only `admin_audit_log`)
   - If any file fails, stop immediately, inspect the error, and resolve it before proceeding.

7. **Run Database Audit**
   - Open [`supabase/audit/rls-audit.sql`](file:///F:/AWS/AWS_BUILDER_LPU/supabase/audit/rls-audit.sql) in the SQL Editor.
   - Run all 11 audit queries and compare each output against the expected results:
     - Query 1: 0 tables in public with RLS off.
     - Query 2: All expected policies present on public tables and `storage.objects`.
     - Query 3 & 4: 0 security definer functions missing `search_path = ''` or living in `public`.
     - Query 5: Buckets `avatars` and `covers` are private; `event-images` and `blog-images` are public; allowed MIME types are `image/jpeg`, `image/png`, `image/webp` (no SVG).
     - Query 6: Anon holds only `SELECT` on `events` and `posts`, and `INSERT` on `contact_messages` and `newsletter_subscribers`. No access to `profiles`, `user_roles`, `registrations`, `registration_notes`, `event_registrations`, or `admin_registrations`.
     - Query 7: Active admin count is 0 initially (1 after bootstrap).
     - Query 8: 0 views in schema public that are not `security_invoker`.
     - Query 9: Only `review_registration` in schema public, and it is NOT security definer.

8. **Run Verification Script**
   - In your local project terminal, run:
     ```bash
     npm run db:check
     ```
   - Confirm all environment, table, and auth checks return `PASS`.

9. **Step 15: Google OAuth & Email Configuration**
   - **Google OAuth Setup**:
     1. Open the [Google Cloud Console](https://console.cloud.google.com/) > **APIs & Services > Credentials**.
     2. Create an **OAuth Client ID** of type **Web application**.
     3. Add **Authorized JavaScript Origins**: `http://localhost:3000` (and production domain when deployed).
     4. Add **Authorized redirect URIs**: `https://<your-project-ref>.supabase.co/auth/v1/callback` (copied from Supabase Dashboard > Auth > Providers > Google).
     5. In the Supabase Dashboard, go to **Authentication > Providers > Google**:
        - Toggle **Enable Google provider** to ON.
        - Paste the **Client ID** and **Client Secret**.
        - Save.
   - **Confirm Email Template**:
     1. Go to **Authentication > Email Templates > Confirm signup**.
     2. Subject: `Confirm your AWS Student Builder Group LPU account`.
     3. Replace the default body with the HTML from `supabase/email-templates/confirm-signup.html`.
     4. Save changes.
   - **Redirect URLs Verification**:
     - Confirm that `http://localhost:3000/**` is listed under **Authentication > URL Configuration > Redirect URLs**.

10. **First Administrator Promotion**
   - **Do NOT run `supabase/manual/first-admin.example.sql` yet.**
   - Once the administrator signs up and confirms their email via the application (Step 15), execute [`supabase/manual/first-admin.example.sql`](file:///F:/AWS/AWS_BUILDER_LPU/supabase/manual/first-admin.example.sql) with their verified email address in the SQL Editor to grant root Administrator privileges.

---

### Registrations and Email

- **Run Migration 007**: Apply `supabase/migrations/007_registration_review.sql` after `006_owner_completion.sql`. This adds:
  - `public.admin_registrations`: A `security_invoker = true` view that joins `registrations` with `profiles`. Under RLS, administrators see all submissions while regular members only see their own.
  - `public.review_registration`: An invoker-rights, transactional SQL state machine function enforcing role hierarchy and atomic status updates.
- **State Machine**:
  - `pending` -> `approve` (becomes `approved`), `reject` (`rejected`), or `archive` (`archived`)
  - `rejected` -> `reopen` (`pending`) or `archive` (`archived`)
  - `approved` -> `archive` only (revoking membership or altering roles happens on the Members page, not here)
  - `archived` -> `restore` (restores to `approved` if the account already holds a role above `participant`, otherwise reverts to `pending`)
- **Role Grants on Approval**:
  - Approval grants exactly one of: `student`, `participant`, `member`, or `core`.
  - The `admin` role is **NEVER** granted from the registrations page or review function; administrative elevation is performed exclusively on the Members page or via direct SQL.
- **SMTP Mailer Configuration**:
  - The five SMTP settings (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `MAIL_FROM`) are server-only secrets.
  - Store them locally in `.env.local` and in the production hosting provider's environment variables dashboard. They must never be prefixed with `NEXT_PUBLIC_` and never committed to git.
  - Run `npm run mail:test -- you@example.com` to verify SMTP connectivity and transport health.
  - If mail is not configured, the registrations system continues to function normally and simply skips email dispatch.
- **Re-run Audit & Simulation**: Always re-run `supabase/audit/rls-audit.sql` and `supabase/audit/rls-simulation.sql` after applying migration 007 to verify the new view and review function.

---

### Members and the audit log

- **Run Migrations 008 and 009**: Apply `supabase/migrations/008_private_notes.sql` and `supabase/migrations/009_member_admin.sql` in numerical order after `007_registration_review.sql`.
- **What Migration 008 Fixes**:
  - `admin_note` was previously stored directly on `public.registrations`. Since applicants can select their own registration row via the API, private notes could potentially be read by the applicant.
  - Migration 008 moves notes into an admin-only table (`public.registration_notes`) with strict RLS policies (authenticated admins only).
  - Existing non-empty notes were safely copied into `registration_notes` before dropping `registrations.admin_note`.
  - Both `admin_registrations` view and `review_registration` function were updated to read and write notes via `registration_notes`.
- **What Migration 009 Adds**:
  - `public.admin_members`: A `security_invoker = true` view joining `user_roles`, `profiles`, `registrations`, and `registration_notes`.
  - Three member management functions: `set_member_role`, `set_member_active`, and `remove_member`. All are invoker security, admin-only, cannot target the caller's own account, and enforce rules in SQL.
  - `public.admin_audit_log`: An append-only audit trail capturing role changes, active flag toggles, and registration status updates.
- **Who Counts as a Member**:
  - A member is anyone who holds access: an approved registration, or any role above `participant`. Archiving a registration can never hide someone who still holds elevated access.
- **Admin Role Grants**:
  - `admin` is granted exclusively from the Members page or the SQL Editor, one person at a time, and only to someone who is active and approved.
  - The last active admin can never be demoted, deactivated, or removed.
- **Remove Member Semantics**:
  - "Remove member" deletes nothing: the person's role becomes `participant` and their registration is set to `archived` (it can be restored from the Registrations page).
  - "Inactive" is a separate, reversible flag that keeps the person listed while disabling access.
- **Audit Trail**:
  - Every change of a role, active flag, or registration status is written to `public.admin_audit_log` by database triggers (`private.audit_user_roles` and `private.audit_registrations`), so even changes made directly in the SQL Editor leave a trace.
  - No insert, update, or delete policy exists on `admin_audit_log`, making it append-only and immutable through the API.
  - The audit log can be inspected directly in the Supabase Table Editor (`admin_audit_log`).
- **Re-run Audit & Simulation**:
  - Re-run `supabase/audit/rls-audit.sql` and `supabase/audit/rls-simulation.sql` after applying 008 and 009.
  - Note: Member-dependent simulation tests require the test account (`v_user`) to be an approved member on the Registrations page; otherwise those tests are skipped.

---

### Security Architecture & Hierarchy

#### Role Delegation Hierarchy
- **Administrator**: Full control over all features, content, events, and role assignments.
- **Admin**: Can appoint or promote Captains, Core members, Members, Students, and Participants. Cannot alter Administrators or promote users to Admin/Administrator.
- **Captain**: Can appoint or promote Core members, Members, Students, and Participants. Cannot alter Captains, Admins, or Administrators.
- **Core Members**: Permissions appropriate to assigned duties (events, posts, content management, registration reviews).
- **Regular Members & Pending Applicants**: Read-only or own-data access.
- **Last Admin Protection**: The `guard_user_roles()` trigger prevents demoting, deactivating, or deleting the last active Administrator.

#### Public Form Abuse Prevention
- `contact_messages` and `newsletter_subscribers` permit public insertions from anonymous visitors.
- The database enforces strict length limits, email regex formatting, and enum constraints.
- Neither anonymous nor regular authenticated users can read or list submitted messages or subscriber emails.
- **Rate Limiting & Abuse Prevention**: Server-side rate limiting (via Next.js Route Handlers, Cloudflare Turnstile / Captcha, or edge middleware) should be connected in API routes handling public submissions to guard against spam flooding.

#### Concurrency-Safe Event Registrations
- Duplicate event registrations are blocked by `uq_event_registrations_event_user (event_id, user_id)`.
- Capacity limits and registration deadlines are strictly enforced by the `private.handle_event_registration()` trigger.
- The trigger uses `SELECT ... FOR UPDATE` to lock the target event record during registration, guaranteeing serialized capacity tracking and preventing overselling under high concurrency.

---

### Security Simulation

The script [`supabase/audit/rls-simulation.sql`](file:///F:/AWS/AWS_BUILDER_LPU/supabase/audit/rls-simulation.sql) tests all Row Level Security (RLS) policies, column-level grants, and role guard triggers from the database side under simulated `authenticated` sessions.

#### How to Run:
1. In the Supabase SQL Editor, run:
   ```sql
   select id, email, created_at from auth.users order by created_at;
   ```
2. Copy the UUID of your active Admin account and the UUID of a regular non-admin registered member.
3. Open [`supabase/audit/rls-simulation.sql`](file:///F:/AWS/AWS_BUILDER_LPU/supabase/audit/rls-simulation.sql) and paste the two UUIDs into `v_admin` and `v_user` at the top of the block.
4. Run the entire script in the SQL Editor.

#### Interpreting the Results:
- **`ALL PASS`**: The first row (`SUMMARY`) shows `ALL PASS` with `pass = true`. This proves all security rules, isolation barriers, and role restrictions are functioning with 100% integrity.
- **Safety**: Every test executes within a subtransaction ending in an immediate rollback (`SIM_ROLLBACK`). No data is modified. Output contains only SQLSTATE codes and row counts (zero personal data).
- **Mandatory Re-run**: You must run this simulation again after any step that modifies or touches policies.
- **Failure Protocol**: If any test fails, **STOP and do NOT proceed to Step 16b**. Share the summary table output for diagnosis.
