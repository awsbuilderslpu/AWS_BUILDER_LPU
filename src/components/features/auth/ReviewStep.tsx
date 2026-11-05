"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  UserRound,
  GraduationCap,
  CircleCheck,
  ArrowLeft,
  Pencil,
  Loader2,
  Check,
} from "lucide-react";
import { authCopy, authParam } from "@/data/auth";
import {
  registrationCopy,
  universities,
  departments,
} from "@/data/registration";
import { roleMeta, type Role } from "@/data/roles";
import {
  registerSchema,
  completeRegistrationSchema,
} from "@/lib/auth/schemas";
import { registerAccount, completeRegistration } from "@/lib/auth/service";
import { formatDob } from "@/lib/auth/format";
import { safeNext } from "@/lib/auth/safe-next";
import { useRegistration } from "@/components/features/auth/RegistrationProvider";
import { RegisterStepFrame } from "@/components/features/auth/RegisterStepFrame";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ReviewStep() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { state, goToStep, markSubmitted } = useRegistration();

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [completeSuccess, setCompleteSuccess] = React.useState(false);

  const isCompleteMode = state.mode === "complete";

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

  const handleFinishCta = () => {
    const next = safeNext(searchParams.get("next"), "/account");
    const params = new URLSearchParams(searchParams.toString());
    params.delete(authParam);
    params.delete("next");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    router.refresh();
    router.push(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isCompleteMode) {
      const parsed = completeRegistrationSchema.safeParse(state.data);
      if (!parsed.success) {
        goToStep(1);
        return;
      }

      if (!state.currentProfile) {
        setError(authCopy.complete.saveFailed);
        return;
      }

      setIsSubmitting(true);
      try {
        const result = await completeRegistration(
          parsed.data,
          state.currentProfile
        );
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setCompleteSuccess(true);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Standard register mode
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

  if (completeSuccess) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="mx-auto my-auto flex w-full max-w-[500px] flex-col items-center py-6 text-center">
          <div
            aria-hidden="true"
            className="flex size-20 items-center justify-center rounded-full border-2 border-success bg-success/10 shadow-[0_0_25px_rgba(34,197,94,0.3)] select-none"
          >
            <Check className="size-10 text-success stroke-[2.5]" />
          </div>

          <h2
            id="auth-view-heading"
            tabIndex={-1}
            className="mt-6 text-[clamp(24px,2vw,30px)] font-bold leading-tight text-foreground tracking-tight outline-none"
          >
            {authCopy.complete.successTitle}
          </h2>

          <p className="mt-3 max-w-[420px] text-[15px] leading-relaxed text-muted-foreground">
            {authCopy.complete.successText}
          </p>

          <Button
            type="button"
            variant="primary"
            withArrow
            onClick={handleFinishCta}
            className="mt-8 h-12 w-full text-[15px] font-semibold"
          >
            {authCopy.complete.successCta}
          </Button>
        </div>
      </div>
    );
  }

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
              <div className="text-[20px] font-semibold text-foreground truncate">
                {fullName || "—"}
              </div>
              <div className="text-[14px] text-muted-foreground break-all">
                {state.data.email || "—"}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => goToStep(1)}
            aria-label="Edit personal information"
            className="text-muted-foreground transition-colors hover:text-primary cursor-pointer p-1"
          >
            <Pencil className="size-4.5" />
          </button>
        </div>

        {/* Section 1: Personal Information */}
        <div className="rounded-lg border border-border bg-card/40 p-5">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <UserRound className="size-4 text-primary" />
              <h3 className="text-[15px] font-semibold text-foreground">
                {registrationCopy.review.sections.personal}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => goToStep(1)}
              className="flex items-center gap-1 text-[13px] text-primary transition-colors hover:text-primary-hover cursor-pointer"
            >
              <Pencil className="size-3.5" />
              <span>Edit</span>
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 text-[13.5px]">
            <div>
              <span className="text-muted-foreground">
                {registrationCopy.review.labels.registrationNumber}
              </span>
              <p className="mt-0.5 font-medium text-foreground">
                {state.data.registrationNumber || "—"}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">
                {registrationCopy.review.labels.phone}
              </span>
              <p className="mt-0.5 font-medium text-foreground">
                {state.data.phone
                  ? `${state.data.countryCode ?? "+91"} ${state.data.phone}`
                  : "—"}
              </p>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">
                {registrationCopy.review.labels.dateOfBirth}
              </span>
              <p className="mt-0.5 font-medium text-foreground">
                {formatDob(state.data.dateOfBirth) || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Academic Information */}
        <div className="rounded-lg border border-border bg-card/40 p-5">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="size-4 text-primary" />
              <h3 className="text-[15px] font-semibold text-foreground">
                {registrationCopy.review.sections.academic}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => goToStep(2)}
              className="flex items-center gap-1 text-[13px] text-primary transition-colors hover:text-primary-hover cursor-pointer"
            >
              <Pencil className="size-3.5" />
              <span>Edit</span>
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 text-[13.5px]">
            <div className="col-span-2">
              <span className="text-muted-foreground">
                {registrationCopy.review.labels.university}
              </span>
              <p className="mt-0.5 font-medium text-foreground">
                {universityLabel || "—"}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">
                {registrationCopy.review.labels.programme}
              </span>
              <p className="mt-0.5 font-medium text-foreground">
                {programmeDisplay || "—"}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">
                {registrationCopy.review.labels.year}
              </span>
              <p className="mt-0.5 font-medium text-foreground">
                {yearDisplay || "—"}
              </p>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">
                {registrationCopy.review.labels.graduation}
              </span>
              <p className="mt-0.5 font-medium text-foreground">
                {state.data.graduationYear || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Interests & Role */}
        <div className="rounded-lg border border-border bg-card/40 p-5">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h3 className="text-[15px] font-semibold text-foreground">
              {registrationCopy.review.sections.interests}
            </h3>
            <button
              type="button"
              onClick={() => goToStep(3)}
              className="flex items-center gap-1 text-[13px] text-primary transition-colors hover:text-primary-hover cursor-pointer"
            >
              <Pencil className="size-3.5" />
              <span>Edit</span>
            </button>
          </div>

          <div className="mt-4">
            {state.data.interests && state.data.interests.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {state.data.interests.map((item) => (
                  <span
                    key={item}
                    className="rounded-md border border-border bg-card/60 px-3 py-1 text-[13px] text-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-muted-foreground">
                {registrationCopy.review.none}
              </p>
            )}
          </div>

          <div className="mt-5 border-t border-border/60 pt-4">
            <span className="text-[13.5px] text-muted-foreground">
              {registrationCopy.review.sections.role}:
            </span>
            <div className="mt-2 flex items-center">
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-3 py-1 text-[13px] font-semibold",
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
            className="rounded-md border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-400"
          >
            {error}
          </div>
        )}

        {/* Navigation Buttons: Back and Submit */}
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
                <span>
                  {isCompleteMode
                    ? authCopy.complete.submitting
                    : registrationCopy.review.submitting}
                </span>
              </>
            ) : (
              <>
                <CircleCheck className="size-4 shrink-0" aria-hidden="true" />
                <span>
                  {isCompleteMode
                    ? authCopy.complete.submit
                    : registrationCopy.review.submit}
                </span>
              </>
            )}
          </Button>
        </div>
      </form>
    </RegisterStepFrame>
  );
}
