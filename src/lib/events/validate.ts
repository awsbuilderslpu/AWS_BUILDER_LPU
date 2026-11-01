import { z } from "zod";
import { adminCopy } from "../../data/admin";
import { normalizeHref } from "../richtext/href";

const BANNER_REGEX = /^[0-9]{4}\/(0[1-9]|1[0-2])\/[0-9a-f-]{36}\.(webp|jpg)$/;
const ISO_REGEX =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/;

export const eventFormSchema = z
  .object({
    title: z
      .string()
      .transform((val) => val.trim())
      .pipe(
        z
          .string()
          .min(3, adminCopy.events.errors.title)
          .max(120, adminCopy.events.errors.title)
      ),
    category: z.enum(
      ["workshop", "hackathon", "talk", "competition", "community"],
      {
        message: adminCopy.events.errors.category,
      }
    ),
    locationMode: z.enum(["on_campus", "online", "hybrid"]),
    venue: z
      .string()
      .nullable()
      .optional()
      .default(null)
      .transform((val) => {
        if (!val) return null;
        const trimmed = val.trim();
        return trimmed.length > 0 ? trimmed : null;
      }),
    meetingUrl: z
      .string()
      .nullable()
      .optional()
      .default(null)
      .transform((val) => {
        if (!val) return null;
        const trimmed = val.trim();
        return trimmed.length > 0 ? trimmed : null;
      }),
    startsAt: z
      .string()
      .nullable()
      .refine(
        (val) =>
          typeof val === "string" &&
          ISO_REGEX.test(val) &&
          !Number.isNaN(Date.parse(val)),
        { message: adminCopy.events.errors.startsAt }
      ),
    endsAt: z
      .string()
      .nullable()
      .refine(
        (val) =>
          typeof val === "string" &&
          ISO_REGEX.test(val) &&
          !Number.isNaN(Date.parse(val)),
        { message: adminCopy.events.errors.endsAt }
      ),
    registrationEnabled: z.boolean(),
    registrationDeadline: z
      .string()
      .nullable()
      .optional()
      .default(null)
      .transform((val) => {
        if (!val) return null;
        const trimmed = val.trim();
        return trimmed.length > 0 ? trimmed : null;
      })
      .refine(
        (val) =>
          !val || (ISO_REGEX.test(val) && !Number.isNaN(Date.parse(val))),
        { message: adminCopy.events.errors.deadline }
      ),
    bannerPath: z
      .string()
      .nullable()
      .optional()
      .default(null)
      .transform((val) => {
        if (!val) return null;
        const trimmed = val.trim();
        return trimmed.length > 0 ? trimmed : null;
      })
      .refine((val) => !val || BANNER_REGEX.test(val), {
        message: adminCopy.events.errors.banner,
      }),
    isPublished: z.boolean(),
    capacity: z
      .union([z.number(), z.string(), z.null(), z.undefined()])
      .optional()
      .default(null)
      .transform((val) => {
        if (val === null || val === undefined) return null;
        if (typeof val === "string") {
          const trimmed = val.trim();
          if (trimmed === "") return null;
          const num = Number(trimmed);
          return Number.isNaN(num) ? NaN : num;
        }
        return val;
      })
      .refine(
        (val) => {
          if (val === null) return true;
          return (
            typeof val === "number" &&
            Number.isInteger(val) &&
            val >= 1 &&
            val <= 100000
          );
        },
        { message: adminCopy.events.errors.capacity }
      ),
    description: z.unknown(),
  })
  .superRefine((data, ctx) => {
    // 1. endsAt must be strictly after startsAt
    const startMs = data.startsAt ? Date.parse(data.startsAt) : NaN;
    const endMs = data.endsAt ? Date.parse(data.endsAt) : NaN;
    if (!Number.isNaN(startMs) && !Number.isNaN(endMs)) {
      if (endMs <= startMs) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["endsAt"],
          message: adminCopy.events.errors.endsAt,
        });
      }
    }

    // 2. venue required for on_campus and hybrid (max 200 characters)
    if (data.locationMode === "on_campus" || data.locationMode === "hybrid") {
      if (!data.venue) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["venue"],
          message: adminCopy.events.errors.venue,
        });
      } else if (data.venue.length > 200) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["venue"],
          message: adminCopy.events.errors.venue,
        });
      }
    } else if (data.venue && data.venue.length > 200) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["venue"],
        message: adminCopy.events.errors.venue,
      });
    }

    // 3. meetingUrl required for online and hybrid, and must normalise to an https:// address
    if (data.locationMode === "online" || data.locationMode === "hybrid") {
      if (!data.meetingUrl) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["meetingUrl"],
          message: adminCopy.events.errors.meetingUrl,
        });
      } else {
        const normalized = normalizeHref(data.meetingUrl);
        if (
          !normalized ||
          !normalized.startsWith("https://") ||
          normalized.length > 300
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["meetingUrl"],
            message: adminCopy.events.errors.meetingUrl,
          });
        }
      }
    } else if (data.meetingUrl) {
      const normalized = normalizeHref(data.meetingUrl);
      if (
        !normalized ||
        !normalized.startsWith("https://") ||
        normalized.length > 300
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["meetingUrl"],
          message: adminCopy.events.errors.meetingUrl,
        });
      }
    }

    // 4. registrationDeadline, when given, on or before startsAt
    if (data.registrationDeadline) {
      const deadlineMs = Date.parse(data.registrationDeadline);
      if (!Number.isNaN(deadlineMs) && !Number.isNaN(startMs)) {
        if (deadlineMs > startMs) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["registrationDeadline"],
            message: adminCopy.events.errors.deadline,
          });
        }
      }
    }
  });

export type EventFormValues = z.infer<typeof eventFormSchema>;

