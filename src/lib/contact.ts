import { contactCopy, formSubjects, messageLimits } from "@/data/contact";
import { submitContactMessageAction } from "@/lib/messages/actions";

export type ContactField =
  | "name"
  | "email"
  | "phone"
  | "registrationNumber"
  | "university"
  | "subject"
  | "message";
export type ContactValues = Record<ContactField, string>;
export type ContactErrors = Partial<Record<ContactField, string>>;

export function validateField(
  field: ContactField,
  values: ContactValues
): string | undefined {
  const value = values[field]?.trim() ?? "";

  switch (field) {
    case "name":
      if (value.length < 2) {
        return contactCopy.errors.name;
      }
      return undefined;

    case "email": {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return contactCopy.errors.email;
      }
      return undefined;
    }

    case "phone": {
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length < 10) {
        return contactCopy.errors.phone;
      }
      return undefined;
    }

    case "registrationNumber":
      if (value.length < 3) {
        return contactCopy.errors.registrationNumber;
      }
      return undefined;

    case "university":
      if (value.length < 2) {
        return contactCopy.errors.university;
      }
      return undefined;

    case "subject":
      if (!formSubjects.includes(value)) {
        return contactCopy.errors.subject;
      }
      return undefined;

    case "message":
      if (value.length < messageLimits.min) {
        return contactCopy.errors.message;
      }
      return undefined;

    default:
      return undefined;
  }
}

export function validateContact(values: ContactValues): ContactErrors {
  const fields: ContactField[] = [
    "name",
    "email",
    "phone",
    "registrationNumber",
    "university",
    "subject",
    "message",
  ];
  const errors: ContactErrors = {};

  for (const field of fields) {
    const error = validateField(field, values);
    if (error) {
      errors[field] = error;
    }
  }

  return errors;
}

export function validateResumeFile(file: File): string | undefined {
  const maxBytes = 5 * 1024 * 1024; // 5MB
  if (file.size > maxBytes) {
    return contactCopy.errors.resumeSize;
  }

  const allowedExtensions = [".pdf", ".doc", ".docx"];
  const lowerName = file.name.toLowerCase();
  const isAllowed = allowedExtensions.some((ext) => lowerName.endsWith(ext));
  if (!isAllowed) {
    return contactCopy.errors.resumeType;
  }

  return undefined;
}

// Submits to Supabase database (and optionally forwards to external endpoint if configured).
export async function submitContact(
  values: ContactValues,
  resumeFile?: File | null
): Promise<{ ok: boolean }> {
  try {
    const formData = new FormData();
    formData.append("name", values.name.trim());
    formData.append("email", values.email.trim());
    formData.append("phone", values.phone.trim());
    formData.append("registrationNumber", values.registrationNumber.trim());
    formData.append("university", values.university.trim());
    formData.append("subject", values.subject.trim());
    formData.append("message", values.message.trim());
    if (resumeFile) {
      formData.append("resume", resumeFile);
    }

    // 1. Submit to Supabase
    const dbResult = await submitContactMessageAction(formData);

    // 2. Optionally forward to external webhook / Formspree if configured
    const endpoint = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT;
    if (endpoint) {
      try {
        await fetch(endpoint, {
          method: "POST",
          body: formData,
        });
      } catch (webhookErr) {
        console.warn("External contact endpoint error:", webhookErr);
      }
    }

    return { ok: dbResult.ok };
  } catch (error) {
    console.error("Failed to submit contact form:", error);
    return { ok: false };
  }
}
