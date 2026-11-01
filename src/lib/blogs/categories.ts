// Must match the constraint in 011_blogs.sql (blogs_category_values). Keep them in sync.
export const blogCategories = [
  "AWS",
  "Cloud Computing",
  "Tutorials",
  "Community",
  "Career",
  "Projects",
  "Architecture",
  "Cloud Security",
  "Student Guide",
  "Development",
] as const;

export type BlogCategory = (typeof blogCategories)[number];

