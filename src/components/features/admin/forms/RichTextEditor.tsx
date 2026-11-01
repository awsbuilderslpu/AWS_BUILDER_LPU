"use client";

import * as React from "react";
import { Bold, Italic, List, ListOrdered, Heading, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  sanitizeDoc,
  countChars,
  richLimits,
  emptyDoc,
  type RichTextDoc,
  type RichTextNode,
  type RichTextMark,
} from "@/lib/richtext";

export interface RichTextEditorProps {
  id?: string;
  label?: string;
  required?: boolean;
  variant?: "basic" | "full";
  value?: unknown;
  onChange: (doc: RichTextDoc | null) => void;
  hint?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Converts a RichTextDoc into editable text lines with markdown-like shorthand.
 */
function docToText(value: unknown): string {
  if (!value || typeof value !== "object") return "";
  const doc = value as RichTextDoc;
  if (!Array.isArray(doc.content)) return "";

  const lines: string[] = [];

  function nodeToText(node: RichTextNode): string {
    if (node.type === "text" && typeof node.text === "string") {
      let t = node.text;
      if (Array.isArray(node.marks)) {
        for (const mark of node.marks) {
          if (mark.type === "bold") t = `**${t}**`;
          else if (mark.type === "italic") t = `*${t}*`;
          else if (mark.type === "code") t = `\`${t}\``;
          else if (mark.type === "link" && typeof mark.attrs?.href === "string") {
            t = `[${t}](${mark.attrs.href})`;
          }
        }
      }
      return t;
    }
    if (Array.isArray(node.content)) {
      return node.content.map(nodeToText).join("");
    }
    return "";
  }

  for (const block of doc.content) {
    if (block.type === "paragraph") {
      lines.push(nodeToText(block));
    } else if (block.type === "heading") {
      const level = typeof block.attrs?.level === "number" ? block.attrs.level : 3;
      lines.push(`${"#".repeat(level)} ${nodeToText(block)}`);
    } else if (block.type === "bulletList" && Array.isArray(block.content)) {
      for (const item of block.content) {
        lines.push(`- ${nodeToText(item)}`);
      }
    } else if (block.type === "orderedList" && Array.isArray(block.content)) {
      let i = 1;
      for (const item of block.content) {
        lines.push(`${i}. ${nodeToText(item)}`);
        i++;
      }
    } else {
      lines.push(nodeToText(block));
    }
  }

  return lines.join("\n");
}

/**
 * Parses markdown inline text into an array of text nodes with marks.
 */
function parseInline(text: string): RichTextNode[] {
  if (!text) return [];

  // Match bold (**x**), italic (*x*), code (`x`), or link ([label](href))
  const tokenRegex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(tokenRegex);
  const nodes: RichTextNode[] = [];

  for (const part of parts) {
    if (!part) continue;

    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      nodes.push({
        type: "text",
        text: part.slice(2, -2),
        marks: [{ type: "bold" }],
      });
    } else if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      nodes.push({
        type: "text",
        text: part.slice(1, -1),
        marks: [{ type: "italic" }],
      });
    } else if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      nodes.push({
        type: "text",
        text: part.slice(1, -1),
        marks: [{ type: "code" }],
      });
    } else if (part.startsWith("[") && part.includes("](") && part.endsWith(")")) {
      const closeBracket = part.indexOf("](");
      const label = part.slice(1, closeBracket);
      const href = part.slice(closeBracket + 2, -1);
      const marks: RichTextMark[] = [{ type: "link", attrs: { href } }];
      nodes.push({
        type: "text",
        text: label,
        marks,
      });
    } else {
      nodes.push({
        type: "text",
        text: part,
      });
    }
  }

  return nodes.length > 0 ? nodes : [{ type: "text", text }];
}

/**
 * Converts editor text lines into a structured RichTextDoc.
 */
function textToDoc(text: string): RichTextDoc {
  const lines = text.split("\n");
  const content: RichTextNode[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      content.push({ type: "paragraph", content: [] });
      continue;
    }

    if (trimmed.startsWith("### ")) {
      content.push({
        type: "heading",
        attrs: { level: 3 },
        content: parseInline(trimmed.slice(4)),
      });
    } else if (trimmed.startsWith("## ")) {
      content.push({
        type: "heading",
        attrs: { level: 2 },
        content: parseInline(trimmed.slice(3)),
      });
    } else if (trimmed.startsWith("# ")) {
      content.push({
        type: "heading",
        attrs: { level: 1 },
        content: parseInline(trimmed.slice(2)),
      });
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      content.push({
        type: "bulletList",
        content: [
          {
            type: "listItem",
            content: [{ type: "paragraph", content: parseInline(trimmed.slice(2)) }],
          },
        ],
      });
    } else if (/^\d+\.\s/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s(.*)$/);
      const itemText = match ? match[2] : trimmed;
      content.push({
        type: "orderedList",
        content: [
          {
            type: "listItem",
            content: [{ type: "paragraph", content: parseInline(itemText) }],
          },
        ],
      });
    } else {
      content.push({
        type: "paragraph",
        content: parseInline(line),
      });
    }
  }

  return {
    type: "doc",
    content: content.length > 0 ? content : [{ type: "paragraph" }],
  };
}

export const RichTextEditor = React.forwardRef<HTMLTextAreaElement, RichTextEditorProps>(
  (
    {
      id: idProp,
      label,
      required,
      variant = "basic",
      value,
      onChange,
      hint,
      error,
      disabled,
      className,
    },
    ref
  ) => {
    const generatedId = React.useId();
    const id = idProp || generatedId;
    const errorId = error ? `${id}-error` : undefined;
    const hintId = hint ? `${id}-hint` : undefined;
    const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
    const [rawText, setRawText] = React.useState<string>(() => docToText(value));
    const [prevValue, setPrevValue] = React.useState<unknown>(value);

    // Sync when value changes externally
    if (value !== prevValue) {
      setPrevValue(value);
      setRawText(docToText(value));
    }

    const currentDoc = React.useMemo(() => textToDoc(rawText), [rawText]);
    const charCount = React.useMemo(() => countChars(currentDoc), [currentDoc]);
    const maxChars = richLimits[variant].maxChars;

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const nextText = e.target.value;
      setRawText(nextText);
      const parsed = textToDoc(nextText);
      const sanitized = sanitizeDoc(parsed, variant);
      onChange(sanitized.content?.length ? sanitized : emptyDoc);
    };

    const wrapSelection = (prefix: string, suffix: string = prefix, defaultPlaceholder: string = "") => {
      const el = textareaRef.current;
      if (!el) return;

      const start = el.selectionStart;
      const end = el.selectionEnd;
      const selected = rawText.slice(start, end) || defaultPlaceholder;
      const replacement = `${prefix}${selected}${suffix}`;
      const updated = rawText.slice(0, start) + replacement + rawText.slice(end);

      setRawText(updated);
      const parsed = textToDoc(updated);
      const sanitized = sanitizeDoc(parsed, variant);
      onChange(sanitized);

      // Re-focus and set selection
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(
          start + prefix.length,
          start + prefix.length + selected.length
        );
      });
    };

    const insertBlockPrefix = (prefix: string) => {
      const el = textareaRef.current;
      if (!el) return;

      const start = el.selectionStart;
      const lineStart = rawText.lastIndexOf("\n", start - 1) + 1;
      const updated = rawText.slice(0, lineStart) + prefix + rawText.slice(lineStart);

      setRawText(updated);
      const parsed = textToDoc(updated);
      const sanitized = sanitizeDoc(parsed, variant);
      onChange(sanitized);

      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(start + prefix.length, start + prefix.length);
      });
    };

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <div className="flex items-center justify-between">
            <label htmlFor={id} className="block text-[12.5px] font-medium text-white">
              {label}
              {required && (
                <span className="ml-1 text-primary" aria-hidden="true">
                  *
                </span>
              )}
            </label>
            <span
              className={cn(
                "text-[11px] tabular-nums",
                charCount > maxChars ? "text-destructive font-medium" : "text-muted-foreground"
              )}
            >
              {charCount.toLocaleString()} / {maxChars.toLocaleString()}
            </span>
          </div>
        )}

        <div
          className={cn(
            "rounded-md border border-border bg-background/60 overflow-hidden transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30",
            error && "border-red-400/70 focus-within:border-red-400 focus-within:ring-red-400/30",
            disabled && "opacity-50 pointer-events-none"
          )}
        >
          {/* Toolbar */}
          <div className="flex items-center gap-1 border-b border-border bg-card/60 px-2 py-1.5">
            <button
              type="button"
              onClick={() => wrapSelection("**", "**", "bold text")}
              title="Bold"
              aria-label="Bold"
              className="rounded p-1 text-muted-foreground hover:bg-muted/30 hover:text-white cursor-pointer"
            >
              <Bold className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => wrapSelection("*", "*", "italic text")}
              title="Italic"
              aria-label="Italic"
              className="rounded p-1 text-muted-foreground hover:bg-muted/30 hover:text-white cursor-pointer"
            >
              <Italic className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => wrapSelection("[", "](https://)", "link text")}
              title="Link"
              aria-label="Link"
              className="rounded p-1 text-muted-foreground hover:bg-muted/30 hover:text-white cursor-pointer"
            >
              <LinkIcon className="size-3.5" />
            </button>
            <div className="mx-1 h-3.5 w-px bg-border" />
            <button
              type="button"
              onClick={() => insertBlockPrefix("### ")}
              title="Heading"
              aria-label="Heading"
              className="rounded p-1 text-muted-foreground hover:bg-muted/30 hover:text-white cursor-pointer"
            >
              <Heading className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertBlockPrefix("- ")}
              title="Bullet list"
              aria-label="Bullet list"
              className="rounded p-1 text-muted-foreground hover:bg-muted/30 hover:text-white cursor-pointer"
            >
              <List className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertBlockPrefix("1. ")}
              title="Numbered list"
              aria-label="Numbered list"
              className="rounded p-1 text-muted-foreground hover:bg-muted/30 hover:text-white cursor-pointer"
            >
              <ListOrdered className="size-3.5" />
            </button>
          </div>

          <textarea
            ref={(node) => {
              textareaRef.current = node;
              if (typeof ref === "function") ref(node);
              else if (ref) ref.current = node;
            }}
            id={id}
            value={rawText}
            onChange={handleTextChange}
            rows={5}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={cn(
              "w-full bg-transparent px-3 py-2.5 text-[13px] text-foreground placeholder:text-[12px] placeholder:text-muted-foreground/75 focus:outline-none resize-y",
              className
            )}
            placeholder="Write a clear event description with highlights, agenda, and expectations..."
          />
        </div>

        {hint && !error && (
          <p id={hintId} className="text-[11.5px] text-muted-foreground">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} role="alert" className="text-[11.5px] text-destructive">
            {error}
          </p>
        )}
      </div>
    );
  }
);

RichTextEditor.displayName = "RichTextEditor";

