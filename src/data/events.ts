import type { HeadingLine } from "@/components/ui/PageHeading";

export type EventCategory =
  | "workshop"
  | "hackathon"
  | "talk"
  | "competition"
  | "community";

export type EventStatus = "upcoming" | "registration-open" | "past";

export interface EventItem {
  slug: string;
  title: string;
  description: string;
  category: EventCategory;
  status: EventStatus;
  startDate: string; // "YYYY-MM-DD"
  endDate?: string; // "YYYY-MM-DD"
  location: string;
  image?: string;
  href: string;
}

export interface EventFilter {
  label: string;
  category: EventCategory | null;
}

export const eventsHeading: HeadingLine[] = [
  { text: "LEARN." },
  { text: "BUILD." },
  { text: "TOGETHER.", accent: true },
];

export const eventsIntro =
  "From workshops and tech talks to hackathons and hands-on labs, we organize events that help you gain real cloud skills, connect with industry experts, and grow together as a community.";

export const eventFilters: EventFilter[] = [
  { label: "All Events", category: null },
  { label: "Workshops", category: "workshop" },
  { label: "Hackathons", category: "hackathon" },
  { label: "Tech Talks", category: "talk" },
  { label: "Competitions", category: "competition" },
  { label: "Community", category: "community" },
];

export const events: EventItem[] = [
  {
    slug: "aws-cloud-fundamentals-workshop",
    title: "AWS Cloud Fundamentals Workshop",
    description:
      "Get started with AWS. Learn core services, hands-on with the AWS Console, and deploy your first project.",
    category: "workshop",
    status: "upcoming",
    startDate: "2026-11-14",
    location: "LPU Campus",
    href: "#", // TODO: point to event detail page when it exists
  },
  {
    slug: "cloud-hackathon-2026",
    title: "Cloud Hackathon 2026",
    description:
      "Build innovative solutions using AWS services. Collaborate, compete, and showcase your skills.",
    category: "hackathon",
    status: "upcoming",
    startDate: "2026-11-28",
    endDate: "2026-11-29",
    location: "LPU Campus",
    href: "#", // TODO: point to event detail page when it exists
  },
  {
    slug: "tech-talk-careers-in-cloud",
    title: "Tech Talk: Careers in Cloud",
    description:
      "Insights from industry experts on cloud careers, certifications, and real-world experiences.",
    category: "talk",
    status: "registration-open",
    startDate: "2026-12-12",
    location: "LPU Campus",
    href: "#", // TODO: point to event detail page when it exists
  },
];

export const viewAllHref = "#"; // TODO: point to the full events listing when it exists
