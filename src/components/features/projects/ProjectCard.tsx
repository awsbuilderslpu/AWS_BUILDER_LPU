import * as React from "react";
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
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
      case "Open Source":
        return "text-sky-400 bg-sky-500/10 border-sky-500/30";
      case "In Development":
        return "text-amber-400 bg-amber-500/10 border-amber-500/30";
      default:
        return "text-muted-foreground bg-muted/40 border-border";
    }
  };

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col justify-between rounded-xl border border-border bg-card/60 p-5 backdrop-blur-sm",
        "transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-card/90 hover:shadow-[0_12px_32px_rgba(255,153,0,0.12)]",
        className
      )}
    >
      <div>
        {/* Top Badges: Category & Status */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
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
            <div className="flex items-center gap-1 text-xs text-muted-foreground/80 font-mono">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              <span>{project.stars}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="mt-4 text-lg font-semibold leading-snug text-foreground transition-colors duration-200 group-hover:text-primary">
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
                className="inline-flex items-center rounded border border-[#FF9900]/25 bg-[#FF9900]/10 px-2 py-0.5 text-[11.5px] font-medium text-foreground/95"
              >
                {service}
              </span>
            ))}
          </div>
        </div>

        {/* Other Tech Stack */}
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

      {/* Card Footer: Contributors & External Links */}
      <div className="mt-6 flex items-center justify-between gap-3 border-t border-border/80 pt-4">
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
