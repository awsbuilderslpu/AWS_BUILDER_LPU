import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { PageHeading } from "@/components/ui/PageHeading";
import { Button } from "@/components/ui/button";
import { ArtworkSlot } from "@/components/ui/ArtworkSlot";
import { AboutDecor } from "@/components/features/about/AboutDecor";
import { MapPin, Link2, Mail, ShieldCheck, Sparkles, Terminal } from "lucide-react";
import {
  FaInstagram,
  FaLinkedinIn,
  FaGithub,
  FaDiscord,
  FaYoutube,
} from "react-icons/fa6";
import {
  aboutHeading,
  aboutIntro,
  aboutStats,
} from "@/data/about";
import { siteConfig } from "@/data/site";
import { Reveal } from "@/components/motion/Reveal";

export interface AboutHeroProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
}

export function AboutHero({ className, ...props }: AboutHeroProps) {
  return (
    <section
      className={cn(
        "relative flex flex-col overflow-hidden pt-6 pb-16 lg:pt-10 lg:pb-20",
        className
      )}
      {...props}
    >
      {/* 1. Background Decor layer */}
      <AboutDecor />

      {/* 2. Main Hero Content Container */}
      <div className="relative z-10 mx-auto w-full max-w-[1560px] px-4 sm:px-6 lg:px-8 xl:pl-[clamp(60px,8vw,140px)]">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8 xl:gap-12">
          {/* Left Column: Heading, Intro, Socials, CTAs */}
          <div className="flex flex-col items-start lg:col-span-7 xl:col-span-7">
            <Reveal delay={0}>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <SectionEyebrow lines="both">About Us</SectionEyebrow>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 font-mono text-[11px] font-medium text-primary">
                  <Sparkles className="size-3" />
                  Official Student Chapter
                </span>
              </div>
            </Reveal>

            <Reveal delay={0.08} className="mt-5 w-full">
              <PageHeading size="xl" as="h1" lines={aboutHeading} />
            </Reveal>

            <Reveal delay={0.16} className="mt-6 w-full">
              <p className="max-w-[640px] text-base leading-relaxed text-muted-foreground sm:text-lg sm:leading-relaxed">
                {aboutIntro}
              </p>
            </Reveal>

            {/* Quick Connect Metadata Strip */}
            <Reveal delay={0.22} className="mt-6 w-full">
              <div className="flex max-w-[700px] flex-wrap items-center gap-2 sm:gap-2.5 text-xs font-mono text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card/60 px-2.5 py-1 transition-colors hover:border-primary/40 hover:text-foreground">
                  <MapPin className="size-3.5 text-primary" />
                  <span>Phagwara, Punjab</span>
                </span>
                <a
                  href="https://awslpu.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card/60 px-2.5 py-1 transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <Link2 className="size-3.5 text-primary" />
                  <span>awslpu.in</span>
                </a>
                <a
                  href="https://www.linkedin.com/company/awsbuilderslpu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card/60 px-2.5 py-1 transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <FaLinkedinIn className="size-3.5 text-primary" />
                  <span>LinkedIn</span>
                </a>
                <a
                  href="https://github.com/awsbuilderslpu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card/60 px-2.5 py-1 transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <FaGithub className="size-3.5 text-primary" />
                  <span>GitHub</span>
                </a>
                <a
                  href="https://discord.com/channels/1093195608409510009/1204396903605993472"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card/60 px-2.5 py-1 transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <FaDiscord className="size-3.5 text-primary" />
                  <span>Discord</span>
                </a>
                <a
                  href="https://www.instagram.com/awsbuilders.lpu/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card/60 px-2.5 py-1 transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <FaInstagram className="size-3.5 text-primary" />
                  <span>Instagram</span>
                </a>
                <a
                  href="https://www.youtube.com/@AWSCloudCommunityLPU"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card/60 px-2.5 py-1 transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <FaYoutube className="size-3.5 text-primary" />
                  <span>YouTube</span>
                </a>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card/60 px-2.5 py-1 transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <Mail className="size-3.5 text-primary" />
                  <span>{siteConfig.email}</span>
                </a>
              </div>
            </Reveal>

            {/* Action Buttons */}
            <Reveal delay={0.28} className="mt-8 flex flex-wrap items-center gap-4">
              <Button
                asChild
                variant="primary"
                size="lg"
                withArrow
                className="font-semibold px-6 shadow-[0_0_20px_rgba(255,153,0,0.25)]"
              >
                <Link href={siteConfig.joinUrl}>Join Community</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                withArrow
                className="font-medium"
              >
                <Link href="/events">Explore Events</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                withArrow
                className="font-medium"
              >
                <Link href="/members">Meet the Team</Link>
              </Button>
            </Reveal>
          </div>

          {/* Right Column: Isometric 3D Cloud Network Artwork */}
          <div className="relative flex w-full items-center justify-center lg:col-span-5 xl:col-span-5 lg:-translate-x-16 xl:-translate-x-24 lg:-translate-y-12 xl:-translate-y-16">
            <div className="relative aspect-[4/3] w-full max-w-[520px] lg:max-w-none">
              {/* Ambient atmospheric glow */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 scale-105 rounded-full bg-gradient-to-tr from-primary/25 via-amber-500/10 to-cyan-500/10 blur-3xl"
              />

              <ArtworkSlot
                name="About: AWS cube + cloud"
                src="/images/artwork/Neon AWS Cloud Network Isometric Illustration.png"
                alt="AWS Cloud Network Isometric Illustration"
                priority
                objectFit="contain"
                objectPosition="object-center"
                className="h-full w-full aspect-auto overflow-visible"
                imageClassName="object-contain drop-shadow-[0_0_35px_rgba(255,153,0,0.35)]"
              />

              {/* Floating Architectural Badge Overlay */}
              <div className="absolute -bottom-2 -left-2 sm:bottom-4 sm:left-4 z-10 flex items-center gap-3 rounded-xl border border-border/80 bg-background/85 px-4 py-3 shadow-xl backdrop-blur-md">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                  <Terminal className="size-5" />
                </div>
                <div>
                  <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-primary">
                    AWS Cloud Sandbox
                  </div>
                  <div className="text-xs text-muted-foreground">
                    100% Hands-On • Live Deployments
                  </div>
                </div>
              </div>

              {/* Top-Right Badge Overlay */}
              <div className="absolute -top-2 right-2 sm:top-2 sm:right-4 z-10 hidden sm:flex items-center gap-2.5 rounded-lg border border-border/80 bg-background/85 px-3 py-2 shadow-lg backdrop-blur-md">
                <ShieldCheck className="size-4 text-emerald-400" />
                <span className="font-mono text-[11px] font-medium text-foreground">
                  Well-Architected Culture
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Hero Stats Ribbon */}
        <div className="mt-14 pt-8 border-t border-border/60">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4 lg:gap-6">
            {aboutStats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <Reveal key={stat.label} delay={0.06 * idx}>
                  <div className="group relative rounded-lg border border-border/60 bg-card/40 p-4 transition-all duration-300 hover:border-primary/40 hover:bg-card/70 hover:shadow-[0_0_20px_rgba(255,153,0,0.08)]">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-2xl font-black text-foreground sm:text-3xl tracking-tight group-hover:text-primary transition-colors">
                        {stat.value}
                      </span>
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                        <Icon className="size-4" />
                      </div>
                    </div>
                    <div className="mt-2 font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                      {stat.label}
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
                      {stat.description}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
