export interface EmailCopy {
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
  test: {
    subject: string;
    text: string;
  };
}

export const emailCopy: EmailCopy = {
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
  test: {
    subject: "Test email from the club website",
    text: "If you can read this, approval emails will work.",
  },
};

