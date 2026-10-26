import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepperStep {
  label: string;
  short: string;
}

export interface StepperProps {
  steps: readonly StepperStep[] | StepperStep[];
  current: number;
  className?: string;
}

export function Stepper({ steps, current, className }: StepperProps) {
  return (
    <nav
      aria-label="Registration progress"
      className={cn("w-full select-none", className)}
    >
      <ol className="grid grid-cols-4 w-full">
        {steps.map((step, idx) => {
          const stepNumber = idx + 1;
          const isCompleted = stepNumber < current;
          const isCurrent = stepNumber === current;

          return (
            <li
              key={step.label}
              className="relative flex flex-col items-center text-center"
              aria-current={isCurrent ? "step" : undefined}
            >
              {/* Connecting line between circles */}
              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    "absolute left-1/2 top-[17px] sm:top-[18px] -translate-y-1/2 w-full h-px z-0",
                    isCompleted ? "bg-primary/50" : "bg-border"
                  )}
                  aria-hidden="true"
                />
              )}

              {/* Circle */}
              <div
                className={cn(
                  "relative z-10 flex size-[34px] sm:size-9 items-center justify-center rounded-full text-sm transition-colors",
                  isCurrent && "bg-primary font-bold text-background",
                  isCompleted &&
                    "border border-primary/60 bg-background text-primary",
                  !isCurrent &&
                    !isCompleted &&
                    "border border-border bg-background font-medium text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check
                    className="size-4 text-primary stroke-[2.5]"
                    aria-hidden="true"
                  />
                ) : (
                  <span>{stepNumber}</span>
                )}
              </div>

              {/* Label */}
              <div
                className={cn(
                  "mt-2.5 text-[14px] leading-tight transition-colors text-center",
                  isCurrent && "font-semibold text-white",
                  isCompleted && "font-medium text-muted-foreground/90",
                  !isCurrent && !isCompleted && "text-muted-foreground"
                )}
              >
                <span className="sr-only">
                  Step {stepNumber} of {steps.length}:{" "}
                </span>
                <span className="sm:hidden">{step.short}</span>
                <span className="hidden sm:inline">{step.label}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
