import * as React from "react";
import Image from "next/image";
import {
  ExternalLink,
  Star,
  Layers,
  Cpu,
  Users,
} from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import { cn } from "@/lib/utils";
import type { Project } from "@/data/projects";

export interface ProjectCardProps {
  project: Project;
  className?: string;
}

export function ProjectCard({ project, className }: ProjectCardProps) {
  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "Live":
        return "text-emerald-400 bg-emerald-950/80 border-emerald-500/40";
      case "Open Source":
        return "text-sky-300 bg-sky-950/80 border-sky-500/40";
      case "In Development":
        return "text-amber-300 bg-amber-950/80 border-amber-500/40";
      default:
        return "text-muted-foreground bg-muted/80 border-border";
    }
  };

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col justify-between overflow-hidden rounded-xl border border-border bg-card/60 backdrop-blur-sm",
        "transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-card/90 hover:shadow-[0_12px_36px_rgba(255,153,0,0.15)]",
        className
      )}
    >
      <div>
        {/* Project Thumbnail Image */}
        {project.image && (
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-background">
            <Image
              src={project.image}
              alt={project.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Subtle dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-card via-black/20 to-black/40" />

            {/* Floating Badges over Image */}
            <div className="absolute inset-x-3.5 top-3.5 flex items-center justify-between gap-2 z-10 pointer-events-none">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-md border border-primary/40 bg-black/60 px-2.5 py-1 text-[11.5px] font-semibold text-primary backdrop-blur-md">
                  <Layers className="size-3" />
                  {project.category}
                </span>

                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium leading-none backdrop-blur-md",
                    getStatusColor(project.status)
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      project.status === "Live"
                        ? "bg-emerald-400 animate-pulse"
                        : project.status === "Open Source"
                        ? "bg-sky-400"
                        : "bg-amber-400"
                    )}
                    aria-hidden="true"
                  />
                  {project.status}
                </span>
              </div>

              {project.stars !== undefined && (
                <div className="flex items-center gap-1 rounded-md border border-white/10 bg-black/60 px-2 py-1 text-xs text-foreground font-mono backdrop-blur-md">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  <span>{project.stars}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5">
          {/* Fallback Badges if no image */}
          {!project.image && (
            <div className="mb-4 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                <Layers className="size-3" />
                {project.category}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium leading-none",
                  getStatusColor(project.status)
                )}
              >
                {project.status}
              </span>
            </div>
          )}

          {/* Title */}
          <h3 className="text-[17px] font-semibold leading-snug text-foreground transition-colors duration-200 group-hover:text-primary">
            {project.title}
          </h3>

          {/* Description */}
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">
            {project.description}
          </p>

          {/* AWS Services Highlights */}
          <div className="mt-4">
            <span className="flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-muted-foreground/80">
              <Cpu className="size-3 text-primary" />
              AWS Architecture
            </span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {project.awsServices.map((service) => (
                <span
                  key={service}
                  className="inline-flex items-center rounded border border-[#FF9900]/30 bg-[#FF9900]/10 px-2 py-0.5 text-[11.5px] font-medium text-foreground/95"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center rounded border border-border bg-background/50 px-2 py-0.5 text-[11px] font-mono text-muted-foreground"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Card Footer: Contributors & Action Links */}
      <div className="mx-5 mb-5 flex items-center justify-between gap-3 border-t border-border/80 pt-4">
        {/* Contributors */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
          <Users className="size-3.5 shrink-0 text-primary" />
          <span className="truncate">
            {project.contributors.join(", ")}
          </span>
        </div>

        {/* Action Links */}
        <div className="flex items-center gap-2 shrink-0">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.title} on GitHub`}
              className="flex size-8 items-center justify-center rounded-lg border border-border bg-card/40 text-muted-foreground transition-all duration-200 hover:border-primary/50 hover:bg-card hover:text-primary"
            >
              <FaGithub className="size-4" />
            </a>
          )}

          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Live demo for ${project.title}`}
              className="flex size-8 items-center justify-center rounded-lg border border-border bg-card/40 text-muted-foreground transition-all duration-200 hover:border-primary/50 hover:bg-card hover:text-primary"
            >
              <ExternalLink className="size-4" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
