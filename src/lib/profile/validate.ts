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

export const profileFormSchema = z
  .object({
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

