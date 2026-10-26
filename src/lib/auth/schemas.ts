import { z } from "zod";
import { authCopy } from "@/data/auth";
import {
  registrationCopy,
  registrationConstants,
  countryCodes,
  universities,
  programmes,
  departments,
  yearOptions,
  semesterOptions,
  interestOptions,
} from "@/data/registration";
import { signupRoles } from "@/data/roles";

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: authCopy.errors.email }),
  password: z
    .string()
    .min(1, { message: authCopy.errors.password }),
});

export type SignInValues = z.infer<typeof signInSchema>;

// Shared field definitions for Basic Information
const firstNameField = z
  .string()
  .trim()
  .min(1, { message: registrationCopy.errors.firstName })
  .max(60, { message: registrationCopy.errors.firstName });

const lastNameField = z
  .string()
  .trim()
  .min(1, { message: registrationCopy.errors.lastName })
  .max(60, { message: registrationCopy.errors.lastName });

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, { message: registrationCopy.errors.email })
  .email({ message: registrationCopy.errors.email });

const countryCodeField = z.enum(countryCodes);

const phoneField = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ""));

const registrationNumberField = z
  .string()
  .trim()
  .regex(/^\d+$/, { message: registrationCopy.errors.registrationNumber })
  .min(registrationConstants.registrationNumberLength.min, {
    message: registrationCopy.errors.registrationNumber,
  })
  .max(registrationConstants.registrationNumberLength.max, {
    message: registrationCopy.errors.registrationNumber,
  });

const dateOfBirthField = z
  .string()
  .trim()
  .superRefine((val, ctx) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: registrationCopy.errors.dateOfBirth,
      });
      return;
    }
    const [y, m, d] = val.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    if (
      date.getFullYear() !== y ||
      date.getMonth() !== m - 1 ||
      date.getDate() !== d
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: registrationCopy.errors.dateOfBirth,
      });
      return;
    }
    const now = new Date();
    const todayY = now.getFullYear();
    const todayM = now.getMonth();
    const todayD = now.getDate();
    if (
      y > todayY ||
      (y === todayY && (m - 1 > todayM || (m - 1 === todayM && d > todayD)))
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: registrationCopy.errors.dateOfBirth,
      });
      return;
    }
    let age = todayY - y;
    if (todayM < m - 1 || (todayM === m - 1 && todayD < d)) {
      age--;
    }
    if (age < registrationConstants.minAge) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: registrationCopy.errors.underAge(registrationConstants.minAge),
      });
    }
  });

const passwordField = z
  .string()
  .min(registrationConstants.passwordMin, {
    message: registrationCopy.errors.password,
  })
  .max(registrationConstants.passwordMax, {
    message: registrationCopy.errors.password,
  })
  .regex(/(?=.*[A-Za-z])(?=.*\d)/, {
    message: registrationCopy.errors.password,
  });

const termsAcceptedField = z.literal(true, {
  message: registrationCopy.errors.terms,
});

// Step 1: Basic Information Schema
export const basicInfoSchema = z
  .object({
    firstName: firstNameField,
    lastName: lastNameField,
    email: emailField,
    countryCode: countryCodeField,
    phone: phoneField,
    registrationNumber: registrationNumberField,
    dateOfBirth: dateOfBirthField,
    password: passwordField,
    confirmPassword: z.string(),
    termsAccepted: termsAcceptedField,
  })
  .refine(
    (data) => {
      if (data.countryCode === "+91") {
        return /^[6-9]\d{9}$/.test(data.phone);
      }
      return /^\d{6,14}$/.test(data.phone);
    },
    {
      message: registrationCopy.errors.phone,
      path: ["phone"],
    }
  )
  .refine((data) => data.password === data.confirmPassword, {
    message: registrationCopy.errors.confirmPassword,
    path: ["confirmPassword"],
  });

export type BasicInfoValues = z.infer<typeof basicInfoSchema>;

// Step 2: Academic Details Schema
export const academicSchema = z.object({
  university: z
    .string()
    .trim()
    .refine((val) => universities.some((u) => u.value === val), {
      message: registrationCopy.errors.university,
    }),
  programme: z
    .string()
    .trim()
    .refine((val) => (programmes as readonly string[]).includes(val), {
      message: registrationCopy.errors.programme,
    }),
  department: z
    .string()
    .trim()
    .refine((val) => departments.some((d) => d.value === val), {
      message: registrationCopy.errors.department,
    }),
  year: z
    .string()
    .trim()
    .refine((val) => (yearOptions as readonly string[]).includes(val), {
      message: registrationCopy.errors.year,
    }),
  semester: z
    .string()
    .trim()
    .refine((val) => (semesterOptions as readonly string[]).includes(val), {
      message: registrationCopy.errors.semester,
    }),
  graduationYear: z
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
        message: registrationCopy.errors.graduationYear,
      }
    ),
});

export type AcademicValues = z.infer<typeof academicSchema>;

// Step 3: Interests & Role Schema
export const interestsSchema = z.object({
  interests: z.array(
    z
      .string()
      .refine((val) => (interestOptions as readonly string[]).includes(val))
  ),
  requestedRole: z
    .string()
    .refine((val) => (signupRoles as readonly string[]).includes(val), {
      message: registrationCopy.errors.role,
    }),
});

export type InterestsValues = z.infer<typeof interestsSchema>;

// Full Registration Schema (without confirmPassword)
export const registerSchema = z
  .object({
    firstName: firstNameField,
    lastName: lastNameField,
    email: emailField,
    countryCode: countryCodeField,
    phone: phoneField,
    registrationNumber: registrationNumberField,
    dateOfBirth: dateOfBirthField,
    password: passwordField,
    termsAccepted: termsAcceptedField,
    university: z
      .string()
      .trim()
      .refine((val) => universities.some((u) => u.value === val), {
        message: registrationCopy.errors.university,
      }),
    programme: z
      .string()
      .trim()
      .refine((val) => (programmes as readonly string[]).includes(val), {
        message: registrationCopy.errors.programme,
      }),
    department: z
      .string()
      .trim()
      .refine((val) => departments.some((d) => d.value === val), {
        message: registrationCopy.errors.department,
      }),
    year: z
      .string()
      .trim()
      .refine((val) => (yearOptions as readonly string[]).includes(val), {
        message: registrationCopy.errors.year,
      }),
    semester: z
      .string()
      .trim()
      .refine((val) => (semesterOptions as readonly string[]).includes(val), {
        message: registrationCopy.errors.semester,
      }),
    graduationYear: z
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
          message: registrationCopy.errors.graduationYear,
        }
      ),
    interests: z.array(
      z
        .string()
        .refine((val) => (interestOptions as readonly string[]).includes(val))
    ),
    requestedRole: z
      .string()
      .refine((val) => (signupRoles as readonly string[]).includes(val), {
        message: registrationCopy.errors.role,
      }),
  })
  .refine(
    (data) => {
      if (data.countryCode === "+91") {
        return /^[6-9]\d{9}$/.test(data.phone);
      }
      return /^\d{6,14}$/.test(data.phone);
    },
    {
      message: registrationCopy.errors.phone,
      path: ["phone"],
    }
  );

export type RegisterInput = z.infer<typeof registerSchema>;
