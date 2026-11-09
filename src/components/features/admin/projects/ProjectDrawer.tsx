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
  UploadCloud,
  Image as ImageIcon,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { uploadImage } from "@/lib/storage/upload";
import { publicObjectUrl } from "@/lib/storage/urls";
import {
  createProjectAction,
  updateProjectAction,
  deleteProjectAction,
} from "@/lib/projects/actions";
import { ConfirmDialog } from "@/components/features/admin/kit/ConfirmDialog";
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
  onDeleted?: (deletedProject: ProjectItem) => void;
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
  onDeleted,
}: ProjectDrawerProps) {
  const isEditing = Boolean(project);
  const [loading, setLoading] = React.useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
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

  // Image Upload States
  const [imageUploadMode, setImageUploadMode] = React.useState<"upload" | "url">("upload");
  const [isUploadingImage, setIsUploadingImage] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [avatarUploading, setAvatarUploading] = React.useState(false);
  const avatarInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file must be under 5 MB.");
      return;
    }

    setIsUploadingImage(true);
    try {
      // 1. Try Supabase Storage upload
      try {
        const res = await uploadImage({
          bucket: "event-banners",
          file,
        });
        if (res?.path) {
          const publicUrl = publicObjectUrl("event-banners", res.path);
          if (publicUrl) {
            setImage(publicUrl);
            toast.success("Cover image uploaded to cloud storage!");
            setIsUploadingImage(false);
            return;
          }
        }
      } catch (storageErr) {
        console.warn("Storage upload fallback to data URL:", storageErr);
      }

      // 2. Resilient Fallback: Local Data URL
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setImage(reader.result);
          toast.success("Cover image selected and preview ready!");
        }
        setIsUploadingImage(false);
      };
      reader.onerror = () => {
        toast.error("Failed to read image file.");
        setIsUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Failed to upload image.");
      setIsUploadingImage(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }
    setAvatarUploading(true);
    try {
      try {
        const res = await uploadImage({
          bucket: "event-banners",
          file,
          aspect: 1,
        });
        if (res?.path) {
          const publicUrl = publicObjectUrl("event-banners", res.path);
          if (publicUrl) {
            setAuthorAvatar(publicUrl);
            toast.success("Author avatar uploaded!");
            setAvatarUploading(false);
            return;
          }
        }
      } catch (storageErr) {
        console.warn("Avatar storage fallback to data URL:", storageErr);
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setAuthorAvatar(reader.result);
          toast.success("Author avatar selected!");
        }
        setAvatarUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Failed to upload avatar.");
      setAvatarUploading(false);
    }
  };

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
            stats: formData.stats ?? { likes: 0, views: "0", rating: 5.0 },
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
            stats: formData.stats ?? { likes: 0, views: "0", rating: 5.0 },
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
            stats: formData.stats ?? { likes: 0, views: "0", rating: 5.0 },
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

  const handleDelete = async () => {
    if (!project) return;
    setDeleteLoading(true);
    const targetId = project.id || project.slug;

    try {
      const res = await deleteProjectAction(targetId);
      if (res.ok) {
        toast.success(`Project "${project.title}" deleted.`);
      } else {
        toast.info(`Removed project "${project.title}" locally.`);
      }
      onDeleted?.(project);
      setDeleteConfirmOpen(false);
      onOpenChange(false);
    } catch {
      toast.info(`Removed project "${project.title}" locally.`);
      onDeleted?.(project);
      setDeleteConfirmOpen(false);
      onOpenChange(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const categories = projectCategories.filter((c) => c !== "All Categories");
  const statuses = projectStatuses.filter((s) => s !== "All Status") as ProjectStatus[];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[94vw] max-w-3xl max-h-[90vh] bg-card border border-border text-foreground p-0 flex flex-col shadow-2xl overflow-hidden rounded-2xl gap-0">
        {/* Modal Header */}
        <DialogHeader className="p-6 border-b border-border bg-card shrink-0 text-left">
          <div className="flex items-center justify-between pr-6">
            <div className="flex items-center gap-3.5">
              <div className="size-10 rounded-xl bg-[#FF9900]/15 border border-[#FF9900]/30 flex items-center justify-center text-[#FF9900] shrink-0">
                <Code2 className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-foreground">
                  {isEditing ? "Edit Project" : "Add New Project"}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  {isEditing
                    ? `Update details and configurations for "${project?.title}"`
                    : "Publish a new student project or cloud architecture to the club portfolio."}
                </DialogDescription>
              </div>
            </div>
            {featured && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FF9900]/15 text-[#FF9900] border border-[#FF9900]/30 shadow-[0_0_10px_rgba(255,153,0,0.2)]">
                <Star className="size-3.5 fill-[#FF9900]" />
                Featured
              </span>
            )}
          </div>
        </DialogHeader>

        {/* Tab Navigation */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="px-6 pt-3 pb-2 border-b border-border bg-muted/40">
              <TabsList className="bg-muted border border-border p-1 w-full grid grid-cols-4 h-10">
                <TabsTrigger
                  value="basics"
                  className="data-[state=active]:bg-[#FF9900] data-[state=active]:text-black text-xs font-medium flex items-center gap-1.5 text-muted-foreground data-[state=active]:font-semibold"
                >
                  <Info className="size-3.5" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="tech"
                  className="data-[state=active]:bg-[#FF9900] data-[state=active]:text-black text-xs font-medium flex items-center gap-1.5 text-muted-foreground data-[state=active]:font-semibold"
                >
                  <Cloud className="size-3.5" />
                  Stack & Cloud
                </TabsTrigger>
                <TabsTrigger
                  value="team"
                  className="data-[state=active]:bg-[#FF9900] data-[state=active]:text-black text-xs font-medium flex items-center gap-1.5 text-muted-foreground data-[state=active]:font-semibold"
                >
                  <Users className="size-3.5" />
                  Team
                </TabsTrigger>
                <TabsTrigger
                  value="links"
                  className="data-[state=active]:bg-[#FF9900] data-[state=active]:text-black text-xs font-medium flex items-center gap-1.5 text-muted-foreground data-[state=active]:font-semibold"
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
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. CloudOps Radar"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] text-sm transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      URL Slug *
                    </label>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="e.g. cloudops-radar"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground font-mono text-xs focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat} className="bg-popover text-popover-foreground">
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Development Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]"
                    >
                      {statuses.map((st) => (
                        <option key={st} value={st} className="bg-popover text-popover-foreground">
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-muted/40 cursor-pointer hover:bg-muted/70 transition-colors">
                      <input
                        type="checkbox"
                        checked={featured}
                        onChange={(e) => setFeatured(e.target.checked)}
                        className="size-4 rounded border-border text-[#FF9900] focus:ring-[#FF9900] accent-[#FF9900]"
                      />
                      <div>
                        <span className="text-sm font-medium text-foreground block">
                          Featured Showcase
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Highlight this project on the homepage
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Tagline (Short Punchy Description) *
                  </label>
                  <input
                    type="text"
                    required
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Serverless cost optimization analyzer with automated AWS resource cleanup."
                    className="w-full px-3.5 py-2.5 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Full Description & Architecture Details
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide detailed breakdown of features, cloud architecture, purpose, and impact..."
                    className="w-full px-3.5 py-2.5 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] leading-relaxed"
                  />
                </div>

                {/* Cover Image Upload & Preview */}
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Cover Image *
                    </label>
                    <div className="flex items-center rounded-lg border border-border bg-muted/50 p-0.5 text-xs">
                      <button
                        type="button"
                        onClick={() => setImageUploadMode("upload")}
                        className={cn(
                          "px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5",
                          imageUploadMode === "upload"
                            ? "bg-[#FF9900] text-black font-semibold shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <UploadCloud className="size-3.5" />
                        Upload Image
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageUploadMode("url")}
                        className={cn(
                          "px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5",
                          imageUploadMode === "url"
                            ? "bg-[#FF9900] text-black font-semibold shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <ImageIcon className="size-3.5" />
                        URL / Preset
                      </button>
                    </div>
                  </div>

                  {imageUploadMode === "upload" ? (
                    <div className="space-y-3">
                      {/* Hidden native input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                      />

                      {/* Active Image Preview with replace/remove */}
                      {image ? (
                        <div className="relative rounded-xl border border-border bg-muted/30 overflow-hidden group">
                          <div className="relative aspect-video w-full overflow-hidden bg-muted">
                            <Image
                              src={image}
                              alt="Project Cover Preview"
                              fill
                              unoptimized
                              className="object-cover"
                              sizes="500px"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploadingImage}
                                className="bg-[#FF9900] text-black hover:bg-[#FF9900]/90 text-xs font-semibold shadow-lg"
                              >
                                <UploadCloud className="size-3.5 mr-1.5" />
                                Upload New Image
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                onClick={() => setImage("")}
                                className="text-xs"
                              >
                                <Trash2 className="size-3.5 mr-1.5" />
                                Remove
                              </Button>
                            </div>
                          </div>
                          <div className="p-2.5 flex items-center justify-between text-xs text-muted-foreground bg-muted/50 border-t border-border">
                            <span className="truncate max-w-[280px]">
                              {image.startsWith("data:") ? "Custom uploaded image" : image}
                            </span>
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="text-[#FF9900] hover:underline flex items-center gap-1 font-medium text-xs"
                            >
                              <RefreshCw className="size-3" /> Change Image
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Empty dropzone */
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                          }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                            const file = e.dataTransfer.files?.[0];
                            if (file) handleFileUpload(file);
                          }}
                          onClick={() => fileInputRef.current?.click()}
                          className={cn(
                            "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-3",
                            isDragging
                              ? "border-[#FF9900] bg-[#FF9900]/10"
                              : "border-border bg-muted/20 hover:border-[#FF9900]/50 hover:bg-muted/40"
                          )}
                        >
                          {isUploadingImage ? (
                            <div className="flex flex-col items-center gap-2">
                              <Loader2 className="size-8 text-[#FF9900] animate-spin" />
                              <span className="text-sm text-muted-foreground">Processing & uploading image...</span>
                            </div>
                          ) : (
                            <>
                              <div className="size-12 rounded-full bg-[#FF9900]/15 flex items-center justify-center text-[#FF9900]">
                                <UploadCloud className="size-6" />
                              </div>
                              <div>
                                <span className="text-sm font-semibold text-foreground block">
                                  Click to upload or drag & drop cover image
                                </span>
                                <span className="text-xs text-muted-foreground mt-1 block">
                                  Supports JPG, PNG, or WebP (max 5 MB · Recommended 1200 × 630)
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* URL / Presets mode */
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        placeholder="https://... or /images/projects/thefleetfly.jpg"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]"
                      />
                      <div className="flex flex-wrap gap-2">
                        {["/images/projects/thefleetfly.jpg", "/images/projects/vulnix.jpg", "/images/projects/cloudsec.jpg"].map(
                          (preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setImage(preset)}
                              className={cn(
                                "text-[11px] px-2.5 py-1 rounded-md border transition-colors",
                                image === preset
                                  ? "bg-[#FF9900]/20 border-[#FF9900] text-[#FF9900] font-medium"
                                  : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border-border"
                              )}
                            >
                              Preset: {preset.split("/").pop()}
                            </button>
                          )
                        )}
                      </div>

                      {image && (
                        <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-border bg-muted mt-2">
                          <Image
                            src={image}
                            alt="Preview"
                            fill
                            unoptimized
                            className="object-cover"
                            sizes="400px"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* TAB 2: TECH STACK & AWS */}
              <TabsContent value="tech" className="space-y-6 m-0 focus-visible:outline-none">
                {/* Tech Stack */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Technologies & Frameworks
                    </label>
                    <span className="text-xs text-muted-foreground">
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
                      className="flex-1 px-3.5 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-[#FF9900]"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        addTechTag(techInput);
                        setTechInput("");
                      }}
                      className="border-border text-foreground hover:bg-muted"
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>

                  {/* Active Tech Stack Pills */}
                  <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 rounded-lg border border-border bg-muted/20">
                    {techStack.length === 0 ? (
                      <span className="text-xs text-muted-foreground italic p-1">
                        No technologies added yet.
                      </span>
                    ) : (
                      techStack.map((tech) => (
                        <span
                          key={tech}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-500/15 text-blue-600 dark:text-blue-300 border border-blue-500/30"
                        >
                          {tech}
                          <button
                            type="button"
                            onClick={() => removeTechTag(tech)}
                            className="text-blue-600 dark:text-blue-300 hover:text-foreground"
                          >
                            <X className="size-3" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  {/* Quick-add chips */}
                  <div className="mt-3">
                    <span className="text-[11px] text-muted-foreground block mb-1.5">
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
                              ? "bg-muted text-muted-foreground/40 border-border/40 cursor-not-allowed"
                              : "bg-muted/50 text-foreground border-border hover:border-[#FF9900]/50 hover:text-[#FF9900]"
                          }`}
                        >
                          + {item}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AWS Services */}
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      AWS Services & Infrastructure
                    </label>
                    <span className="text-xs text-muted-foreground">
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
                      className="flex-1 px-3.5 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-[#FF9900]"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        addAwsTag(awsInput);
                        setAwsInput("");
                      }}
                      className="border-border text-foreground hover:bg-muted"
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>

                  {/* Active AWS Pills */}
                  <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 rounded-lg border border-border bg-muted/20">
                    {awsServices.length === 0 ? (
                      <span className="text-xs text-muted-foreground italic p-1">
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
                            className="text-[#FF9900] hover:text-foreground"
                          >
                            <X className="size-3" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  {/* Quick-add AWS chips */}
                  <div className="mt-3">
                    <span className="text-[11px] text-muted-foreground block mb-1.5">
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
                              ? "bg-muted text-muted-foreground/40 border-border/40 cursor-not-allowed"
                              : "bg-muted/50 text-foreground border-border hover:border-[#FF9900]/50 hover:text-[#FF9900]"
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
                <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-4">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Users className="size-4 text-[#FF9900]" />
                    Project Lead / Primary Author
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        Author Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        placeholder="e.g. MD Arfaa Taj"
                        className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:border-[#FF9900]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        Role / Designation
                      </label>
                      <input
                        type="text"
                        value={authorRole}
                        onChange={(e) => setAuthorRole(e.target.value)}
                        placeholder="e.g. Lead Full-Stack Developer"
                        className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:border-[#FF9900]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Lead Author Avatar (Optional)
                    </label>
                    <div className="flex items-center gap-3">
                      {/* Hidden avatar input */}
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleAvatarUpload(file);
                        }}
                      />

                      {/* Avatar preview circle */}
                      <div className="relative size-10 rounded-full overflow-hidden border border-border bg-muted shrink-0">
                        {authorAvatar ? (
                          <Image
                            src={authorAvatar}
                            alt={authorName || "Author"}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <div className="size-full flex items-center justify-center text-xs font-bold text-muted-foreground bg-muted">
                            {authorName ? authorName.charAt(0).toUpperCase() : "?"}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          value={authorAvatar}
                          onChange={(e) => setAuthorAvatar(e.target.value)}
                          placeholder="/images/members/arfaa.png or URL"
                          className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-foreground text-xs focus:outline-none focus:border-[#FF9900]"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={avatarUploading}
                          onClick={() => avatarInputRef.current?.click()}
                          className="border-border text-foreground hover:bg-muted text-xs shrink-0"
                        >
                          {avatarUploading ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <>
                              <UploadCloud className="size-3.5 mr-1" />
                              Upload
                            </>
                          )}
                        </Button>
                        {authorAvatar && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setAuthorAvatar("")}
                            className="text-muted-foreground hover:text-red-500 px-2"
                            title="Remove avatar"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Team Members List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Collaborators & Team Members ({team.length})
                    </label>
                  </div>

                  {/* Add Member Row */}
                  <div className="p-3 rounded-lg border border-border bg-muted/40 flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      placeholder="Member Name"
                      className="flex-1 px-3 py-1.5 rounded-md bg-background border border-border text-foreground text-xs focus:outline-none focus:border-[#FF9900]"
                    />
                    <input
                      type="text"
                      value={newTeamRole}
                      onChange={(e) => setNewTeamRole(e.target.value)}
                      placeholder="Role (e.g. Cloud Architect)"
                      className="flex-1 px-3 py-1.5 rounded-md bg-background border border-border text-foreground text-xs focus:outline-none focus:border-[#FF9900]"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={addTeamMember}
                      className="bg-[#FF9900] text-black hover:bg-[#FF9900]/90 text-xs shrink-0 font-medium"
                    >
                      <Plus className="size-3.5 mr-1" />
                      Add Member
                    </Button>
                  </div>

                  {/* Team List */}
                  <div className="space-y-2">
                    {team.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic py-2">
                        No additional team members listed.
                      </p>
                    ) : (
                      team.map((member, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between px-3.5 py-2 rounded-lg border border-border bg-muted/30"
                        >
                          <div>
                            <span className="text-sm font-medium text-foreground block">
                              {member.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {member.role || "Developer"}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeTeamMember(idx)}
                            className="text-muted-foreground hover:text-red-500 transition-colors p-1"
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
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      GitHub Repository URL
                    </label>
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/organization/repo"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-[#FF9900]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Live Demo / Deployment URL
                    </label>
                    <input
                      type="url"
                      value={demoUrl}
                      onChange={(e) => setDemoUrl(e.target.value)}
                      placeholder="https://project-demo.vercel.app"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-[#FF9900]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Start Date
                    </label>
                    <input
                      type="text"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      placeholder="01 Jun 2025"
                      className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:border-[#FF9900]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      End Date
                    </label>
                    <input
                      type="text"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      placeholder="— or Aug 2025"
                      className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:border-[#FF9900]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Display Date
                    </label>
                    <input
                      type="text"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      placeholder="Aug 2025"
                      className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:border-[#FF9900]"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Portfolio Stats
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">
                        Likes
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={likes}
                        onChange={(e) => setLikes(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:border-[#FF9900]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">
                        Views
                      </label>
                      <input
                        type="text"
                        value={views}
                        onChange={(e) => setViews(e.target.value)}
                        placeholder="1.2K"
                        className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:border-[#FF9900]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">
                        Rating (out of 5)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:border-[#FF9900]"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          {/* Drawer Footer with Actions */}
          <div className="p-4 border-t border-border bg-card flex items-center justify-between gap-3 shrink-0">
            <div>
              {isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeleteConfirmOpen(true)}
                  disabled={loading || deleteLoading}
                  className="border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/50 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="size-3.5" />
                  Delete Project
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-border text-foreground hover:bg-muted text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || deleteLoading}
                className="bg-[#FF9900] text-black hover:bg-[#FF9900]/90 text-xs font-semibold px-4 flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,153,0,0.25)] cursor-pointer"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="size-3.5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                    <span>Saving...</span>
                  </div>
                ) : isEditing ? (
                  "Save Changes"
                ) : (
                  "Create Project"
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Project?"
        description={`Are you sure you want to delete "${project?.title}"? This will permanently remove the project from the admin portal and public portfolio.`}
        confirmLabel={deleteLoading ? "Deleting..." : "Delete Project"}
        pending={deleteLoading}
        onConfirm={handleDelete}
        tone="danger"
      />
    </Dialog>
  );
}

