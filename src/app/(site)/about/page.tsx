import type { Metadata } from "next";
import { siteConfig } from "@/data/site";
import { AboutHero } from "@/components/features/about/AboutHero";

export const metadata: Metadata = {
  title: `About Us | ${siteConfig.name} ${siteConfig.org}`,
  description: `Learn about ${siteConfig.name} ${siteConfig.org} — student-led community at ${siteConfig.university} focused on cloud computing using Amazon Web Services.`,
};

export default function AboutPage() {
  return <AboutHero />;
}
