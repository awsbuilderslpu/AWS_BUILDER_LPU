"use client";

import * as React from "react";
import { SlidersHorizontal, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { FilterChips } from "@/components/ui/FilterChips";
import { SearchInput } from "@/components/ui/SearchInput";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { MemberCoreCard } from "@/components/features/members/MemberCoreCard";
import { MemberRowCard } from "@/components/features/members/MemberRowCard";
import { JoinCard } from "@/components/features/members/JoinCard";
import {
  members,
  memberTabs,
  memberSkills,
  memberSearchPlaceholder,
  allMembersPreviewCount,
  joinCards,
} from "@/data/members";
import { filterMembers } from "@/lib/members";

export function MembersExplorer() {
  const [activeTab, setActiveTab] = React.useState<string>("All Members");
  const [query, setQuery] = React.useState<string>("");
  const [skills, setSkills] = React.useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = React.useState<boolean>(false);
  const [showAll, setShowAll] = React.useState<boolean>(false);

  const tab =
    memberTabs.find((t) => t.label === activeTab) ?? memberTabs[0];
  const matched = filterMembers(members, tab.group, query, skills);
  const core = matched.filter((m) => m.group === "core");
  const others = matched.filter((m) => m.group !== "core");
  const isDefaultView =
    tab.group === null && query.trim() === "" && skills.length === 0;
  const visibleOthers =
    isDefaultView && !showAll
      ? others.slice(0, allMembersPreviewCount)
      : others;

  const handleClear = () => {
    setActiveTab("All Members");
    setQuery("");
    setSkills([]);
    setShowAll(false);
  };

  const options = React.useMemo(() => memberTabs.map((t) => t.label), []);

  return (
    <div className="mt-6">
      {/* Controls row */}
      <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
        <FilterChips
          variant="solid"
          ariaLabel="Filter members by group"
          options={options}
          value={activeTab}
          onChange={setActiveTab}
        />

        {/* Right group */}
        <div className="flex w-full items-center gap-[15px] 2xl:w-auto 2xl:mr-[clamp(0px,2.6vw,43px)]">
          <SearchInput
            value={query}
            onChange={setQuery}
            ariaLabel="Search members"
            placeholder={memberSearchPlaceholder}
            className="h-[42px] min-w-0 flex-1 2xl:w-[clamp(300px,26.2vw,438px)] 2xl:flex-none"
          />

          <button
            type="button"
            aria-expanded={filtersOpen}
            aria-controls="member-skill-filters"
            onClick={() => setFiltersOpen((prev) => !prev)}
            className="inline-flex h-[42px] shrink-0 items-center gap-2.5 rounded-md border border-border bg-card/40 px-5 text-sm text-foreground transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background cursor-pointer"
          >
            <SlidersHorizontal
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <span>Filters</span>
            {skills.length > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground leading-none">
                {skills.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Skills panel */}
      {filtersOpen && (
        <div
          id="member-skill-filters"
          role="group"
          aria-label="Filter by skill"
          className="mt-4 rounded-lg border border-border bg-card/60 p-4"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Filter by skill
            </span>
            {skills.length > 0 && (
              <button
                type="button"
                onClick={() => setSkills([])}
                className="text-[12.5px] font-medium text-primary transition-colors hover:text-primary-hover cursor-pointer focus-visible:outline-none focus-visible:underline"
              >
                Clear skills
              </button>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {memberSkills.map((skill) => {
              const isPressed = skills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  aria-pressed={isPressed}
                  onClick={() => {
                    setSkills((prev) =>
                      prev.includes(skill)
                        ? prev.filter((s) => s !== skill)
                        : [...prev, skill]
                    );
                  }}
                  className={cn(
                    "h-8 rounded-md border px-3 text-[13px] transition-colors cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
                    isPressed
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border bg-card/40 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  )}
                >
                  {skill}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Status row */}
      {!isDefaultView && (
        <>
          <div className="mt-4 flex items-center gap-3 text-[13px]">
            <span className="text-muted-foreground">
              {matched.length} {matched.length === 1 ? "member" : "members"}
            </span>
            <button
              type="button"
              onClick={handleClear}
              className="font-medium text-primary transition-colors hover:text-primary-hover cursor-pointer focus-visible:outline-none focus-visible:underline"
            >
              Clear
            </button>
          </div>
          <p aria-live="polite" className="sr-only">
            Showing {matched.length} members
          </p>
        </>
      )}

      {/* Main grid */}
      <div className="mt-5 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_clamp(260px,17.2vw,288px)] xl:gap-[23px]">
        {/* Left column */}
        <div className="flex flex-col gap-5">
          {/* Core section */}
          {core.length > 0 && (
            <section aria-labelledby="core-team-heading">
              <div className="mb-2.5 flex items-center justify-between">
                <SectionEyebrow
                  id="core-team-heading"
                  size="sm"
                  role="heading"
                  aria-level={2}
                >
                  Core Team
                </SectionEyebrow>
                {tab.group === null && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("Core Team")}
                    className="inline-flex items-center gap-1 text-[13.5px] font-medium text-primary transition-colors hover:text-primary-hover cursor-pointer focus-visible:outline-none focus-visible:underline"
                  >
                    <span>View All</span>
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
              <ul className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 2xl:grid-cols-6">
                {core.map((member) => (
                  <li key={member.slug} className="flex">
                    <MemberCoreCard member={member} className="w-full" />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Others section */}
          {visibleOthers.length > 0 && (
            <section aria-labelledby="others-members-heading">
              <div className="mb-2.5 flex items-center justify-between">
                <SectionEyebrow
                  id="others-members-heading"
                  size="sm"
                  role="heading"
                  aria-level={2}
                >
                  {tab.group === null ? "All Members" : tab.label}
                </SectionEyebrow>
                {isDefaultView && others.length > allMembersPreviewCount && (
                  <button
                    type="button"
                    aria-expanded={showAll}
                    onClick={() => setShowAll((prev) => !prev)}
                    className="inline-flex items-center gap-1 text-[13.5px] font-medium text-primary transition-colors hover:text-primary-hover cursor-pointer focus-visible:outline-none focus-visible:underline"
                  >
                    <span>{showAll ? "Show Less" : "View All"}</span>
                    {!showAll && (
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    )}
                  </button>
                )}
              </div>
              <ul className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 2xl:grid-cols-4">
                {visibleOthers.map((member) => (
                  <li key={member.slug} className="flex">
                    <MemberRowCard member={member} className="w-full" />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Empty state */}
          {matched.length === 0 && (
            <div className="rounded-lg border border-border bg-card/40 p-8 text-center text-sm text-muted-foreground">
              No members match your search. Try a different filter or keyword.
            </div>
          )}
        </div>

        {/* Right column */}
        <aside
          aria-label="Join the community"
          className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:flex xl:flex-col xl:justify-between xl:gap-[21px] xl:pt-1"
        >
          {joinCards.map((card, idx) => (
            <JoinCard key={idx} data={card} />
          ))}
        </aside>
      </div>
    </div>
  );
}
