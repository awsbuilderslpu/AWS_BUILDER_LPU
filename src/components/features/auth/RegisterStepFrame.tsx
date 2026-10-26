"use client";

import * as React from "react";
import { registerSteps } from "@/data/registration";
import { AuthSwitchRow } from "@/components/features/auth/AuthSwitchRow";
import { Stepper } from "@/components/features/auth/Stepper";

export interface RegisterStepFrameProps {
  step: number;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  autoFocusHeading?: boolean;
}

export function RegisterStepFrame({
  step,
  title,
  subtitle,
  children,
  autoFocusHeading = true,
}: RegisterStepFrameProps) {
  const headingRef = React.useRef<HTMLHeadingElement>(null);

  React.useEffect(() => {
    if (autoFocusHeading) {
      headingRef.current?.focus();
    }
  }, [autoFocusHeading]);

  return (
    <div className="flex flex-1 flex-col">
      <AuthSwitchRow />

      <div className="mx-auto my-auto w-full max-w-[580px] py-2 sm:py-3">
        <Stepper steps={registerSteps} current={step} className="mb-4" />

        <h2
          ref={headingRef}
          id="auth-view-heading"
          tabIndex={-1}
          className="text-[clamp(20px,1.8vw,26px)] font-bold leading-[1.15] text-white tracking-tight outline-none"
        >
          {title}
        </h2>

        <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">
          {subtitle}
        </p>

        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
