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
import { Reveal } from "@/components/motion/Reveal";
import { staggerDelay } from "@/lib/motion/tokens";
import type { Member } from "@/data/members";
import {
  memberSearchPlaceholder,
  allMembersPreviewCount,
  joinCards,
} from "@/data/members";
import { publicMemberTabs, profileCopy } from "@/data/profile";
import { filterMembers } from "@/lib/members/public-filter";
import { skillsOf } from "@/lib/members/public-card";

export interface MembersExplorerProps {
  members: Member[];
}

export function MembersExplorer({ members }: MembersExplorerProps) {
  const [activeTab, setActiveTab] = React.useState<string>("All Members");
  const [query, setQuery] = React.useState<string>("");
  const [skills, setSkills] = React.useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = React.useState<boolean>(false);
  const [showAll, setShowAll] = React.useState<boolean>(false);

  const memberSkills = React.useMemo(() => skillsOf(members), [members]);

  const tab =
    publicMemberTabs.find((t) => t.label === activeTab) ?? publicMemberTabs[0];
  const matched = filterMembers(members, tab.group, query, skills);
  const core = matched.filter((m) => m.group === "core");
  const isDefaultView =
    tab.group === null && query.trim() === "" && skills.length === 0;

  const communityMembers = matched.filter(
    (m) => m.group === "community" || m.group === "lead" || m.group === "mentor"
  );
  const alumniMembers = matched.filter((m) => m.group === "alumni");
  const speakerMembers = matched.filter((m) => m.group === "speaker");

  const visibleCommunity =
    isDefaultView && !showAll
      ? communityMembers.slice(0, allMembersPreviewCount)
      : communityMembers;

  const handleClear = () => {
    setActiveTab("All Members");
    setQuery("");
    setSkills([]);
    setShowAll(false);
  };

  const options = React.useMemo(() => publicMemberTabs.map((t) => t.label), []);

  if (members.length === 0) {
    return (
      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px] items-start">
        <div className="rounded-2xl border border-border bg-card/60 p-8 sm:p-12 text-center text-muted-foreground backdrop-blur-sm">
          {profileCopy.members.empty}
        </div>
        <aside
          aria-label="Join the community"
          className="flex flex-col gap-4 sm:flex-row lg:flex-col lg:gap-5 shrink-0"
        >
          {joinCards.slice(1).map((card, idx) => (
            <JoinCard key={idx} data={card} className="w-full" />
          ))}
        </aside>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {/* Controls row */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <FilterChips
            variant="solid"
            size="sm"
            ariaLabel="Filter members by group"
            options={options}
            value={activeTab}
            onChange={setActiveTab}
          />
        </div>

        {/* Right group */}
        <div className="flex w-full sm:w-auto items-center gap-3 shrink-0">
          <SearchInput
            value={query}
            onChange={setQuery}
            ariaLabel="Search members"
            placeholder={memberSearchPlaceholder}
            className="h-10 min-w-0 flex-1 sm:w-[240px] lg:w-[270px] xl:w-[320px] sm:flex-none"
          />

          <button
            type="button"
            aria-expanded={filtersOpen}
            aria-controls="member-skill-filters"
            onClick={() => setFiltersOpen((prev) => !prev)}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-border bg-card/40 px-4 text-xs sm:text-sm font-medium text-foreground transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background cursor-pointer"
          >
            <SlidersHorizontal
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <span>Filters</span>
            {skills.length > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground leading-none">
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
                      : "border-border bg-card/40 text-muted-foreground hover:border-primary/50 hover:text-primary"
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
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_300px] 2xl:grid-cols-[minmax(0,1fr)_320px] lg:gap-6 xl:gap-8">
        {/* Left column */}
        <div className="min-w-0 flex flex-col gap-8">
          {/* Default view: Core Team + All Members + Alumni + Speakers */}
          {isDefaultView ? (
            <>
              {/* Core Team section */}
              {core.length > 0 && (
                <section aria-labelledby="core-team-heading">
                  <div className="mb-3 flex items-center justify-between">
                    <SectionEyebrow
                      id="core-team-heading"
                      size="sm"
                      role="heading"
                      aria-level={2}
                    >
                      Core Team
                    </SectionEyebrow>
                    <button
                      type="button"
                      onClick={() => setActiveTab("Core Team")}
                      className="inline-flex items-center gap-1 text-xs sm:text-[13px] font-medium text-primary transition-colors hover:text-primary-hover cursor-pointer focus-visible:outline-none focus-visible:underline"
                    >
                      <span>View All</span>
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </button>
                  </div>
                  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6">
                    {core.map((member, index) => (
                      <Reveal
                        as="li"
                        key={member.slug}
                        delay={staggerDelay(index, 0.06, 0.4)}
                        className="flex"
                      >
                        <MemberCoreCard member={member} className="w-full" />
                      </Reveal>
                    ))}
                  </ul>
                </section>
              )}

              {/* All Members section */}
              {visibleCommunity.length > 0 && (
                <section aria-labelledby="all-members-heading">
                  <div className="mb-3 flex items-center justify-between">
                    <SectionEyebrow
                      id="all-members-heading"
                      size="sm"
                      role="heading"
                      aria-level={2}
                    >
                      All Members
                    </SectionEyebrow>
                    {communityMembers.length > allMembersPreviewCount && (
                      <button
                        type="button"
                        aria-expanded={showAll}
                        onClick={() => setShowAll((prev) => !prev)}
                        className="inline-flex items-center gap-1 text-xs sm:text-[13px] font-medium text-primary transition-colors hover:text-primary-hover cursor-pointer focus-visible:outline-none focus-visible:underline"
                      >
                        <span>{showAll ? "Show Less" : "View All"}</span>
                        {!showAll && (
                          <ArrowRight className="size-3.5" aria-hidden="true" />
                        )}
                      </button>
                    )}
                  </div>
                  <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
                    {visibleCommunity.map((member, index) => (
                      <Reveal
                        as="li"
                        key={member.slug}
                        delay={staggerDelay(index, 0.06, 0.4)}
                        className="flex"
                      >
                        <MemberRowCard member={member} className="w-full" />
                      </Reveal>
                    ))}
                  </ul>
                </section>
              )}

              {/* Alumni section */}
              {alumniMembers.length > 0 && (
                <section aria-labelledby="alumni-members-heading">
                  <div className="mb-3 flex items-center justify-between">
                    <SectionEyebrow
                      id="alumni-members-heading"
                      size="sm"
                      role="heading"
                      aria-level={2}
                    >
                      Alumni
                    </SectionEyebrow>
                    <button
                      type="button"
                      onClick={() => setActiveTab("Alumni")}
                      className="inline-flex items-center gap-1 text-xs sm:text-[13px] font-medium text-primary transition-colors hover:text-primary-hover cursor-pointer focus-visible:outline-none focus-visible:underline"
                    >
                      <span>View All</span>
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </button>
                  </div>
                  <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
                    {alumniMembers.slice(0, 4).map((member, index) => (
                      <Reveal
                        as="li"
                        key={member.slug}
                        delay={staggerDelay(index, 0.06, 0.4)}
                        className="flex"
                      >
                        <MemberRowCard member={member} className="w-full" />
                      </Reveal>
                    ))}
                  </ul>
                </section>
              )}

              {/* Speakers section */}
              {speakerMembers.length > 0 && (
                <section aria-labelledby="speakers-members-heading">
                  <div className="mb-3 flex items-center justify-between">
                    <SectionEyebrow
                      id="speakers-members-heading"
                      size="sm"
                      role="heading"
                      aria-level={2}
                    >
                      Speakers
                    </SectionEyebrow>
                    <button
                      type="button"
                      onClick={() => setActiveTab("Speakers")}
                      className="inline-flex items-center gap-1 text-xs sm:text-[13px] font-medium text-primary transition-colors hover:text-primary-hover cursor-pointer focus-visible:outline-none focus-visible:underline"
                    >
                      <span>View All</span>
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </button>
                  </div>
                  <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
                    {speakerMembers.slice(0, 4).map((member, index) => (
                      <Reveal
                        as="li"
                        key={member.slug}
                        delay={staggerDelay(index, 0.06, 0.4)}
                        className="flex"
                      >
                        <MemberRowCard member={member} className="w-full" />
                      </Reveal>
                    ))}
                  </ul>
                </section>
              )}
            </>
          ) : (
            /* Filtered or Searched view */
            matched.length > 0 && (
              <section aria-labelledby="filtered-members-heading">
                <div className="mb-3 flex items-center justify-between">
                  <SectionEyebrow
                    id="filtered-members-heading"
                    size="sm"
                    role="heading"
                    aria-level={2}
                  >
                    {tab.label}
                  </SectionEyebrow>
                </div>
                <ul
                  className={cn(
                    "grid gap-3",
                    tab.group === "core"
                      ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6"
                      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4"
                  )}
                >
                  {matched.map((member, index) => (
                    <Reveal
                      as="li"
                      key={member.slug}
                      delay={staggerDelay(index, 0.06, 0.4)}
                      className="flex"
                    >
                      {tab.group === "core" ? (
                        <MemberCoreCard member={member} className="w-full" />
                      ) : (
                        <MemberRowCard member={member} className="w-full" />
                      )}
                    </Reveal>
                  ))}
                </ul>
              </section>
            )
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
          className="flex flex-col gap-4 sm:flex-row lg:flex-col lg:gap-5 shrink-0"
        >
          {joinCards.slice(1).map((card, idx) => (
            <JoinCard key={idx} data={card} className="w-full" />
          ))}
        </aside>
      </div>
    </div>
  );
}
