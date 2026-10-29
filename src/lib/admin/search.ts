/**
 * Sanitizes a search term by:
 * - Returning "" for non-strings
 * - Applying Unicode NFKC normalization
 * - Keeping only letters, digits, whitespace, and @ . _ + -
 * - Collapsing whitespace and trimming
 * - Capping length at 100 characters
 */
export function sanitizeSearchTerm(input: unknown): string {
  if (typeof input !== "string") {
    return "";
  }

  const normalized = input.normalize("NFKC");
  const filtered = normalized.replace(/[^\p{L}\p{N}\s@._+\-]/gu, "");
  return filtered.replace(/\s+/g, " ").trim().slice(0, 100);
}

// PostgREST treats comma, parentheses, quotes, backslash, * and % specially; after sanitising none of them can reach the filter string, so a visitor cannot change the filter logic. Every admin search in later steps must go through these two functions.
export function buildSearchOr(columns: string[], term: string): string | null {
  if (!columns.length) {
    return null;
  }

  const sanitized = sanitizeSearchTerm(term);
  if (!sanitized) {
    return null;
  }

  return columns.map((col) => `${col}.ilike.*${sanitized}*`).join(",");
}

