"use client";

import * as React from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { authCopy } from "@/data/auth";
import { universities, type CountryCode } from "@/data/registration";
import type { Role } from "@/data/roles";
import { loadOwnProfile, type OwnProfileData } from "@/lib/auth/service";
import {
  RegistrationProvider,
  useRegistration,
  type RegistrationData,
} from "@/components/features/auth/RegistrationProvider";
import { BasicInfoStep } from "@/components/features/auth/BasicInfoStep";
import { AcademicStep } from "@/components/features/auth/AcademicStep";
import { InterestsStep } from "@/components/features/auth/InterestsStep";
import { ReviewStep } from "@/components/features/auth/ReviewStep";
import { Button } from "@/components/ui/button";

function CompleteFlowContent() {
  const { state } = useRegistration();

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

export function CompleteFlow() {
  const [profile, setProfile] = React.useState<OwnProfileData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchProfile = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await loadOwnProfile();
    if (!result.ok) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    setProfile(result.data);
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center min-h-[320px]">
        <Loader2
          className="size-10 animate-spin text-primary"
          aria-hidden="true"
        />
        <h2
          id="auth-view-heading"
          tabIndex={-1}
          className="mt-4 text-lg font-semibold text-white outline-none"
        >
          {authCopy.complete.loading}
        </h2>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center min-h-[320px]">
        <div className="flex size-14 items-center justify-center rounded-full border border-red-500/40 bg-red-500/10 text-red-400">
          <AlertCircle className="size-7 stroke-[2]" />
        </div>
        <h2
          id="auth-view-heading"
          tabIndex={-1}
          className="mt-4 text-xl font-bold tracking-tight text-white outline-none"
        >
          {authCopy.complete.title}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-[360px]">
          {error || authCopy.complete.loadFailed}
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-6 cursor-pointer"
          onClick={() => void fetchProfile()}
        >
          {authCopy.complete.retry}
        </Button>
      </div>
    );
  }

  const seedData: RegistrationData = {
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    countryCode: (profile.countryCode as CountryCode) || "+91",
    phone: profile.phone,
    registrationNumber: profile.registrationNumber ?? "",
    dateOfBirth: profile.dateOfBirth ?? "",
    university: profile.university || universities[0].value,
    programme: profile.programme,
    department: profile.department,
    year: profile.year,
    semester: profile.semester,
    graduationYear: profile.graduationYear,
    interests: profile.interests,
    requestedRole: (profile.requestedRole as Role) || "student",
    termsAccepted: profile.termsAcceptedAt ? true : undefined,
  };

  return (
    <RegistrationProvider
      mode="complete"
      initialData={seedData}
      currentProfile={profile}
    >
      <CompleteFlowContent />
    </RegistrationProvider>
  );
}
