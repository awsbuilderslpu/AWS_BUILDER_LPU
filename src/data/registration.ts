import {
  CalendarDays,
  FileText,
  Users,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { siteConfig } from "@/data/site";
import { authCopy } from "@/data/auth";

const { name, org, website, university } = siteConfig;

export interface RegisterStepItem {
  label: string;
  short: string;
}

export const registerSteps: RegisterStepItem[] = [
  { label: "Basic Information", short: "Basic Info" },
  { label: "Academic Details", short: "Academic" },
  { label: "Interests", short: "Interests" },
  { label: "Review", short: "Review" },
];

export const countryCodes = [
  "+91",
  "+1",
  "+44",
  "+61",
  "+65",
  "+93",
  "+94",
  "+880",
  "+971",
  "+975",
  "+977",
] as const;
export type CountryCode = (typeof countryCodes)[number];

export const universities = [
  { value: "lpu", label: `${university} (${org})` },
] as const;

export const programmes = [
  "B.Tech",
  "M.Tech",
  "BCA",
  "MCA",
  "B.Sc",
  "M.Sc",
  "BBA",
  "MBA",
  "Diploma",
  "Ph.D.",
  "Other",
] as const;
export type Programme = (typeof programmes)[number];

export interface DepartmentOption {
  value: string;
  label: string;
  short: string;
}

export const departments: DepartmentOption[] = [
  { value: "cse", label: "Computer Science and Engineering", short: "CSE" },
  { value: "it", label: "Information Technology", short: "IT" },
  {
    value: "ece",
    label: "Electronics and Communication Engineering",
    short: "ECE",
  },
  {
    value: "aiml",
    label: "Artificial Intelligence and Machine Learning",
    short: "AIML",
  },
  { value: "ds", label: "Data Science", short: "DS" },
  { value: "cyber", label: "Cyber Security", short: "CYS" },
  { value: "ee", label: "Electrical Engineering", short: "EE" },
  { value: "me", label: "Mechanical Engineering", short: "ME" },
  { value: "ce", label: "Civil Engineering", short: "CE" },
  { value: "other", label: "Other", short: "Other" },
];

export const yearOptions = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "5th Year",
] as const;

export const semesterOptions = [
  "1st Semester",
  "2nd Semester",
  "3rd Semester",
  "4th Semester",
  "5th Semester",
  "6th Semester",
  "7th Semester",
  "8th Semester",
  "9th Semester",
  "10th Semester",
] as const;

export const interestOptions = [
  "Cloud Computing",
  "Cyber Security",
  "AI/ML",
  "DevOps",
  "Web Development",
  "Data Science",
  "Community & Events",
  "Open Source",
  "Other",
] as const;
export type InterestOption = (typeof interestOptions)[number];

// Constants
export const registrationConstants = {
  passwordMin: 8,
  passwordMax: 72,
  // Placeholder policy; sign-ups under 18 may need a parent's consent under India's data-protection law, so confirm with the university
  minAge: 16,
  // Digits only; TODO: tighten to the university's real format
  registrationNumberLength: { min: 6, max: 12 },
  graduationSpan: 7,
  resendSeconds: 60,
};

export interface SuccessLinkItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const registrationCopy = {
  basic: {
    title: "Basic Information",
    subtitle: "Tell us a few details about yourself.",
    fields: {
      firstName: { label: "First Name", placeholder: "First name" },
      lastName: { label: "Last Name", placeholder: "Last name" },
      email: { label: "Email Address", placeholder: `you@${website}` },
      phone: { label: "Phone Number", placeholder: "9876543210" },
      registrationNumber: {
        label: "Registration Number",
        placeholder: "Reg. number (e.g. 12001234)",
      },
      dateOfBirth: { label: "Date of Birth" },
      password: { label: "Password", placeholder: "At least 8 chars" },
      confirmPassword: {
        label: "Confirm Password",
        placeholder: "Re-enter password",
      },
    },
    countryCodeLabel: "Country code",
    registrationInfo:
      "Your university registration number, as printed on your ID card.",
    registrationInfoLabel: "About the registration number",
    passwordHint:
      "Use at least 8 characters with a mix of letters, numbers and symbols.",
    terms: {
      before: "I agree to the",
      terms: "Terms and Conditions",
      join: "and",
      privacy: "Privacy Policy",
      // TODO: those pages come in the final cleanup step
      termsHref: "/terms",
      privacyHref: "/privacy",
    },
    note: authCopy.welcome.note,
  },
  academic: {
    title: "Academic Details",
    subtitle: "Help us know your academic background.",
    fields: {
      university: {
        label: "University",
        placeholder: "Select your university",
      },
      programme: { label: "Programme", placeholder: "Select your programme" },
      department: {
        label: "Branch / Department",
        placeholder: "Select your branch or department",
      },
      year: { label: "Current Year", placeholder: "Select year" },
      semester: { label: "Current Semester", placeholder: "Select semester" },
      graduationYear: {
        label: "Expected Graduation Year",
        placeholder: "Select year",
      },
    },
  },
  interests: {
    title: "Interests & Involvement",
    subtitle: "Let us know what you're interested in.",
    interestsLabel: "Areas of Interest",
    interestsHint: "(Select multiple)",
    roleLabel: "What role are you joining as?",
    roleNotice:
      "Core Team and Admin access can only be granted by the club admins. Your request will be reviewed together with your registration.",
  },
  review: {
    title: "Review Your Details",
    subtitle: "Please review your details before creating your account.",
    sections: {
      personal: "Personal Information",
      academic: "Academic Information",
      interests: "Interests",
      role: "Role",
    },
    labels: {
      fullName: "Full Name",
      registrationNumber: "Registration Number",
      phone: "Phone",
      dateOfBirth: "Date of Birth",
      university: "University",
      programme: "Programme",
      year: "Current Year",
      graduation: "Expected Graduation",
    },
    none: "None selected",
    needsApproval: "Needs approval",
    submit: "Create Account",
    submitting: "Creating account...",
  },
  verify: {
    title: "Verify Your Email",
    intro: "We've sent a verification link to",
    box: "Please check your inbox and click the verification link to activate your account.",
    spamHint: "Can't find it? Check your spam or junk folder.",
    resend: "Resend Email",
    resendIn: (s: number) => `Resend Email (${s}s)`,
    resent: "Verification email sent again.",
    change: "Change Email Address",
  },
  success: {
    title: "Registration Successful!",
    welcome: `Welcome to ${name} ${org} 🎉`,
    text: "Your account has been created and verified. Club admins will review your registration, and you'll get an email once it's approved.",
    cta: "Go to my account",
    ctaSignedOut: "Sign in",
    links: [
      { label: "Events", href: "/events", icon: CalendarDays },
      { label: "Blogs", href: "/blogs", icon: FileText },
      { label: "Community", href: "/members", icon: Users },
      // TODO: point Opportunities at a real page later
      { label: "Opportunities", href: "/about", icon: Trophy },
    ] as SuccessLinkItem[],
  },
  errors: {
    firstName: "Please enter your first name.",
    lastName: "Please enter your last name.",
    phone: "Please enter a valid phone number.",
    registrationNumber:
      "Please enter your registration number (digits only).",
    dateOfBirth: "Please enter a valid date of birth.",
    underAge: (n: number) => `You must be at least ${n} years old to register.`,
    password: "Use at least 8 characters, including a letter and a number.",
    confirmPassword: "Passwords don't match.",
    terms: "Please accept the Terms and Conditions and the Privacy Policy.",
    university: "Please choose your university.",
    programme: "Please choose your programme.",
    department: "Please choose your branch or department.",
    year: "Please choose your current year.",
    semester: "Please choose your current semester.",
    graduationYear: "Please choose your expected graduation year.",
    role: "Please choose a role.",
    registerFailed: "We couldn't create your account. Please try again.",
    resendFailed: "We couldn't resend the email. Please try again in a moment.",
    email: authCopy.errors.email,
  },
};
