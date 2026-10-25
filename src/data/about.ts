import { siteConfig } from "@/data/site";
import type { HeadingLine } from "@/components/ui/PageHeading";
import {
  Users,
  BookOpen,
  CodeXml,
  Rocket,
  Handshake,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";

export interface AboutPillar {
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface AboutQuote {
  text: string;
  attribution: string;
}

export const aboutHeading: HeadingLine[] = [
  { text: "MORE" },
  { text: "THAN A CLUB," },
  { text: "A CLOUD COMMUNITY.", accent: true },
];

export const aboutIntro: string = `${siteConfig.name} ${siteConfig.org} is a student-led community at ${siteConfig.university} (${siteConfig.org}) focused on cloud computing using Amazon Web Services (AWS). We aim to provide students with the resources, workshops, and hands-on experiences to learn, apply, and grow in cloud technologies.`;

export const aboutPillars: AboutPillar[] = [
  {
    title: "Community",
    description:
      "A collaborative space for learners, builders and cloud enthusiasts.",
    icon: Users,
  },
  {
    title: "Learning",
    description:
      "Workshops, resources and expert sessions on AWS technologies.",
    icon: BookOpen,
  },
  {
    title: "Practice",
    description:
      "Hands-on projects, cloud labs and real-world problem solving.",
    icon: CodeXml,
  },
  {
    title: "Growth",
    description:
      "Build your skills, portfolio and network with industry exposure.",
    icon: Rocket,
  },
  {
    title: "Opportunities",
    description:
      "Internships, hackathons and career guidance in the cloud ecosystem.",
    icon: Handshake,
  },
  {
    title: "Impact",
    description: "Using cloud technology to solve real-world challenges.",
    icon: Lightbulb,
  },
];

export const aboutQuote: AboutQuote = {
  text: "We believe in empowering students to build a better tomorrow, on the cloud.",
  attribution: `${siteConfig.name} ${siteConfig.org}`,
};
