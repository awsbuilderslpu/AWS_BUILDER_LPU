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
import { Artwork } from "@/components/ui/Artwork";
import { HeroDecor } from "@/components/features/home/HeroDecor";

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
      {/* Right Artwork (Desktop xl and up, absolute layer z-0, elevated more up) */}
      <div className="absolute right-[5%] xl:right-[7%] 2xl:right-[8%] top-[-3%] bottom-[5%] hidden w-[52%] 2xl:w-[48%] aspect-auto z-0 xl:flex items-center justify-center">
        {/* Ambient atmospheric glow behind the cloud servers */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 scale-105 rounded-full bg-gradient-to-tr from-primary/20 via-accent/15 to-transparent blur-3xl"
        />
        <Artwork
          slot="homeCloudServers"
          priority
          sizes="(min-width: 1280px) 50vw, 448px"
          className="h-full w-full aspect-auto overflow-visible"
        />
      </div>

      {/* Hero Decor Layer (xl and up, z-[1]) */}
      <HeroDecor />

      {/* Main Content Wrapper (z-10) */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-center px-6 pt-10 pb-2 xl:mx-0 xl:max-w-none xl:px-0 xl:pl-[10%] xl:pt-14 xl:pb-2">
        <div className="flex w-full max-w-[580px] flex-col items-start origin-left scale-90 translate-y-3">
          {/* Eyebrow */}
          <SectionEyebrow lines="after" size="md">
            {siteConfig.name} / {siteConfig.org}
          </SectionEyebrow>

          {/* Headline (20px gap) */}
          <div className="mt-5">
            <PageHeading size="xl" as="h1" lines={heroHeading} />
          </div>

          {/* Subtitle / Description (24px gap) */}
          <p className="mt-6 max-w-[540px] text-lg leading-[1.5] text-muted-foreground xl:max-w-[clamp(420px,32vw,540px)]">
            {siteConfig.description}
          </p>

          {/* CTAs (28px gap, 24px gap between buttons) */}
          <div className="mt-7 flex flex-wrap items-center gap-6">
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

          {/* StatsRow (48px gap, plain variant, first stat flush left) */}
          <div className="mt-12 w-full">
            <StatsRow variant="plain" stats={homeStats} />
          </div>
        </div>

        {/* Right Artwork (Below xl breakpoint, normal flow under content) */}
        <div className="relative mt-12 mb-10 w-full max-w-md self-center xl:hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 scale-105 rounded-full bg-gradient-to-tr from-primary/20 via-accent/15 to-transparent blur-3xl"
          />
          <Artwork
            slot="homeCloudServers"
            sizes="(max-width: 1280px) 100vw, 448px"
            className="aspect-[4/3] w-full overflow-visible"
          />
        </div>
      </div>
    </section>
  );
}
