import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: React.ReactNode;
  error?: string;
}

export const CheckboxField = React.forwardRef<
  HTMLInputElement,
  CheckboxFieldProps
>(({ id: idProp, label, error, className, ...props }, ref) => {
  const generatedId = React.useId();
  const id = idProp || generatedId;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="w-full">
      <label
        htmlFor={id}
        className="flex cursor-pointer items-start gap-2.5 select-none"
      >
        <div className="relative mt-0.5 flex size-[18px] shrink-0 items-center justify-center">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            aria-invalid={Boolean(error)}
            aria-describedby={errorId}
            className={cn(
              "peer size-[18px] appearance-none rounded border border-border bg-card/40 transition-colors cursor-pointer",
              "hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              "checked:border-primary checked:bg-primary",
              error && "border-red-400/70",
              className
            )}
            {...props}
          />
          <Check
            className="pointer-events-none absolute size-3 text-background font-black stroke-[3] opacity-0 peer-checked:opacity-100 transition-opacity"
            aria-hidden="true"
          />
        </div>
        <div className="text-[12.5px] leading-snug text-white [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary-hover">
          {label}
        </div>
      </label>
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-[12px] text-red-400">
          {error}
        </p>
      )}
    </div>
  );
});
CheckboxField.displayName = "CheckboxField";
