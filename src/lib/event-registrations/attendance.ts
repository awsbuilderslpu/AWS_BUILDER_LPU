import type { AttendanceStatus } from "./types";

export function canSetAttendance(
  current: AttendanceStatus | "cancelled",
  next: AttendanceStatus
): boolean {
  if (current === "registered" && next === "attended") {
    return true;
  }
  if (current === "attended" && next === "registered") {
    return true;
  }
  return false;
}
