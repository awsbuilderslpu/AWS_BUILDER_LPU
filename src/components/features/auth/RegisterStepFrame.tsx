"use client";

import * as React from "react";
import { registerSteps } from "@/data/registration";
import { AuthSwitchRow } from "@/components/features/auth/AuthSwitchRow";
import { Stepper } from "@/components/features/auth/Stepper";
import { useRegistration } from "@/components/features/auth/RegistrationProvider";

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
  const { state } = useRegistration();
  const headingRef = React.useRef<HTMLHeadingElement>(null);

  React.useEffect(() => {
    if (autoFocusHeading) {
      headingRef.current?.focus();
    }
  }, [autoFocusHeading]);

  return (
    <div className="flex flex-1 flex-col">
      {state.mode !== "complete" && <AuthSwitchRow />}

      <div className="mx-auto my-auto w-full max-w-[500px] py-1 sm:py-1.5">
        <Stepper steps={registerSteps} current={step} className="mb-2 sm:mb-2.5" />

        <h2
          ref={headingRef}
          id="auth-view-heading"
          tabIndex={-1}
          className="text-[19px] sm:text-[21px] font-bold leading-tight text-foreground tracking-tight outline-none"
        >
          {title}
        </h2>

        <p className="mt-0.5 text-[12.5px] leading-snug text-muted-foreground">
          {subtitle}
        </p>

        <div className="mt-2.5 sm:mt-3">{children}</div>
      </div>
    </div>
  );
}
