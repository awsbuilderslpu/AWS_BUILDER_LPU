import { normalizeHref } from "./href";

export interface RichTextDoc {
  type: "doc";
  content?: RichTextNode[];
  [key: string]: unknown;
}

export interface RichTextMark {
  type: string;
  attrs?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface RichTextNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: RichTextNode[];
  marks?: RichTextMark[];
  text?: string;
  [key: string]: unknown;
}

export const emptyDoc: RichTextDoc = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

export const richLimits = {
  basic: {
    maxChars: 10000,
  },
  full: {
    maxChars: 50000,
  },
} as const;

const BASIC_ALLOWED_NODES = new Set([
  "doc",
  "paragraph",
  "text",
  "bulletList",
  "orderedList",
  "listItem",
  "heading",
  "hardBreak",
]);

const BASIC_ALLOWED_MARKS = new Set([
  "bold",
  "italic",
  "strike",
  "code",
  "link",
]);

/**
 * Counts text characters across all text nodes in a rich-text document.
 */
export function countChars(doc: unknown): number {
  if (!doc || typeof doc !== "object") {
    return 0;
  }

  let total = 0;
  const node = doc as RichTextNode;

  if (node.type === "text" && typeof node.text === "string") {
    total += node.text.length;
  }

  if (Array.isArray(node.content)) {
    for (const child of node.content) {
      total += countChars(child);
    }
  }

  return total;
}

function sanitizeNode(
  raw: unknown,
  allowedNodes: Set<string>,
  allowedMarks: Set<string>
): RichTextNode | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const node = raw as Record<string, unknown>;
  const type = typeof node.type === "string" ? node.type : "";

  if (!allowedNodes.has(type)) {
    return null;
  }

  const clean: RichTextNode = { type };

  if (type === "text") {
    clean.text = typeof node.text === "string" ? node.text : "";
  }

  if (node.attrs && typeof node.attrs === "object") {
    const rawAttrs = node.attrs as Record<string, unknown>;
    const cleanAttrs: Record<string, unknown> = {};

    if (type === "heading" && typeof rawAttrs.level === "number") {
      cleanAttrs.level = Math.min(Math.max(Math.floor(rawAttrs.level), 1), 6);
    }

    if (Object.keys(cleanAttrs).length > 0) {
      clean.attrs = cleanAttrs;
    }
  }

  if (Array.isArray(node.marks)) {
    const cleanMarks: Array<{ type: string; attrs?: Record<string, unknown> }> =
      [];
    for (const mark of node.marks) {
      if (!mark || typeof mark !== "object") continue;
      const markType = typeof mark.type === "string" ? mark.type : "";
      if (!allowedMarks.has(markType)) continue;

      if (markType === "link") {
        const markAttrs = (mark.attrs || {}) as Record<string, unknown>;
        const href = normalizeHref(
          typeof markAttrs.href === "string" ? markAttrs.href : null
        );
        if (href) {
          cleanMarks.push({
            type: "link",
            attrs: { href },
          });
        }
      } else {
        cleanMarks.push({ type: markType });
      }
    }
    if (cleanMarks.length > 0) {
      clean.marks = cleanMarks;
    }
  }

  if (Array.isArray(node.content)) {
    const cleanContent: RichTextNode[] = [];
    for (const child of node.content) {
      const sanitizedChild = sanitizeNode(child, allowedNodes, allowedMarks);
      if (sanitizedChild) {
        cleanContent.push(sanitizedChild);
      }
    }
    if (cleanContent.length > 0) {
      clean.content = cleanContent;
    }
  }

  return clean;
}

/**
 * Sanitizes an arbitrary JSON rich-text document against an allowed node/mark schema.
 * Returns emptyDoc when input is nullish or malformed.
 */
export function sanitizeDoc(
  value: unknown,
  variant: "basic" | "full" = "basic"
): RichTextDoc {
  if (!value || typeof value !== "object") {
    return emptyDoc;
  }

  const raw = value as Record<string, unknown>;
  if (raw.type !== "doc") {
    return emptyDoc;
  }

  const allowedNodes = variant === "full" ? BASIC_ALLOWED_NODES : BASIC_ALLOWED_NODES;
  const allowedMarks = variant === "full" ? BASIC_ALLOWED_MARKS : BASIC_ALLOWED_MARKS;

  const sanitized = sanitizeNode(raw, allowedNodes, allowedMarks);
  if (!sanitized || sanitized.type !== "doc") {
    return emptyDoc;
  }

  return {
    type: "doc",
    content: sanitized.content ?? [{ type: "paragraph" }],
  };
}
