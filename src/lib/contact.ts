import { contactCopy, formSubjects, messageLimits } from "@/data/contact";

export type ContactField = "name" | "email" | "subject" | "message";
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
  const fields: ContactField[] = ["name", "email", "subject", "message"];
  const errors: ContactErrors = {};

  for (const field of fields) {
    const error = validateField(field, values);
    if (error) {
      errors[field] = error;
    }
  }

  return errors;
}

// Works with Formspree-style endpoints (JSON POST, 2xx = success). To switch to another service later, change only this function.
export async function submitContact(
  values: ContactValues
): Promise<{ ok: boolean }> {
  const payload = {
    name: values.name.trim(),
    email: values.email.trim(),
    subject: values.subject.trim(),
    message: values.message.trim(),
  };

  const endpoint = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT;

  if (!endpoint) {
    if (process.env.NODE_ENV === "production") {
      console.warn("NEXT_PUBLIC_CONTACT_ENDPOINT is not configured.");
      return { ok: false };
    }

    // TODO: Simulated submission in development mode. Set NEXT_PUBLIC_CONTACT_ENDPOINT for real submissions.
    await new Promise((resolve) => setTimeout(resolve, 700));
    return { ok: true };
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    return { ok: response.ok };
  } catch (error) {
    console.error("Failed to submit contact form:", error);
    return { ok: false };
  }
}
