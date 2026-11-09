import * as React from "react";
import Link from "next/link";

import { siteConfig } from "@/data/site";
import { heroHeading } from "@/data/home";
import { homeStats } from "@/data/stats";
import { cn } from "@/lib/utils";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { PageHeading } from "@/components/ui/PageHeading";
import { Button } from "@/components/ui/button";
import { StatsRow } from "@/components/ui/StatsRow";
import { HeroDecor } from "@/components/features/home/HeroDecor";
import { Reveal } from "@/components/motion/Reveal";

export interface HomeHeroProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
}

export function HomeHero({ className, ...props }: HomeHeroProps) {
  return (
    <section
      className={cn(
        "relative flex min-h-[max(calc(100svh-180px),580px)] xl:min-h-[max(calc(100svh-160px),610px)] flex-col overflow-hidden",
        className
      )}
      {...props}
    >
      {/* Background Video Visual (Desktop xl and up, absolute layer z-0) */}
      <div className="absolute right-[2%] xl:right-[4%] 2xl:right-[6%] top-0 bottom-[4%] hidden w-[56%] 2xl:w-[50%] z-0 xl:flex items-center justify-center pointer-events-none select-none">
        {/* Ambient atmospheric glow behind the globe */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 scale-75 rounded-full bg-gradient-to-tr from-primary/6 via-accent/5 to-transparent blur-3xl opacity-40"
        />
        <div
          className="relative w-full aspect-video overflow-hidden"
          style={{
            maskImage:
              "radial-gradient(ellipse 47% 50% at 50% 50%, black 55%, transparent 92%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 47% 50% at 50% 50%, black 55%, transparent 92%)",
          }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster="/images/back_ground/poster.webp"
            className="h-full w-full object-contain pointer-events-none select-none mix-blend-screen"
            style={{
              filter: "contrast(1.6) brightness(0.85)",
            }}
          >
            <source src="/images/back_ground/aws_builder_lpu.mp4" type="video/mp4" />
            <source src="/images/back_ground/aws_builder_lpu.mkv" type="video/x-matroska" />
          </video>
        </div>
      </div>

      {/* Hero Decor Layer (xl and up, z-[1]) */}
      <HeroDecor />

      {/* Main Content Wrapper (z-10) */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-center px-6 pt-10 pb-2 xl:mx-0 xl:max-w-none xl:px-0 xl:pl-[13%] 2xl:pl-[15%] xl:pt-14 xl:pb-2">
        <div className="flex w-full max-w-[580px] flex-col items-start origin-left scale-90 translate-y-3">
          {/* Eyebrow */}
          <Reveal delay={0}>
            <SectionEyebrow lines="after" size="md">
              {siteConfig.name} / {siteConfig.org}
            </SectionEyebrow>
          </Reveal>

          {/* Headline (20px gap) */}
          <Reveal delay={0.1} className="mt-5">
            <PageHeading size="xl" as="h1" lines={heroHeading} />
          </Reveal>

          {/* Subtitle / Description (24px gap) */}
          <Reveal delay={0.18} className="mt-6">
            <p className="max-w-[540px] text-lg leading-[1.5] text-muted-foreground xl:max-w-[clamp(420px,32vw,540px)]">
              {siteConfig.description}
            </p>
          </Reveal>

          {/* CTAs (28px gap, 24px gap between buttons) */}
          <Reveal delay={0.26} className="mt-7">
            <div className="flex flex-wrap items-center gap-6">
              <Button
                asChild
                variant="primary"
                size="lg"
                withArrow
                className="font-semibold"
              >
                <Link href="/events">Explore Events</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="font-medium"
              >
                <Link href={siteConfig.joinUrl} scroll={false}>
                  Join the Club
                </Link>
              </Button>
            </div>
          </Reveal>

          {/* StatsRow (48px gap, plain variant, first stat flush left) */}
          <Reveal delay={0.34} className="mt-12 w-full">
            <StatsRow variant="plain" stats={homeStats} />
          </Reveal>
        </div>

        {/* Background Video Visual (Below xl breakpoint, normal flow under content) */}
        <div className="relative mt-12 mb-10 w-full max-w-lg self-center xl:hidden pointer-events-none select-none">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 scale-75 rounded-full bg-gradient-to-tr from-primary/6 via-accent/5 to-transparent blur-3xl opacity-40"
          />
          <div
            className="relative w-full aspect-video overflow-hidden"
            style={{
              maskImage:
                "radial-gradient(ellipse 47% 50% at 50% 50%, black 55%, transparent 92%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 47% 50% at 50% 50%, black 55%, transparent 92%)",
            }}
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              poster="/images/back_ground/poster.webp"
              className="h-full w-full object-contain pointer-events-none select-none mix-blend-screen"
              style={{
                filter: "contrast(1.6) brightness(0.85)",
              }}
            >
              <source src="/images/back_ground/aws_builder_lpu.mp4" type="video/mp4" />
              <source src="/images/back_ground/aws_builder_lpu.mkv" type="video/x-matroska" />
            </video>
          </div>
        </div>
      </div>
    </section>
  );
}
