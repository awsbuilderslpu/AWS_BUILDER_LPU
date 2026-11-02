import * as React from "react";
import { cn } from "@/lib/utils";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { PageHeading } from "@/components/ui/PageHeading";
import { ArtworkSlot } from "@/components/ui/ArtworkSlot";
import { AboutDecor } from "@/components/features/about/AboutDecor";
import { PillarCard } from "@/components/features/about/PillarCard";
import { QuoteBox } from "@/components/features/about/QuoteBox";
import { MapPin, Link2, Mail } from "lucide-react";
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
  aboutPillars,
  aboutQuote,
} from "@/data/about";
import { siteConfig } from "@/data/site";
import { Reveal } from "@/components/motion/Reveal";
import { staggerDelay } from "@/lib/motion/tokens";

export interface AboutHeroProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
}

export function AboutHero({ className, ...props }: AboutHeroProps) {
  return (
    <section
      className={cn(
        "relative flex min-h-[max(calc(100svh-72px),800px)] flex-col overflow-hidden",
        className
      )}
      {...props}
    >
      {/* 1. Decor layer */}
      <AboutDecor />

      {/* 2. Content wrapper */}
      <div className="relative z-10 w-full px-6 pt-12 pb-16 xl:pl-[11.8%]">
        <div className="flex flex-col items-start xl:w-[clamp(720px,50.4vw,842px)]">
          <SectionEyebrow>About Us</SectionEyebrow>

          <div className="mt-5">
            <PageHeading size="lg" as="h1" lines={aboutHeading} />
          </div>

          <p className="mt-5 max-w-[640px] text-lg leading-[1.65] text-muted-foreground">
            {aboutIntro}
          </p>

          {/* Quick Connect Metadata Strip */}
          <div className="mt-6 flex max-w-[700px] flex-wrap items-center gap-x-5 gap-y-2.5 text-xs font-mono text-muted-foreground/90">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5 text-primary" />
              <span>Phagwara, Punjab, India</span>
            </span>
            <a
              href="https://awslpu.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 transition-colors hover:text-primary"
            >
              <Link2 className="size-3.5 text-primary" />
              <span>https://awslpu.in</span>
            </a>
            <a
              href="https://www.instagram.com/awsbuilders.lpu/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 transition-colors hover:text-primary"
            >
              <FaInstagram className="size-3.5 text-primary" />
              <span>awsbuilders.lpu</span>
            </a>
            <a
              href="https://www.linkedin.com/company/awsbuilderslpu"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 transition-colors hover:text-primary"
            >
              <FaLinkedinIn className="size-3.5 text-primary" />
              <span>company/awsbuilderslpu</span>
            </a>
            <a
              href="https://github.com/awsbuilderslpu"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 transition-colors hover:text-primary"
            >
              <FaGithub className="size-3.5 text-primary" />
              <span>awsbuilderslpu</span>
            </a>
            <a
              href="https://discord.com/channels/1093195608409510009/1204396903605993472"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 transition-colors hover:text-primary"
            >
              <FaDiscord className="size-3.5 text-primary" />
              <span>Discord</span>
            </a>
            <a
              href="https://www.youtube.com/@AWSCloudCommunityLPU"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 transition-colors hover:text-primary"
            >
              <FaYoutube className="size-3.5 text-primary" />
              <span>YouTube</span>
            </a>
            <a
              href={`mailto:${siteConfig.email}`}
              className="flex items-center gap-1.5 transition-colors hover:text-primary"
            >
              <Mail className="size-3.5 text-primary" />
              <span>{siteConfig.email}</span>
            </a>
          </div>

          <div className="mt-7 grid w-full grid-cols-1 gap-[22px] sm:grid-cols-2 xl:grid-cols-3">
            {aboutPillars.map((pillar, index) => (
              <Reveal key={pillar.title} delay={staggerDelay(index)}>
                <PillarCard
                  title={pillar.title}
                  description={pillar.description}
                  icon={pillar.icon}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Quote box */}
      <QuoteBox
        text={aboutQuote.text}
        attribution={aboutQuote.attribution}
        className="mx-6 mb-10 max-w-md xl:absolute xl:bottom-[10.5%] xl:left-[68.4%] xl:z-10 xl:m-0 xl:w-[21%] xl:max-w-none"
      />

      {/* 4. Artwork slot */}
      <div className="relative mx-6 mb-10 aspect-[4/3] w-[calc(100%-3rem)] max-w-md self-center xl:absolute xl:right-0 xl:top-[3%] xl:z-0 xl:m-0 xl:h-[68%] xl:w-[47%] xl:max-w-none xl:aspect-auto">
        {/* Ambient atmospheric glow behind the isometric scene */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 scale-105 rounded-full bg-gradient-to-tr from-primary/20 via-accent/15 to-transparent blur-3xl"
        />
        <ArtworkSlot
          name="About: AWS cube + cloud"
          src="/images/artwork/Neon AWS Cloud Network Isometric Illustration.png"
          alt="AWS Cloud Network Isometric Illustration"
          priority
          objectFit="contain"
          objectPosition="object-right"
          className="h-full w-full aspect-auto overflow-visible"
          imageClassName="object-contain xl:object-right drop-shadow-[0_0_35px_rgba(255,153,0,0.3)]"
        />
      </div>
    </section>
  );
}
