/**
 * Normalizes a URL string, returning a valid URL or null if invalid or dangerous.
 */
export function normalizeHref(input: string | null | undefined): string | null {
  if (typeof input !== "string") {
    return null;
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  // Reject malicious schemes immediately
  if (/^(javascript|vbscript|data):/i.test(trimmed)) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
}

