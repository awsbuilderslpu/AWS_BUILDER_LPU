import type { OwnProfile } from "./types";
import type { ProfileFormValues } from "./validate";

export function formFromOwnProfile(profile: OwnProfile): ProfileFormValues {
  return {
    firstName: profile.firstName ?? "",
    lastName: profile.lastName ?? "",
    phoneCountryCode: (profile.phoneCountryCode as ProfileFormValues["phoneCountryCode"]) ?? "+91",
    phoneNumber: profile.phoneNumber ?? "",
    university: profile.university ?? "lpu",
    programme: profile.programme ?? "B.Tech",
    department: profile.department ?? "cse",
    studyYear: profile.studyYear ?? "1st Year",
    semester: profile.semester ?? "1st Semester",
    graduationYear: profile.graduationYear ?? String(new Date().getFullYear()),
    headline: profile.headline ?? null,
    bio: profile.bio ?? null,
    location: profile.location ?? null,
    awsBuilderUrl: profile.awsBuilderUrl ?? null,
    linkedinUrl: profile.linkedinUrl ?? null,
    githubUrl: profile.githubUrl ?? null,
    websiteUrl: profile.websiteUrl ?? null,
    instagramUrl: profile.instagramUrl ?? null,
    youtubeUrl: profile.youtubeUrl ?? null,
    skills: [...profile.skills],
    interests: [...profile.interests],
    isPublicProfile: profile.isPublicProfile,
  };
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export function formatDob(dob: string | null | undefined): string {
  if (!dob) return "-";
  const parts = dob.split("-");
  if (parts.length !== 3) return dob;
  const [yStr, mStr, dStr] = parts;
  const m = Number(mStr);
  const d = Number(dStr);
  if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
    return `${d} ${MONTH_NAMES[m - 1]} ${yStr}`;
  }
  return dob;
}
