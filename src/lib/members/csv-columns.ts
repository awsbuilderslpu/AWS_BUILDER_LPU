import type { CsvColumn } from "../admin/csv";
import { formatIst } from "../datetime";
import type { AppRole, MemberDetails } from "./types";

export function buildMemberCsvColumns(
  roleLabels: Record<AppRole, string>
): CsvColumn<MemberDetails>[] {
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
      header: "Phone",
      value: (row) => {
        const code = row.phoneCountryCode?.trim();
        const num = row.phoneNumber?.trim();
        if (code && num) {
          return `${code} ${num}`;
        }
        return "";
      },
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
      header: "Branch",
      value: (row) => row.department ?? "",
    },
    {
      header: "Year",
      value: (row) => row.studyYear ?? "",
    },
    {
      header: "Semester",
      value: (row) => row.semester ?? "",
    },
    {
      header: "Expected graduation",
      value: (row) =>
        row.graduationYear != null ? String(row.graduationYear) : "",
    },
    {
      header: "Role",
      value: (row) => roleLabels[row.role] ?? row.role,
    },
    {
      header: "Status",
      value: (row) => (row.isActive ? "Active" : "Inactive"),
    },
    {
      header: "Member since",
      value: (row) =>
        row.memberSince
          ? formatIst(row.memberSince, { withTime: false })
          : "",
    },
  ];
}

