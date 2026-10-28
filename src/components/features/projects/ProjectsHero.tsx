import * as React from "react";
import Image from "next/image";
import { projectsCopy } from "@/data/projects";

export function ProjectsHero() {
  return (
    <div className="relative z-10 w-full overflow-hidden border-b border-border/40 bg-gradient-to-b from-background via-card/20 to-background/90 pt-8 pb-10 sm:pt-12 sm:pb-14">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-4 sm:px-6 lg:flex-row lg:items-center lg:px-8">
        {/* Left Column: Heading, Eyebrow, Subtitle */}
        <div className="relative z-10 max-w-2xl">
          {/* Eyebrow */}
          <div className="mb-3 flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <span>{projectsCopy.eyebrow}</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            {projectsCopy.titlePrefix}{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              {projectsCopy.titleHighlight}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {projectsCopy.subtitle}
          </p>
        </div>

        {/* Right Column: Glowing 3D AWS Cloud Artwork & Vertical Tagline */}
        <div className="relative flex w-full items-center justify-end lg:w-auto">
          <div className="relative flex items-center gap-6">
            {/* 3D Glowing AWS Cloud illustration */}
            <div className="relative h-[180px] w-[260px] sm:h-[220px] sm:w-[320px] lg:h-[240px] lg:w-[380px]">
              {/* Radial background glow */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 scale-125 rounded-full bg-gradient-to-tr from-primary/20 via-accent/15 to-transparent blur-2xl"
              />

              {/* Digital Globe Background */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-6 -top-4 size-[180px] opacity-40 mix-blend-screen sm:size-[220px]"
              >
                <Image
                  src="/images/artwork/Digital Globe with Neon Network Arcs.png"
                  alt=""
                  fill
                  sizes="260px"
                  className="object-contain"
                />
              </div>

              {/* Main Glowing Neon AWS Cloud Artwork */}
              <div className="relative h-full w-full">
                <Image
                  src="/images/artwork/Neon AWS Cloud Computing Network.png"
                  alt="AWS Cloud Computing Network"
                  fill
                  priority
                  sizes="(max-width: 640px) 260px, (max-width: 1024px) 340px, 420px"
                  className="object-contain drop-shadow-[0_0_35px_rgba(255,153,0,0.35)]"
                />
              </div>
            </div>

            {/* Vertical Tagline (IDEAS / DEPLOY / SCALE / REPEAT) */}
            <div
              aria-hidden="true"
              className="hidden select-none border-l border-primary/30 pl-4 font-mono text-[13px] font-bold uppercase tracking-[0.25em] text-cyan-400/90 sm:flex sm:flex-col sm:gap-1.5"
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

