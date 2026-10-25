"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Sparkles, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  projects,
  projectCategories,
  type ProjectCategory,
} from "@/data/projects";
import { ProjectCard } from "@/components/features/projects/ProjectCard";
import { Button } from "@/components/ui/button";

export function ProjectsExplorer() {
  const [selectedCategory, setSelectedCategory] =
    React.useState<ProjectCategory>("All");
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredProjects = React.useMemo(() => {
    return projects.filter((project) => {
      const matchesCategory =
        selectedCategory === "All" || project.category === selectedCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const inTitle = project.title.toLowerCase().includes(q);
      const inDesc = project.description.toLowerCase().includes(q);
      const inAws = project.awsServices.some((s) => s.toLowerCase().includes(q));
      const inTech = project.techStack.some((t) => t.toLowerCase().includes(q));
      const inContributors = project.contributors.some((c) =>
        c.toLowerCase().includes(q)
      );

      return inTitle || inDesc || inAws || inTech || inContributors;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="mt-8 flex flex-col">
      {/* Controls Bar: Category tabs + Search */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Category Filter Chips */}
        <div
          role="tablist"
          aria-label="Filter projects by category"
          className="flex flex-wrap items-center gap-2"
        >
          {projectCategories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "h-9 rounded-lg border px-3.5 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer select-none",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground font-semibold shadow-[0_0_12px_rgba(255,153,0,0.3)]"
                    : "border-border bg-card/40 text-muted-foreground hover:border-primary/50 hover:bg-card hover:text-primary"
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:w-72">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects, AWS services..."
            aria-label="Search projects"
            className={cn(
              "h-10 w-full rounded-lg border border-border bg-card/40 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground",
              "transition-all duration-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            )}
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Showing{" "}
          <strong className="text-foreground">{filteredProjects.length}</strong>{" "}
          {filteredProjects.length === 1 ? "project" : "projects"}
        </span>
        {(searchQuery || selectedCategory !== "All") && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}
            className="text-primary hover:underline cursor-pointer"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      ) : (
        <div className="mt-12 flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-full border border-border bg-card/60 text-muted-foreground">
            <Search className="size-5" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-foreground">
            No projects found
          </h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            We couldn&apos;t find any project matching &ldquo;{searchQuery}&rdquo;. Try another
            keyword or reset your category filters.
          </p>
          <Button
            variant="outlineOrange"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}
            className="mt-4"
          >
            Reset filters
          </Button>
        </div>
      )}

      {/* Submit Your Project Banner */}
      <div className="mt-14 rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 via-card/70 to-card/60 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="size-3.5" />
              <span>Student Builders Call for Code</span>
            </div>
            <h3 className="mt-3 text-xl font-bold text-foreground sm:text-2xl">
              Built something awesome with AWS? Showcase it here!
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Are you working on an architecture, hackathon project, or research tool powered by AWS? Get your project featured on the official AWS Student Builders Group LPU website.
            </p>
          </div>

          <div className="shrink-0">
            <Button asChild variant="primary" size="lg" withArrow>
              <Link href="/contact" className="inline-flex items-center gap-2">
                <PlusCircle className="size-4" />
                <span>Submit Your Project</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
