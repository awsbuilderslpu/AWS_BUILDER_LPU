"use client";

import * as React from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ExternalLink,
  Users,
  Calendar,
  Layers,
  Heart,
  Eye,
  Edit2,
  Cloud,
  Award,
  Briefcase,
  Cpu,
  ShieldCheck,
  CheckSquare,
  Square,
  Sparkles,
  Trash2,
} from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import type { ProjectItem } from "@/lib/projects/types";

interface ProjectPreviewDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: ProjectItem | null;
  onEdit: (project: ProjectItem) => void;
  onDelete?: (project: ProjectItem) => void;
}

export function ProjectPreviewDrawer({
  open,
  onOpenChange,
  project,
  onEdit,
  onDelete,
}: ProjectPreviewDrawerProps) {
  // Interactive roadmap checklist state
  const [completedTasks, setCompletedTasks] = React.useState<Record<string, boolean>>({});

  // Generate milestone items based on project details
  const roadmapItems = React.useMemo(() => {
    if (!project) return [];
    return [
      {
        id: "step-1",
        label: `Core Architecture & ${project.category} setup with ${project.techStack[0] || "modern frameworks"}`,
      },
      {
        id: "step-2",
        label: `Cloud infrastructure & ${project.awsServices[0] || "AWS Services"} integration`,
      },
      {
        id: "step-3",
        label: `End-to-end security compliance, IAM role enforcement & testing`,
      },
      {
        id: "step-4",
        label: `Automated CI/CD pipeline, monitoring & production release verification`,
      },
    ];
  }, [project]);

  // Reset or initialize roadmap progress when project changes
  React.useEffect(() => {
    if (project) {
      if (project.status === "Completed") {
        setCompletedTasks({
          "step-1": true,
          "step-2": true,
          "step-3": true,
          "step-4": true,
        });
      } else if (project.status === "Ongoing") {
        setCompletedTasks({
          "step-1": true,
          "step-2": true,
          "step-3": false,
          "step-4": false,
        });
      } else {
        setCompletedTasks({
          "step-1": true,
          "step-2": false,
          "step-3": false,
          "step-4": false,
        });
      }
    }
  }, [project]);

  if (!project) return null;

  const totalSteps = roadmapItems.length;
  const finishedSteps = roadmapItems.filter((item) => completedTasks[item.id]).length;
  const progressPct = totalSteps > 0 ? Math.round((finishedSteps / totalSteps) * 100) : 0;

  const toggleTask = (id: string) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] bg-card border border-border text-foreground p-0 flex flex-col shadow-2xl overflow-hidden rounded-2xl gap-0">
        {/* Modal Header matching Reference Image */}
        <DialogHeader className="p-6 border-b border-border bg-card/95 shrink-0 text-left">
          <div className="flex items-start justify-between pr-8 gap-4">
            <div className="flex items-start gap-4">
              {/* Category / Icon Tile */}
              <div className="size-12 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-500 dark:text-rose-400 shrink-0 mt-0.5 shadow-[0_0_20px_rgba(244,63,94,0.15)]">
                {project.category === "Security" ? (
                  <ShieldCheck className="size-6 text-rose-500 dark:text-rose-400" />
                ) : project.category === "AI & ML" ? (
                  <Cpu className="size-6 text-rose-500 dark:text-rose-400" />
                ) : (
                  <Sparkles className="size-6 text-rose-500 dark:text-rose-400" />
                )}
              </div>

              <div>
                <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                  {project.title}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  {project.tagline}
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Modal Body - 2 Columns exactly matching Reference Image */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-7 [scrollbar-width:thin] space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6">
              {/* >_ PROJECT DESCRIPTION */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="text-slate-900 dark:text-white font-bold">&gt;_</span>
                  PROJECT DESCRIPTION
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-sans">
                  {project.description || project.tagline}
                </p>
              </div>

              {/* ? WHY THIS PROJECT STANDS OUT */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">?</span>
                  WHY THIS PROJECT STANDS OUT
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                  As cloud and AI workloads scale into enterprise operations, real-world deployment requires production-level reliability, automated governance, and robust architectural resilience. This project is built by AWS Student Builders Group to reflect production standards.
                </p>

                {/* Uniqueness Callout Box */}
                <div className="border-l-2 border-cyan-500 dark:border-cyan-400 bg-cyan-500/10 dark:bg-cyan-950/30 px-4 py-3 rounded-r-md">
                  <span className="text-xs font-bold text-cyan-800 dark:text-cyan-300 block mb-1">
                    Uniqueness:
                  </span>
                  <span className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed block">
                    {project.tagline} Built with specialized cloud paradigms and tested against edge cases.
                  </span>
                </div>
              </div>

              {/* HOW TO IMPRESS RECRUITERS */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Award className="size-4 text-purple-600 dark:text-purple-400" />
                  HOW TO IMPRESS RECRUITERS
                </h4>
                <div className="border-l-2 border-purple-500 dark:border-purple-400 bg-purple-500/10 dark:bg-purple-950/30 px-4 py-3 rounded-r-md">
                  <span className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed block">
                    Highlight live architecture diagrams, benchmarked latency/cost metrics, and AWS serverless or microservice decoupling in technical interviews.
                  </span>
                </div>
              </div>

              {/* INDUSTRY RELEVANCE & DEMAND */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="size-4 text-amber-600 dark:text-amber-500" />
                  INDUSTRY RELEVANCE & DEMAND
                </h4>
                <div className="rounded-xl border border-border bg-slate-50 dark:bg-muted/40 p-4 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                  High demand across cloud engineering, DevSecOps, and distributed computing teams. Demonstrates end-to-end delivery from prototype to audited cloud deployment.
                </div>
              </div>

              {/* Cover Media if available */}
              {project.image && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="size-3.5 text-blue-600 dark:text-blue-400" />
                    Cover Media
                  </h4>
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-border bg-black/60 shadow-lg">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 600px"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="lg:col-span-5 space-y-6">
              {/* TECHNOLOGIES Card */}
              <div className="rounded-xl border border-border bg-slate-50/60 dark:bg-muted/40 p-4 sm:p-5 space-y-3 shadow-xs">
                <h4 className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  TECHNOLOGIES
                </h4>
                <div className="flex flex-wrap gap-2">
                  {project.techStack && project.techStack.length > 0 ? (
                    project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="text-xs px-3 py-1.5 rounded-lg bg-card text-slate-800 dark:text-slate-200 border border-border font-medium shadow-2xs"
                      >
                        {tech}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic">No technologies listed</span>
                  )}
                </div>

                {project.awsServices && project.awsServices.length > 0 && (
                  <div className="pt-3 border-t border-border">
                    <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 block mb-2 uppercase">
                      AWS Services
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {project.awsServices.map((service) => (
                        <span
                          key={service}
                          className="text-xs px-2.5 py-1 rounded-md bg-amber-500/10 dark:bg-[#FF9900]/15 text-amber-800 dark:text-[#FF9900] border border-amber-500/30 dark:border-[#FF9900]/30 font-medium"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* INTERACTIVE ROADMAP Card */}
              <div className="rounded-xl border border-border bg-slate-50/60 dark:bg-muted/40 p-4 sm:p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    INTERACTIVE ROADMAP
                  </h4>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-mono">
                    <span>Progress</span>
                    <span className="text-slate-900 dark:text-white font-semibold">{progressPct}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 rounded-full transition-all duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Checklist */}
                <div className="space-y-2.5 pt-1">
                  {roadmapItems.map((item) => {
                    const isChecked = !!completedTasks[item.id];
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleTask(item.id)}
                        className="w-full flex items-start gap-2.5 text-left p-2 rounded-lg hover:bg-muted/80 transition-colors group cursor-pointer"
                      >
                        {isChecked ? (
                          <CheckSquare className="size-4 text-amber-600 dark:text-primary shrink-0 mt-0.5" />
                        ) : (
                          <Square className="size-4 text-slate-400 dark:text-muted-foreground group-hover:text-slate-700 dark:group-hover:text-foreground shrink-0 mt-0.5" />
                        )}
                        <span
                          className={`text-xs leading-relaxed transition-colors ${
                            isChecked
                              ? "text-slate-400 dark:text-muted-foreground line-through decoration-slate-400 dark:decoration-muted-foreground"
                              : "text-slate-700 dark:text-foreground group-hover:text-amber-700 dark:group-hover:text-primary"
                          }`}
                        >
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Project Team & Links Card */}
              <div className="rounded-xl border border-border bg-slate-50/60 dark:bg-muted/40 p-4 sm:p-5 space-y-4 shadow-xs">
                <h4 className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Users className="size-3.5 text-slate-500 dark:text-muted-foreground" />
                    PROJECT TEAM & REPO
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-muted-foreground capitalize">{project.status}</span>
                </h4>

                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-border/80">
                    <div>
                      <span className="text-xs font-semibold text-slate-900 dark:text-foreground block">
                        {project.author?.name}
                      </span>
                      <span className="text-[11px] text-amber-700 dark:text-[#FF9900] font-medium">
                        {project.author?.role || "Lead Developer"}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-slate-600 dark:text-muted-foreground border border-border">
                      Lead
                    </span>
                  </div>

                  {project.team && project.team.length > 0 && (
                    <div className="space-y-1.5">
                      {project.team.map((member, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-slate-800 dark:text-foreground">{member.name}</span>
                          <span className="text-slate-500 dark:text-muted-foreground text-[11px]">{member.role}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions & Links */}
                  <div className="space-y-2 pt-2">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted text-xs text-slate-800 dark:text-foreground transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <FaGithub className="size-3.5" />
                          GitHub Repository
                        </span>
                        <ExternalLink className="size-3 text-slate-400 dark:text-muted-foreground" />
                      </a>
                    )}

                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between px-3 py-2 rounded-lg border border-[#FF9900]/30 bg-[#FF9900]/10 hover:bg-[#FF9900]/20 text-xs text-amber-800 dark:text-[#FF9900] font-medium transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <ExternalLink className="size-3.5" />
                          Live Demo URL
                        </span>
                        <ExternalLink className="size-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-card/95 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 text-xs font-mono text-slate-500 dark:text-muted-foreground">
            <span>slug: {project.slug}</span>
            <span className="hidden sm:inline-flex items-center gap-1">
              <Calendar className="size-3" /> {project.startDate || "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {onDelete && (
              <Button
                type="button"
                variant="outline"
                onClick={() => onDelete(project)}
                className="border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/50 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="size-3.5" />
                Delete
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-border text-slate-700 dark:text-foreground hover:bg-muted text-xs cursor-pointer"
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onEdit(project);
              }}
              className="bg-[#FF9900] text-black hover:bg-[#FF9900]/90 text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,153,0,0.25)] cursor-pointer"
            >
              <Edit2 className="size-3.5" />
              Edit Project
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
