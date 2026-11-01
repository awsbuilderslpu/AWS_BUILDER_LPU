export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return c;
    }
  });
}

export interface ReviewEmailCopy {
  approved: {
    subject: (siteLabel: string) => string;
    body: (siteLabel: string) => string;
    cta: string;
  };
  rejected: {
    subject: (siteLabel: string) => string;
    body: (siteLabel: string) => string;
    help: (email: string) => string;
  };
  shared: {
    greeting: (name: string) => string;
    noteIntro: string;
    signoff: (siteLabel: string) => string;
  };
}

const defaultCopy: ReviewEmailCopy = {
  approved: {
    subject: (siteLabel: string) => `Your ${siteLabel} registration is approved`,
    body: (siteLabel: string) =>
      `Good news: your registration with ${siteLabel} has been approved. You can now sign in and use your member account.`,
    cta: "Sign in",
  },
  rejected: {
    subject: (siteLabel: string) => `An update on your ${siteLabel} registration`,
    body: (siteLabel: string) =>
      `Thank you for registering with ${siteLabel}. We weren't able to approve your registration this time.`,
    help: (email: string) =>
      `If you think this is a mistake, reply to this email or write to ${email}.`,
  },
  shared: {
    greeting: (name: string) => `Hi ${name},`,
    noteIntro: "A note from the admins:",
    signoff: (siteLabel: string) => `The ${siteLabel} team`,
  },
};

export interface ReviewEmailOptions {
  kind: "approved" | "rejected";
  firstName: string;
  siteLabel: string;
  siteUrl: string | null;
  contactEmail: string;
  note?: string;
  copy?: ReviewEmailCopy;
}

export function buildReviewEmail(
  options: ReviewEmailOptions,
  copyParam?: ReviewEmailCopy
): { subject: string; text: string; html: string } {
  const copy = copyParam ?? options.copy ?? defaultCopy;
  const isApproved = options.kind === "approved";

  // Clean and build subject with CR and LF stripped
  const rawSubject = isApproved
    ? copy.approved.subject(options.siteLabel)
    : copy.rejected.subject(options.siteLabel);
  const subject = rawSubject
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Name fallback to "there"
  const name = options.firstName?.trim() || "there";

  // Note check (non-empty string only)
  const trimmedNote = options.note?.trim();
  const hasNote = Boolean(trimmedNote);

  // URL validation: only http:// or https://
  const isValidUrl = Boolean(
    options.siteUrl && /^https?:\/\/[^\s<>"']+$/.test(options.siteUrl)
  );

  // Text parts
  const textParts: string[] = [];
  textParts.push(copy.shared.greeting(name));
  textParts.push(
    isApproved
      ? copy.approved.body(options.siteLabel)
      : copy.rejected.body(options.siteLabel)
  );

  if (isApproved && isValidUrl) {
    textParts.push(`${copy.approved.cta}: ${options.siteUrl}`);
  }

  if (hasNote) {
    textParts.push(`${copy.shared.noteIntro}\n${trimmedNote}`);
  }

  if (!isApproved) {
    textParts.push(copy.rejected.help(options.contactEmail));
  }

  textParts.push(copy.shared.signoff(options.siteLabel));
  const text = textParts.join("\n\n");

  // HTML parts
  const htmlParts: string[] = [];
  htmlParts.push(
    `<p style="margin:0 0 16px;">${escapeHtml(copy.shared.greeting(name))}</p>`
  );

  const bodyText = isApproved
    ? copy.approved.body(options.siteLabel)
    : copy.rejected.body(options.siteLabel);
  htmlParts.push(
    `<p style="margin:0 0 16px;">${escapeHtml(bodyText)}</p>`
  );

  if (isApproved && isValidUrl) {
    htmlParts.push(
      `<p style="margin:20px 0;"><a href="${escapeHtml(
        options.siteUrl!
      )}" style="display:inline-block;padding:10px 18px;background:black;color:white;text-decoration:none;border-radius:6px;font-weight:500;">${escapeHtml(
        copy.approved.cta
      )}</a></p>`
    );
  }

  if (hasNote) {
    const escapedNote = escapeHtml(trimmedNote!).replace(
      /\r\n|\r|\n/g,
      "<br>"
    );
    htmlParts.push(
      `<p style="margin:16px 0 8px;font-weight:600;">${escapeHtml(
        copy.shared.noteIntro
      )}</p><blockquote style="margin:0 0 16px;padding:8px 12px;border-left:3px solid gray;color:black;">${escapedNote}</blockquote>`
    );
  }

  if (!isApproved) {
    htmlParts.push(
      `<p style="margin:16px 0;color:dimgray;">${escapeHtml(
        copy.rejected.help(options.contactEmail)
      )}</p>`
    );
  }

  htmlParts.push(
    `<p style="margin:24px 0 0;color:dimgray;">${escapeHtml(
      copy.shared.signoff(options.siteLabel)
    )}</p>`
  );

  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:black;background:white;max-width:600px;margin:0 auto;padding:24px;line-height:1.5;">${htmlParts.join(
    ""
  )}</div>`;

  return { subject, text, html };
}
