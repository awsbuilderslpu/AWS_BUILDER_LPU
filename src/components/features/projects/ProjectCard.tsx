import * as React from "react";
import Image from "next/image";
import { Star, Heart, Eye, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import type { Project } from "@/data/projects";

export interface ProjectCardProps {
  project: Project;
  isSelected?: boolean;
  onSelect?: (project: Project) => void;
  className?: string;
}

export function ProjectCard({
  project,
  isSelected = false,
  onSelect,
  className,
}: ProjectCardProps) {
  const getStatusBadge = (status: Project["status"]) => {
    switch (status) {
      case "Ongoing":
        return "border-emerald-500/40 bg-emerald-950/80 text-emerald-400";
      case "Completed":
        return "border-purple-500/40 bg-purple-950/80 text-purple-300";
      case "Under Review":
        return "border-amber-500/40 bg-amber-950/80 text-amber-300";
      case "Archived":
        return "border-border bg-card/80 text-muted-foreground";
      default:
        return "border-border bg-card/80 text-muted-foreground";
    }
  };

  return (
    <article
      onClick={() => onSelect?.(project)}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-card/60 backdrop-blur-sm cursor-pointer select-none",
        "transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-card/90 hover:shadow-[0_10px_30px_rgba(255,153,0,0.15)]",
        isSelected
          ? "border-primary ring-1 ring-primary shadow-[0_0_24px_rgba(255,153,0,0.22)]"
          : "border-border/80",
        className
      )}
    >
      <div>
        {/* 16:9 Thumbnail Image */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-background">
          <Image
            src={project.image}
            alt={project.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Subtle dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-black/20 to-black/40" />

          {/* Floating Badges */}
          <div className="absolute inset-x-3.5 top-3.5 z-10 flex items-center justify-between gap-2 pointer-events-none">
            {/* Featured Badge */}
            {project.featured ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/50 bg-black/70 px-2 py-0.5 text-[11px] font-semibold text-amber-300 backdrop-blur-md shadow-xs">
                <Star className="size-3 fill-amber-400 text-amber-400" />
                Featured
              </span>
            ) : (
              <span />
            )}

            {/* Status Badge */}
            <span
              className={cn(
                "inline-flex items-center rounded-md border px-2.5 py-0.5 text-[11px] font-medium leading-normal backdrop-blur-md shadow-xs",
                getStatusBadge(project.status)
              )}
            >
              {project.status}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5">
          {/* Title */}
          <h3 className="text-[17px] font-bold leading-snug text-white transition-colors duration-200 group-hover:text-primary">
            {project.title}
          </h3>

          {/* Tagline / Snippet */}
          <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {project.tagline || project.description}
          </p>

          {/* Tech Stack Pills */}
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {project.techStack.slice(0, 5).map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center rounded border border-border bg-card/70 px-2 py-0.5 text-[11px] font-mono text-muted-foreground"
              >
                {tech}
              </span>
            ))}
            {project.techStack.length > 5 && (
              <span className="inline-flex items-center rounded border border-border bg-card/40 px-1.5 py-0.5 text-[10.5px] font-mono text-muted-foreground/80">
                +{project.techStack.length - 5}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer: Author + Metrics */}
      <div className="mx-4 sm:mx-5 mb-4 sm:mb-5 flex items-center justify-between gap-2 border-t border-border/70 pt-3.5">
        {/* Author Avatar & Name */}
        <div className="flex items-center gap-2 min-w-0">
          <Avatar
            name={project.author.name}
            src={project.author.avatar}
            size={24}
            className="ring-1 ring-border shrink-0"
          />
          <span className="truncate text-xs font-medium text-foreground/90">
            {project.author.name}
          </span>
        </div>

        {/* Metrics: Likes, Views, Date */}
        <div className="flex items-center gap-2.5 sm:gap-3 text-xs text-muted-foreground shrink-0 font-mono">
          <div className="flex items-center gap-1 text-rose-400/90" title={`${project.stats.likes} Likes`}>
            <Heart className="size-3.5 fill-rose-500/20 text-rose-400" />
            <span>{project.stats.likes}</span>
          </div>

          <div className="flex items-center gap-1 text-sky-400/90" title={`${project.stats.views} Views`}>
            <Eye className="size-3.5 text-sky-400" />
            <span>{project.stats.views}</span>
          </div>

          <div className="flex items-center gap-1 text-muted-foreground/80">
            <Calendar className="size-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">{project.date}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
