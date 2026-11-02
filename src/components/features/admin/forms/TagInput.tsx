"use client";

import * as React from "react";
import { X } from "lucide-react";
import { FormField } from "@/components/ui/FormField";
import { addTag, removeTag } from "@/lib/blogs/tags";
import { adminCopy } from "@/data/admin";
import { cn } from "@/lib/utils";

export interface TagInputProps {
  id: string;
  label: string;
  value: string[];
  onChange: (tags: string[]) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  maxTags?: number;
  className?: string;
}

const copy = adminCopy.blogs.form;

export function TagInput({
  id,
  label,
  value = [],
  onChange,
  error,
  hint,
  required = false,
  disabled = false,
  maxTags = 10,
  className,
}: TagInputProps) {
  const [inputVal, setInputVal] = React.useState("");
  const [tagError, setTagError] = React.useState<string | null>(null);

  const handleAdd = React.useCallback(
    (raw: string) => {
      const res = addTag(value, raw, maxTags);
      if (res.ok) {
        onChange(res.tags);
        setInputVal("");
        setTagError(null);
      } else {
        if (res.error === "limit") {
          const limitMsg =
            typeof copy.tagErrors.limitFor === "function"
              ? copy.tagErrors.limitFor(maxTags)
              : copy.tagErrors.limit;
          setTagError(limitMsg);
        } else {
          setTagError(copy.tagErrors[res.error] ?? copy.tagErrors.empty);
        }
      }
    },
    [value, onChange, maxTags]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAdd(inputVal);
    } else if (e.key === "Backspace" && inputVal === "" && value.length > 0) {
      e.preventDefault();
      onChange(value.slice(0, -1));
      setTagError(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.includes(",")) {
      const parts = val.split(",");
      for (const part of parts) {
        if (part.trim()) {
          handleAdd(part);
        }
      }
      setInputVal("");
    } else {
      setInputVal(val);
      if (tagError) {
        setTagError(null);
      }
    }
  };

  const handleRemove = (tag: string) => {
    onChange(removeTag(value, tag));
    setTagError(null);
  };

  return (
    <FormField id={id} label={label} required={required} error={error} className={className}>
      <div
        className={cn(
          "flex flex-wrap items-center gap-1.5 rounded-md border border-border bg-background/60 p-2 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30 min-h-[42px]",
          error && "border-red-400/70 focus-within:border-red-400 focus-within:ring-red-400/30",
          disabled && "opacity-50 pointer-events-none"
        )}
      >
        {value.length > 0 && (
          <div
            role="list"
            aria-label={copy.tagsList}
            className="flex flex-wrap items-center gap-1.5"
          >
            {value.map((tag) => (
              <span
                key={tag}
                role="listitem"
                className="inline-flex items-center gap-1 rounded bg-muted/70 border border-border/80 px-2 py-0.5 text-xs text-foreground font-mono select-none"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(tag)}
                  aria-label={copy.removeTag(tag)}
                  title={copy.removeTag(tag)}
                  disabled={disabled}
                  className="rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-white cursor-pointer focus:outline-none"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <input
          id={id}
          type="text"
          value={inputVal}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled || value.length >= maxTags}
          placeholder={value.length >= maxTags ? "" : copy.hints.tags}
          className="flex-1 min-w-[120px] bg-transparent text-[13px] text-foreground placeholder:text-[12px] placeholder:text-muted-foreground/75 focus:outline-none px-1"
        />
      </div>

      {tagError && (
        <p role="alert" className="text-[12px] text-destructive leading-snug">
          {tagError}
        </p>
      )}

      {hint && !error && !tagError && (
        <p className="text-[11.5px] text-muted-foreground">{hint}</p>
      )}
    </FormField>
  );
}

