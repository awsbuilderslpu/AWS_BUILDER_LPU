"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  X,
  Star,
  ExternalLink,
  Code2,
  Cloud,
  Users,
  Info,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import {
  createProjectAction,
  updateProjectAction,
} from "@/lib/projects/actions";
import type {
  ProjectItem,
  ProjectFormData,
  ProjectStatus,
  ProjectAuthor,
} from "@/lib/projects/types";
import {
  projectCategories,
  projectStatuses,
} from "@/data/projects";

interface ProjectDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: ProjectItem | null;
  onSaved: (savedProject: ProjectItem, isNew: boolean) => void;
}

const COMMON_TECH_STACK = [
  "Next.js",
  "React",
  "Node.js",
  "TypeScript",
  "Python",
  "FastAPI",
  "Docker",
  "Tailwind",
  "MongoDB",
  "PostgreSQL",
  "Terraform",
  "LLM",
  "Mapbox",
  "Arduino",
];

const COMMON_AWS_SERVICES = [
  "AWS Lambda",
  "Amazon Bedrock",
  "Amazon DynamoDB",
  "Amazon S3",
  "Amazon ECS",
  "AWS IoT Core",
  "Amazon CloudWatch",
  "Amazon API Gateway",
  "AWS Amplify",
  "AWS App Runner",
  "Amazon SageMaker",
];

export function ProjectDrawer({
  open,
  onOpenChange,
  project,
  onSaved,
}: ProjectDrawerProps) {
  const isEditing = Boolean(project);
  const [loading, setLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("basics");

  // Form State
  const [title, setTitle] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [tagline, setTagline] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState("Cloud & AI");
  const [status, setStatus] = React.useState<ProjectStatus>("Ongoing");
  const [featured, setFeatured] = React.useState(false);
  const [image, setImage] = React.useState("/images/projects/thefleetfly.jpg");

  // Tech Stack & AWS
  const [techStack, setTechStack] = React.useState<string[]>([]);
  const [techInput, setTechInput] = React.useState("");
  const [awsServices, setAwsServices] = React.useState<string[]>([]);
  const [awsInput, setAwsInput] = React.useState("");

  // Author & Team
  const [authorName, setAuthorName] = React.useState("");
  const [authorRole, setAuthorRole] = React.useState("");
  const [authorAvatar, setAuthorAvatar] = React.useState("");
  const [team, setTeam] = React.useState<ProjectAuthor[]>([]);
  const [newTeamName, setNewTeamName] = React.useState("");
  const [newTeamRole, setNewTeamRole] = React.useState("");

  // Dates & Links & Stats
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [date, setDate] = React.useState("");
  const [githubUrl, setGithubUrl] = React.useState("");
  const [demoUrl, setDemoUrl] = React.useState("");
  const [likes, setLikes] = React.useState(0);
  const [views, setViews] = React.useState("1.2K");
  const [rating, setRating] = React.useState(4.8);

  // Auto-slugify on title change when not editing
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generatedSlug);
    }
  };

  React.useEffect(() => {
    if (project) {
      setTitle(project.title);
      setSlug(project.slug);
      setTagline(project.tagline);
      setDescription(project.description);
      setCategory(project.category);
      setStatus(project.status);
      setFeatured(Boolean(project.featured));
      setImage(project.image || "/images/projects/thefleetfly.jpg");
      setTechStack(project.techStack || []);
      setAwsServices(project.awsServices || []);
      setAuthorName(project.author?.name || "");
      setAuthorRole(project.author?.role || "");
      setAuthorAvatar(project.author?.avatar || "");
      setTeam(project.team ? [...project.team] : []);
      setStartDate(project.startDate || "");
      setEndDate(project.endDate || "");
      setDate(project.date || project.startDate || "");
      setGithubUrl(project.githubUrl || "");
      setDemoUrl(project.demoUrl || "");
      setLikes(project.stats?.likes ?? 0);
      setViews(project.stats?.views ?? "1.0K");
      setRating(project.stats?.rating ?? 4.8);
    } else {
      setTitle("");
      setSlug("");
      setTagline("");
      setDescription("");
      setCategory("Cloud & AI");
      setStatus("Ongoing");
      setFeatured(false);
      setImage("/images/projects/thefleetfly.jpg");
      setTechStack(["Next.js", "React", "AWS"]);
      setAwsServices(["AWS Lambda", "Amazon DynamoDB"]);
      setAuthorName("");
      setAuthorRole("Lead Developer");
      setAuthorAvatar("");
      setTeam([]);
      setStartDate(
        new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      );
      setEndDate("—");
      setDate(
        new Date().toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })
      );
      setGithubUrl("");
      setDemoUrl("");
      setLikes(10);
      setViews("500");
      setRating(4.8);
    }
    setActiveTab("basics");
  }, [project, open]);

  // Tech stack handlers
  const addTechTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !techStack.includes(trimmed)) {
      setTechStack([...techStack, trimmed]);
    }
  };

  const removeTechTag = (tag: string) => {
    setTechStack(techStack.filter((t) => t !== tag));
  };

  // AWS service handlers
  const addAwsTag = (service: string) => {
    const trimmed = service.trim();
    if (trimmed && !awsServices.includes(trimmed)) {
      setAwsServices([...awsServices, trimmed]);
    }
  };

  const removeAwsTag = (service: string) => {
    setAwsServices(awsServices.filter((s) => s !== service));
  };

  // Team member handlers
  const addTeamMember = () => {
    if (!newTeamName.trim()) {
      toast.error("Please enter team member name.");
      return;
    }
    setTeam([
      ...team,
      {
        name: newTeamName.trim(),
        role: newTeamRole.trim() || "Developer",
      },
    ]);
    setNewTeamName("");
    setNewTeamRole("");
  };

  const removeTeamMember = (index: number) => {
    setTeam(team.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Project title is required.");
      return;
    }
    if (!slug.trim()) {
      toast.error("Project slug is required.");
      return;
    }
    if (!tagline.trim()) {
      toast.error("Project tagline is required.");
      return;
    }
    if (!authorName.trim()) {
      toast.error("Lead Author name is required.");
      return;
    }

    setLoading(true);

    const formData: ProjectFormData = {
      slug: slug.trim().toLowerCase(),
      title: title.trim(),
      tagline: tagline.trim(),
      description: description.trim() || tagline.trim(),
      category: category.trim(),
      status,
      featured,
      image: image.trim() || "/images/projects/thefleetfly.jpg",
      techStack,
      awsServices,
      author: {
        name: authorName.trim(),
        role: authorRole.trim() || "Developer",
        avatar: authorAvatar.trim() || undefined,
      },
      team,
      startDate: startDate.trim() || "Ongoing",
      endDate: endDate.trim() || undefined,
      date: date.trim() || startDate.trim() || "2025",
      githubUrl: githubUrl.trim() || undefined,
      demoUrl: demoUrl.trim() || undefined,
      stats: {
        likes: Number(likes) || 0,
        views: String(views).trim() || "0",
        rating: Number(rating) || 5.0,
      },
    };

    const targetId = project?.id || project?.slug;

    try {
      if (isEditing && targetId) {
        const res = await updateProjectAction(targetId, formData);
        if (res.ok) {
          toast.success("Project updated successfully.");
          const updatedItem: ProjectItem = {
            ...project,
            ...formData,
            updatedAt: new Date().toISOString(),
          };
          onSaved(updatedItem, false);
          onOpenChange(false);
        } else {
          toast.error(res.error || "Failed to update project.");
        }
      } else {
        const res = await createProjectAction(formData);
        if (res.ok) {
          toast.success("Project created successfully.");
          const newItem: ProjectItem = {
            id: res.id,
            ...formData,
            createdAt: new Date().toISOString(),
          };
          onSaved(newItem, true);
          onOpenChange(false);
        } else {
          // If table doesn't exist yet, we still provide immediate optimistic update to the admin UI!
          toast.info("Created project locally. (Apply migration 016 to persist to Supabase).");
          const newItem: ProjectItem = {
            id: `temp-${Date.now()}`,
            ...formData,
            createdAt: new Date().toISOString(),
          };
          onSaved(newItem, true);
          onOpenChange(false);
        }
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const categories = projectCategories.filter((c) => c !== "All Categories");
  const statuses = projectStatuses.filter((s) => s !== "All Status") as ProjectStatus[];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl bg-[#090E17] border-l border-white/10 text-white p-0 flex flex-col h-full shadow-2xl overflow-hidden"
      >
        {/* Drawer Header */}
        <SheetHeader className="p-6 border-b border-white/10 bg-black/30 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Code2 className="size-5 text-[#FF9900]" />
                {isEditing ? "Edit Project" : "Add New Project"}
              </SheetTitle>
              <SheetDescription className="text-sm text-slate-400 mt-1">
                {isEditing
                  ? `Update details and configurations for "${project?.title}"`
                  : "Publish a new student project or cloud architecture to the club portfolio."}
              </SheetDescription>
            </div>
            {featured && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FF9900]/15 text-[#FF9900] border border-[#FF9900]/30 shadow-[0_0_10px_rgba(255,153,0,0.2)]">
                <Star className="size-3.5 fill-[#FF9900]" />
                Featured
              </span>
            )}
          </div>
        </SheetHeader>

        {/* Tab Navigation */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="px-6 pt-3 pb-2 border-b border-white/10 bg-white/[0.02]">
              <TabsList className="bg-white/5 border border-white/10 p-1 w-full grid grid-cols-4 h-10">
                <TabsTrigger
                  value="basics"
                  className="data-[state=active]:bg-[#FF9900] data-[state=active]:text-black text-xs font-medium flex items-center gap-1.5"
                >
                  <Info className="size-3.5" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="tech"
                  className="data-[state=active]:bg-[#FF9900] data-[state=active]:text-black text-xs font-medium flex items-center gap-1.5"
                >
                  <Cloud className="size-3.5" />
                  Stack & Cloud
                </TabsTrigger>
                <TabsTrigger
                  value="team"
                  className="data-[state=active]:bg-[#FF9900] data-[state=active]:text-black text-xs font-medium flex items-center gap-1.5"
                >
                  <Users className="size-3.5" />
                  Team
                </TabsTrigger>
                <TabsTrigger
                  value="links"
                  className="data-[state=active]:bg-[#FF9900] data-[state=active]:text-black text-xs font-medium flex items-center gap-1.5"
                >
                  <ExternalLink className="size-3.5" />
                  Links & Dates
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Scrollable Tab Contents */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* TAB 1: BASICS */}
              <TabsContent value="basics" className="space-y-4 m-0 focus-visible:outline-none">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. CloudOps Radar"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-black/40 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] text-sm transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      URL Slug *
                    </label>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="e.g. cloudops-radar"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-black/40 border border-white/15 text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat} className="bg-slate-900 text-white">
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Development Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]"
                    >
                      {statuses.map((st) => (
                        <option key={st} value={st} className="bg-slate-900 text-white">
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-3 p-2.5 rounded-lg border border-white/10 bg-white/[0.03] cursor-pointer hover:bg-white/[0.06] transition-colors">
                      <input
                        type="checkbox"
                        checked={featured}
                        onChange={(e) => setFeatured(e.target.checked)}
                        className="size-4 rounded border-white/20 text-[#FF9900] focus:ring-[#FF9900] accent-[#FF9900]"
                      />
                      <div>
                        <span className="text-sm font-medium text-white block">
                          Featured Showcase
                        </span>
                        <span className="text-xs text-slate-400">
                          Highlight this project on the homepage
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Tagline (Short Punchy Description) *
                  </label>
                  <input
                    type="text"
                    required
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Serverless cost optimization analyzer with automated AWS resource cleanup."
                    className="w-full px-3.5 py-2.5 rounded-lg bg-black/40 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Full Description & Architecture Details
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide detailed breakdown of features, cloud architecture, purpose, and impact..."
                    className="w-full px-3.5 py-2.5 rounded-lg bg-black/40 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Cover Image URL / Path
                  </label>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="/images/projects/thefleetfly.jpg"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-black/40 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]"
                  />
                  <div className="flex gap-2 mt-2">
                    {["/images/projects/thefleetfly.jpg", "/images/projects/vulnix.jpg", "/images/projects/cloudsec.jpg"].map(
                      (preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setImage(preset)}
                          className="text-[11px] px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                        >
                          Preset: {preset.split("/").pop()}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* TAB 2: TECH STACK & AWS */}
              <TabsContent value="tech" className="space-y-6 m-0 focus-visible:outline-none">
                {/* Tech Stack */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Technologies & Frameworks
                    </label>
                    <span className="text-xs text-slate-400">
                      {techStack.length} added
                    </span>
                  </div>

                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          addTechTag(techInput);
                          setTechInput("");
                        }
                      }}
                      placeholder="Type technology and press Enter (e.g. Next.js, Docker)"
                      className="flex-1 px-3.5 py-2 rounded-lg bg-black/40 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#FF9900]"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        addTechTag(techInput);
                        setTechInput("");
                      }}
                      className="border-white/15 text-white hover:bg-white/10"
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>

                  {/* Active Tech Stack Pills */}
                  <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 rounded-lg border border-white/10 bg-white/[0.02]">
                    {techStack.length === 0 ? (
                      <span className="text-xs text-slate-500 italic p-1">
                        No technologies added yet.
                      </span>
                    ) : (
                      techStack.map((tech) => (
                        <span
                          key={tech}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-500/15 text-blue-300 border border-blue-500/30"
                        >
                          {tech}
                          <button
                            type="button"
                            onClick={() => removeTechTag(tech)}
                            className="text-blue-300 hover:text-white"
                          >
                            <X className="size-3" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  {/* Quick-add chips */}
                  <div className="mt-3">
                    <span className="text-[11px] text-slate-400 block mb-1.5">
                      Suggested Technologies:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {COMMON_TECH_STACK.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => addTechTag(item)}
                          disabled={techStack.includes(item)}
                          className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                            techStack.includes(item)
                              ? "bg-white/5 text-slate-600 border-white/5 cursor-not-allowed"
                              : "bg-white/[0.04] text-slate-300 border-white/10 hover:border-[#FF9900]/50 hover:text-[#FF9900]"
                          }`}
                        >
                          + {item}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AWS Services */}
                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      AWS Services & Infrastructure
                    </label>
                    <span className="text-xs text-slate-400">
                      {awsServices.length} added
                    </span>
                  </div>

                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={awsInput}
                      onChange={(e) => setAwsInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          addAwsTag(awsInput);
                          setAwsInput("");
                        }
                      }}
                      placeholder="Type AWS service and press Enter (e.g. AWS Lambda)"
                      className="flex-1 px-3.5 py-2 rounded-lg bg-black/40 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#FF9900]"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        addAwsTag(awsInput);
                        setAwsInput("");
                      }}
                      className="border-white/15 text-white hover:bg-white/10"
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>

                  {/* Active AWS Pills */}
                  <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 rounded-lg border border-white/10 bg-white/[0.02]">
                    {awsServices.length === 0 ? (
                      <span className="text-xs text-slate-500 italic p-1">
                        No AWS services added yet.
                      </span>
                    ) : (
                      awsServices.map((service) => (
                        <span
                          key={service}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[#FF9900]/15 text-[#FF9900] border border-[#FF9900]/30"
                        >
                          {service}
                          <button
                            type="button"
                            onClick={() => removeAwsTag(service)}
                            className="text-[#FF9900] hover:text-white"
                          >
                            <X className="size-3" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  {/* Quick-add AWS chips */}
                  <div className="mt-3">
                    <span className="text-[11px] text-slate-400 block mb-1.5">
                      Suggested AWS Services:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {COMMON_AWS_SERVICES.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => addAwsTag(item)}
                          disabled={awsServices.includes(item)}
                          className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                            awsServices.includes(item)
                              ? "bg-white/5 text-slate-600 border-white/5 cursor-not-allowed"
                              : "bg-white/[0.04] text-slate-300 border-white/10 hover:border-[#FF9900]/50 hover:text-[#FF9900]"
                          }`}
                        >
                          + {item}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* TAB 3: AUTHOR & TEAM */}
              <TabsContent value="team" className="space-y-6 m-0 focus-visible:outline-none">
                {/* Lead Author */}
                <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Users className="size-4 text-[#FF9900]" />
                    Project Lead / Primary Author
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Author Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        placeholder="e.g. MD Arfaa Taj"
                        className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-[#FF9900]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Role / Designation
                      </label>
                      <input
                        type="text"
                        value={authorRole}
                        onChange={(e) => setAuthorRole(e.target.value)}
                        placeholder="e.g. Lead Full-Stack Developer"
                        className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-[#FF9900]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Avatar URL (Optional)
                    </label>
                    <input
                      type="text"
                      value={authorAvatar}
                      onChange={(e) => setAuthorAvatar(e.target.value)}
                      placeholder="/images/members/arfaa.png"
                      className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-[#FF9900]"
                    />
                  </div>
                </div>

                {/* Team Members List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Collaborators & Team Members ({team.length})
                    </label>
                  </div>

                  {/* Add Member Row */}
                  <div className="p-3 rounded-lg border border-white/10 bg-black/30 flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      placeholder="Member Name"
                      className="flex-1 px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF9900]"
                    />
                    <input
                      type="text"
                      value={newTeamRole}
                      onChange={(e) => setNewTeamRole(e.target.value)}
                      placeholder="Role (e.g. Cloud Architect)"
                      className="flex-1 px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF9900]"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={addTeamMember}
                      className="bg-[#FF9900] text-black hover:bg-[#FF9900]/90 text-xs shrink-0"
                    >
                      <Plus className="size-3.5 mr-1" />
                      Add Member
                    </Button>
                  </div>

                  {/* Team List */}
                  <div className="space-y-2">
                    {team.length === 0 ? (
                      <p className="text-xs text-slate-500 italic py-2">
                        No additional team members listed.
                      </p>
                    ) : (
                      team.map((member, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between px-3.5 py-2 rounded-lg border border-white/10 bg-white/[0.02]"
                        >
                          <div>
                            <span className="text-sm font-medium text-white block">
                              {member.name}
                            </span>
                            <span className="text-xs text-slate-400">
                              {member.role || "Developer"}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeTeamMember(idx)}
                            className="text-slate-400 hover:text-red-400 transition-colors p-1"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* TAB 4: LINKS, DATES & METRICS */}
              <TabsContent value="links" className="space-y-4 m-0 focus-visible:outline-none">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      GitHub Repository URL
                    </label>
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/organization/repo"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-black/40 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#FF9900]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Live Demo / Deployment URL
                    </label>
                    <input
                      type="url"
                      value={demoUrl}
                      onChange={(e) => setDemoUrl(e.target.value)}
                      placeholder="https://project-demo.vercel.app"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-black/40 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#FF9900]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Start Date
                    </label>
                    <input
                      type="text"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      placeholder="01 Jun 2025"
                      className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-[#FF9900]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      End Date
                    </label>
                    <input
                      type="text"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      placeholder="— or Aug 2025"
                      className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-[#FF9900]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Display Date
                    </label>
                    <input
                      type="text"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      placeholder="Aug 2025"
                      className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-[#FF9900]"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                    Portfolio Stats
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Likes
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={likes}
                        onChange={(e) => setLikes(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-[#FF9900]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Views
                      </label>
                      <input
                        type="text"
                        value={views}
                        onChange={(e) => setViews(e.target.value)}
                        placeholder="1.2K"
                        className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-[#FF9900]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Rating (out of 5)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-[#FF9900]"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          {/* Drawer Footer with Actions */}
          <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-end gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-white/15 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#FF9900] text-black hover:bg-[#FF9900]/90 font-semibold px-5 shadow-[0_0_15px_rgba(255,153,0,0.3)]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="size-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  <span>Saving...</span>
                </div>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Create Project"
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

