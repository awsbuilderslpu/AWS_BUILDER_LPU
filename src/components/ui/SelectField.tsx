import * as React from "react";
import { ChevronDown } from "lucide-react";
import { fieldClass } from "@/components/ui/formStyles";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectFieldProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  placeholder?: string;
  options: readonly SelectOption[] | SelectOption[];
}

export const SelectField = React.forwardRef<
  HTMLSelectElement,
  SelectFieldProps
>(
  (
    {
      id: idProp,
      label,
      required,
      error,
      hint,
      placeholder,
      options,
      className,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const id = idProp || generatedId;
    const errorId = error ? `${id}-error` : undefined;
    const hintId = hint ? `${id}-hint` : undefined;
    const describedBy =
      [errorId, hintId].filter(Boolean).join(" ") || undefined;

    return (
      <div className="w-full">
        <label
          htmlFor={id}
          className="mb-1 block text-[12.5px] font-medium text-foreground"
        >
          {label}
          {required && (
            <span className="ml-1 text-primary" aria-hidden="true">
              *
            </span>
          )}
        </label>
        <div className="relative">
          <select
            ref={ref}
            id={id}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={cn(
              fieldClass,
              "h-10 appearance-none pl-3 pr-8 text-[13px] bg-card/40 [color-scheme:dark] invalid:text-muted-foreground cursor-pointer [&_option]:bg-card [&_option]:text-foreground",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
        {error ? (
          <p
            id={errorId}
            role="alert"
            className="mt-1.5 text-[13px] text-red-400"
          >
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} className="mt-1.5 text-[13px] text-muted-foreground">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);
SelectField.displayName = "SelectField";
