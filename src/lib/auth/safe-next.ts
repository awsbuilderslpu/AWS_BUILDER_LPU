/**
 * Open-redirect protection helper.
 * Validates redirect targets before routing users to a `?next=` query parameter.
 *
 * Rules:
 * 1. Must be a string of at most 200 characters.
 * 2. Must start with exactly one "/" (internal relative path only).
 * 3. Must not start with "//" (protocol-relative URLs to external domains).
 * 4. Must not contain backslashes "\" (bypasses URL parsers in some browsers).
 * 5. Must not contain control characters (\x00-\x1F, \x7F).
 * 6. Must not contain "://" (absolute scheme bypasses).
 *
 * Accepted examples:
 * - "/account"
 * - "/members"
 * - "/events"
 * - "/blogs/intro-to-aws"
 * - "/events?filter=upcoming&tag=cloud"
 *
 * Rejected examples (returns fallback):
 * - "https://evil.com"
 * - "//evil.com"
 * - "/\\evil.com"
 * - "javascript:alert(1)"
 * - "/account\r\nSet-Cookie:..."
 * - null / undefined / ""
 * - Strings exceeding 200 characters
 */
export function safeNext(
  value: string | null | undefined,
  fallback = "/account"
): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();

  if (
    trimmed.length === 0 ||
    trimmed.length > 200 ||
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.includes("\\") ||
    trimmed.includes("://") ||
    /[\x00-\x1F\x7F]/.test(trimmed)
  ) {
    return fallback;
  }

  return trimmed;
}

