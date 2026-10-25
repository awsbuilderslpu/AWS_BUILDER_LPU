import * as React from "react";
import Link from "next/link";
import { Users, BookOpen, Rocket } from "lucide-react";

import { siteConfig } from "@/data/site";
import { CornerFrame } from "@/components/ui/CornerFrame";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { ArtworkSlot } from "@/components/ui/ArtworkSlot";
import { Button } from "@/components/ui/button";

export function CTABanner() {
  const pillars = [
    {
      icon: Users,
      label: "Real People",
    },
    {
      icon: BookOpen,
      label: "Real Skills",
    },
    {
      icon: Rocket,
      label: "Real Opportunities",
    },
  ];

  return (
    <section id="cta" className="w-full scroll-mt-24 mt-12 py-12 md:py-16">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <CornerFrame className="bg-card/70 backdrop-blur-sm">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10">
            {/* Left: Eyebrow, Heading, Paragraph */}
            <div className="flex flex-col items-start lg:col-span-5">
              <SectionEyebrow className="mb-4">Join the Journey</SectionEyebrow>
              <h2 className="text-3xl font-black uppercase tracking-tight leading-[1.08] sm:text-4xl lg:text-[40px] xl:text-[44px]">
                <span className="block text-foreground">BE A PART OF</span>
                <span className="block text-primary mt-1">SOMETHING BIGGER.</span>
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                Learn, build, share and grow with a community of curious minds at{" "}
                {siteConfig.name} {siteConfig.org}.
              </p>
            </div>

            {/* Center: Three Pillars + CTAs */}
            <div className="flex flex-col items-center justify-center lg:col-span-4">
              {/* Pillars */}
              <div className="flex w-full items-center justify-around sm:justify-center sm:gap-6">
                {pillars.map((pillar, idx) => {
                  const Icon = pillar.icon;
                  return (
                    <React.Fragment key={pillar.label}>
                      <div className="flex flex-col items-center text-center">
                        <div className="flex h-11 w-11 items-center justify-center text-primary">
                          <Icon className="size-8 stroke-[1.5]" />
                        </div>
                        <span className="mt-2.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">
                          {pillar.label}
                        </span>
                      </div>
                      {idx < pillars.length - 1 && (
                        <div
                          aria-hidden="true"
                          className="h-12 w-px bg-border sm:mx-2"
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Action Buttons under Pillars */}
              <div className="mt-8 flex w-full flex-col gap-3.5 sm:flex-row sm:justify-center">
                <Button
                  asChild
                  variant="primary"
                  withArrow
                  size="default"
                  className="rounded-md font-semibold text-sm px-6 h-11"
                >
                  <Link href={siteConfig.joinUrl}>Join the Club</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  withArrow
                  size="default"
                  className="rounded-md text-sm px-6 h-11"
                >
                  <Link href="/events">Explore Events</Link>
                </Button>
              </div>
            </div>

            {/* Right: Artwork Placeholder */}
            <div className="w-full lg:col-span-3">
              <ArtworkSlot
                name="CTA cloud + servers"
                className="mx-auto max-w-[280px] sm:max-w-[320px] lg:max-w-none"
              />
            </div>
          </div>
        </CornerFrame>
      </div>
    </section>
  );
}
