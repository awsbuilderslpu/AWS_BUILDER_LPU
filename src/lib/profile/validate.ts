import { z } from "zod";
import { profileCopy } from "../../data/profile";
import {
  countryCodes,
  universities,
  programmes,
  departments,
  yearOptions,
  semesterOptions,
  interestOptions,
  registrationConstants,
} from "../../data/registration";
import { normalizeHref } from "../richtext/href";
import { isValidPhoneNumber } from "../auth/schemas";

const firstNameField = z
  .string()
  .trim()
  .min(1, { message: profileCopy.errors.firstName })
  .max(60, { message: profileCopy.errors.firstName });

const lastNameField = z
  .string()
  .trim()
  .min(1, { message: profileCopy.errors.lastName })
  .max(60, { message: profileCopy.errors.lastName });

const countryCodeField = z.enum(countryCodes);

const phoneField = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ""));

const universityField = z
  .string()
  .trim()
  .refine((val) => universities.some((u) => u.value === val), {
    message: profileCopy.errors.university,
  });

const programmeField = z
  .string()
  .trim()
  .refine((val) => (programmes as readonly string[]).includes(val), {
    message: profileCopy.errors.programme,
  });

const departmentField = z
  .string()
  .trim()
  .refine((val) => departments.some((d) => d.value === val), {
    message: profileCopy.errors.department,
  });

const studyYearField = z
  .string()
  .trim()
  .refine((val) => (yearOptions as readonly string[]).includes(val), {
    message: profileCopy.errors.studyYear,
  });

const semesterField = z
  .string()
  .trim()
  .refine((val) => (semesterOptions as readonly string[]).includes(val), {
    message: profileCopy.errors.semester,
  });

const graduationYearField = z
  .string()
  .trim()
  .refine(
    (val) => {
      const y = Number(val);
      const currentYear = new Date().getFullYear();
      return (
        /^\d{4}$/.test(val) &&
        !isNaN(y) &&
        y >= currentYear &&
        y <= currentYear + registrationConstants.graduationSpan
      );
    },
    {
      message: profileCopy.errors.graduationYear,
    }
  );

const nullableString = (max: number, errorMsg: string) =>
  z
    .unknown()
    .transform((val, ctx) => {
      if (val === null || val === undefined) return null;
      if (typeof val !== "string") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: errorMsg,
        });
        return z.NEVER;
      }
      const trimmed = val.trim();
      if (!trimmed) return null;
      if (trimmed.length > max) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: errorMsg,
        });
        return z.NEVER;
      }
      return trimmed;
    });

const linkField = z
  .unknown()
  .transform((val, ctx) => {
    if (val === null || val === undefined) return null;
    if (typeof val !== "string") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: profileCopy.errors.link,
      });
      return z.NEVER;
    }
    const trimmed = val.trim();
    if (!trimmed) return null;

    const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed);
    const urlToTest = hasScheme ? trimmed : `https://${trimmed}`;
    const normalized = normalizeHref(urlToTest);

    if (
      !normalized ||
      !/^https?:\/\//i.test(normalized) ||
      normalized.length > 300
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: profileCopy.errors.link,
      });
      return z.NEVER;
    }

    return normalized;
  });

const skillsField = z
  .unknown()
  .transform((val, ctx) => {
    if (val === null || val === undefined) return [];
    if (!Array.isArray(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: profileCopy.errors.skills,
      });
      return z.NEVER;
    }
    const seen = new Set<string>();
    const uniqueSkills: string[] = [];
    for (const item of val) {
      if (typeof item !== "string") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: profileCopy.errors.skills,
        });
        return z.NEVER;
      }
      const trimmed = item.trim();
      if (trimmed.length < 1 || trimmed.length > 30) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: profileCopy.errors.skills,
        });
        return z.NEVER;
      }
      const lower = trimmed.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        uniqueSkills.push(trimmed);
      }
    }
    if (uniqueSkills.length > 20) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: profileCopy.errors.skills,
      });
      return z.NEVER;
    }
    return uniqueSkills;
  });

const interestsField = z.array(
  z.string().refine((val) => (interestOptions as readonly string[]).includes(val), {
    message: profileCopy.errors.interests,
  })
);

const usernameField = z
  .unknown()
  .transform((val, ctx) => {
    if (val === null || val === undefined) return null;
    if (typeof val !== "string") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Username must be 3-30 lowercase characters (letters, numbers, hyphens, underscores)",
      });
      return z.NEVER;
    }
    const trimmed = val.trim().toLowerCase();
    if (!trimmed) return null;
    if (trimmed.length < 3 || trimmed.length > 30 || !/^[a-z0-9_-]+$/.test(trimmed)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Username must be 3-30 letters, numbers, hyphens or underscores",
      });
      return z.NEVER;
    }
    return trimmed;
  });

export const profileFormSchema = z
  .object({
    username: usernameField.optional().nullable(),
    firstName: firstNameField,
    lastName: lastNameField,
    phoneCountryCode: countryCodeField,
    phoneNumber: phoneField,
    university: universityField,
    programme: programmeField,
    department: departmentField,
    studyYear: studyYearField,
    semester: semesterField,
    graduationYear: graduationYearField,
    headline: nullableString(120, profileCopy.errors.headline),
    bio: nullableString(1000, profileCopy.errors.bio),
    location: nullableString(120, profileCopy.errors.location),
    awsBuilderUrl: linkField,
    linkedinUrl: linkField,
    githubUrl: linkField,
    websiteUrl: linkField,
    instagramUrl: linkField,
    youtubeUrl: linkField,
    skills: skillsField,
    interests: interestsField,
    isPublicProfile: z.boolean().default(false),
  })
  .refine(
    (data) => isValidPhoneNumber(data.phoneCountryCode, data.phoneNumber),
    {
      message: profileCopy.errors.phone,
      path: ["phoneNumber"],
    }
  );

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
export type ProfileFormInput = z.input<typeof profileFormSchema>;

export const adminProfileFormSchema = z
  .object({
    userId: z.string().uuid(),
    username: usernameField.optional().nullable(),
    firstName: firstNameField,
    lastName: lastNameField,
    phoneCountryCode: countryCodeField.optional().nullable(),
    phoneNumber: z
      .string()
      .trim()
      .transform((v) => {
        const cleaned = v.replace(/[\s-]/g, "");
        return cleaned.length > 0 ? cleaned : null;
      })
      .optional()
      .nullable(),
    registrationNumber: nullableString(200, "Registration number is too long").optional(),
    dateOfBirth: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
      .optional()
      .nullable()
      .or(z.literal(""))
      .transform((v) => (v && v.trim() !== "" ? v.trim() : null)),
    gender: z
      .enum(["Male", "Female"])
      .optional()
      .nullable()
      .or(z.literal(""))
      .transform((v) => (v === "Male" || v === "Female" ? v : null)),
    university: z
      .string()
      .trim()
      .optional()
      .nullable()
      .or(z.literal(""))
      .transform((v) => (v && v.trim() !== "" ? v.trim() : null)),
    programme: z
      .string()
      .trim()
      .optional()
      .nullable()
      .or(z.literal(""))
      .transform((v) => (v && v.trim() !== "" ? v.trim() : null)),
    department: z
      .string()
      .trim()
      .optional()
      .nullable()
      .or(z.literal(""))
      .transform((v) => (v && v.trim() !== "" ? v.trim() : null)),
    studyYear: z
      .string()
      .trim()
      .optional()
      .nullable()
      .or(z.literal(""))
      .transform((v) => (v && v.trim() !== "" ? v.trim() : null)),
    semester: z
      .string()
      .trim()
      .optional()
      .nullable()
      .or(z.literal(""))
      .transform((v) => (v && v.trim() !== "" ? v.trim() : null)),
    graduationYear: z
      .union([z.number(), z.string()])
      .optional()
      .nullable()
      .transform((val) => {
        if (val === null || val === undefined || val === "") return null;
        const num = Number(val);
        return isNaN(num) ? null : num;
      }),
    headline: nullableString(120, profileCopy.errors.headline).optional(),
    bio: nullableString(1000, profileCopy.errors.bio).optional(),
    location: nullableString(120, profileCopy.errors.location).optional(),
    awsBuilderUrl: linkField.optional(),
    linkedinUrl: linkField.optional(),
    githubUrl: linkField.optional(),
    websiteUrl: linkField.optional(),
    instagramUrl: linkField.optional(),
    youtubeUrl: linkField.optional(),
    skills: skillsField.optional().default([]),
    interests: z.array(z.string()).optional().default([]),
    isPublicProfile: z.boolean().optional(),
    publicTitle: nullableString(80, "Public title must be at most 80 characters").optional(),
  })
  .refine(
    (data) => {
      if (!data.phoneNumber) return true;
      return isValidPhoneNumber(data.phoneCountryCode || "+91", data.phoneNumber);
    },
    {
      message: profileCopy.errors.phone,
      path: ["phoneNumber"],
    }
  );

export type AdminProfileFormValues = z.infer<typeof adminProfileFormSchema>;
export type AdminProfileFormInput = z.input<typeof adminProfileFormSchema>;


