import type { CsvColumn } from "../admin/csv";
import { formatIst } from "../datetime";
import type { AttendeeRow, AttendanceStatus } from "./types";

export function buildAttendeeCsvColumns(
  statusLabels: Record<AttendanceStatus | "cancelled", string>
): CsvColumn<AttendeeRow>[] {
  return [
    {
      header: "Name",
      value: (row) => row.fullName ?? "",
    },
    {
      header: "Email",
      value: (row) => row.email ?? "",
    },
    {
      header: "Registration number",
      value: (row) => row.registrationNumber ?? "",
    },
    {
      header: "Programme",
      value: (row) => row.programme ?? "",
    },
    {
      header: "Study year",
      value: (row) =>
        row.studyYear !== null && row.studyYear !== undefined
          ? row.studyYear
          : "",
    },
    {
      header: "Status",
      value: (row) => statusLabels[row.status] ?? row.status ?? "",
    },
    {
      header: "Registered on",
      value: (row) =>
        row.createdAt ? formatIst(row.createdAt, { withTime: true }) : "",
    },
    {
      header: "Cancelled on",
      value: (row) =>
        row.cancelledAt ? formatIst(row.cancelledAt, { withTime: true }) : "",
    },
  ];
}
