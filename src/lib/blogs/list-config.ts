import type { ListConfig } from "../admin/list-params";
import { blogCategories } from "./categories";

export function buildBlogsListConfig(categories: string[]): ListConfig {
  return {
    tabs: ["all", "published", "scheduled", "drafts", "archived"],
    filters: {
      category: categories,
    },
    dateKeys: ["from", "to"],
    sorts: [
      "publish_at:desc",
      "publish_at:asc",
      "title:asc",
      "title:desc",
      "updated_at:desc",
    ],
    defaultSort: "publish_at:desc",
    pageSizes: [10, 25],
  };
}

export const blogsListConfig = buildBlogsListConfig([...blogCategories]);

