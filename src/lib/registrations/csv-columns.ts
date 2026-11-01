import type { CsvColumn } from "../admin/csv";
import { formatIst } from "../datetime";
import type { RegistrationDetails } from "./types";

export const registrationCsvColumns: CsvColumn<RegistrationDetails>[] = [
  {
    header: "Name",
    value: (row) => row.fullName,
  },
  {
    header: "Email",
    value: (row) => row.email,
  },
  {
    header: "Phone",
    value: (row) => {
      const code = row.phoneCountryCode?.trim();
      const num = row.phoneNumber?.trim();
      if (code && num) {
        return `${code} ${num}`;
      }
      return num || "";
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
    value: (row) => row.graduationYear ?? "",
  },
  {
    header: "Requested role",
    value: (row) => row.requestedRole ?? "",
  },
  {
    header: "Status",
    value: (row) => row.status ?? "",
  },
  {
    header: "Applied on",
    value: (row) =>
      row.appliedAt ? formatIst(row.appliedAt, { withTime: false }) : "",
  },
  {
    header: "Reviewed on",
    value: (row) =>
      row.reviewedAt ? formatIst(row.reviewedAt, { withTime: false }) : "",
  },
  {
    header: "Note",
    value: (row) => row.adminNote ?? "",
  },
];

