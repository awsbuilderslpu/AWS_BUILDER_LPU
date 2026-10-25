import * as React from "react";
import Link from "next/link";
import { Mail, MapPin, Globe, ArrowUpRight } from "lucide-react";
import { FaLinkedinIn, FaInstagram, FaGithub, FaDiscord, FaYoutube } from "react-icons/fa6";
import { siteConfig, socialLinks } from "@/data/site";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";

export const metadata = {
  title: "Contact | AWS Student Builders Group LPU",
  description:
    "Get in touch with AWS Student Builders Group LPU. Connect with our community via Email, GitHub, LinkedIn, Instagram, Discord, or YouTube.",
};

const contactCards = [
  {
    title: "Email Us",
    description: "Direct inquiries, partnerships, and questions",
    value: siteConfig.email,
    href: `mailto:${siteConfig.email}`,
    icon: Mail,
    action: "Send an email",
  },
  {
    title: "Official Website",
    description: "Explore club announcements, resources, and events",
    value: siteConfig.website,
    href: siteConfig.website.startsWith("http")
      ? siteConfig.website
      : `https://${siteConfig.website}`,
    icon: Globe,
    action: "Visit website",
  },
  {
    title: "Discord Community",
    description: "Real-time discussions, study rooms, and peer support",
    value: "AWS Student Builder Group",
    href: "https://discord.com/channels/1093195608409510009/1204396903605993472",
    icon: FaDiscord,
    action: "Join Discord server",
  },
  {
    title: "YouTube Channel",
    description: "Cloud workshops, tutorials, and recorded sessions",
    value: "@AWSCloudCommunityLPU",
    href: "https://www.youtube.com/@AWSCloudCommunityLPU",
    icon: FaYoutube,
    action: "Subscribe on YouTube",
  },
  {
    title: "GitHub Organization",
    description: "Open source projects, repositories, and learning labs",
    value: "awsbuilderslpu",
    href: "https://github.com/awsbuilderslpu",
    icon: FaGithub,
    action: "Explore repositories",
  },
  {
    title: "LinkedIn Page",
    description: "Professional updates, member spotlights, and events",
    value: "company/awsbuilderslpu",
    href: "https://www.linkedin.com/company/awsbuilderslpu",
    icon: FaLinkedinIn,
    action: "Connect on LinkedIn",
  },
  {
    title: "Instagram",
    description: "Event highlights, behind-the-scenes, and stories",
    value: "@awsbuilders.lpu",
    href: "https://www.instagram.com/awsbuilders.lpu/",
    icon: FaInstagram,
    action: "Follow on Instagram",
  },
  {
    title: "Campus Location",
    description: "Our physical university hub in Punjab",
    value: "Lovely Professional University, Phagwara, Punjab, India",
    href: "https://maps.google.com/?q=Lovely+Professional+University+Phagwara",
    icon: MapPin,
    action: "View on map",
  },
];

export default function ContactPage() {
  return (
    <section className="relative flex flex-1 flex-col justify-center px-6 py-16 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-5xl text-center">
        <div className="flex justify-center">
          <SectionEyebrow>GET IN TOUCH</SectionEyebrow>
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl">
          Connect With <span className="text-primary">AWS Builders LPU</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Have an inquiry, want to collaborate on cloud projects, or connect with our community? Reach out through any of our official channels below.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {contactCards.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.title}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="group relative flex flex-col justify-between rounded-xl border border-border bg-card/60 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:bg-card/90 hover:shadow-[0_0_24px_rgba(255,153,0,0.18)]"
            >
              <div>
                <div className="flex size-11 items-center justify-center rounded-lg border border-border bg-muted/60 text-primary transition-colors duration-300 group-hover:border-primary/40 group-hover:bg-primary/10">
                  <Icon className="size-5" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-foreground">
                  {item.title}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.description}
                </p>
                <div className="mt-4 font-mono text-sm font-medium text-foreground/90 break-all">
                  {item.value}
                </div>
              </div>

              <div className="mt-6 flex items-center gap-1.5 text-xs font-medium text-primary transition-transform duration-200 group-hover:translate-x-1">
                <span>{item.action}</span>
                <ArrowUpRight className="size-3.5" />
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
