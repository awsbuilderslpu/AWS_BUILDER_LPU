import type { ProjectStatus, ProjectAuthor, ProjectStats } from "@/data/projects";

export type { ProjectStatus, ProjectAuthor, ProjectStats };

export interface ProjectItem {
  id?: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  status: ProjectStatus;
  featured?: boolean;
  image: string;
  techStack: string[];
  awsServices: string[];
  author: ProjectAuthor;
  team?: ProjectAuthor[];
  startDate: string;
  endDate?: string;
  date: string;
  githubUrl?: string;
  demoUrl?: string;
  stats: ProjectStats;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectFormData {
  id?: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  status: ProjectStatus;
  featured: boolean;
  image: string;
  techStack: string[];
  awsServices: string[];
  author: ProjectAuthor;
  team: ProjectAuthor[];
  startDate: string;
  endDate?: string;
  date: string;
  githubUrl?: string;
  demoUrl?: string;
  stats?: ProjectStats;
}

export function mapDbRowToProject(row: Record<string, unknown>): ProjectItem {
  return {
    id: typeof row.id === "string" ? row.id : undefined,
    slug: String(row.slug ?? ""),
    title: String(row.title ?? ""),
    tagline: String(row.tagline ?? ""),
    description: String(row.description ?? ""),
    category: String(row.category ?? "Cloud & AI"),
    status: (row.status as ProjectStatus) || "Ongoing",
    featured: Boolean(row.featured),
    image: String(row.image || "/images/projects/thefleetfly.jpg"),
    techStack: Array.isArray(row.tech_stack)
      ? (row.tech_stack as string[])
      : [],
    awsServices: Array.isArray(row.aws_services)
      ? (row.aws_services as string[])
      : [],
    author:
      typeof row.author === "object" && row.author !== null
        ? (row.author as ProjectAuthor)
        : { name: "" },
    team: Array.isArray(row.team) ? (row.team as ProjectAuthor[]) : [],
    startDate: String(row.start_date ?? ""),
    endDate: row.end_date ? String(row.end_date) : undefined,
    date: String(row.date || row.start_date || ""),
    githubUrl: row.github_url ? String(row.github_url) : undefined,
    demoUrl: row.demo_url ? String(row.demo_url) : undefined,
    stats:
      typeof row.stats === "object" && row.stats !== null
        ? (row.stats as ProjectStats)
        : { likes: 0, views: "0", rating: 5.0 },
    createdAt: typeof row.created_at === "string" ? row.created_at : undefined,
    updatedAt: typeof row.updated_at === "string" ? row.updated_at : undefined,
  };
}

export function mapProjectToDbPayload(
  data: ProjectFormData,
  userId?: string
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    slug: data.slug.trim().toLowerCase(),
    title: data.title.trim(),
    tagline: data.tagline.trim(),
    description: data.description.trim(),
    category: data.category.trim(),
    status: data.status,
    featured: Boolean(data.featured),
    image: data.image.trim() || "/images/projects/thefleetfly.jpg",
    tech_stack: data.techStack,
    aws_services: data.awsServices,
    author: data.author,
    team: data.team,
    start_date: data.startDate,
    end_date: data.endDate ? data.endDate.trim() : null,
    date: data.date ? data.date.trim() : data.startDate,
    github_url: data.githubUrl ? data.githubUrl.trim() : null,
    demo_url: data.demoUrl ? data.demoUrl.trim() : null,
    stats: data.stats || { likes: 0, views: "0", rating: 5.0 },
    updated_at: new Date().toISOString(),
  };

  if (userId) {
    payload.created_by = userId;
  }

  return payload;
}

