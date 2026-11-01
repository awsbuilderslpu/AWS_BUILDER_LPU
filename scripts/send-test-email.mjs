import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '..', '.env.local');

// 1. Load .env.local if present
if (fs.existsSync(envPath)) {
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
          if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
          ) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  } catch {
    // ignore read errors
  }
}

// 2. Validate destination email address argument
const to = process.argv[2]?.trim();
const EMAIL_REGEX = /^[^\s@<>",;:]+@[^\s@<>",;:]+\.[^\s@<>",;:]+$/;

if (!to || to.length > 254 || !EMAIL_REGEX.test(to)) {
  console.log('Usage: npm run mail:test -- you@example.com');
  process.exit(1);
}

// 3. Verify SMTP configuration
const host = process.env.SMTP_HOST?.trim();
const port = Number(process.env.SMTP_PORT?.trim()) || 587;
const user = process.env.SMTP_USER?.trim();
const pass = process.env.SMTP_PASS?.trim();
const from = process.env.MAIL_FROM?.trim();

if (!host || !user || !pass || !from) {
  console.log('FAIL: missing settings');
  process.exit(1);
}

if (/[\r\n]/.test(from)) {
  console.log('FAIL: sender or recipient refused');
  process.exit(1);
}

// 4. Create transport and send test message
const transport = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  requireTLS: port === 587,
  auth: {
    user,
    pass,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 20000,
});

const testSubject = 'Test email from the club website';
const testText = 'If you can read this, approval emails will work.';
const testHtml =
  '<div style="font-family:sans-serif;padding:16px;">If you can read this, approval emails will work.</div>';

try {
  await transport.sendMail({
    from,
    to,
    subject: testSubject,
    text: testText,
    html: testHtml,
  });

  console.log('PASS: test email sent');
  process.exit(0);
} catch (err) {
  const code =
    err && typeof err === 'object' && 'code' in err ? String(err.code) : '';

  if (code === 'EAUTH') {
    console.log('FAIL: login rejected');
  } else if (
    [
      'ECONNECTION',
      'ETIMEDOUT',
      'ESOCKET',
      'ECONNREFUSED',
      'EDNS',
      'ENOTFOUND',
    ].includes(code)
  ) {
    console.log("FAIL: can't connect");
  } else if (code === 'EENVELOPE') {
    console.log('FAIL: sender or recipient refused');
  } else {
    console.log('FAIL: unknown error');
  }

  process.exit(1);
}

