"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FolderGit2,
  Plus,
  Search,
  Star,
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Layers,
  Cloud,
  LayoutGrid,
  Table as TableIcon,
  MoreVertical,
  Check,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import { AdminPageHeader } from "@/components/features/admin/kit/AdminPageHeader";
import { StatCard } from "@/components/features/admin/kit/StatCard";
import { StatCardRow } from "@/components/features/admin/kit/StatCardRow";
import { ConfirmDialog } from "@/components/features/admin/kit/ConfirmDialog";
import { EmptyState } from "@/components/features/admin/kit/EmptyState";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  toggleFeaturedProjectAction,
  updateProjectStatusAction,
  deleteProjectAction,
} from "@/lib/projects/actions";
import type {
  ProjectItem,
  ProjectStatus,
} from "@/lib/projects/types";
import {
  projectCategories,
  projectStatuses,
} from "@/data/projects";
import { ProjectDrawer } from "./ProjectDrawer";
import { ProjectPreviewDrawer } from "./ProjectPreviewDrawer";

interface ProjectsViewProps {
  initialProjects: ProjectItem[];
}

export function ProjectsView({ initialProjects }: ProjectsViewProps) {
  const [items, setItems] = React.useState<ProjectItem[]>(initialProjects);
  const [search, setSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("All Categories");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("All");
  const [featuredOnly, setFeaturedOnly] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<"table" | "grid">("table");

  // Drawers & Modals
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState<ProjectItem | null>(null);

  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewProject, setPreviewProject] = React.useState<ProjectItem | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [projectToDelete, setProjectToDelete] = React.useState<ProjectItem | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  // Sync state if initialProjects changes
  React.useEffect(() => {
    setItems(initialProjects);
  }, [initialProjects]);

  // Derived Counts
  const counts = React.useMemo(() => {
    return {
      total: items.length,
      ongoing: items.filter((p) => p.status === "Ongoing").length,
      completed: items.filter((p) => p.status === "Completed").length,
      featured: items.filter((p) => Boolean(p.featured)).length,
    };
  }, [items]);

  // Filtering
  const filteredProjects = React.useMemo(() => {
    return items.filter((project) => {
      // 1. Status Filter
      if (selectedStatus !== "All" && project.status !== selectedStatus) {
        return false;
      }

      // 2. Category Filter
      if (
        selectedCategory !== "All Categories" &&
        project.category !== selectedCategory
      ) {
        return false;
      }

      // 3. Featured Only
      if (featuredOnly && !project.featured) {
        return false;
      }

      // 4. Search Query
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesTitle = project.title.toLowerCase().includes(query);
        const matchesTagline = project.tagline.toLowerCase().includes(query);
        const matchesSlug = project.slug.toLowerCase().includes(query);
        const matchesAuthor = project.author?.name?.toLowerCase().includes(query);
        const matchesCategory = project.category?.toLowerCase().includes(query);
        const matchesTech = (project.techStack || []).some((t) =>
          t.toLowerCase().includes(query)
        );
        const matchesAws = (project.awsServices || []).some((s) =>
          s.toLowerCase().includes(query)
        );

        if (
          !matchesTitle &&
          !matchesTagline &&
          !matchesSlug &&
          !matchesAuthor &&
          !matchesCategory &&
          !matchesTech &&
          !matchesAws
        ) {
          return false;
        }
      }

      return true;
    });
  }, [items, search, selectedCategory, selectedStatus, featuredOnly]);

  // Actions
  const handleCreate = () => {
    setEditingProject(null);
    setDrawerOpen(true);
  };

  const handleEdit = (project: ProjectItem) => {
    setEditingProject(project);
    setDrawerOpen(true);
  };

  const handlePreview = (project: ProjectItem) => {
    setPreviewProject(project);
    setPreviewOpen(true);
  };

  const handleSaved = (saved: ProjectItem, isNew: boolean) => {
    if (isNew) {
      setItems((prev) => [saved, ...prev]);
    } else {
      setItems((prev) =>
        prev.map((p) => (p.slug === saved.slug || p.id === saved.id ? saved : p))
      );
    }
  };

  const handleToggleFeatured = async (project: ProjectItem) => {
    const nextState = !project.featured;
    setItems((prev) =>
      prev.map((p) =>
        p.slug === project.slug || p.id === project.id
          ? { ...p, featured: nextState }
          : p
      )
    );

    try {
      const targetId = project.id || project.slug;
      const res = await toggleFeaturedProjectAction(targetId, nextState);
      if (res.ok) {
        toast.success(
          nextState
            ? `Marked "${project.title}" as featured.`
            : `Removed "${project.title}" from featured.`
        );
      } else {
        toast.info("Updated featured status locally.");
      }
    } catch {
      toast.info("Updated featured status locally.");
    }
  };

  const handleStatusChange = async (
    project: ProjectItem,
    nextStatus: ProjectStatus
  ) => {
    setItems((prev) =>
      prev.map((p) =>
        p.slug === project.slug || p.id === project.id
          ? { ...p, status: nextStatus }
          : p
      )
    );

    try {
      const targetId = project.id || project.slug;
      const res = await updateProjectStatusAction(targetId, nextStatus);
      if (res.ok) {
        toast.success(`Updated status to ${nextStatus}.`);
      } else {
        toast.info(`Updated status to ${nextStatus} locally.`);
      }
    } catch {
      toast.info(`Updated status to ${nextStatus} locally.`);
    }
  };

  const openDeleteDialog = (project: ProjectItem) => {
    setProjectToDelete(project);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    setDeleteLoading(true);

    const targetId = projectToDelete.id || projectToDelete.slug;
    setItems((prev) =>
      prev.filter(
        (p) => p.slug !== projectToDelete.slug && p.id !== projectToDelete.id
      )
    );

    try {
      const res = await deleteProjectAction(targetId);
      if (res.ok) {
        toast.success(`Project "${projectToDelete.title}" deleted.`);
      } else {
        toast.info(`Removed project "${projectToDelete.title}" locally.`);
      }
    } catch {
      toast.info(`Removed project "${projectToDelete.title}" locally.`);
    } finally {
      setDeleteLoading(false);
      setDeleteConfirmOpen(false);
      setProjectToDelete(null);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("All Categories");
    setSelectedStatus("All");
    setFeaturedOnly(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <AdminPageHeader
        title="Project Management"
        subtitle="Manage student-built cloud architectures, generative AI tools, and serverless applications."
        actions={
          <Button
            onClick={handleCreate}
            className="bg-[#FF9900] text-black hover:bg-[#FF9900]/90 font-semibold px-4 h-10 shadow-[0_0_15px_rgba(255,153,0,0.3)] transition-all"
          >
            <Plus className="size-4 mr-2" />
            New Project
          </Button>
        }
      />

      {/* Top Stat Cards */}
      <StatCardRow className="grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Projects"
          value={counts.total}
          icon={FolderGit2}
          tone="blue"
        />
        <StatCard
          label="Ongoing Builds"
          value={counts.ongoing}
          icon={Clock}
          tone="orange"
        />
        <StatCard
          label="Completed"
          value={counts.completed}
          icon={CheckCircle2}
          tone="green"
        />
        <StatCard
          label="Featured Showcase"
          value={counts.featured}
          icon={Star}
          tone="violet"
        />
      </StatCardRow>

      {/* Filter and Control Bar */}
      <div className="rounded-2xl border border-white/10 bg-[#060D1A]/70 p-4 backdrop-blur-md space-y-3.5">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects by title, member, stack, category..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-[#FF9900] transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF9900]"
            >
              {projectCategories.map((c) => (
                <option key={c} value={c} className="bg-slate-900 text-white">
                  {c}
                </option>
              ))}
            </select>

            {/* Featured Only Toggle Button */}
            <button
              type="button"
              onClick={() => setFeaturedOnly(!featuredOnly)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                featuredOnly
                  ? "bg-[#FF9900]/20 border-[#FF9900]/50 text-[#FF9900]"
                  : "bg-black/40 border-white/10 text-slate-300 hover:text-white"
              }`}
            >
              <Star
                className={`size-3.5 ${
                  featuredOnly ? "fill-[#FF9900] text-[#FF9900]" : ""
                }`}
              />
              Featured
            </button>

            {/* View Switcher: Table vs Grid */}
            <div className="flex items-center rounded-xl border border-white/10 bg-black/40 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "table"
                    ? "bg-white/15 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Table view"
              >
                <TableIcon className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-white/15 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Grid view"
              >
                <LayoutGrid className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Status Tabs Bar */}
        <div className="flex items-center justify-between border-t border-white/10 pt-3 flex-wrap gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {["All", "Ongoing", "Completed", "Under Review", "Archived"].map((st) => {
              const isActive = selectedStatus === st;
              const count =
                st === "All"
                  ? items.length
                  : items.filter((p) => p.status === st).length;

              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSelectedStatus(st)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-[#FF9900] text-black font-semibold shadow-[0_0_10px_rgba(255,153,0,0.25)]"
                      : "bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.06]"
                  }`}
                >
                  <span>{st}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive
                        ? "bg-black/25 text-black font-bold"
                        : "bg-white/10 text-slate-300"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {(search ||
            selectedCategory !== "All Categories" ||
            selectedStatus !== "All" ||
            featuredOnly) && (
            <button
              type="button"
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-[#FF9900] transition-colors"
            >
              <RotateCcw className="size-3" /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Projects List Content */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          title="No projects found"
          text="No student projects match your current search query or status filter."
          icon={AlertCircle}
          action={
            <Button
              onClick={resetFilters}
              variant="outline"
              className="text-xs"
            >
              Reset filters
            </Button>
          }
        />
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <div className="rounded-2xl border border-white/10 bg-[#060D1A]/80 backdrop-blur-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-black/40 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Tech & AWS</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Featured</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {filteredProjects.map((project) => (
                  <tr
                    key={project.slug}
                    className="hover:bg-white/[0.03] transition-colors group"
                  >
                    {/* Project info & image */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative size-12 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-black/50">
                          <Image
                            src={project.image || "/images/projects/thefleetfly.jpg"}
                            alt={project.title}
                            fill
                            unoptimized
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div className="max-w-[220px]">
                          <span
                            onClick={() => handlePreview(project)}
                            className="font-semibold text-white hover:text-[#FF9900] cursor-pointer block truncate"
                          >
                            {project.title}
                          </span>
                          <span className="text-xs text-slate-400 block truncate">
                            {project.tagline}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            /{project.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-white/5 text-slate-300 border border-white/10 whitespace-nowrap">
                        {project.category}
                      </span>
                    </td>

                    {/* Tech stack & AWS */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[220px]">
                        {(project.techStack || []).slice(0, 2).map((tech) => (
                          <span
                            key={tech}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20"
                          >
                            {tech}
                          </span>
                        ))}
                        {(project.awsServices || []).slice(0, 1).map((service) => (
                          <span
                            key={service}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-[#FF9900]/10 text-[#FF9900] border border-[#FF9900]/20"
                          >
                            {service}
                          </span>
                        ))}
                        {((project.techStack?.length || 0) +
                          (project.awsServices?.length || 0) >
                          3) && (
                          <span className="text-[10px] px-1 py-0.5 text-slate-400">
                            +
                            {(project.techStack?.length || 0) +
                              (project.awsServices?.length || 0) -
                              3}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Author */}
                    <td className="py-3 px-4">
                      <div>
                        <span className="text-xs font-medium text-white block">
                          {project.author?.name || "Anonymous"}
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          {project.author?.role || "Developer"}
                        </span>
                      </div>
                    </td>

                    {/* Status dropdown */}
                    <td className="py-3 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                              project.status === "Completed"
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
                                : project.status === "Ongoing"
                                ? "bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25"
                                : project.status === "Under Review"
                                ? "bg-blue-500/15 text-blue-400 border-blue-500/30 hover:bg-blue-500/25"
                                : "bg-slate-500/15 text-slate-400 border-slate-500/30 hover:bg-slate-500/25"
                            }`}
                          >
                            <span className="size-1.5 rounded-full bg-current" />
                            {project.status}
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="start"
                          className="bg-slate-900 border-white/10 text-white min-w-[130px]"
                        >
                          {(
                            ["Ongoing", "Completed", "Under Review", "Archived"] as ProjectStatus[]
                          ).map((st) => (
                            <DropdownMenuItem
                              key={st}
                              onClick={() => handleStatusChange(project, st)}
                              className="text-xs cursor-pointer flex items-center justify-between"
                            >
                              <span>{st}</span>
                              {project.status === st && (
                                <Check className="size-3 text-[#FF9900]" />
                              )}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>

                    {/* Featured toggle */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(project)}
                        title={
                          project.featured
                            ? "Remove from featured"
                            : "Mark as featured"
                        }
                        className={`p-1.5 rounded-lg transition-colors ${
                          project.featured
                            ? "text-[#FF9900] bg-[#FF9900]/15 hover:bg-[#FF9900]/25"
                            : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                        }`}
                      >
                        <Star
                          className={`size-4 ${
                            project.featured ? "fill-[#FF9900]" : ""
                          }`}
                        />
                      </button>
                    </td>

                    {/* Actions Menu */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreview(project)}
                          className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                          title="Preview details"
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(project)}
                          className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                          title="Edit project"
                        >
                          <Edit2 className="size-4" />
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                            >
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-slate-900 border-white/10 text-white w-44"
                          >
                            <DropdownMenuItem
                              onClick={() => handlePreview(project)}
                              className="text-xs cursor-pointer flex items-center gap-2"
                            >
                              <Eye className="size-3.5" />
                              View Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEdit(project)}
                              className="text-xs cursor-pointer flex items-center gap-2"
                            >
                              <Edit2 className="size-3.5" />
                              Edit Project
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleFeatured(project)}
                              className="text-xs cursor-pointer flex items-center gap-2"
                            >
                              <Star className="size-3.5" />
                              {project.featured ? "Unfeature" : "Make Featured"}
                            </DropdownMenuItem>

                            {project.githubUrl && (
                              <DropdownMenuItem asChild>
                                <a
                                  href={project.githubUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs cursor-pointer flex items-center gap-2"
                                >
                                  <FaGithub className="size-3.5" />
                                  GitHub Repo
                                </a>
                              </DropdownMenuItem>
                            )}

                            {project.demoUrl && (
                              <DropdownMenuItem asChild>
                                <a
                                  href={project.demoUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs cursor-pointer flex items-center gap-2"
                                >
                                  <ExternalLink className="size-3.5" />
                                  Live Demo
                                </a>
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(project)}
                              className="text-xs cursor-pointer text-red-400 hover:text-red-300 focus:text-red-300 flex items-center gap-2"
                            >
                              <Trash2 className="size-3.5" />
                              Delete Project
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <div
              key={project.slug}
              className="group relative rounded-2xl border border-white/10 bg-[#060D1A]/80 backdrop-blur-md overflow-hidden flex flex-col hover:border-[#FF9900]/40 transition-all hover:shadow-[0_4px_25px_rgba(255,153,0,0.15)]"
            >
              {/* Card Image */}
              <div className="relative aspect-video w-full overflow-hidden bg-black/60">
                <Image
                  src={project.image || "/images/projects/thefleetfly.jpg"}
                  alt={project.title}
                  fill
                  unoptimized
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060D1A] via-transparent to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10">
                    {project.category}
                  </span>
                  {project.featured && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#FF9900] text-black shadow-md">
                      <Star className="size-3 fill-black" />
                      Featured
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <h3
                      onClick={() => handlePreview(project)}
                      className="font-bold text-lg text-white hover:text-[#FF9900] cursor-pointer transition-colors"
                    >
                      {project.title}
                    </h3>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
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
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {project.tagline}
                  </p>

                  {/* Tech stack */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {(project.techStack || []).slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20"
                      >
                        {tech}
                      </span>
                    ))}
                    {(project.awsServices || []).slice(0, 2).map((service) => (
                      <span
                        key={service}
                        className="text-[10px] px-2 py-0.5 rounded bg-[#FF9900]/15 text-[#FF9900] border border-[#FF9900]/30"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">
                      Lead
                    </span>
                    <span className="text-slate-200 font-medium truncate max-w-[120px] block">
                      {project.author?.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handlePreview(project)}
                      className="h-8 px-2.5 text-xs text-slate-300 hover:text-white hover:bg-white/10"
                    >
                      <Eye className="size-3.5 mr-1" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(project)}
                      className="h-8 px-2.5 text-xs border-white/15 text-white hover:bg-white/10"
                    >
                      <Edit2 className="size-3.5 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project Form Drawer (Create & Edit) */}
      <ProjectDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        project={editingProject}
        onSaved={handleSaved}
      />

      {/* Project Detail Preview Drawer */}
      <ProjectPreviewDrawer
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        project={previewProject}
        onEdit={(p) => {
          setPreviewOpen(false);
          handleEdit(p);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Project?"
        description={`Are you sure you want to delete "${projectToDelete?.title}"? This will permanently remove the project from the admin portal and public portfolio.`}
        confirmLabel={deleteLoading ? "Deleting..." : "Delete Project"}
        pending={deleteLoading}
        onConfirm={handleConfirmDelete}
        tone="danger"
      />
    </div>
  );
}

