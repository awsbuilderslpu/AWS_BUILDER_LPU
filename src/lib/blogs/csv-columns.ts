import type { CsvColumn } from "../admin/csv";
import { formatIst } from "../datetime";
import { blogLifecycle } from "./lifecycle";
import type { BlogDetails, BlogLifecycle } from "./types";

/**
 * Builds CSV column definitions for blog posts.
 * Headers: Title, Category, Author, Status, Publish date, Read minutes, Featured, Tags.
 * Body and meta fields are excluded from the export.
 */
export function buildBlogCsvColumns(
  statusLabels: Record<BlogLifecycle, string>,
  nowMs: number
): CsvColumn<BlogDetails>[] {
  return [
    {
      header: "Title",
      value: (row) => row.title ?? "",
    },
    {
      header: "Category",
      value: (row) => row.category ?? "",
    },
    {
      header: "Author",
      value: (row) => row.authorName ?? "",
    },
    {
      header: "Status",
      value: (row) =>
        statusLabels[blogLifecycle({ status: row.status, publishAt: row.publishAt }, nowMs)] ?? "",
    },
    {
      header: "Publish date",
      value: (row) =>
        row.publishAt ? formatIst(row.publishAt, { withTime: true }) : "",
    },
    {
      header: "Read minutes",
      value: (row) => row.readMinutes ?? 1,
    },
    {
      header: "Featured",
      value: (row) => (row.isFeatured ? "Yes" : "No"),
    },
    {
      header: "Tags",
      value: (row) => (Array.isArray(row.tags) ? row.tags.join("; ") : ""),
    },
  ];
}

