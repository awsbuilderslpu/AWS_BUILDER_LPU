import { type LucideIcon, Mail, MapPin, Link2, Share2 } from "lucide-react";
import { siteConfig } from "@/data/site";
import type { HeadingLine } from "@/components/ui/PageHeading";

export interface ContactInfoItem {
  label: string;
  value: string;
  href?: string;
  external?: boolean;
  icon: LucideIcon;
}

export interface FollowItem {
  label: string;
  text: string;
  icon: LucideIcon;
}

export const contactHeading: HeadingLine[] = [
  { text: "GET IN" },
  { text: "TOUCH.", accent: true },
];

export const contactIntro = `Have a question about the club, an upcoming event or a collaboration? Send us a message and the ${siteConfig.name} ${siteConfig.org} team will get back to you.`;

export const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  siteConfig.address
)}`;

export const contactInfo: ContactInfoItem[] = [
  {
    label: "Email",
    value: siteConfig.email,
    href: `mailto:${siteConfig.email}`,
    icon: Mail,
  },
  {
    label: "Location",
    value: siteConfig.address,
    icon: MapPin,
  },
  {
    label: "Website",
    value: siteConfig.website,
    href: `https://${siteConfig.website}`,
    external: true,
    icon: Link2,
  },
];

export const followItem: FollowItem = {
  label: "Follow Us",
  text: "Follow us for the latest updates on events, workshops and more.",
  icon: Share2,
};

export const formSubjects: string[] = [
  "General question",
  "Join the club",
  "Events and workshops",
  "Collaboration or sponsorship",
  "Feedback",
  "Other",
];

export const messageLimits = {
  min: 10,
  max: 1000,
};

export const contactCopy = {
  titles: {
    form: "Send a message",
    details: "Contact Details",
    map: "Find Us",
  },
  fields: {
    name: { label: "Name", placeholder: "Your name" },
    email: { label: "Email", placeholder: "you@example.com" },
    phone: { label: "Phone Number", placeholder: "+91 98765 43210" },
    registrationNumber: {
      label: "Registration Number",
      placeholder: "e.g. 12201234",
    },
    university: {
      label: "University",
      placeholder: "Lovely Professional University",
    },
    subject: { label: "Topic", placeholder: "Select a topic" },
    resume: {
      label: "Resume / CV",
      placeholder: "Upload your resume",
      hint: "PDF, DOC, or DOCX (Max 5MB)",
    },
    message: { label: "Message", placeholder: "Tell us how we can help..." },
  },
  errors: {
    name: "Please enter your name.",
    email: "Please enter a valid email address.",
    phone: "Please enter a valid phone number.",
    registrationNumber: "Please enter your registration number.",
    university: "Please enter your university name.",
    subject: "Please choose a topic.",
    resumeSize: "Resume file size must be less than 5MB.",
    resumeType: "Please upload a valid PDF, DOC, or DOCX file.",
    message: `Please write at least ${messageLimits.min} characters.`,
  },
  submit: "Send Message",
  submitting: "Sending...",
  successTitle: "Message sent",
  successText:
    "Thanks for reaching out. We'll reply to the email address you gave us.",
  successAgain: "Send another message",
  failure: `Something went wrong. Please try again, or email us at ${siteConfig.email}.`,
  mapButton: "Open in Google Maps",
};
