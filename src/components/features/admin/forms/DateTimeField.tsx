"use client";

import * as React from "react";
import { adminCopy } from "@/data/admin";
import { isoToIst, istToIso } from "@/lib/datetime";
import { fieldClass } from "@/components/ui/formStyles";
import { cn } from "@/lib/utils";

export interface DateTimeFieldProps {
  id: string;
  label: string;
  value: string | null; // UTC ISO string
  onChange: (iso: string | null) => void;
  min?: string; // UTC ISO string
  max?: string; // UTC ISO string
  required?: boolean;
  disabled?: boolean;
  error?: string;
  hint?: string;
  className?: string;
}

export function DateTimeField({
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
}: DateTimeFieldProps) {
  const copy = adminCopy.forms.dateTime;

  // Local state for native inputs
  const [prevValue, setPrevValue] = React.useState(value);
  const [date, setDate] = React.useState<string>(() => {
    return value ? isoToIst(value)?.date ?? "" : "";
  });
  const [time, setTime] = React.useState<string>(() => {
    return value ? isoToIst(value)?.time ?? "" : "";
  });

  // Sync from external value changes only, without fighting user typing
  if (value !== prevValue) {
    setPrevValue(value);
    const ist = value ? isoToIst(value) : null;
    setDate(ist?.date ?? "");
    setTime(ist?.time ?? "");
  }

  const minDate = min ? isoToIst(min)?.date : undefined;
  const maxDate = max ? isoToIst(max)?.date : undefined;

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextDate = e.target.value;
    setDate(nextDate);
    if (nextDate && time) {
      const iso = istToIso(nextDate, time);
      onChange(iso);
    } else {
      onChange(null);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextTime = e.target.value;
    setTime(nextTime);
    if (date && nextTime) {
      const iso = istToIso(date, nextTime);
      onChange(iso);
    } else {
      onChange(null);
    }
  };

  const handleClear = () => {
    setDate("");
    setTime("");
    onChange(null);
  };

  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  const onlyOneFilled = Boolean((date && !time) || (!date && time));
  const hasValue = Boolean(date || time);

  return (
    <fieldset className={cn("flex flex-col gap-2", className)}>
      <legend className="text-[13.5px] font-medium text-foreground select-none mb-1">
        {label}
        {required && (
          <span aria-hidden="true" className="ml-1 text-primary">
            *
          </span>
        )}
      </legend>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_170px]">
        <input
          id={`${id}-date`}
          type="date"
          value={date}
          min={minDate}
          max={maxDate}
          disabled={disabled}
          required={required}
          onChange={handleDateChange}
          aria-label={copy.date}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(fieldClass, "h-11 [color-scheme:dark]")}
        />
        <input
          id={`${id}-time`}
          type="time"
          step="60"
          value={time}
          disabled={disabled}
          required={required}
          onChange={handleTimeChange}
          aria-label={copy.time}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(fieldClass, "h-11 [color-scheme:dark]")}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[12.5px] text-muted-foreground">{copy.ist}</p>
        {hasValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[12px] text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline cursor-pointer"
          >
            {copy.clear}
          </button>
        )}
      </div>

      {onlyOneFilled && (
        <p role="status" className="text-[12.5px] text-muted-foreground">
          {copy.both}
        </p>
      )}

      {hint && !error && (
        <p id={hintId} className="text-[12px] text-muted-foreground">
          {hint}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-[13px] leading-snug text-red-400"
        >
          {error}
        </p>
      )}
    </fieldset>
  );
}

