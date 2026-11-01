import type { LucideIcon } from "lucide-react";
import { Cloud, Box, BookOpen, Briefcase, Users } from "lucide-react";
import { siteConfig } from "@/data/site";
import type { HeadingLine } from "@/components/ui/PageHeading";

export type BlogTopic =
  | "AWS"
  | "Cloud Computing"
  | "Tutorials"
  | "Community"
  | "Career"
  | "Projects";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt?: string;
  category: string;
  topics: BlogTopic[];
  authorName: string;
  authorImage?: string;
  date: string; // "YYYY-MM-DD"
  readMinutes: number;
  image?: string;
  featured?: boolean;
  href: string;
}

export interface PopularTopic {
  label: string;
  topic: BlogTopic;
  count: number;
  icon: LucideIcon;
  href: string;
}

export const blogsHeading: HeadingLine[] = [
  { text: "IDEAS" },
  { text: "INSIGHTS" },
  { text: "REAL IMPACT.", accent: true },
];

export const blogsIntro = `Explore articles, tutorials, project write-ups, industry insights and stories from our community. Learn cloud, build your skills, and stay updated with everything AWS at ${siteConfig.org}.`;

export const blogFilters: string[] = [
  "All",
  "AWS",
  "Cloud Computing",
  "Tutorials",
  "Community",
  "Career",
  "Projects",
];

export const searchPlaceholder =
  "Search articles, tutorials, events, members..."; // TODO: currently only searches blog posts until a site-wide search exists

export const blogPosts: BlogPost[] = [
  {
    slug: "getting-started-with-aws-for-students",
    title: "Getting Started with AWS: A Beginner's Guide for Students",
    excerpt:
      "Learn the basics of AWS, core services, and how you can start building real projects as a student.",
    category: "AWS",
    topics: ["AWS", "Tutorials"],
    authorName: "Arfaa Taj",
    date: "2025-10-12",
    readMinutes: 8,
    featured: true,
    href: "#", // TODO: post detail page
  },
  {
    slug: "deploy-full-stack-app-ec2-rds",
    title: "Deploy a Full Stack App on AWS Using EC2 and RDS",
    category: "Tutorial",
    topics: ["AWS", "Tutorials"],
    authorName: "Rohan Verma",
    date: "2025-10-05",
    readMinutes: 6,
    href: "#", // TODO: post detail page
  },
  {
    slug: "highlights-cloud-club-hackathon-2025",
    title: "Highlights from AWS Cloud Club Hackathon 2025",
    category: "Community",
    topics: ["Community"],
    authorName: "Sneha Sharma",
    date: "2025-09-28",
    readMinutes: 5,
    href: "#", // TODO: post detail page
  },
  {
    slug: "top-10-cloud-skills-2026",
    title: "Top 10 Cloud Skills to Learn in 2026",
    category: "Career",
    topics: ["Career", "Cloud Computing"],
    authorName: "Karan Mehta",
    date: "2025-09-20",
    readMinutes: 7,
    href: "#", // TODO: post detail page
  },
  {
    slug: "dockerized-application-on-aws",
    title: "Build and Deploy a Dockerized Application on AWS",
    category: "Projects",
    topics: ["AWS", "Projects"],
    authorName: "Aditya Singh",
    date: "2025-09-18",
    readMinutes: 6,
    href: "#", // TODO: post detail page
  },
  {
    slug: "cloud-security-best-practices",
    title: "Introduction to Cloud Security Best Practices",
    category: "Cloud Security",
    topics: ["Cloud Computing"],
    authorName: "Priya Nair",
    date: "2025-09-12",
    readMinutes: 7,
    href: "#", // TODO: post detail page
  },
  {
    slug: "scalable-architectures-on-aws",
    title: "Designing Scalable Architectures on AWS",
    category: "Architecture",
    topics: ["AWS", "Cloud Computing"],
    authorName: "Vikram Rao",
    date: "2025-09-05",
    readMinutes: 8,
    href: "#", // TODO: post detail page
  },
  {
    slug: "aws-free-tier-for-students",
    title: "How to Get Started with AWS Free Tier as a Student",
    category: "Student Guide",
    topics: ["AWS", "Tutorials"],
    authorName: "Ananya Patel",
    date: "2025-08-28",
    readMinutes: 5,
    href: "#", // TODO: post detail page
  },
];

export const popularTopics: PopularTopic[] = [
  {
    label: "AWS Services",
    topic: "AWS",
    count: 12,
    icon: Cloud,
    href: "/blogs?topic=AWS",
  },
  {
    label: "Cloud Projects",
    topic: "Projects",
    count: 8,
    icon: Box,
    href: "/blogs?topic=Projects",
  },
  {
    label: "Tutorials",
    topic: "Tutorials",
    count: 15,
    icon: BookOpen,
    href: "/blogs?topic=Tutorials",
  },
  {
    label: "Career Guidance",
    topic: "Career",
    count: 6,
    icon: Briefcase,
    href: "/blogs?topic=Career",
  },
  {
    label: "Community Stories",
    topic: "Community",
    count: 9,
    icon: Users,
    href: "/blogs?topic=Community",
  },
];

export const newsletterCopy = {
  eyebrow: "Stay Updated",
  text: "Get the latest blog posts, events and announcements directly in your inbox.",
  placeholder: "Enter your email address",
};

export const allPostsHref = "/blogs";
