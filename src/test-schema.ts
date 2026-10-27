import { basicInfoSchema } from "@/lib/auth/schemas";
import { zodResolver } from "@hookform/resolvers/zod";

async function test() {
  const resolver = zodResolver(basicInfoSchema);

  const invalidData = {
    firstName: "Argive me the step by step gide - STEP 14 of the website: SUPABASE BACKEND FOUNDATION (database, roles, security rules, file storage, client helpers). Steps 1 to 13c built the front end. This step adds the backend only: no page, component or layout changes, no sign-in screens or route guards (Step 15), no admin screens (Steps 16 to 21), and no page reads from the database yet (Step 22). Do ONLY Step 14.

Testing: do NOT use Playwright or the internal browser, and do NOT run npm run build(the dev server is running).Verify with npx tsc --noEmit, npm run lint and curl.I will run the SQL in the Supabase dashboard myself.

    Secrets: never print, log, commit or ask me for any key.Keys go in .env.local only, which I fill in myself.Create.env.example with these names and empty values: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY.Confirm.env.local is in .gitignore.The service role key may only be used in server - only files(import "server-only"), never in a client component.

      Rules: read AGENTS.md first and follow it.Tokens only(no hex colors in src /).Club name comes from siteConfig.Nothing in src / may contain "PICT" or "Pune".Don't change art-source/ or the artwork pipeline.

  0. READ FIRST.Read AGENTS.md, package.json, .gitignore, and list src / and the app / routes.Look at the sign - up flow from Step 12 and list the fields it collects.Report in one line: whether Supabase packages are already installed, whether any auth or data code exists, and the sign - up fields found.

1. INSTALL.npm install @supabase/supabase-js @supabase/ssr server - only.Nothing else.

  2. CLIENT HELPERS(new files):
  - src / lib / supabase / client.ts: browser client(createBrowserClient).
   - src / lib / supabase / server.ts: server client using cookies() from next / headers(createServerClient, current async cookies API for the Next.js version in use).
   - src / lib / supabase / admin.ts: service - role client, with import "server-only".
  - src / lib / supabase / middleware.ts plus the root middleware file: session refresh only.It must not redirect or block any route.If AGENTS.md or the Next.js version in use calls this file "proxy", follow that.
   - src / types / database.ts: hand - written TypeScript types for the tables below(I will regenerate them later).
   All helpers must give a clear error message, not a crash at import time, when the env vars are empty, and the middleware must pass requests through untouched in that case, so the site still renders with no.env.local.

3. SQL MIGRATION: supabase / migrations /0001_init.sql(one file I paste into the Supabase SQL editor).Idempotent where practical.
    Enums:
  - app_role: 'admin', 'core_team', 'member'
    - member_status: 'pending', 'active', 'rejected', 'archived', 'deactivated'
      - event_status: 'draft', 'published', 'archived'
        - post_status: 'draft', 'scheduled', 'published'
  Tables(id uuid primary key default gen_random_uuid(), created_at, updated_at where sensible):
  - profiles: id uuid primary key references auth.users on delete cascade, full_name, email, avatar_url, cover_url, bio, skills text[], role app_role default 'member', status member_status default 'pending', linkedin_url, github_url, instagram_url, signup_details jsonb default '{}'(holds the Step 12 sign - up fields that have no column of their own), joined_at(set when status first becomes 'active').
   - registration_notes: profile_id references profiles, author_id references profiles, note, created_at.Admin only(these are private notes on pending sign - ups).
   - events: title, slug unique, description, location, starts_at, ends_at, registration_deadline, capacity(nullable), cover_url, status default 'draft', created_by references profiles.
   - event_registrations: event_id, user_id, unique(event_id, user_id).
   - posts: title, slug unique, excerpt, body, cover_url, tags text[], status default 'draft', author_id references profiles, publish_at(for scheduled posts), published_at, seo_title, seo_description.
   - contact_messages: name, email, subject, message, handled boolean default false.
   - newsletter_subscribers: email unique.
   Functions and triggers:
  - current_app_role() and current_member_status() helpers(security definer, stable, search_path set) reading profiles for auth.uid().Also is_admin() and is_staff()(admin or core_team, status 'active') helpers built on them.
   - handle_new_user(): trigger on auth.users insert that creates a profiles row with role 'member', status 'pending', copying email and full_name from the user metadata.
   - set_updated_at() trigger on every table with updated_at.
   - A trigger that stops anyone except an admin from changing role or status on any profile, including their own, so no one can promote or approve themselves.Service - role calls(auth.uid() is null) are allowed through.
   - A trigger that sets joined_at the first time status becomes 'active'.
   - Public - read rule for scheduled posts: a post counts as published when status = 'published', or status = 'scheduled' and publish_at <= now().Use one view or one policy expression for this, not copies.
   - event_registration_count(event_id) security definer function returning an integer, so the public can see attendee counts without reading the registrations table.
   Row Level Security: enable RLS on EVERY table, with explicit policies:
  - profiles: a user can read their own row and update their own row except role and status(own avatar, cover, bio, skills, social links, name); active members' public fields (name, avatar, cover, bio, skills, social links, role) are readable by everyone for the Members page without exposing email or signup_details (use a view for this, with security_invoker or a column-safe approach, and say which you chose); admin can read and update every profile.
    - registration_notes: admin only, all operations.
   - events: anyone can read published events; admin and core_team can read all and insert, update and delete.
   - event_registrations: an active member can register and unregister themselves, only for published events whose registration_deadline has not passed, and read their own; admin and core_team can read all.
   - posts: anyone can read published posts(per the rule above); admin and core_team can read all and insert, update and delete; no one else can write.
   - contact_messages: anyone(including anonymous) can insert; only admin can read, update and delete.
   - newsletter_subscribers: anyone can insert; only admin can read and delete.
   Role rules to implement exactly:
  - Core Team manages events and blogs only.They cannot change roles, statuses or other members' profiles, and cannot read registration notes, contact messages or subscribers.
    - Only admin and core_team can write posts.
   - A member whose status is 'pending' can sign in and read their own profile only.Every other read of member - only data and every write is denied for them. 'rejected', 'archived' and 'deactivated' get the same treatment as pending.
   - "Remove Member" is a soft deactivate: status = 'deactivated'.No policy lets anyone delete profiles, and deactivated users lose all member privileges.
    Storage: create buckets avatars, covers, event - images, blog - images, all public - read, each with a 5 MB file size limit and image MIME types only(jpeg, png, webp, gif).Policies: public read; a user may write only inside a folder named with their own user id in avatars and covers(and only when status is 'active' or 'pending', not deactivated); admin and core_team may write to event - images and blog - images; only admin may delete in any bucket besides a user's own folder.
   Do NOT insert any admin user in the migration.At the bottom put a commented - out example showing how I promote my own account to admin after signing up(update profiles set role = 'admin', status = 'active' where email = '...'), noting it must be run in the SQL editor, which bypasses the protection trigger.

4. DOCS: supabase / README.md with short numbered steps for me: create the project, copy the three keys into.env.local, paste 0001_init.sql into the SQL editor and run it, sign up once(this works from Step 15, so until then create the user under Authentication > Users in the dashboard), then run the promote - to - admin line.Also list how to confirm each table shows RLS enabled and each bucket exists.

5. NO UI.Do not add auth forms, guards or pages, and do not wire any page to the database.Every page must render exactly as before, with or without.env.local.

    VERIFY: tsc and lint pass.curl "/", "/about", "/events", "/blogs", "/members", "/contact" and "/?auth=signin" all return 200 with the env vars empty.grep confirms: no key values anywhere, SUPABASE_SERVICE_ROLE_KEY is referenced only in server - only files, no hex colors in src /, and.env.local is gitignored.In your report: the Step 0 line, a table of every table with its RLS policies in one line each, the public profiles approach you chose, the list of files created or changed, and anything in my instructions you could not do or had to interpret.Then STOP.Do not start Step 15.faa",
  lastName: "Taj",
    email: "arfaa123@gmail.com",
      countryCode: "+91",
        phone: "8371889693",
          registrationNumber: "12313447",
            dateOfBirth: "2026-10-07",
              password: "Password123!",
                confirmPassword: "Password123!",
                  termsAccepted: true,
  };

const resolverResult = await resolver(invalidData, undefined, {
  fields: {},
  criteriaMode: "firstError",
  shouldUseNativeValidation: false,
});

console.log("Resolver errors on 2026 dob:", JSON.stringify(resolverResult.errors, null, 2));

const validData = {
  ...invalidData,
  dateOfBirth: "2003-05-15",
};

const validResult = await resolver(validData, undefined, {
  fields: {},
  criteriaMode: "firstError",
  shouldUseNativeValidation: false,
});

console.log("Resolver on valid data - errors count:", Object.keys(validResult.errors).length);
console.log("Resolver on valid data - values present:", Boolean(validResult.values.firstName));
}

void test();
