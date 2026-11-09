"use client";

import * as React from "react";
import Link from "next/link";
import { Cloud, Cpu, Users, Sparkles } from "lucide-react";

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
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    },
    []
  );

  return (
    <section
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative flex min-h-[max(calc(100svh-180px),580px)] xl:min-h-[max(calc(100svh-160px),620px)] flex-col overflow-hidden",
        className
      )}
      {...props}
    >
      {/* Dynamic Mouse Spotlight Glow on Blueprint Grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 hidden transition-opacity duration-700 lg:block"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(750px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 153, 0, 0.08), rgba(47, 140, 255, 0.03) 40%, transparent 80%)`,
        }}
      />

      {/* Cyber Blueprint Grid Pattern Overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 select-none bg-[linear-gradient(to_right,#16284618_1px,transparent_1px),linear-gradient(to_bottom,#16284618_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_45%,black_40%,transparent_90%)]"
      />

      {/* Background Video Visual (Desktop xl and up, absolute layer z-0) */}
      <div className="absolute right-[1%] xl:right-[3%] 2xl:right-[5%] top-0 bottom-[2%] hidden w-[58%] 2xl:w-[52%] z-0 xl:flex items-center justify-center pointer-events-none select-none">
        {/* Ambient atmospheric glows */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 scale-90 rounded-full bg-gradient-to-tr from-primary/10 via-accent/8 to-transparent blur-3xl opacity-50"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-10 right-10 -z-10 size-72 rounded-full bg-primary/10 blur-3xl opacity-40"
        />

        {/* Video Canvas Container */}
        <div
          className="relative w-full aspect-video overflow-hidden"
          style={{
            maskImage:
              "radial-gradient(ellipse 48% 52% at 50% 50%, black 55%, transparent 92%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 48% 52% at 50% 50%, black 55%, transparent 92%)",
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
              filter: "contrast(1.55) brightness(0.9)",
            }}
          >
            <source src="/images/back_ground/aws_builder_lpu.mp4" type="video/mp4" />
            <source src="/images/back_ground/aws_builder_lpu.mkv" type="video/x-matroska" />
          </video>
        </div>

        {/* Floating Interactive Architecture HUD Badges over the Isometric Community */}
        <div className="pointer-events-none absolute inset-0 z-20">
          {/* Badge 1: AWS Region Top Right */}
          <div className="pointer-events-auto absolute top-[12%] right-[6%] xl:right-[10%] flex items-center gap-3 rounded-lg border border-border/80 bg-background/85 px-3.5 py-2 backdrop-blur-md shadow-[0_12px_30px_rgba(0,0,0,0.6)] animate-float transition-transform duration-300 hover:scale-105 hover:border-primary/40">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary/15 text-primary">
              <Cloud className="size-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-mono text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                AWS Region
              </span>
              <span className="font-mono text-xs font-bold text-foreground flex items-center gap-1.5">
                ap-south-1
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
                </span>
              </span>
            </div>
          </div>

          {/* Badge 2: Architecture Stack Middle Left */}
          <div className="pointer-events-auto absolute top-[44%] left-[2%] xl:left-[4%] flex items-center gap-3 rounded-lg border border-border/80 bg-background/85 px-3.5 py-2 backdrop-blur-md shadow-[0_12px_30px_rgba(0,0,0,0.6)] animate-float [animation-delay:2.5s] transition-transform duration-300 hover:scale-105 hover:border-accent/40">
            <div className="flex size-7 items-center justify-center rounded-md bg-accent/15 text-accent">
              <Cpu className="size-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-mono text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                Cloud Stack
              </span>
              <span className="font-mono text-xs font-bold text-foreground">
                Lambda • EKS • Bedrock
              </span>
            </div>
          </div>

          {/* Badge 3: Student Builders Bottom Center */}
          <div className="pointer-events-auto absolute bottom-[14%] right-[16%] xl:right-[20%] flex items-center gap-3 rounded-lg border border-primary/25 bg-background/90 px-3.5 py-2 backdrop-blur-md shadow-[0_12px_30px_rgba(255,153,0,0.15)] animate-float [animation-delay:4.5s] transition-transform duration-300 hover:scale-105 hover:border-primary/50">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary/15 text-primary">
              <Users className="size-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-mono text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                Network Pulse
              </span>
              <span className="font-mono text-xs font-bold text-primary flex items-center gap-1.5">
                200+ Active Builders
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Decor Layer (xl and up, z-[1]) */}
      <HeroDecor />

      {/* Main Content Wrapper (z-10) */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-center px-6 pt-10 pb-6 xl:mx-0 xl:max-w-none xl:px-0 xl:pl-[12%] 2xl:pl-[14%] xl:pt-14 xl:pb-6">
        <div className="flex w-full max-w-[620px] flex-col items-start">
          {/* Eyebrow */}
          <Reveal delay={0}>
            <SectionEyebrow lines="both" size="md">
              {siteConfig.name} / {siteConfig.org}
            </SectionEyebrow>
          </Reveal>

          {/* Headline */}
          <Reveal delay={0.12} className="mt-4 sm:mt-5">
            <PageHeading
              size="xl"
              as="h1"
              lines={heroHeading}
              gradient
              className="tracking-tight"
            />
          </Reveal>

          {/* Subtitle / Description */}
          <Reveal delay={0.2} className="mt-5 sm:mt-6">
            <p className="max-w-[540px] text-base sm:text-lg leading-[1.6] text-muted-foreground">
              Official student-led community for{" "}
              <span className="text-foreground font-medium">AWS Student Builder Group LPU</span>.{" "}
              Building, learning, and scaling cloud-native systems with enterprise-grade AWS architecture.
            </p>
          </Reveal>

          {/* CTAs */}
          <Reveal delay={0.28} className="mt-7 sm:mt-8">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <Button
                asChild
                variant="primary"
                size="lg"
                withArrow
                className="relative overflow-hidden font-semibold shadow-[0_0_25px_rgba(255,153,0,0.35)] hover:shadow-[0_0_35px_rgba(255,153,0,0.6)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent"
              >
                <Link href="/events">Explore Events</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="group font-medium border-border/80 bg-card/60 backdrop-blur-md hover:border-primary/50 hover:bg-card/90 hover:shadow-[0_0_20px_rgba(255,153,0,0.15)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Link href={siteConfig.joinUrl} scroll={false} className="flex items-center gap-2">
                  <Sparkles className="size-4 text-primary transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                  <span>Join the Club</span>
                </Link>
              </Button>
            </div>
          </Reveal>

          {/* StatsRow */}
          <Reveal delay={0.36} className="mt-10 sm:mt-12 w-full">
            <StatsRow variant="plain" stats={homeStats} />
          </Reveal>
        </div>

        {/* Background Video Visual (Below xl breakpoint, normal flow under content) */}
        <div className="relative mt-12 mb-10 w-full max-w-lg self-center xl:hidden select-none">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 scale-90 rounded-full bg-gradient-to-tr from-primary/10 via-accent/8 to-transparent blur-3xl opacity-50"
          />
          <div
            className="relative w-full aspect-video overflow-hidden rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm"
            style={{
              maskImage:
                "radial-gradient(ellipse 48% 52% at 50% 50%, black 55%, transparent 92%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 48% 52% at 50% 50%, black 55%, transparent 92%)",
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
                filter: "contrast(1.55) brightness(0.9)",
              }}
            >
              <source src="/images/back_ground/aws_builder_lpu.mp4" type="video/mp4" />
              <source src="/images/back_ground/aws_builder_lpu.mkv" type="video/x-matroska" />
            </video>
          </div>
          {/* Mobile HUD Chip */}
          <div className="mt-3 flex items-center justify-center gap-2 font-mono text-[11px] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>AWS Cloud Ecosystem • LPU Chapter</span>
          </div>
        </div>
      </div>
    </section>
  );
}
