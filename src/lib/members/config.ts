import type { ListConfig } from "../admin/list-params";

export function buildMembersListConfig(
  departments: string[],
  years: string[]
): ListConfig {
  return {
    tabs: ["all", "admin", "core", "member", "student", "participant"],
    filters: {
      department: departments,
      year: years,
      status: ["active", "inactive"],
    },
    sorts: [
      "full_name:asc",
      "full_name:desc",
      "registration_number:asc",
      "registration_number:desc",
      "study_year:asc",
      "study_year:desc",
      "role:asc",
      "role:desc",
      "member_since:asc",
      "member_since:desc",
    ],
    defaultSort: "full_name:asc",
    pageSizes: [10, 25, 50],
  };
}

