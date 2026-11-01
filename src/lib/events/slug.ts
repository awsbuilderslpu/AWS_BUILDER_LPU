const SUFFIX_REGEX = /^[a-z0-9]{6}$/;

/**
 * Builds a deterministic, URL-safe slug from an event title and a 6-character suffix.
 * - Converts to lower-case ASCII only.
 * - Replaces runs of non-alphanumerics with a single dash.
 * - Trims leading and trailing dashes.
 * - Cuts the base title to 60 characters.
 * - Falls back to "event" when nothing usable remains.
 * - Appends "-" and the 6-character lowercase alphanumeric suffix.
 * Throws if the suffix is not exactly six lower-case letters or digits.
 */
export function makeSlug(title: string, suffix: string): string {
  if (typeof suffix !== "string" || !SUFFIX_REGEX.test(suffix)) {
    throw new Error(
      "Invalid slug suffix: must be exactly six lower-case letters or digits"
    );
  }

  const raw = typeof title === "string" ? title : "";
  let base = raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (base.length > 60) {
    base = base.slice(0, 60).replace(/-+$/, "");
  }

  if (!base) {
    base = "event";
  }

  return `${base}-${suffix}`;
}

