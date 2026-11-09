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
} from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import type { ProjectItem } from "@/lib/projects/types";

interface ProjectPreviewDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: ProjectItem | null;
  onEdit: (project: ProjectItem) => void;
}

export function ProjectPreviewDrawer({
  open,
  onOpenChange,
  project,
  onEdit,
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
              <div className="size-12 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 shrink-0 mt-0.5 shadow-[0_0_20px_rgba(244,63,94,0.15)]">
                {project.category === "Security" ? (
                  <ShieldCheck className="size-6 text-rose-400" />
                ) : project.category === "AI & ML" ? (
                  <Cpu className="size-6 text-rose-400" />
                ) : (
                  <Sparkles className="size-6 text-rose-400" />
                )}
              </div>

              <div>
                <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground tracking-tight leading-tight">
                  {project.title}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
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
                <h4 className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="text-slate-400 font-bold">&gt;_</span>
                  PROJECT DESCRIPTION
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed font-sans">
                  {project.description || project.tagline}
                </p>
              </div>

              {/* ? WHY THIS PROJECT STANDS OUT */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="text-blue-400 font-bold">?</span>
                  WHY THIS PROJECT STANDS OUT
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  As cloud and AI workloads scale into enterprise operations, real-world deployment requires production-level reliability, automated governance, and robust architectural resilience. This project is built by AWS Student Builders Group to reflect production standards.
                </p>

                {/* Uniqueness Callout Box */}
                <div className="border-l-2 border-cyan-400 bg-cyan-950/20 px-4 py-3 rounded-r-md">
                  <span className="text-xs font-semibold text-cyan-300 block mb-1">
                    Uniqueness:
                  </span>
                  <span className="text-xs text-slate-300 leading-relaxed block">
                    {project.tagline} Built with specialized cloud paradigms and tested against edge cases.
                  </span>
                </div>
              </div>

              {/* HOW TO IMPRESS RECRUITERS */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Award className="size-4 text-purple-400" />
                  HOW TO IMPRESS RECRUITERS
                </h4>
                <div className="border-l-2 border-purple-500 bg-purple-950/25 px-4 py-3 rounded-r-md">
                  <span className="text-xs text-slate-200 leading-relaxed block">
                    Highlight live architecture diagrams, benchmarked latency/cost metrics, and AWS serverless or microservice decoupling in technical interviews.
                  </span>
                </div>
              </div>

              {/* INDUSTRY RELEVANCE & DEMAND */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="size-4 text-amber-500" />
                  INDUSTRY RELEVANCE & DEMAND
                </h4>
                <div className="rounded-xl border border-border bg-muted/40 p-4 text-xs sm:text-sm text-foreground leading-relaxed">
                  High demand across cloud engineering, DevSecOps, and distributed computing teams. Demonstrates end-to-end delivery from prototype to audited cloud deployment.
                </div>
              </div>

              {/* Cover Media if available */}
              {project.image && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Layers className="size-3.5 text-blue-500" />
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
              <div className="rounded-xl border border-border bg-muted/40 p-4 sm:p-5 space-y-3 shadow-sm">
                <h4 className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">
                  TECHNOLOGIES
                </h4>
                <div className="flex flex-wrap gap-2">
                  {project.techStack && project.techStack.length > 0 ? (
                    project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="text-xs px-3 py-1.5 rounded-lg bg-card text-foreground border border-border font-medium"
                      >
                        {tech}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">No technologies listed</span>
                  )}
                </div>

                {project.awsServices && project.awsServices.length > 0 && (
                  <div className="pt-3 border-t border-slate-800/80">
                    <span className="text-[11px] font-mono text-slate-400 block mb-2 uppercase">
                      AWS Services
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {project.awsServices.map((service) => (
                        <span
                          key={service}
                          className="text-xs px-2.5 py-1 rounded-md bg-[#FF9900]/15 text-[#FF9900] border border-[#FF9900]/30 font-medium"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* INTERACTIVE ROADMAP Card */}
              <div className="rounded-xl border border-border bg-muted/40 p-4 sm:p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono font-semibold text-foreground uppercase tracking-wider">
                    INTERACTIVE ROADMAP
                  </h4>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                    <span>Progress</span>
                    <span className="text-foreground font-semibold">{progressPct}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
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
                          <CheckSquare className="size-4 text-primary shrink-0 mt-0.5" />
                        ) : (
                          <Square className="size-4 text-muted-foreground group-hover:text-foreground shrink-0 mt-0.5" />
                        )}
                        <span
                          className={`text-xs leading-relaxed transition-colors ${
                            isChecked
                              ? "text-muted-foreground line-through decoration-muted-foreground"
                              : "text-foreground group-hover:text-primary"
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
              <div className="rounded-xl border border-border bg-muted/40 p-4 sm:p-5 space-y-4 shadow-sm">
                <h4 className="text-xs font-mono font-semibold text-foreground uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Users className="size-3.5 text-muted-foreground" />
                    PROJECT TEAM & REPO
                  </span>
                  <span className="text-[11px] text-muted-foreground capitalize">{project.status}</span>
                </h4>

                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-border/80">
                    <div>
                      <span className="text-xs font-semibold text-foreground block">
                        {project.author?.name}
                      </span>
                      <span className="text-[11px] text-[#FF9900]">
                        {project.author?.role || "Lead Developer"}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                      Lead
                    </span>
                  </div>

                  {project.team && project.team.length > 0 && (
                    <div className="space-y-1.5">
                      {project.team.map((member, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-foreground">{member.name}</span>
                          <span className="text-muted-foreground text-[11px]">{member.role}</span>
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
                        className="flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted text-xs text-foreground transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <FaGithub className="size-3.5" />
                          GitHub Repository
                        </span>
                        <ExternalLink className="size-3 text-muted-foreground" />
                      </a>
                    )}

                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between px-3 py-2 rounded-lg border border-[#FF9900]/30 bg-[#FF9900]/10 hover:bg-[#FF9900]/20 text-xs text-[#FF9900] font-medium transition-colors"
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
          <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
            <span>slug: {project.slug}</span>
            <span className="hidden sm:inline-flex items-center gap-1">
              <Calendar className="size-3" /> {project.startDate || "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-border text-foreground hover:bg-muted text-xs"
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onEdit(project);
              }}
              className="bg-[#FF9900] text-black hover:bg-[#FF9900]/90 text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,153,0,0.25)]"
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
