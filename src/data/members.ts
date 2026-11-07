import { type LucideIcon, Users, GraduationCap } from "lucide-react";
import { siteConfig } from "@/data/site";
import type { HeadingLine } from "@/components/ui/PageHeading";

export type MemberGroup = "core" | "lead" | "mentor" | "community" | "alumni" | "speaker";

export interface MemberSocials {
  awsBuilder?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  instagram?: string;
  youtube?: string;
}

export interface Member {
  slug: string;
  name: string;
  role: string;
  badge?: string; // text on the photo badge, defaults to role
  focus?: string; // second line on core cards
  group: MemberGroup;
  skills: string[];
  image?: string; // a path under /images/members/, leave undefined
  socials: MemberSocials;
}

export interface MemberTab {
  label: string;
  group: MemberGroup | null;
}

export interface JoinCardData {
  icon: LucideIcon;
  title: string;
  text: string;
  cta: {
    label: string;
    href: string;
    variant: "primary" | "outline";
  };
  framed?: boolean;
}

export const membersHeading: HeadingLine[] = [
  { text: "A COMMUNITY" },
  { text: "OF BUILDERS.", accent: true },
];

export const membersIntro = `Meet the passionate students, leaders, and contributors who make ${siteConfig.name} ${siteConfig.org} a thriving community. Different skills, same mission — to learn, build and create real impact together.`;

export const memberTabs: MemberTab[] = [
  { label: "All Members", group: null },
  { label: "Core Team", group: "core" },
  { label: "Club Leads", group: "lead" },
  { label: "Mentors", group: "mentor" },
  { label: "Community Members", group: "community" },
  { label: "Alumni", group: "alumni" },
  { label: "Speakers", group: "speaker" },
];

export const memberSearchPlaceholder = "Search members by name, role, skills...";

export const allMembersPreviewCount = 4;

// TODO: Replace with real social links
const defaultSocials: MemberSocials = {
  linkedin: "#",
  github: "#",
  website: "#",
};

export const members: Member[] = [
  {
    slug: "shashank",
    name: "Shashank",
    role: "Club Lead",
    focus: `${siteConfig.name} ${siteConfig.org}`,
    group: "core",
    skills: ["AWS", "Cloud", "IaC"],
    socials: defaultSocials,
  },
  {
    slug: "md-arfaa",
    name: "MD ARFAA",
    role: "Technical Lead",
    focus: "Cloud & DevOps",
    group: "core",
    skills: ["AWS", "DevOps", "Docker"],
    socials: defaultSocials,
  },
  {
    slug: "rohan-verma",
    name: "Rohan Verma",
    role: "Event Coordinator",
    focus: "Workshops & Hackathons",
    group: "core",
    skills: ["AWS", "Cloud"],
    socials: defaultSocials,
  },
  {
    slug: "ananya-patel",
    name: "Ananya Patel",
    role: "Content Lead",
    focus: "Community & Blogs",
    group: "core",
    skills: ["Cloud", "Python"],
    socials: defaultSocials,
  },
  {
    slug: "karan-mehta",
    name: "Karan Mehta",
    role: "Design Lead",
    focus: "Creative & Branding",
    group: "core",
    skills: ["Cloud"],
    socials: defaultSocials,
  },
  {
    slug: "aditya-singh",
    name: "Aditya Singh",
    role: "Public Relations Lead",
    badge: "PR Lead",
    focus: "Outreach & Partnerships",
    group: "core",
    skills: ["AWS", "Cloud"],
    socials: defaultSocials,
  },
  {
    slug: "priya-nair",
    name: "Priya Nair",
    role: "Community Member",
    group: "community",
    skills: ["AWS", "Python", "Cloud"],
    socials: defaultSocials,
  },
  {
    slug: "vikram-rao",
    name: "Vikram Rao",
    role: "Community Member",
    group: "community",
    skills: ["DevOps", "Linux", "Docker"],
    socials: defaultSocials,
  },
  {
    slug: "mehak-khan",
    name: "Mehak Khan",
    role: "Community Member",
    group: "community",
    skills: ["Cloud", "Security", "AI/ML"],
    socials: defaultSocials,
  },
  {
    slug: "arjun-iyer",
    name: "Arjun Iyer",
    role: "Community Member",
    group: "community",
    skills: ["Terraform", "AWS", "IaC"],
    socials: defaultSocials,
  },
  // TODO: Replace placeholder members below with real members
  {
    slug: "neha-kapoor",
    name: "Neha Kapoor",
    role: "Community Member",
    group: "community",
    skills: ["AWS", "Python"],
    socials: defaultSocials,
  },
  {
    slug: "harpreet-singh",
    name: "Harpreet Singh",
    role: "Community Member",
    group: "community",
    skills: ["DevOps", "Terraform"],
    socials: defaultSocials,
  },
  {
    slug: "simran-kaur",
    name: "Simran Kaur",
    role: "Web Development Lead",
    group: "lead",
    skills: ["Python", "Cloud"],
    socials: defaultSocials,
  },
  {
    slug: "dev-chopra",
    name: "Dev Chopra",
    role: "AI/ML Lead",
    group: "lead",
    skills: ["AI/ML", "Python"],
    socials: defaultSocials,
  },
  {
    slug: "ritu-malhotra",
    name: "Ritu Malhotra",
    role: "Faculty Mentor",
    group: "mentor",
    skills: ["Cloud", "Security"],
    socials: defaultSocials,
  },
  {
    slug: "amit-verma",
    name: "Amit Verma",
    role: "Industry Mentor",
    group: "mentor",
    skills: ["AWS", "Terraform", "IaC"],
    socials: defaultSocials,
  },
  {
    slug: "rahul-bansal",
    name: "Rahul Bansal",
    role: "Alumni • SDE at Amazon",
    group: "alumni",
    skills: ["AWS", "DevOps"],
    socials: defaultSocials,
  },
  {
    slug: "pooja-arora",
    name: "Pooja Arora",
    role: "Alumni • Cloud Engineer",
    group: "alumni",
    skills: ["Cloud", "Docker"],
    socials: defaultSocials,
  },
  {
    slug: "siddharth-patel",
    name: "Siddharth Patel",
    role: "Alumni • Solutions Architect",
    group: "alumni",
    skills: ["AWS", "Serverless", "IaC"],
    socials: defaultSocials,
  },
  {
    slug: "kavita-sharma",
    name: "Kavita Sharma",
    role: "Alumni • DevOps Consultant",
    group: "alumni",
    skills: ["DevOps", "Terraform", "Cloud"],
    socials: defaultSocials,
  },
  // Speakers
  {
    slug: "dr-rajesh-gupta",
    name: "Dr. Rajesh Gupta",
    role: "Keynote Speaker • AWS Principal Architect",
    group: "speaker",
    skills: ["AWS", "Cloud", "GenAI"],
    socials: defaultSocials,
  },
  {
    slug: "aisha-verma",
    name: "Aisha Verma",
    role: "Tech Speaker • Staff DevOps Engineer",
    group: "speaker",
    skills: ["DevOps", "Kubernetes", "Docker"],
    socials: defaultSocials,
  },
  {
    slug: "sameer-sen",
    name: "Sameer Sen",
    role: "Guest Speaker • AWS Community Hero",
    group: "speaker",
    skills: ["Serverless", "AWS", "Python"],
    socials: defaultSocials,
  },
  {
    slug: "tanvi-nair",
    name: "Tanvi Nair",
    role: "Tech Speaker • Lead AI Researcher",
    group: "speaker",
    skills: ["AI/ML", "Cloud", "Security"],
    socials: defaultSocials,
  },
];

export const memberSkills: string[] = Array.from(
  new Set(members.flatMap((m) => m.skills))
).sort((a, b) => a.localeCompare(b));

export const joinCards: JoinCardData[] = [
  {
    icon: Users,
    title: "Be a part of our community",
    text: "Join a growing network of students interested in cloud, technology and innovation.",
    cta: {
      label: "Join the Club",
      href: siteConfig.joinUrl,
      variant: "primary",
    },
  },
  {
    icon: GraduationCap,
    title: "Become a member",
    text: `Open to all ${siteConfig.org} students who are curious about cloud, technology and real-world skills.`,
    cta: {
      label: "Learn More",
      href: "/about",
      variant: "outline",
    },
    framed: true,
  },
];
