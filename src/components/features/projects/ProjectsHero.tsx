import * as React from "react";
import Image from "next/image";
import { projectsCopy } from "@/data/projects";

export function ProjectsHero() {
  return (
    <div className="relative z-10 w-full overflow-hidden bg-transparent py-6 sm:py-8 lg:py-10">
      <div className="mx-auto flex max-w-[1560px] flex-col items-start justify-between gap-6 px-4 sm:px-6 lg:flex-row lg:items-center lg:px-8">
        {/* Left Column: Heading, Eyebrow, Subtitle */}
        <div className="relative z-10 max-w-lg xl:max-w-xl shrink-0">
          {/* Eyebrow */}
          <div className="mb-2.5 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {projectsCopy.eyebrow}
          </div>

          {/* Main Title */}
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-[54px] uppercase leading-none">
            {projectsCopy.titlePrefix}{" "}
            <span className="text-primary">{projectsCopy.titleHighlight}</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-4 max-w-[480px] text-sm leading-relaxed text-muted-foreground sm:text-base">
            {projectsCopy.subtitle}
          </p>
        </div>

        {/* Right Column: Glowing 3D AWS Cloud Artwork & Floating Tagline */}
        <div className="relative flex w-full flex-1 items-center justify-end lg:w-auto">
          <div className="relative aspect-[2126/740] w-full max-w-[560px] md:max-w-[700px] lg:max-w-[840px] xl:max-w-[960px] 2xl:max-w-[1040px]">
            {/* Ambient Radial Background Glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 scale-105 rounded-full bg-gradient-to-tr from-primary/20 via-accent/15 to-transparent blur-3xl"
            />

            <Image
              src="/images/artwork/projects.png"
              alt="AWS Projects Network"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1040px"
              className="object-contain drop-shadow-[0_0_35px_rgba(255,153,0,0.35)]"
            />

            {/* Vertical Tagline (IDEAS / DEPLOY / SCALE / REPEAT) Floating on the far right */}
            <div
              aria-hidden="true"
              className="absolute -right-2 sm:right-2 lg:right-4 top-1/2 -translate-y-1/2 hidden select-none font-mono text-[11px] xl:text-[12px] font-bold uppercase tracking-[0.22em] text-cyan-400/90 sm:flex sm:flex-col sm:gap-2 shrink-0 z-20 pointer-events-none"
            >
              <span className="hover:text-primary transition-colors">IDEAS</span>
              <span className="hover:text-primary transition-colors">DEPLOY</span>
              <span className="hover:text-primary transition-colors">SCALE</span>
              <span className="hover:text-primary transition-colors">REPEAT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

