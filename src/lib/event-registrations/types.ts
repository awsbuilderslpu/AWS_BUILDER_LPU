export type RegisterOutcome =
  | "registered"
  | "already_registered"
  | "closed"
  | "full";

export type CancelOutcome = "cancelled" | "not_registered";

export type MyStatus = "registered" | "attended" | "cancelled" | null;

export type AttendanceStatus = "registered" | "attended";

export interface AttendeeRow {
  registrationId: string;
  eventId: string;
  userId: string;
  status: "registered" | "attended" | "cancelled";
  fullName: string;
  email: string;
  registrationNumber: string | null;
  programme: string | null;
  studyYear: number | null;
  createdAt: string;
  cancelledAt: string | null;
}

export function toAttendeeRow(raw: unknown): AttendeeRow {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;

  const rawStatus = r.status;
  const status =
    rawStatus === "attended" ||
    rawStatus === "cancelled" ||
    rawStatus === "registered"
      ? rawStatus
      : "registered";

  const rawStudyYear = r.study_year ?? r.studyYear;
  let studyYear: number | null = null;
  if (typeof rawStudyYear === "number" && !Number.isNaN(rawStudyYear)) {
    studyYear = rawStudyYear;
  } else if (
    typeof rawStudyYear === "string" &&
    rawStudyYear.trim() !== "" &&
    !Number.isNaN(Number(rawStudyYear))
  ) {
    studyYear = Number(rawStudyYear);
  }

  const rawRegId = r.registration_id ?? r.registrationId;
  const rawEventId = r.event_id ?? r.eventId;
  const rawUserId = r.user_id ?? r.userId;
  const rawFullName = r.full_name ?? r.fullName;
  const rawEmail = r.email;
  const rawRegNumber = r.registration_number ?? r.registrationNumber;
  const rawProgramme = r.programme;
  const rawCreatedAt = r.created_at ?? r.createdAt;
  const rawCancelledAt = r.cancelled_at ?? r.cancelledAt;

  return {
    registrationId: typeof rawRegId === "string" ? rawRegId : "",
    eventId: typeof rawEventId === "string" ? rawEventId : "",
    userId: typeof rawUserId === "string" ? rawUserId : "",
    status,
    fullName: typeof rawFullName === "string" ? rawFullName : "",
    email: typeof rawEmail === "string" ? rawEmail : "",
    registrationNumber:
      typeof rawRegNumber === "string" ? rawRegNumber : null,
    programme: typeof rawProgramme === "string" ? rawProgramme : null,
    studyYear,
    createdAt: typeof rawCreatedAt === "string" ? rawCreatedAt : "",
    cancelledAt: typeof rawCancelledAt === "string" ? rawCancelledAt : null,
  };
}

