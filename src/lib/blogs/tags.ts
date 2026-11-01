export type AddTagResult =
  | { ok: true; tags: string[] }
  | { ok: false; error: "empty" | "too_long" | "duplicate" | "limit" };

/**
 * Adds a tag to the current list of tags.
 * - Trims the raw input.
 * - Length must be 1 to 30 characters ("empty" if 0, "too_long" if > 30).
 * - Must not be a case-insensitive duplicate ("duplicate").
 * - List may hold at most 10 tags ("limit").
 */
export function addTag(current: string[], raw: string): AddTagResult {
  const trimmed = typeof raw === "string" ? raw.trim() : "";

  if (trimmed.length === 0) {
    return { ok: false, error: "empty" };
  }

  if (trimmed.length > 30) {
    return { ok: false, error: "too_long" };
  }

  const isDuplicate = current.some(
    (t) => t.toLowerCase() === trimmed.toLowerCase()
  );
  if (isDuplicate) {
    return { ok: false, error: "duplicate" };
  }

  if (current.length >= 10) {
    return { ok: false, error: "limit" };
  }

  return { ok: true, tags: [...current, trimmed] };
}

/**
 * Removes a tag from the current list, compared case-insensitively.
 */
export function removeTag(current: string[], tag: string): string[] {
  const targetLower = (tag ?? "").toLowerCase();
  return current.filter((t) => t.toLowerCase() !== targetLower);
}

