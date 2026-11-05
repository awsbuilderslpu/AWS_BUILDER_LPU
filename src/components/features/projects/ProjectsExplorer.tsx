"use client";

import * as React from "react";
import { Search, ChevronDown, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  projects,
  projectStatusTabs,
  projectCategories,
  projectTechnologies,
  projectStatuses,
  projectMembers,
  projectsCopy,
  type ProjectStatusTab,
} from "@/data/projects";
import { ProjectCard } from "@/components/features/projects/ProjectCard";
import { ProjectDetailsDrawer } from "@/components/features/projects/ProjectDetailsDrawer";

export function ProjectsExplorer() {
  const [selectedStatusTab, setSelectedStatusTab] =
    React.useState<ProjectStatusTab>("All Projects");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("All Categories");
  const [selectedTech, setSelectedTech] = React.useState("All Technologies");
  const [selectedStatus, setSelectedStatus] = React.useState("All Status");
  const [selectedMember, setSelectedMember] = React.useState("All Members");

  // Selected project for the details drawer (defaults to the first project, e.g. "TheFleetFly")
  const [selectedSlug, setSelectedSlug] = React.useState<string | null>(
    projects[0]?.slug ?? null
  );

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(6);

  // Filtered projects
  const filteredProjects = React.useMemo(() => {
    return projects.filter((project) => {
      // 1. Status Tab filter
      if (selectedStatusTab === "Featured") {
        if (!project.featured) return false;
      } else if (selectedStatusTab !== "All Projects") {
        if (project.status !== selectedStatusTab) return false;
      }

      // 2. Category dropdown
      if (
        selectedCategory !== "All Categories" &&
        project.category !== selectedCategory
      ) {
        return false;
      }

      // 3. Technology dropdown
      if (
        selectedTech !== "All Technologies" &&
        !project.techStack.includes(selectedTech)
      ) {
        return false;
      }

      // 4. Status dropdown
      if (selectedStatus !== "All Status" && project.status !== selectedStatus) {
        return false;
      }

      // 5. Member dropdown
      if (selectedMember !== "All Members") {
        const matchesAuthor = project.author.name === selectedMember;
        const matchesTeam = project.team?.some((m) => m.name === selectedMember);
        if (!matchesAuthor && !matchesTeam) return false;
      }

      // 6. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = project.title.toLowerCase().includes(q);
        const inTagline = project.tagline.toLowerCase().includes(q);
        const inDesc = project.description.toLowerCase().includes(q);
        const inAuthor = project.author.name.toLowerCase().includes(q);
        const inTech = project.techStack.some((t) => t.toLowerCase().includes(q));
        const inAws = project.awsServices.some((s) => s.toLowerCase().includes(q));

        if (!inTitle && !inTagline && !inDesc && !inAuthor && !inTech && !inAws) {
          return false;
        }
      }

      return true;
    });
  }, [
    selectedStatusTab,
    selectedCategory,
    selectedTech,
    selectedStatus,
    selectedMember,
    searchQuery,
  ]);

  // Helper handlers that reset to page 1
  const handleStatusTabSelect = (tab: ProjectStatusTab) => {
    setSelectedStatusTab(tab);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleCategorySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  const handleTechSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTech(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(1);
  };

  const handleMemberSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMember(e.target.value);
    setCurrentPage(1);
  };

  // Total pages
  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / pageSize));
  const activePage = Math.min(currentPage, totalPages);

  // Paginated items
  const paginatedProjects = React.useMemo(() => {
    const startIndex = (activePage - 1) * pageSize;
    return filteredProjects.slice(startIndex, startIndex + pageSize);
  }, [filteredProjects, activePage, pageSize]);

  // Active selected project
  const activeProject = React.useMemo(() => {
    if (!selectedSlug) return null;
    return (
      filteredProjects.find((p) => p.slug === selectedSlug) ||
      projects.find((p) => p.slug === selectedSlug) ||
      null
    );
  }, [selectedSlug, filteredProjects]);

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedStatusTab("All Projects");
    setSearchQuery("");
    setSelectedCategory("All Categories");
    setSelectedTech("All Technologies");
    setSelectedStatus("All Status");
    setSelectedMember("All Members");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    selectedStatusTab !== "All Projects" ||
    searchQuery.trim() !== "" ||
    selectedCategory !== "All Categories" ||
    selectedTech !== "All Technologies" ||
    selectedStatus !== "All Status" ||
    selectedMember !== "All Members";

  const startIndex = (activePage - 1) * pageSize + 1;
  const endIndex = Math.min(activePage * pageSize, filteredProjects.length);

  return (
    <div className="mx-auto max-w-[1560px] px-4 sm:px-6 lg:px-8 py-8">
      <div
        className={cn(
          "grid gap-6 items-start",
          activeProject
            ? "grid-cols-1 lg:grid-cols-[1fr_390px] xl:grid-cols-[1fr_430px]"
            : "grid-cols-1"
        )}
      >
        {/* Left Column: Filters, Cards Grid & Pagination */}
        <div className="min-w-0">
          {/* =========================================================================
              FILTER ROW 1: Status Tabs
             ========================================================================= */}
          <div
            role="tablist"
            aria-label="Filter projects by status"
            className="flex flex-wrap items-center gap-2"
          >
            {projectStatusTabs.map((tab) => {
              const isSelected = selectedStatusTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handleStatusTabSelect(tab)}
                  className={cn(
                    "h-10 rounded-lg px-4 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer select-none",
                    isSelected
                      ? "border border-primary bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "border border-border/80 bg-card/50 text-muted-foreground hover:border-primary/50 hover:bg-card hover:text-white"
                  )}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* =========================================================================
              FILTER ROW 2: Dropdowns, Search Box & Reset Button
             ========================================================================= */}
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            {/* Category Dropdown */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={handleCategorySelect}
                aria-label="Filter by category"
                className="h-9 appearance-none rounded-lg border border-border/80 bg-card/60 pl-3 pr-8 text-xs font-medium text-foreground transition-colors hover:border-primary/40 focus:border-primary focus:outline-none cursor-pointer"
              >
                {projectCategories.map((cat) => (
                  <option key={cat} value={cat} className="bg-background text-foreground">
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            </div>

            {/* Technologies Dropdown */}
            <div className="relative">
              <select
                value={selectedTech}
                onChange={handleTechSelect}
                aria-label="Filter by technology"
                className="h-9 appearance-none rounded-lg border border-border/80 bg-card/60 pl-3 pr-8 text-xs font-medium text-foreground transition-colors hover:border-primary/40 focus:border-primary focus:outline-none cursor-pointer"
              >
                {projectTechnologies.map((tech) => (
                  <option key={tech} value={tech} className="bg-background text-foreground">
                    {tech}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            </div>

            {/* Status Dropdown */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={handleStatusSelect}
                aria-label="Filter by status"
                className="h-9 appearance-none rounded-lg border border-border/80 bg-card/60 pl-3 pr-8 text-xs font-medium text-foreground transition-colors hover:border-primary/40 focus:border-primary focus:outline-none cursor-pointer"
              >
                {projectStatuses.map((st) => (
                  <option key={st} value={st} className="bg-background text-foreground">
                    {st}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            </div>

            {/* Members Dropdown */}
            <div className="relative">
              <select
                value={selectedMember}
                onChange={handleMemberSelect}
                aria-label="Filter by member"
                className="h-9 appearance-none rounded-lg border border-border/80 bg-card/60 pl-3 pr-8 text-xs font-medium text-foreground transition-colors hover:border-primary/40 focus:border-primary focus:outline-none cursor-pointer"
              >
                {projectMembers.map((m) => (
                  <option key={m} value={m} className="bg-background text-foreground">
                    {m}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            </div>

            {/* Search Input Box */}
            <div className="relative w-36 sm:w-44 md:w-48 lg:w-52">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search projects..."
                aria-label="Search projects"
                className={cn(
                  "h-9 w-full rounded-lg border border-border/80 bg-card/60 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground",
                  "transition-colors hover:border-primary/40 focus:border-primary focus:bg-card/90 focus:outline-none focus:ring-1 focus:ring-primary"
                )}
              />
            </div>

            {/* Reset Link/Button */}
            <button
              type="button"
              onClick={handleResetFilters}
              className={cn(
                "inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer transition-colors whitespace-nowrap shrink-0",
                hasActiveFilters
                  ? "text-primary hover:underline"
                  : "text-muted-foreground hover:text-white"
              )}
            >
              <RotateCcw className="size-3" />
              <span>{projectsCopy.resetFilters}</span>
            </button>
          </div>

          {/* =========================================================================
              MAIN CARDS GRID
             ========================================================================= */}
          <div className="mt-6">
            {filteredProjects.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-12 text-center bg-card/30">
                <h3 className="text-base font-semibold text-white">
                  {projectsCopy.empty.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {projectsCopy.empty.description}
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-primary/50 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/20 cursor-pointer"
                >
                  <RotateCcw className="size-3.5" />
                  <span>{projectsCopy.empty.reset}</span>
                </button>
              </div>
            ) : (
              <div
                className={cn(
                  "grid gap-5",
                  activeProject
                    ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                )}
              >
                {paginatedProjects.map((project) => (
                  <ProjectCard
                    key={project.slug}
                    project={project}
                    isSelected={activeProject?.slug === project.slug}
                    onSelect={(p) => setSelectedSlug(p.slug)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Mobile Modal/Drawer for Project Details when active */}
          {activeProject && (
            <div className="mt-8 block lg:hidden">
              <ProjectDetailsDrawer
                project={activeProject}
                onClose={() => setSelectedSlug(null)}
              />
            </div>
          )}

          {/* =========================================================================
              PAGINATION BAR
             ========================================================================= */}
          {filteredProjects.length > 0 && (
            <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border/70 pt-5 sm:flex-row text-xs text-muted-foreground">
              {/* Showing X to Y of Z projects */}
              <div>
                {projectsCopy.pagination.showing(
                  startIndex,
                  endIndex,
                  filteredProjects.length
                )}
              </div>

              {/* Page Number Buttons */}
              <div className="flex items-center gap-1.5">
                {/* Prev Page */}
                <button
                  type="button"
                  disabled={activePage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous page"
                  className="flex size-8 items-center justify-center rounded-lg border border-border/80 bg-card/60 text-muted-foreground transition-colors hover:border-primary/50 hover:text-white disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronLeft className="size-4" />
                </button>

                {/* Page Numbers */}
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNumber = i + 1;
                  const isCurrent = activePage === pageNumber;

                  // Only show page 1, current, totalPages, and immediate neighbors
                  if (
                    totalPages > 6 &&
                    pageNumber !== 1 &&
                    pageNumber !== totalPages &&
                    Math.abs(pageNumber - activePage) > 1
                  ) {
                    if (
                      pageNumber === 2 ||
                      pageNumber === totalPages - 1
                    ) {
                      return (
                        <span key={pageNumber} className="px-1 text-muted-foreground">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }

                  return (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setCurrentPage(pageNumber)}
                      className={cn(
                        "flex size-8 items-center justify-center rounded-lg text-xs font-semibold transition-colors cursor-pointer",
                        isCurrent
                          ? "border border-primary bg-primary text-primary-foreground shadow-xs"
                          : "border border-border/80 bg-card/60 text-muted-foreground hover:border-primary/50 hover:text-white"
                      )}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                {/* Next Page */}
                <button
                  type="button"
                  disabled={activePage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Next page"
                  className="flex size-8 items-center justify-center rounded-lg border border-border/80 bg-card/60 text-muted-foreground transition-colors hover:border-primary/50 hover:text-white disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>

              {/* Page Size Selector */}
              <div className="relative">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  aria-label="Projects per page"
                  className="h-8 appearance-none rounded-lg border border-border/80 bg-card/60 pl-3 pr-7 text-xs font-medium text-foreground transition-colors hover:border-primary/40 focus:border-primary focus:outline-none cursor-pointer"
                >
                  <option value={6} className="bg-background text-foreground">
                    {projectsCopy.pagination.perPage(6)}
                  </option>
                  <option value={12} className="bg-background text-foreground">
                    {projectsCopy.pagination.perPage(12)}
                  </option>
                  <option value={24} className="bg-background text-foreground">
                    {projectsCopy.pagination.perPage(24)}
                  </option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Project Details Drawer (Desktop sticky side panel) */}
        {activeProject && (
          <div className="hidden lg:block sticky top-24">
            <ProjectDetailsDrawer
              project={activeProject}
              onClose={() => setSelectedSlug(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
