import "server-only";

import nodemailer from "nodemailer";

export interface SendMailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}

const EMAIL_REGEX = /^[^\s@<>",;:]+@[^\s@<>",;:]+\.[^\s@<>",;:]+$/;

export function isMailConfigured(): boolean {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const from = process.env.MAIL_FROM?.trim();

  return Boolean(host && user && pass && from);
}

// Reusable transport instance
let transportInstance: nodemailer.Transporter | null = null;

function getTransport(): nodemailer.Transporter {
  if (transportInstance) {
    return transportInstance;
  }

  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT?.trim()) || 587;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  transportInstance = nodemailer.createTransport({
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

  return transportInstance;
}

export async function sendMail({
  to,
  subject,
  text,
  html,
  replyTo,
}: SendMailOptions): Promise<"sent" | "failed" | "not_configured"> {
  if (!isMailConfigured()) {
    return "not_configured";
  }

  // Validate to address
  if (typeof to !== "string" || to.length > 254 || !EMAIL_REGEX.test(to)) {
    return "failed";
  }

  // Validate replyTo address if provided
  if (
    replyTo !== undefined &&
    (typeof replyTo !== "string" ||
      replyTo.length > 254 ||
      !EMAIL_REGEX.test(replyTo))
  ) {
    return "failed";
  }

  // Clean subject: remove CR and LF, cap at 200 characters
  if (typeof subject !== "string") {
    return "failed";
  }
  const cleanSubject = subject.replace(/[\r\n]+/g, " ").trim().slice(0, 200);
  if (!cleanSubject) {
    return "failed";
  }

  // Validate MAIL_FROM contains no CR or LF
  const mailFrom = process.env.MAIL_FROM?.trim() ?? "";
  if (!mailFrom || /[\r\n]/.test(mailFrom)) {
    return "failed";
  }

  try {
    const transport = getTransport();
    await transport.sendMail({
      from: mailFrom,
      to,
      subject: cleanSubject,
      text,
      html,
      replyTo,
    });

    return "sent";
  } catch {
    // Never log personal data, credentials, or error details
    return "failed";
  }
}

