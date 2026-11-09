import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  sanitizeDoc,
  type RichTextDoc,
  type RichTextNode,
  type RichTextMark,
} from "@/lib/richtext";
import { publicObjectUrl } from "@/lib/storage/urls";

export interface RichTextRendererProps {
  doc?: unknown;
  variant?: "basic" | "full" | "article";
  className?: string;
}

function renderMarks(text: string, marks?: RichTextMark[]): React.ReactNode {
  if (!marks || marks.length === 0) {
    return text;
  }

  let element: React.ReactNode = text;

  for (const mark of marks) {
    if (mark.type === "bold") {
      element = <strong className="font-semibold text-foreground">{element}</strong>;
    } else if (mark.type === "italic") {
      element = <em className="italic">{element}</em>;
    } else if (mark.type === "strike") {
      element = <s className="line-through">{element}</s>;
    } else if (mark.type === "code") {
      element = (
        <code className="rounded bg-muted/40 px-1.5 py-0.5 font-mono text-[12px] text-primary">
          {element}
        </code>
      );
    } else if (mark.type === "underline") {
      element = <u className="underline underline-offset-2">{element}</u>;
    } else if (mark.type === "link") {
      const href = typeof mark.attrs?.href === "string" ? mark.attrs.href : "#";
      element = (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
        >
          {element}
        </a>
      );
    }
  }

  return element;
}

function renderNode(node: RichTextNode, index: number): React.ReactNode {
  if (node.type === "text") {
    return (
      <React.Fragment key={index}>
        {renderMarks(node.text ?? "", node.marks)}
      </React.Fragment>
    );
  }

  if (node.type === "hardBreak") {
    return <br key={index} />;
  }

  if (node.type === "horizontalRule") {
    return <hr key={index} className="my-6 border-border" />;
  }

  if (node.type === "image") {
    const rawPath = typeof node.attrs?.src === "string" ? node.attrs.src : null;
    const url = rawPath ? (rawPath.startsWith("http") ? rawPath : publicObjectUrl("blog-images", rawPath)) : null;
    if (!url) return null;
    return (
      <div key={index} className="my-4 overflow-hidden rounded-md border border-border">
        <Image
          src={url}
          alt={typeof node.attrs?.alt === "string" ? node.attrs.alt : "Blog image"}
          width={800}
          height={450}
          className="w-full object-cover"
        />
      </div>
    );
  }

  const children = Array.isArray(node.content)
    ? node.content.map((child, i) => renderNode(child, i))
    : null;

  if (node.type === "paragraph") {
    return (
      <p key={index} className="leading-relaxed text-[13.5px] text-muted-foreground my-2">
        {children}
      </p>
    );
  }

  if (node.type === "heading") {
    const level = typeof node.attrs?.level === "number" ? node.attrs.level : 3;
    const Tag = (`h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6");
    const headingStyles: Record<number, string> = {
      1: "text-[22px] font-bold text-foreground mt-6 mb-3",
      2: "text-[18px] font-semibold text-foreground mt-5 mb-2.5",
      3: "text-[15px] font-semibold text-foreground mt-4 mb-2",
      4: "text-[14px] font-semibold text-foreground mt-3 mb-1.5",
      5: "text-[13px] font-medium text-foreground mt-2 mb-1",
      6: "text-[12px] font-medium text-foreground mt-2 mb-1",
    };
    return (
      <Tag key={index} className={headingStyles[level] ?? headingStyles[3]}>
        {children}
      </Tag>
    );
  }

  if (node.type === "bulletList") {
    return (
      <ul key={index} className="my-3 list-disc list-inside space-y-1 text-[13.5px] text-muted-foreground">
        {children}
      </ul>
    );
  }

  if (node.type === "orderedList") {
    return (
      <ol key={index} className="my-3 list-decimal list-inside space-y-1 text-[13.5px] text-muted-foreground">
        {children}
      </ol>
    );
  }

  if (node.type === "listItem") {
    return (
      <li key={index} className="leading-relaxed">
        {children}
      </li>
    );
  }

  if (node.type === "blockquote") {
    return (
      <blockquote
        key={index}
        className="my-4 border-l-2 border-primary pl-4 italic text-muted-foreground"
      >
        {children}
      </blockquote>
    );
  }

  if (node.type === "codeBlock") {
    return (
      <pre
        key={index}
        className="my-4 overflow-x-auto rounded-md border border-border bg-card p-3 font-mono text-[12px] text-foreground"
      >
        <code>{children}</code>
      </pre>
    );
  }

  return <div key={index}>{children}</div>;
}

export function RichTextRenderer({
  doc,
  variant = "article",
  className,
}: RichTextRendererProps) {
  const cleanDoc: RichTextDoc = React.useMemo(() => {
    return sanitizeDoc(doc, variant);
  }, [doc, variant]);

  if (!cleanDoc.content || cleanDoc.content.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-2 text-foreground font-sans", className)}>
      {cleanDoc.content.map((node, i) => renderNode(node, i))}
    </div>
  );
}

