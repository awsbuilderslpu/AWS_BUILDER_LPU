import type { AppRole } from "../auth/account";

export type { AppRole };

export interface OwnProfile {
  username?: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phoneCountryCode: string | null;
  phoneNumber: string | null;
  registrationNumber: string | null;
  dateOfBirth: string | null;
  gender?: string | null;
  university: string | null;
  programme: string | null;
  department: string | null;
  studyYear: string | null;
  semester: string | null;
  graduationYear: string | null;
  headline: string | null;
  bio: string | null;
  location: string | null;
  awsBuilderUrl: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  websiteUrl: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  skills: string[];
  interests: string[];
  avatarPath: string | null;
  coverPath: string | null;
  isPublicProfile: boolean;
  publicTitle: string | null;
  termsAcceptedAt: string | null;
}

const FIVE_ROLES = new Set<string>([
  "admin",
  "core",
  "member",
  "student",
  "participant",
]);

export interface DirectoryMember {
  userId: string;
  username?: string | null;
  fullName: string;
  publicTitle: string | null;
  accessRole: AppRole | null;
  headline: string | null;
  location: string | null;
  skills: string[];
  avatarPath?: string | null;
  avatarUrl?: string | null;
  links: {
    awsBuilder?: string;
    linkedin?: string;
    github?: string;
    website?: string;
    instagram?: string;
    youtube?: string;
  };
}

export interface PublicProfile {
  userId: string;
  username: string | null;
  firstName: string;
  lastName: string;
  fullName: string;
  publicTitle: string | null;
  accessRole: AppRole | null;
  headline: string | null;
  bio: string | null;
  location: string | null;
  university: string | null;
  programme: string | null;
  department: string | null;
  studyYear: string | null;
  semester: string | null;
  graduationYear: number | null;
  skills: string[];
  interests: string[];
  avatarPath: string | null;
  coverPath: string | null;
  awsBuilderUrl: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  websiteUrl: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  isPublicProfile: boolean;
  createdAt: string | null;
}

export function toOwnProfile(raw: Record<string, unknown> | null | undefined): OwnProfile {
  const r = raw ?? {};
  return {
    username: typeof r.username === "string" ? r.username : null,
    firstName: typeof r.first_name === "string" ? r.first_name : "",
    lastName: typeof r.last_name === "string" ? r.last_name : "",
    email: typeof r.email === "string" ? r.email : "",
    phoneCountryCode: typeof r.phone_country_code === "string" ? r.phone_country_code : null,
    phoneNumber: typeof r.phone_number === "string" ? r.phone_number : null,
    registrationNumber: typeof r.registration_number === "string" ? r.registration_number : null,
    dateOfBirth: typeof r.date_of_birth === "string" ? r.date_of_birth : null,
    gender: typeof r.gender === "string" ? r.gender : null,
    university: typeof r.university === "string" ? r.university : null,
    programme: typeof r.programme === "string" ? r.programme : null,
    department: typeof r.department === "string" ? r.department : null,
    studyYear: typeof r.study_year === "string" ? r.study_year : null,
    semester: typeof r.semester === "string" ? r.semester : null,
    graduationYear: typeof r.graduation_year === "string" ? r.graduation_year : (typeof r.graduation_year === "number" ? String(r.graduation_year) : null),
    headline: typeof r.headline === "string" ? r.headline : null,
    bio: typeof r.bio === "string" ? r.bio : null,
    location: typeof r.location === "string" ? r.location : null,
    awsBuilderUrl: typeof r.aws_builder_url === "string" ? r.aws_builder_url : null,
    linkedinUrl: typeof r.linkedin_url === "string" ? r.linkedin_url : null,
    githubUrl: typeof r.github_url === "string" ? r.github_url : null,
    websiteUrl: typeof r.website_url === "string" ? r.website_url : null,
    instagramUrl: typeof r.instagram_url === "string" ? r.instagram_url : null,
    youtubeUrl: typeof r.youtube_url === "string" ? r.youtube_url : null,
    skills: Array.isArray(r.skills)
      ? r.skills.filter((s): s is string => typeof s === "string")
      : [],
    interests: Array.isArray(r.interests)
      ? r.interests.filter((i): i is string => typeof i === "string")
      : [],
    avatarPath: typeof r.avatar_path === "string" ? r.avatar_path : null,
    coverPath: typeof r.cover_path === "string" ? r.cover_path : null,
    isPublicProfile: Boolean(r.is_public_profile),
    publicTitle: typeof r.public_title === "string" ? r.public_title : null,
    termsAcceptedAt: typeof r.terms_accepted_at === "string" ? r.terms_accepted_at : null,
  };
}

export function toDirectoryMember(raw: Record<string, unknown> | null | undefined): DirectoryMember {
  const r = raw ?? {};
  const roleText = typeof r.access_role === "string" ? r.access_role : null;
  const accessRole: AppRole | null =
    roleText && FIVE_ROLES.has(roleText) ? (roleText as AppRole) : null;

  const links: DirectoryMember["links"] = {};
  if (typeof r.aws_builder_url === "string" && r.aws_builder_url) {
    links.awsBuilder = r.aws_builder_url;
  }
  if (typeof r.linkedin_url === "string" && r.linkedin_url) {
    links.linkedin = r.linkedin_url;
  }
  if (typeof r.github_url === "string" && r.github_url) {
    links.github = r.github_url;
  }
  if (typeof r.website_url === "string" && r.website_url) {
    links.website = r.website_url;
  }
  if (typeof r.instagram_url === "string" && r.instagram_url) {
    links.instagram = r.instagram_url;
  }
  if (typeof r.youtube_url === "string" && r.youtube_url) {
    links.youtube = r.youtube_url;
  }

  return {
    userId: typeof r.user_id === "string" ? r.user_id : "",
    username: typeof r.username === "string" ? r.username : null,
    fullName: typeof r.full_name === "string" ? r.full_name : "",
    publicTitle: typeof r.public_title === "string" ? r.public_title : null,
    accessRole,
    headline: typeof r.headline === "string" ? r.headline : null,
    location: typeof r.location === "string" ? r.location : null,
    skills: Array.isArray(r.skills)
      ? r.skills.filter((s): s is string => typeof s === "string")
      : [],
    avatarPath: typeof r.avatar_path === "string" ? r.avatar_path : null,
    avatarUrl:
      typeof r.avatar_path === "string" && (r.avatar_path.startsWith("http://") || r.avatar_path.startsWith("https://"))
        ? r.avatar_path
        : null,
    links,
  };
}

export function toPublicProfile(raw: Record<string, unknown> | null | undefined): PublicProfile | null {
  if (!raw) return null;
  const r = raw;
  const userId = typeof r.user_id === "string" ? r.user_id : (typeof r.id === "string" ? r.id : "");
  if (!userId) return null;

  const firstName = typeof r.first_name === "string" ? r.first_name : "";
  const lastName = typeof r.last_name === "string" ? r.last_name : "";
  const fullName = `${firstName} ${lastName}`.trim() || "AWS Builder";

  const roleText = typeof r.access_role === "string" ? r.access_role : (typeof r.role === "string" ? r.role : null);
  const accessRole: AppRole | null =
    roleText && FIVE_ROLES.has(roleText) ? (roleText as AppRole) : null;

  return {
    userId,
    username: typeof r.username === "string" ? r.username : null,
    firstName,
    lastName,
    fullName,
    publicTitle: typeof r.public_title === "string" ? r.public_title : null,
    accessRole,
    headline: typeof r.headline === "string" ? r.headline : null,
    bio: typeof r.bio === "string" ? r.bio : null,
    location: typeof r.location === "string" ? r.location : null,
    university: typeof r.university === "string" ? r.university : null,
    programme: typeof r.programme === "string" ? r.programme : null,
    department: typeof r.department === "string" ? r.department : null,
    studyYear: typeof r.study_year === "string" ? r.study_year : null,
    semester: typeof r.semester === "string" ? r.semester : null,
    graduationYear: typeof r.graduation_year === "number" ? r.graduation_year : (typeof r.graduation_year === "string" ? parseInt(r.graduation_year, 10) || null : null),
    skills: Array.isArray(r.skills) ? r.skills.filter((s): s is string => typeof s === "string") : [],
    interests: Array.isArray(r.interests) ? r.interests.filter((i): i is string => typeof i === "string") : [],
    avatarPath: typeof r.avatar_path === "string" ? r.avatar_path : null,
    coverPath: typeof r.cover_path === "string" ? r.cover_path : null,
    awsBuilderUrl: typeof r.aws_builder_url === "string" ? r.aws_builder_url : null,
    linkedinUrl: typeof r.linkedin_url === "string" ? r.linkedin_url : null,
    githubUrl: typeof r.github_url === "string" ? r.github_url : null,
    websiteUrl: typeof r.website_url === "string" ? r.website_url : null,
    instagramUrl: typeof r.instagram_url === "string" ? r.instagram_url : null,
    youtubeUrl: typeof r.youtube_url === "string" ? r.youtube_url : null,
    isPublicProfile: Boolean(r.is_public_profile),
    createdAt: typeof r.created_at === "string" ? r.created_at : null,
  };
}
