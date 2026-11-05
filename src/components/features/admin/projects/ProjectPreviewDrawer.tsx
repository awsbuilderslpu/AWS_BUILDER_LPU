"use client";

import * as React from "react";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  ExternalLink,
  Github,
  Star,
  Users,
  Calendar,
  Layers,
  Heart,
  Eye,
  Edit2,
  Cloud,
} from "lucide-react";
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
  if (!project) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl bg-[#090E17] border-l border-white/10 text-white p-0 flex flex-col h-full shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <SheetHeader className="p-6 border-b border-white/10 bg-black/30 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300">
                  {project.category}
                </span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                    project.status === "Completed"
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      : project.status === "Ongoing"
                      ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                      : project.status === "Under Review"
                      ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                      : "bg-slate-500/15 text-slate-400 border-slate-500/30"
                  }`}
                >
                  {project.status}
                </span>
                {project.featured && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#FF9900]/15 text-[#FF9900] border border-[#FF9900]/30">
                    <Star className="size-3 fill-[#FF9900]" />
                    Featured
                  </span>
                )}
              </div>
              <SheetTitle className="text-2xl font-bold text-white">
                {project.title}
              </SheetTitle>
              <SheetDescription className="text-sm text-slate-400 mt-1">
                {project.tagline}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Cover Media */}
          {project.image && (
            <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-white/10 bg-black/50">
              <Image
                src={project.image}
                alt={project.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 600px"
              />
            </div>
          )}

          {/* Metrics bar */}
          <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl border border-white/10 bg-white/[0.02] text-center">
            <div>
              <span className="text-xs text-slate-400 block mb-0.5 flex items-center justify-center gap-1">
                <Heart className="size-3.5 text-rose-400" /> Likes
              </span>
              <span className="text-base font-semibold text-white">
                {project.stats?.likes ?? 0}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block mb-0.5 flex items-center justify-center gap-1">
                <Eye className="size-3.5 text-blue-400" /> Views
              </span>
              <span className="text-base font-semibold text-white">
                {project.stats?.views ?? "0"}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block mb-0.5 flex items-center justify-center gap-1">
                <Star className="size-3.5 text-amber-400 fill-amber-400" /> Rating
              </span>
              <span className="text-base font-semibold text-white">
                {project.stats?.rating ?? 5.0} / 5
              </span>
            </div>
          </div>

          {/* Overview */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Project Description
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed bg-white/[0.02] p-4 rounded-xl border border-white/10 whitespace-pre-wrap">
              {project.description || project.tagline}
            </p>
          </div>

          {/* Tech Stack */}
          {project.techStack && project.techStack.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="size-3.5 text-blue-400" /> Technologies Used
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="text-xs px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AWS Services */}
          {project.awsServices && project.awsServices.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Cloud className="size-3.5 text-[#FF9900]" /> AWS Architecture
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {project.awsServices.map((service) => (
                  <span
                    key={service}
                    className="text-xs px-2.5 py-1 rounded-md bg-[#FF9900]/15 text-[#FF9900] border border-[#FF9900]/30"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Team */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="size-3.5 text-purple-400" /> Team & Authors
            </h4>
            <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] space-y-3">
              {/* Lead author */}
              <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                <div>
                  <span className="text-sm font-semibold text-white block">
                    {project.author?.name}
                  </span>
                  <span className="text-xs text-[#FF9900]">
                    {project.author?.role || "Lead Developer"}
                  </span>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#FF9900]/15 text-[#FF9900] border border-[#FF9900]/30">
                  Lead
                </span>
              </div>

              {/* Collaborators */}
              {project.team && project.team.length > 0 && (
                <div className="space-y-2 pt-1">
                  {project.team.map((member, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">{member.name}</span>
                      <span className="text-slate-500">{member.role}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Links & Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Github className="size-4" /> GitHub Repository
                </span>
                <ExternalLink className="size-3.5 text-slate-500" />
              </a>
            )}

            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-[#FF9900]/30 bg-[#FF9900]/10 hover:bg-[#FF9900]/20 text-xs font-medium text-[#FF9900] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <ExternalLink className="size-4" /> Live Demo
                </span>
                <ExternalLink className="size-3.5" />
              </a>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-white/10">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5" /> Started: {project.startDate || "N/A"}
            </span>
            {project.endDate && (
              <span>Ended: {project.endDate}</span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between shrink-0">
          <span className="text-xs font-mono text-slate-500">
            slug: {project.slug}
          </span>
          <Button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onEdit(project);
            }}
            className="bg-[#FF9900] text-black hover:bg-[#FF9900]/90 text-xs font-semibold flex items-center gap-1.5"
          >
            <Edit2 className="size-3.5" /> Edit Project
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

