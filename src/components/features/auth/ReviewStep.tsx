"use client";

import * as React from "react";
import {
  UserRound,
  GraduationCap,
  CircleCheck,
  ArrowLeft,
  Pencil,
  Loader2,
} from "lucide-react";
import {
  registrationCopy,
  universities,
  departments,
} from "@/data/registration";
import { roleMeta, type Role } from "@/data/roles";
import { registerSchema } from "@/lib/auth/schemas";
import { registerAccount } from "@/lib/auth/service";
import { formatDob } from "@/lib/auth/format";
import { useRegistration } from "@/components/features/auth/RegistrationProvider";
import { RegisterStepFrame } from "@/components/features/auth/RegisterStepFrame";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ReviewStep() {
  const { state, goToStep, markSubmitted } = useRegistration();

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fullName = `${state.data.firstName ?? ""} ${state.data.lastName ?? ""}`.trim();

  const universityLabel =
    universities.find((u) => u.value === state.data.university)?.label ??
    state.data.university ??
    "";

  const departmentShort =
    departments.find((d) => d.value === state.data.department)?.short ??
    state.data.department ??
    "";

  const programmeDisplay = departmentShort
    ? `${state.data.programme ?? ""} (${departmentShort})`
    : state.data.programme ?? "";

  const yearDisplay = state.data.semester
    ? `${state.data.year ?? ""} (${state.data.semester})`
    : state.data.year ?? "";

  const roleKey = (state.data.requestedRole as Role) || "student";
  const roleInfo = roleMeta[roleKey];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate full data against registerSchema
    const parsed = registerSchema.safeParse(state.data);
    if (!parsed.success) {
      goToStep(1);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await registerAccount(parsed.data);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      markSubmitted();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RegisterStepFrame
      step={4}
      title={registrationCopy.review.title}
      subtitle={registrationCopy.review.subtitle}
    >
      <form
        noValidate
        aria-busy={isSubmitting}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Top Profile Card */}
        <div className="flex items-center justify-between rounded-lg border border-border bg-card/60 p-5">
          <div className="flex items-center gap-4 min-w-0">
            <Avatar name={fullName || "User"} size={64} />
            <div className="min-w-0">
              <div className="text-[20px] font-semibold text-white truncate">
                {fullName || "—"}
              </div>
              <div className="text-[14px] text-muted-foreground break-all">
                {state.data.email || "—"}
              </div>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => goToStep(1)}
            disabled={isSubmitting}
            className="h-9 shrink-0 gap-1.5"
          >
            <Pencil className="size-3.5" aria-hidden="true" />
            <span>Edit</span>
          </Button>
        </div>

        {/* Details Card */}
        <div className="rounded-lg border border-border bg-card/60 p-5">
          {/* Section 1: Personal Information */}
          <div>
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2 text-[15px] font-semibold text-white">
                <UserRound
                  className="size-5 text-primary"
                  aria-hidden="true"
                />
                <span>{registrationCopy.review.sections.personal}</span>
              </div>
              <button
                type="button"
                onClick={() => goToStep(1)}
                disabled={isSubmitting}
                className="text-[13px] font-medium text-primary transition-colors hover:underline cursor-pointer"
              >
                Edit
              </button>
            </div>

            <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
              <div>
                <div className="text-[13px] text-muted-foreground">
                  {registrationCopy.review.labels.fullName}
                </div>
                <div className="text-[14px] text-white break-words">
                  {fullName || "—"}
                </div>
              </div>

              <div>
                <div className="text-[13px] text-muted-foreground">
                  {registrationCopy.review.labels.registrationNumber}
                </div>
                <div className="text-[14px] text-white break-words">
                  {state.data.registrationNumber || "—"}
                </div>
              </div>

              <div>
                <div className="text-[13px] text-muted-foreground">
                  {registrationCopy.review.labels.phone}
                </div>
                <div className="text-[14px] text-white break-words">
                  {state.data.countryCode} {state.data.phone || "—"}
                </div>
              </div>

              <div>
                <div className="text-[13px] text-muted-foreground">
                  {registrationCopy.review.labels.dateOfBirth}
                </div>
                <div className="text-[14px] text-white break-words">
                  {formatDob(state.data.dateOfBirth) || "—"}
                </div>
              </div>
            </div>
          </div>

          <div className="my-5 border-t border-border" />

          {/* Section 2: Academic Information */}
          <div>
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2 text-[15px] font-semibold text-white">
                <GraduationCap
                  className="size-5 text-accent"
                  aria-hidden="true"
                />
                <span>{registrationCopy.review.sections.academic}</span>
              </div>
              <button
                type="button"
                onClick={() => goToStep(2)}
                disabled={isSubmitting}
                className="text-[13px] font-medium text-primary transition-colors hover:underline cursor-pointer"
              >
                Edit
              </button>
            </div>

            <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
              <div>
                <div className="text-[13px] text-muted-foreground">
                  {registrationCopy.review.labels.university}
                </div>
                <div className="text-[14px] text-white break-words">
                  {universityLabel || "—"}
                </div>
              </div>

              <div>
                <div className="text-[13px] text-muted-foreground">
                  {registrationCopy.review.labels.programme}
                </div>
                <div className="text-[14px] text-white break-words">
                  {programmeDisplay || "—"}
                </div>
              </div>

              <div>
                <div className="text-[13px] text-muted-foreground">
                  {registrationCopy.review.labels.year}
                </div>
                <div className="text-[14px] text-white break-words">
                  {yearDisplay || "—"}
                </div>
              </div>

              <div>
                <div className="text-[13px] text-muted-foreground">
                  {registrationCopy.review.labels.graduation}
                </div>
                <div className="text-[14px] text-white break-words">
                  {state.data.graduationYear || "—"}
                </div>
              </div>
            </div>
          </div>

          <div className="my-5 border-t border-border" />

          {/* Section 3: Interests */}
          <div>
            <div className="flex items-center justify-between pb-2">
              <div className="text-[15px] font-semibold text-white">
                {registrationCopy.review.sections.interests}
              </div>
              <button
                type="button"
                onClick={() => goToStep(3)}
                disabled={isSubmitting}
                className="text-[13px] font-medium text-primary transition-colors hover:underline cursor-pointer"
              >
                Edit
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {state.data.interests && state.data.interests.length > 0 ? (
                state.data.interests.map((interest) => (
                  <span
                    key={interest}
                    className="inline-flex h-6 items-center rounded border border-primary/60 px-2.5 text-[12.5px] font-medium text-primary"
                  >
                    {interest}
                  </span>
                ))
              ) : (
                <span className="text-[14px] text-muted-foreground">
                  {registrationCopy.review.none}
                </span>
              )}
            </div>
          </div>

          <div className="my-5 border-t border-border" />

          {/* Section 4: Role */}
          <div>
            <div className="flex items-center justify-between pb-2">
              <div className="text-[15px] font-semibold text-white">
                {registrationCopy.review.sections.role}
              </div>
              <button
                type="button"
                onClick={() => goToStep(3)}
                disabled={isSubmitting}
                className="text-[13px] font-medium text-primary transition-colors hover:underline cursor-pointer"
              >
                Edit
              </button>
            </div>

            <div className="flex items-center pt-1">
              <span
                className={cn(
                  "inline-flex items-center rounded px-3 py-1 text-[13px] font-medium border",
                  roleInfo.tone.border,
                  roleInfo.tone.bg,
                  roleInfo.tone.text
                )}
              >
                {roleInfo.label}
              </span>

              {roleInfo.requiresApproval && (
                <span className="ml-2.5 text-[13px] text-muted-foreground">
                  ({registrationCopy.review.needsApproval})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Error Alert Banner */}
        {error && (
          <div
            role="alert"
            className="rounded-md border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        {/* Navigation Buttons: Back and Create Account */}
        <div className="grid grid-cols-[1fr_2fr] gap-2.5 pt-1.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => goToStep(3)}
            disabled={isSubmitting}
            className="h-10 text-[13.5px] font-medium"
          >
            <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
            <span>Back</span>
          </Button>

          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="h-10 text-[13.5px] font-semibold"
          >
            {isSubmitting ? (
              <>
                <Loader2
                  className="size-4 animate-spin shrink-0"
                  aria-hidden="true"
                />
                <span>{registrationCopy.review.submitting}</span>
              </>
            ) : (
              <>
                <CircleCheck className="size-4 shrink-0" aria-hidden="true" />
                <span>{registrationCopy.review.submit}</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </RegisterStepFrame>
  );
}
