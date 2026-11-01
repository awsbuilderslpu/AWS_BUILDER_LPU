import { z } from "zod";
import { blogCategories } from "./categories";
import { adminCopy } from "../../data/admin";

const BANNER_REGEX = /^[0-9]{4}\/(0[1-9]|1[0-2])\/[0-9a-f-]{36}\.(webp|jpg)$/;

export const blogFormSchema = z.object({
  title: z
    .string()
    .transform((v) => v.trim())
    .pipe(
      z
        .string()
        .min(3, adminCopy.blogs.errors.title)
        .max(120, adminCopy.blogs.errors.title)
    ),

  excerpt: z
    .string()
    .nullable()
    .optional()
    .default("")
    .transform((v) => {
      if (!v) return null;
      const t = v.trim();
      return t.length > 0 ? t : null;
    })
    .pipe(
      z
        .string()
        .max(200, adminCopy.blogs.errors.excerpt)
        .nullable()
    ),

  category: z.enum(
    blogCategories as unknown as [string, ...string[]],
    { error: adminCopy.blogs.errors.category }
  ),

  tags: z
    .array(z.string())
    .transform((arr) => {
      // trim each, filter empty, deduplicate case-insensitively
      const seen = new Set<string>();
      const result: string[] = [];
      for (const raw of arr) {
        const t = raw.trim();
        if (!t) continue;
        const lower = t.toLowerCase();
        if (!seen.has(lower)) {
          seen.add(lower);
          result.push(t);
        }
      }
      return result;
    })
    .pipe(
      z
        .array(
          z
            .string()
            .min(1, adminCopy.blogs.errors.tags)
            .max(30, adminCopy.blogs.errors.tags)
        )
        .max(10, adminCopy.blogs.errors.tags)
    ),

  featuredImagePath: z
    .string()
    .nullable()
    .optional()
    .default(null)
    .transform((v) => {
      if (!v) return null;
      const t = v.trim();
      return t.length > 0 ? t : null;
    })
    .pipe(
      z
        .string()
        .refine((v) => BANNER_REGEX.test(v), {
          message: adminCopy.blogs.errors.featuredImage,
        })
        .nullable()
    ),

  authorName: z
    .string()
    .transform((v) => v.trim())
    .pipe(
      z
        .string()
        .min(2, adminCopy.blogs.errors.authorName)
        .max(80, adminCopy.blogs.errors.authorName)
    ),

  metaTitle: z
    .string()
    .nullable()
    .optional()
    .default("")
    .transform((v) => {
      if (!v) return null;
      const t = v.trim();
      return t.length > 0 ? t : null;
    })
    .pipe(
      z
        .string()
        .max(70, adminCopy.blogs.errors.metaTitle)
        .nullable()
    ),

  metaDescription: z
    .string()
    .nullable()
    .optional()
    .default("")
    .transform((v) => {
      if (!v) return null;
      const t = v.trim();
      return t.length > 0 ? t : null;
    })
    .pipe(
      z
        .string()
        .max(160, adminCopy.blogs.errors.metaDescription)
        .nullable()
    ),

  status: z.enum(["draft", "published"], {
    error: adminCopy.blogs.errors.invalid_input,
  }),

  publishAt: z
    .string()
    .datetime({ offset: true, message: adminCopy.blogs.errors.publishAt })
    .nullable()
    .optional()
    .default(null),

  body: z.unknown(),
});

export type BlogFormValues = z.infer<typeof blogFormSchema>;
