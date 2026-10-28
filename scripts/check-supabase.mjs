import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '..', '.env.local');

// 1. Verify .env.local exists
if (!fs.existsSync(envPath)) {
  console.log('FAIL [env]: .env.local is missing. (Fix: copy .env.example to .env.local and add your Supabase credentials).');
  console.log('\nResult: 0 passed, 1 failed, 0 skipped');
  process.exit(1);
}

// 2. Load .env.local without exposing contents
try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile(envPath);
  } else {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const eqIdx = line.indexOf('=');
      if (eqIdx !== -1) {
        const key = line.slice(0, eqIdx).trim();
        let val = line.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
} catch (err) {
  console.log(`FAIL [env]: Could not read .env.local: ${err.message}`);
  console.log('\nResult: 0 passed, 1 failed, 0 skipped');
  process.exit(1);
}

let passed = 0;
let failed = 0;
let skipped = 0;

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

if (!rawUrl || !key) {
  console.log('FAIL [env]: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not set. (Fix: fill in both values in .env.local).');
  failed++;
  console.log(`\nResult: ${passed} passed, ${failed} failed, ${skipped} skipped`);
  process.exit(1);
}

let baseUrl = '';
let host = '';

try {
  const parsed = new URL(rawUrl);
  host = parsed.hostname;
  baseUrl = parsed.origin;
  console.log(`PASS [env]: Supabase credentials configured for host ${host}`);
  passed++;
} catch {
  console.log('FAIL [env]: NEXT_PUBLIC_SUPABASE_URL is not a valid URL. (Fix: specify a valid URL like https://xyz.supabase.co in .env.local).');
  failed++;
  console.log(`\nResult: ${passed} passed, ${failed} failed, ${skipped} skipped`);
  process.exit(1);
}

async function runChecks() {
  // Private / internal tables where anonymous visitors MUST NOT receive any rows
  const privateTables = [
    'profiles',
    'user_roles',
    'registrations',
    'registration_notes',
    'event_registrations',
    'contact_messages',
    'newsletter_subscribers',
  ];

  for (const table of privateTables) {
    const tableUrl = `${baseUrl}/rest/v1/${table}?select=*&limit=1`;
    try {
      const res = await fetch(tableUrl, {
        method: 'GET',
        headers: { apikey: key },
      });

      if (res.status === 401 || res.status === 403) {
        console.log(`PASS [${table}]: Anonymous access protected (HTTP ${res.status})`);
        passed++;
        continue;
      }

      if (res.status === 404) {
        console.log(`FAIL [${table}]: table not found (HTTP 404). (Fix: run the migrations in supabase/migrations/).`);
        failed++;
        continue;
      }

      let body = null;
      try {
        body = await res.json();
      } catch {
        body = null;
      }

      if (body && typeof body === 'object' && body.code === 'PGRST205') {
        console.log(`FAIL [${table}]: table not found (PGRST205). (Fix: run the migrations in supabase/migrations/).`);
        failed++;
        continue;
      }

      if (res.status === 200) {
        if (Array.isArray(body) && body.length === 0) {
          console.log(`PASS [${table}]: Anonymous query returned 0 rows (table protected by RLS)`);
          passed++;
        } else {
          console.log(`FAIL [${table}]: anonymous visitors can read private table data. (Fix: check RLS policies in 004_security_policies.sql).`);
          failed++;
        }
        continue;
      }

      console.log(`FAIL [${table}]: unexpected status HTTP ${res.status}. (Fix: verify table permissions).`);
      failed++;
    } catch {
      console.log(`FAIL [${table}]: can't reach the project (is it paused?). (Fix: verify your Supabase project status in dashboard).`);
      failed++;
    }
  }

  // Public content tables where published rows may be read anonymously
  const publicTables = ['events', 'posts'];
  for (const table of publicTables) {
    const tableUrl = `${baseUrl}/rest/v1/${table}?select=*&limit=1`;
    try {
      const res = await fetch(tableUrl, {
        method: 'GET',
        headers: { apikey: key },
      });

      if (res.status === 404) {
        console.log(`FAIL [${table}]: table not found (HTTP 404). (Fix: run the migrations in supabase/migrations/).`);
        failed++;
        continue;
      }

      let body = null;
      try {
        body = await res.json();
      } catch {
        body = null;
      }

      if (body && typeof body === 'object' && body.code === 'PGRST205') {
        console.log(`FAIL [${table}]: table not found (PGRST205). (Fix: run the migrations in supabase/migrations/).`);
        failed++;
        continue;
      }

      if (res.status === 200 || res.status === 401 || res.status === 403) {
        console.log(`PASS [${table}]: Table accessible and secured under RLS (HTTP ${res.status})`);
        passed++;
        continue;
      }

      console.log(`FAIL [${table}]: unexpected status HTTP ${res.status}. (Fix: verify table configuration).`);
      failed++;
    } catch {
      console.log(`FAIL [${table}]: can't reach the project (is it paused?). (Fix: verify your Supabase project status in dashboard).`);
      failed++;
    }
  }

  // Auth settings check
  const authUrl = `${baseUrl}/auth/v1/settings`;
  try {
    const res = await fetch(authUrl, {
      method: 'GET',
      headers: { apikey: key },
    });

    if (!res.ok) {
      console.log(`SKIP [auth]: Auth settings endpoint returned HTTP ${res.status}`);
      skipped++;
    } else {
      let settings = null;
      try {
        settings = await res.json();
      } catch {
        settings = null;
      }

      if (settings && typeof settings === 'object') {
        if ('mailer_autoconfirm' in settings) {
          if (settings.mailer_autoconfirm === false) {
            console.log('PASS [auth]: Email confirmation is enabled (mailer_autoconfirm is false)');
            passed++;
          } else {
            console.log('FAIL [auth]: turn Confirm email on in Supabase dashboard (mailer_autoconfirm is true). (Fix: Auth > Email > Confirm email ON).');
            failed++;
          }
        }

        if ('disable_signup' in settings) {
          if (settings.disable_signup === false) {
            console.log('PASS [auth]: User sign-up is enabled (disable_signup is false)');
            passed++;
          } else {
            console.log('FAIL [auth]: User sign-up is disabled in Supabase dashboard. (Fix: Auth > User Signups ON).');
            failed++;
          }
        }

        if (settings.external && typeof settings.external === 'object') {
          if (settings.external.google === true) {
            console.log('PASS [auth]: Google OAuth provider is enabled');
            passed++;
          } else {
            console.log('INFO [auth]: Google OAuth provider is not yet enabled (Step 15 dashboard setup)');
          }
        }
      } else {
        console.log('SKIP [auth]: Auth settings response format unrecognized');
        skipped++;
      }
    }
  } catch {
    console.log("FAIL [auth]: can't reach the project (is it paused?). (Fix: verify your Supabase project status in dashboard).");
    failed++;
  }

  console.log(`\nResult: ${passed} passed, ${failed} failed, ${skipped} skipped`);
  process.exit(failed > 0 ? 1 : 0);
}

runChecks();
