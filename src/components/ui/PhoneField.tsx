import * as React from "react";
import { Phone, ChevronDown } from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { cn } from "@/lib/utils";

export interface PhoneFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  selectProps: UseFormRegisterReturn;
  inputProps: UseFormRegisterReturn;
  codes: readonly string[] | string[];
  selectLabel: string;
  className?: string;
}

export function PhoneField({
  id,
  label,
  required,
  error,
  selectProps,
  inputProps,
  codes,
  selectLabel,
  className,
}: PhoneFieldProps) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={cn("w-full", className)}>
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

      {/* Bordered control with focus-within matching fieldClass */}
      <div
        className={cn(
          "relative flex h-10 w-full items-center rounded-md border border-border bg-card/40 transition-colors",
          "hover:border-primary/40 focus-within:border-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary/30",
          error &&
            "border-red-400/70 focus-within:border-red-400 focus-within:ring-red-400/30"
        )}
      >
        {/* Phone Icon */}
        <Phone
          className="pointer-events-none absolute left-2.5 size-4 text-muted-foreground"
          aria-hidden="true"
        />

        {/* Native Select for country code */}
        <div className="relative">
          <select
            {...selectProps}
            aria-label={selectLabel}
            className="h-10 w-[78px] appearance-none bg-transparent pl-8 pr-5 text-[12.5px] font-medium text-foreground [color-scheme:dark] outline-none cursor-pointer [&_option]:bg-card [&_option]:text-foreground"
          >
            {codes.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-1.5 top-1/2 size-3 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
        </div>

        {/* 1px Vertical Divider */}
        <div className="h-5 w-px bg-border" aria-hidden="true" />

        {/* Number Input */}
        <input
          {...inputProps}
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          placeholder="9876543210"
          className="flex-1 bg-transparent px-2.5 text-[13px] text-foreground placeholder:text-[12px] placeholder:text-muted-foreground/75 outline-none"
        />
      </div>

      {error && (
        <p id={errorId} role="alert" className="mt-1 text-[12px] text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
