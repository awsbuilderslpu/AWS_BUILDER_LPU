"use client";

import * as React from "react";
import { useRegistration } from "@/components/features/auth/RegistrationProvider";
import { WelcomeView } from "@/components/features/auth/WelcomeView";
import { BasicInfoStep } from "@/components/features/auth/BasicInfoStep";
import { AcademicStep } from "@/components/features/auth/AcademicStep";
import { InterestsStep } from "@/components/features/auth/InterestsStep";
import { ReviewStep } from "@/components/features/auth/ReviewStep";
import { VerifyView } from "@/components/features/auth/VerifyView";
import { SuccessView } from "@/components/features/auth/SuccessView";

export function RegisterFlow() {
  const { state, startSteps } = useRegistration();

  if (state.stage === "welcome") {
    return <WelcomeView key="stage-welcome" onUseEmail={startSteps} />;
  }

  if (state.stage === "verify") {
    return <VerifyView key="stage-verify" />;
  }

  if (state.stage === "success") {
    return <SuccessView key="stage-success" />;
  }

  // stage === "steps"
  switch (state.step) {
    case 1:
      return <BasicInfoStep key="step-1" />;
    case 2:
      return <AcademicStep key="step-2" />;
    case 3:
      return <InterestsStep key="step-3" />;
    case 4:
      return <ReviewStep key="step-4" />;
    default:
      return <BasicInfoStep key="step-1" />;
  }
}
