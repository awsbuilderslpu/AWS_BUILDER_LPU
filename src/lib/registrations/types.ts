import type { AppRole, RegistrationStatus } from "../auth/account";

export type { AppRole, RegistrationStatus };

export type ReviewAction =
  | "approve"
  | "reject"
  | "archive"
  | "reopen"
  | "restore";

export const approvableRoles = [
  "student",
  "participant",
  "member",
  "core",
] as const;

export type ApprovableRole = (typeof approvableRoles)[number];

export interface RegistrationListRow {
  id: string;
  userId: string;
  status: RegistrationStatus;
  requestedRole: AppRole;
  appliedAt: string;
  fullName: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  registrationNumber: string | null;
  programme: string | null;
  department: string | null;
  studyYear: string | null;
  avatarPath?: string | null;
  avatarUrl?: string | null;
}

export interface RegistrationDetails extends RegistrationListRow {
  phoneCountryCode: string | null;
  phoneNumber: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  university: string | null;
  semester: string | null;
  graduationYear: number | null;
  interests: string[];
  termsAcceptedAt: string | null;
  adminNote: string | null;
  reviewedAt: string | null;
  reviewedByName: string | null;
}

export function toListRow(
  raw: Record<string, unknown> | null | undefined
): RegistrationListRow {
  const r = raw ?? {};
  return {
    id: r.id != null ? String(r.id) : "",
    userId: r.user_id != null ? String(r.user_id) : "",
    status: (r.status as RegistrationStatus) ?? "pending",
    requestedRole: (r.requested_role as AppRole) ?? "student",
    appliedAt: r.applied_at != null ? String(r.applied_at) : "",
    fullName: r.full_name != null ? String(r.full_name) : "",
    firstName: r.first_name != null ? String(r.first_name) : null,
    lastName: r.last_name != null ? String(r.last_name) : null,
    email: r.email != null ? String(r.email) : "",
    registrationNumber:
      r.registration_number != null ? String(r.registration_number) : null,
    programme: r.programme != null ? String(r.programme) : null,
    department: r.department != null ? String(r.department) : null,
    studyYear: r.study_year != null ? String(r.study_year) : null,
    avatarPath: r.avatar_path != null ? String(r.avatar_path) : null,
    avatarUrl: r.avatar_url != null ? String(r.avatar_url) : null,
  };
}

export function toDetails(
  raw: Record<string, unknown> | null | undefined,
  reviewerName?: string | null
): RegistrationDetails {
  const r = raw ?? {};
  const base = toListRow(r);

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

  let interestsList: string[] = [];
  if (Array.isArray(r.interests)) {
    interestsList = r.interests.map((item) => String(item));
  }

  return {
    ...base,
    avatarPath: r.avatar_path != null ? String(r.avatar_path) : base.avatarPath ?? null,
    avatarUrl: r.avatar_url != null ? String(r.avatar_url) : base.avatarUrl ?? null,
    phoneCountryCode:
      r.phone_country_code != null ? String(r.phone_country_code) : null,
    phoneNumber: r.phone_number != null ? String(r.phone_number) : null,
    dateOfBirth: r.date_of_birth != null ? String(r.date_of_birth) : null,
    gender: r.gender != null ? String(r.gender) : null,
    university: r.university != null ? String(r.university) : null,
    semester: r.semester != null ? String(r.semester) : null,
    graduationYear: gradYear,
    interests: interestsList,
    termsAcceptedAt:
      r.terms_accepted_at != null ? String(r.terms_accepted_at) : null,
    adminNote: r.admin_note != null ? String(r.admin_note) : null,
    reviewedAt: r.reviewed_at != null ? String(r.reviewed_at) : null,
    reviewedByName:
      reviewerName != null && reviewerName.trim() !== ""
        ? reviewerName.trim()
        : null,
  };
}

