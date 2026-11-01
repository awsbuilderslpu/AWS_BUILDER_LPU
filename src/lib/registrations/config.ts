import type { ListConfig } from "../admin/list-params";

export function buildRegistrationsListConfig(
  programmes: string[],
  years: string[]
): ListConfig {
  return {
    tabs: ["all", "pending", "approved", "rejected", "archived"],
    filters: {
      programme: programmes,
      year: years,
    },
    dateKeys: ["from", "to"],
    sorts: [
      "applied_at:desc",
      "applied_at:asc",
      "full_name:asc",
      "full_name:desc",
      "registration_number:asc",
      "registration_number:desc",
    ],
    defaultSort: "applied_at:desc",
    pageSizes: [10, 25],
  };
}

