import { Users, Cloud, UsersRound, Trophy, type LucideIcon } from "lucide-react";
import { siteConfig } from "@/data/site";

export const authParam = "auth" as const;
export type AuthView = "signin" | "register" | "verified";

export interface BenefitItem {
  icon: LucideIcon;
  tone: "orange" | "blue" | "violet" | "green";
  text: string;
}

export interface WelcomeCopy {
  title: string;
  subtitle: string;
  google: string;
  email: string;
  divider: string;
  note: string;
  prompt: string;
  link: string;
}

export interface SigninCopy {
  title: string;
  subtitle: string;
  emailField: {
    label: string;
    placeholder: string;
  };
  passwordField: {
    label: string;
    placeholder: string;
  };
  forgot: string;
  forgotNotice: string;
  submit: string;
  submitting: string;
  success: string;
  successNote: string;
  prompt: string;
  link: string;
}

export interface AuthErrors {
  email: string;
  password: string;
  failed: string;
  google: string;
  unavailable: string;
  emailNotConfirmed: string;
  resendLink: string;
  rateLimited: string;
  network: string;
  linkExpired: string;
  googleFailed: string;
  generic: string;
}

export interface PanelCopy {
  tagline: string[];
  welcomeHeading: {
    line1: string;
    line2Prefix: string;
    line2Highlight: string;
  };
  welcomeText: string;
  benefits: BenefitItem[];
  signinHeading: string[];
  footerGroups: string[][];
}

export interface ConfirmPageCopy {
  title: string;
  subtitle: string;
  description: string;
  button: string;
  verifying: string;
  expiredTitle: string;
  expiredDescription: string;
  backToSignIn: string;
}

export interface SigninSuccessCopy {
  title: string;
  description: string;
  cta: string;
}

export interface AccountPageCopy {
  title: string;
  subtitle: string;
  emailLabel: string;
  roleLabel: string;
  statusLabel: string;
  profileLabel: string;
  profileComplete: string;
  profileIncomplete: string;
  profileHint: string;
  activeStatus: string;
  inactiveStatus: string;
  signOut: string;
}

const { name, org, website } = siteConfig;

export const authCopy: {
  welcome: WelcomeCopy;
  signin: SigninCopy;
  errors: AuthErrors;
  panel: PanelCopy;
  confirmPage: ConfirmPageCopy;
  signinSuccess: SigninSuccessCopy;
  account: AccountPageCopy;
} = {
  welcome: {
    title: "Create your account",
    subtitle: `Join ${name} ${org} and start your journey towards real skills, real people and real impact.`,
    google: "Continue with Google",
    email: "Use Email Instead",
    divider: "or",
    note: `Only ${org} students can register. Please use your official university email or valid details.`,
    prompt: "Already have an account?",
    link: "Sign in",
  },
  signin: {
    title: "Welcome Back",
    subtitle: `Sign in to your ${name} ${org} account.`,
    emailField: {
      label: "University Email",
      placeholder: `you@${website}`,
    },
    passwordField: {
      label: "Password",
      placeholder: "Enter your password",
    },
    forgot: "Forgot Password?",
    forgotNotice: "Password reset will be available once accounts go live.",
    submit: "Sign In",
    submitting: "Signing in...",
    success: "You're signed in",
    successNote: "Redirecting to your account dashboard...",
    prompt: "Don't have an account?",
    link: "Register here",
  },
  errors: {
    email: "Please enter a valid email address.",
    password: "Please enter your password.",
    failed: "Incorrect email or password.",
    google: "Google sign-in isn't connected yet.",
    unavailable: "Accounts aren't open yet. Please check back soon.",
    emailNotConfirmed:
      "Please confirm your email address before signing in. Check your inbox for the confirmation link.",
    resendLink: "Resend confirmation email",
    rateLimited: "Too many sign-in attempts. Please wait a moment and try again.",
    network: "Network connection error. Please check your internet connection.",
    linkExpired: "This confirmation link has expired or has already been used.",
    googleFailed: "Could not sign in with Google. Please try again or use email.",
    generic: "An unexpected error occurred. Please try again.",
  },
  panel: {
    tagline: ["Learn", "Build", "Share", "Grow Together"],
    welcomeHeading: {
      line1: "Be a Part of a",
      line2Prefix: "Bigger ",
      line2Highlight: "Community",
    },
    welcomeText: `Join ${name} ${org} and get access to workshops, hackathons, cloud learning, and amazing opportunities.`,
    benefits: [
      {
        icon: Users,
        tone: "orange",
        text: "Learn from peers and industry experts",
      },
      {
        icon: Cloud,
        tone: "blue",
        text: "Hands-on cloud projects and workshops",
      },
      {
        icon: UsersRound,
        tone: "violet",
        text: `Be part of a growing community at ${org}`,
      },
      {
        icon: Trophy,
        tone: "green",
        text: "Get access to exclusive events and opportunities",
      },
    ],
    signinHeading: ["Ideas", "Deploy", "Scale", "Repeat."],
    footerGroups: [
      ["Real skills", "Real people", "Real impact.", `At ${org}`],
      ["Ideas", "Deploy", "Scale", "Repeat"],
      ["Community", "Technology", "Opportunities", "For a brighter", "Tomorrow"],
    ],
  },
  confirmPage: {
    title: "Confirm Your Email",
    subtitle: `Activate your ${name} ${org} account`,
    description:
      "To protect against automated scanners and activate your account, click the button below to confirm your email address.",
    button: "Confirm Email Address",
    verifying: "Verifying confirmation...",
    expiredTitle: "Verification Link Expired",
    expiredDescription:
      "This verification link has expired, is invalid, or was already used. Please sign in or request a new link.",
    backToSignIn: "Sign In",
  },
  signinSuccess: {
    title: "Email Verified!",
    description: "Your email has been confirmed and your account is active.",
    cta: "Go to My Account",
  },
  account: {
    title: "Account Overview",
    subtitle: `Your profile and membership details with ${name} ${org}.`,
    emailLabel: "Email Address",
    roleLabel: "Assigned Role",
    statusLabel: "Registration Status",
    profileLabel: "Profile Completeness",
    profileComplete: "Complete",
    profileIncomplete: "Incomplete",
    profileHint:
      "All required student and academic details have been submitted. Profile updates will be available in the member directory.",
    activeStatus: "Active",
    inactiveStatus: "Inactive",
    signOut: "Sign out",
  },
};

/**
 * Standard query param error mapping for OAuth callbacks and auth redirects.
 */
export const errorParams: Record<string, string> = {
  access_denied: "Sign in was canceled or access was denied.",
  oauth_failed: authCopy.errors.googleFailed,
  exchange_failed: "Could not establish a secure session. Please try again.",
  link_expired: authCopy.errors.linkExpired,
};
