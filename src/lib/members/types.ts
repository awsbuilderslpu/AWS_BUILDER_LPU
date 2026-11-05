import type { AppRole, RegistrationStatus } from "../registrations/types";

export type { AppRole, RegistrationStatus };

export interface MemberListRow {
  userId: string;
  registrationId: string | null;
  role: AppRole;
  isActive: boolean;
  registrationStatus: RegistrationStatus | null;
  fullName: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  registrationNumber: string | null;
  department: string | null;
  programme: string | null;
  studyYear: string | null;
  memberSince: string;
}

export interface MemberDetails extends MemberListRow {
  phoneCountryCode: string | null;
  phoneNumber: string | null;
  university: string | null;
  semester: string | null;
  graduationYear: number | null;
  interests: string[];
  skills: string[];
  headline: string | null;
  bio: string | null;
  location: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  websiteUrl: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  adminNote: string | null;
  gender?: string | null;
}

export function toMemberListRow(
  raw: Record<string, unknown> | null | undefined
): MemberListRow {
  const r = raw ?? {};
  return {
    userId: r.user_id != null ? String(r.user_id) : "",
    registrationId:
      r.registration_id != null ? String(r.registration_id) : null,
    role: (r.role as AppRole) ?? "participant",
    isActive:
      typeof r.is_active === "boolean"
        ? r.is_active
        : Boolean(r.is_active),
    registrationStatus:
      r.registration_status != null
        ? (r.registration_status as RegistrationStatus)
        : null,
    fullName: r.full_name != null ? String(r.full_name) : "",
    firstName: r.first_name != null ? String(r.first_name) : null,
    lastName: r.last_name != null ? String(r.last_name) : null,
    email: r.email != null ? String(r.email) : null,
    registrationNumber:
      r.registration_number != null ? String(r.registration_number) : null,
    department: r.department != null ? String(r.department) : null,
    programme: r.programme != null ? String(r.programme) : null,
    studyYear: r.study_year != null ? String(r.study_year) : null,
    memberSince: r.member_since != null ? String(r.member_since) : "",
  };
}

export function toMemberDetails(
  raw: Record<string, unknown> | null | undefined
): MemberDetails {
  const r = raw ?? {};
  const base = toMemberListRow(r);

  let gradYear: number | null = null;
  if (
    typeof r.graduation_year === "number" &&
    !Number.isNaN(r.graduation_year)
  ) {
    gradYear = r.graduation_year;
  } else if (
    typeof r.graduation_year === "string" &&
    r.graduation_year.trim() !== ""
  ) {
    const parsed = Number(r.graduation_year);
    gradYear = Number.isNaN(parsed) ? null : parsed;
  }

  const interestsList: string[] = Array.isArray(r.interests)
    ? r.interests.map((item) => String(item))
    : [];

  const skillsList: string[] = Array.isArray(r.skills)
    ? r.skills.map((item) => String(item))
    : [];

  return {
    ...base,
    phoneCountryCode:
      r.phone_country_code != null ? String(r.phone_country_code) : null,
    phoneNumber: r.phone_number != null ? String(r.phone_number) : null,
    university: r.university != null ? String(r.university) : null,
    semester: r.semester != null ? String(r.semester) : null,
    graduationYear: gradYear,
    interests: interestsList,
    skills: skillsList,
    headline: r.headline != null ? String(r.headline) : null,
    bio: r.bio != null ? String(r.bio) : null,
    location: r.location != null ? String(r.location) : null,
    linkedinUrl: r.linkedin_url != null ? String(r.linkedin_url) : null,
    githubUrl: r.github_url != null ? String(r.github_url) : null,
    websiteUrl: r.website_url != null ? String(r.website_url) : null,
    instagramUrl: r.instagram_url != null ? String(r.instagram_url) : null,
    youtubeUrl: r.youtube_url != null ? String(r.youtube_url) : null,
    adminNote: r.admin_note != null ? String(r.admin_note) : null,
    gender: r.gender != null ? String(r.gender) : null,
  };
}

