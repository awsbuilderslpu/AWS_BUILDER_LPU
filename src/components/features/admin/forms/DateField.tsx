import * as React from "react";
import { FormField } from "@/components/ui/FormField";
import { fieldClass } from "@/components/ui/formStyles";
import { cn } from "@/lib/utils";

export interface DateFieldProps {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  hint?: string;
  className?: string;
}

export function DateField({
  id,
  label,
  value,
  onChange,
  min,
  max,
  required = false,
  disabled = false,
  error,
  hint,
  className,
}: DateFieldProps) {
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  const inputElement = (
    <div className="flex flex-col gap-1.5">
      <input
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        required={required}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={cn(fieldClass, "h-11 [color-scheme:dark]", className)}
      />
      {hint && !error && (
        <p id={hintId} className="text-[12px] text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );

  if (label) {
    return (
      <FormField id={id} label={label} required={required} error={error}>
        {inputElement}
      </FormField>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {inputElement}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-[13px] leading-snug text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}
