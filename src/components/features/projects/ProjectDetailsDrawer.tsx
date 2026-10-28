"use client";

import * as React from "react";
import Image from "next/image";
import {
  X,
  Layers,
  Calendar,
  Activity,
  FileText,
  Cpu,
  Link2,
  ExternalLink,
  Heart,
  Eye,
  Star,
} from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { projectsCopy, type Project } from "@/data/projects";

export interface ProjectDetailsDrawerProps {
  project: Project | null;
  onClose: () => void;
  className?: string;
}

type DrawerTab = "overview" | "techStack" | "team" | "media";

export function ProjectDetailsDrawer({
  project,
  onClose,
  className,
}: ProjectDetailsDrawerProps) {
  const [activeTab, setActiveTab] = React.useState<DrawerTab>("overview");

  if (!project) return null;

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "Ongoing":
        return "text-emerald-400";
      case "Completed":
        return "text-purple-300";
      case "Under Review":
        return "text-amber-300";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusBadge = (status: Project["status"]) => {
    switch (status) {
      case "Ongoing":
        return "border-emerald-500/40 bg-emerald-950/80 text-emerald-400";
      case "Completed":
        return "border-purple-500/40 bg-purple-950/80 text-purple-300";
      case "Under Review":
        return "border-amber-500/40 bg-amber-950/80 text-amber-300";
      default:
        return "border-border bg-card/80 text-muted-foreground";
    }
  };

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-xl border border-border/80 bg-card/90 shadow-2xl backdrop-blur-md overflow-hidden",
        className
      )}
    >
      {/* Drawer Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/70 px-5">
        <h2 className="text-base font-bold text-white tracking-tight">
          {projectsCopy.drawerTitle}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close project details"
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/10 hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {/* Banner Image with Status Badge */}
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-background border border-border/60">
          <Image
            src={project.image}
            alt={project.title}
            fill
            sizes="480px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute right-3 top-3 z-10">
            <span
              className={cn(
                "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold backdrop-blur-md",
                getStatusBadge(project.status)
              )}
            >
              {project.status}
            </span>
          </div>
        </div>

        {/* Title and Tagline */}
        <div className="mt-4">
          <h3 className="text-xl font-bold text-white tracking-tight">
            {project.title}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {project.tagline}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mt-5 border-b border-border/70">
          <nav className="flex items-center gap-6" aria-label="Project details sections">
            {(
              [
                { id: "overview", label: projectsCopy.drawerTabs.overview },
                { id: "techStack", label: projectsCopy.drawerTabs.techStack },
                { id: "team", label: projectsCopy.drawerTabs.team },
                { id: "media", label: projectsCopy.drawerTabs.media },
              ] as const
            ).map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "relative pb-2.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer select-none",
                    isActive
                      ? "text-primary font-semibold"
                      : "text-muted-foreground hover:text-white"
                  )}
                >
                  {tab.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-5">
          {activeTab === "overview" && (
            <div className="flex flex-col gap-5">
              {/* 4-Item Metadata Grid */}
              <div className="grid grid-cols-2 gap-3.5 rounded-lg border border-border/60 bg-background/50 p-3.5 text-xs">
                <div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Layers className="size-3.5 text-primary" />
                    <span>{projectsCopy.meta.category}</span>
                  </div>
                  <p className="mt-1 font-semibold text-foreground">
                    {project.category}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="size-3.5 text-primary" />
                    <span>{projectsCopy.meta.startDate}</span>
                  </div>
                  <p className="mt-1 font-semibold text-foreground">
                    {project.startDate}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="size-3.5 text-primary" />
                    <span>{projectsCopy.meta.endDate}</span>
                  </div>
                  <p className="mt-1 font-semibold text-foreground">
                    {project.endDate || "—"}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Activity className="size-3.5 text-primary" />
                    <span>{projectsCopy.meta.status}</span>
                  </div>
                  <p className={cn("mt-1 font-semibold", getStatusColor(project.status))}>
                    {project.status}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <FileText className="size-3.5 text-primary" />
                  <span>{projectsCopy.meta.description}</span>
                </div>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-foreground/90">
                  {project.description}
                </p>
              </div>

              {/* Technologies Used */}
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Cpu className="size-3.5 text-primary" />
                  <span>{projectsCopy.meta.technologiesUsed}</span>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex items-center rounded-md border border-border bg-card/80 px-2.5 py-1 text-xs font-mono text-muted-foreground hover:text-white"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Links */}
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Link2 className="size-3.5 text-primary" />
                  <span>{projectsCopy.meta.links}</span>
                </div>

                <div className="mt-2 flex flex-col gap-2 text-xs">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-lg border border-border bg-background/40 px-3 py-2 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-card hover:text-white"
                    >
                      <div className="flex items-center gap-2">
                        <FaGithub className="size-4 shrink-0 text-foreground" />
                        <span className="font-medium text-foreground">{projectsCopy.meta.githubRepo}</span>
                      </div>
                      <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
                    </a>
                  )}

                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-lg border border-border bg-background/40 px-3 py-2 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-card hover:text-white"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <ExternalLink className="size-4 shrink-0 text-primary" />
                        <span className="font-medium text-foreground">{projectsCopy.meta.liveDemo}</span>
                        <span className="text-primary truncate font-mono text-[11px] underline">
                          {project.demoUrl}
                        </span>
                      </div>
                      <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "techStack" && (
            <div className="flex flex-col gap-4 text-xs">
              <div>
                <span className="font-semibold uppercase tracking-wider text-muted-foreground">
                  AWS Cloud Architecture
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {project.awsServices.map((service) => (
                    <span
                      key={service}
                      className="inline-flex items-center rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-semibold uppercase tracking-wider text-muted-foreground">
                  Application Stack
                </span>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex items-center rounded-md border border-border bg-card/60 px-2.5 py-1 text-xs font-mono text-muted-foreground"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "team" && (
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Contributors
              </span>
              {(project.team || [project.author]).map((member) => (
                <div
                  key={member.name}
                  className="flex items-center gap-3 rounded-lg border border-border bg-background/50 p-2.5 text-xs"
                >
                  <Avatar name={member.name} size={32} />
                  <div>
                    <p className="font-semibold text-white">{member.name}</p>
                    <p className="text-muted-foreground">{member.role || "Developer"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "media" && (
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Media & Blueprints
              </span>
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-border bg-background">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Drawer Footer Metric Pills */}
      <div className="border-t border-border/70 bg-background/70 px-5 py-3.5">
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
          <div className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card/60 py-2">
            <Heart className="size-4 fill-rose-500/20 text-rose-400" />
            <span className="font-bold text-white">{project.stats.likes}</span>
            <span className="text-muted-foreground text-[11px]">{projectsCopy.meta.likes}</span>
          </div>

          <div className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card/60 py-2">
            <Eye className="size-4 text-sky-400" />
            <span className="font-bold text-white">{project.stats.views}</span>
            <span className="text-muted-foreground text-[11px]">{projectsCopy.meta.views}</span>
          </div>

          <div className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card/60 py-2">
            <Star className="size-4 fill-amber-400 text-amber-400" />
            <span className="font-bold text-white">{project.stats.rating}</span>
            <span className="text-muted-foreground text-[11px]">{projectsCopy.meta.rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
