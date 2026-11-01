import type { ListConfig } from "../admin/list-params";

export function buildEventsListConfig(categories: string[]): ListConfig {
  return {
    tabs: ["all", "upcoming", "ongoing", "completed", "archived"],
    filters: {
      category: categories,
      publish: ["published", "draft"],
    },
    dateKeys: ["from", "to"],
    sorts: [
      "starts_at:desc",
      "starts_at:asc",
      "title:asc",
      "title:desc",
      "created_at:desc",
    ],
    defaultSort: "starts_at:desc",
    pageSizes: [10, 25],
  };
}

