/**
 * Estimates read time in minutes from a rich-text document.
 * Walks all text nodes recursively (including inside lists, quotes, code blocks).
 * Words = whitespace-separated tokens. Rounds up to nearest minute.
 * Returns 1 for invalid or empty documents. Maximum of 240 minutes.
 */
export function estimateReadMinutes(doc: unknown): number {
  const wordCount = countWords(doc);
  if (wordCount === 0) return 1;
  return Math.min(240, Math.max(1, Math.ceil(wordCount / 200)));
}

function countWords(node: unknown): number {
  if (!node || typeof node !== "object") {
    return 0;
  }

  const n = node as Record<string, unknown>;
  let total = 0;

  // Count words from text nodes
  if (n.type === "text" && typeof n.text === "string") {
    const words = n.text.trim().split(/\s+/).filter((w) => w.length > 0);
    total += words.length;
  }

  // Recurse into content array
  if (Array.isArray(n.content)) {
    for (const child of n.content) {
      total += countWords(child);
    }
  }

  return total;
}

