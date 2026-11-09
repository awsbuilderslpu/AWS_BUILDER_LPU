import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { fieldClass } from "@/components/ui/formStyles";
import { cn } from "@/lib/utils";

export interface TextFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: string;
  labelAction?: React.ReactNode;
  required?: boolean;
  icon?: LucideIcon;
  error?: string;
  hint?: string;
  rightSlot?: React.ReactNode;
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      id: idProp,
      label,
      labelAction,
      required,
      icon: Icon,
      error,
      hint,
      rightSlot,
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
        <div className="mb-1 flex items-center justify-between">
          <label
            htmlFor={id}
            className="block text-[12.5px] font-medium text-foreground"
          >
            {label}
            {required && (
              <span className="ml-1 text-primary" aria-hidden="true">
                *
              </span>
            )}
          </label>
          {labelAction && <div>{labelAction}</div>}
        </div>
        <div className="relative flex items-center">
          {Icon && (
            <Icon
              className="pointer-events-none absolute left-3 size-4 text-muted-foreground"
              aria-hidden="true"
            />
          )}
          <input
            ref={ref}
            id={id}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={cn(
              fieldClass,
              "h-10 bg-card/40 text-[13px] px-3 placeholder:text-[12px] placeholder:text-muted-foreground/75",
              Icon && "pl-9",
              rightSlot && "pr-9",
              className
            )}
            {...props}
          />
          {rightSlot && (
            <div className="absolute right-2.5 flex items-center">
              {rightSlot}
            </div>
          )}
        </div>
        {error ? (
          <p id={errorId} role="alert" className="mt-1 text-[12px] text-red-400">
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} className="mt-1 text-[12px] text-muted-foreground">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);
TextField.displayName = "TextField";
