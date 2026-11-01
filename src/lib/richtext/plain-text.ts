import type { RichTextNode } from "./sanitize";

/**
 * Converts a rich text document or node to a single line plain text string,
 * collapsing whitespace and optionally truncating to maxLength characters cleanly at word boundaries.
 */
export function docToPlainText(doc: unknown, maxLength?: number): string {
  let raw = "";

  if (typeof doc === "string") {
    raw = doc.replace(/\s+/g, " ").trim();
  } else if (!doc || typeof doc !== "object") {
    return "";
  } else {
    const parts: string[] = [];

    function collect(node: unknown) {
      if (!node || typeof node !== "object") return;
      const n = node as RichTextNode;
      if (
        n.type === "text" &&
        typeof n.text === "string" &&
        n.text.length > 0
      ) {
        parts.push(n.text);
      }
      if (Array.isArray(n.content)) {
        for (const child of n.content) {
          collect(child);
        }
      }
    }

    collect(doc);
    raw = parts.join(" ").replace(/\s+/g, " ").trim();
  }

  if (maxLength && maxLength > 0 && raw.length > maxLength) {
    const sliced = raw.slice(0, maxLength);
    // If next character in raw is whitespace, we sliced exactly at word boundary
    if (raw[maxLength] === " ") {
      return sliced.trim();
    }
    const lastSpace = sliced.lastIndexOf(" ");
    if (lastSpace > 0) {
      return sliced.slice(0, lastSpace).trim();
    }
    return sliced.trim();
  }

  return raw;
}
