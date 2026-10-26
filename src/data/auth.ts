import { Users, Cloud, UsersRound, Trophy, type LucideIcon } from "lucide-react";
import { siteConfig } from "@/data/site";

export const authParam = "auth" as const;
export type AuthView = "signin" | "register";

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

const { name, org, website } = siteConfig;

export const authCopy: {
  welcome: WelcomeCopy;
  signin: SigninCopy;
  errors: AuthErrors;
  panel: PanelCopy;
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
    successNote: "Demo mode: no real account was used.",
    prompt: "Don't have an account?",
    link: "Register here",
  },
  errors: {
    email: "Please enter a valid email address.",
    password: "Please enter your password.",
    failed: "Incorrect email or password.",
    google: "Google sign-in isn't connected yet.",
    unavailable: "Accounts aren't open yet. Please check back soon.",
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
};
