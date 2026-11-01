import { sanitizeDoc, type RichTextNode } from "../richtext";

/**
 * Collects unique image paths in document order after sanitizing the document.
 */
export function collectImagePaths(doc: unknown): string[] {
  const cleanDoc = sanitizeDoc(doc, "article");
  const seen = new Set<string>();
  const paths: string[] = [];

  function walk(node: unknown) {
    if (!node || typeof node !== "object") return;
    const n = node as RichTextNode;

    if (n.type === "image" && n.attrs && typeof n.attrs === "object") {
      const rawSrc = n.attrs.src ?? n.attrs.path;
      if (typeof rawSrc === "string" && rawSrc.trim().length > 0) {
        const path = rawSrc.trim();
        if (!seen.has(path)) {
          seen.add(path);
          paths.push(path);
        }
      }
    }

    if (Array.isArray(n.content)) {
      for (const child of n.content) {
        walk(child);
      }
    }
  }

  if (Array.isArray(cleanDoc.content)) {
    for (const block of cleanDoc.content) {
      walk(block);
    }
  }

  return paths;
}

/**
 * Returns unique session paths that are not present in savedPaths.
 */
export function orphansFromSession(
  sessionPaths: string[],
  savedPaths: string[]
): string[] {
  const savedSet = new Set(savedPaths.map((p) => p.trim()));
  const seen = new Set<string>();
  const orphans: string[] = [];

  for (const raw of sessionPaths) {
    const p = raw.trim();
    if (!p) continue;
    if (!savedSet.has(p) && !seen.has(p)) {
      seen.add(p);
      orphans.push(p);
    }
  }

  return orphans;
}

