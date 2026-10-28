"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Check } from "lucide-react";
import { registrationCopy, interestOptions } from "@/data/registration";
import { signupRoles, roleMeta, type Role } from "@/data/roles";
import { interestsSchema, type InterestsValues } from "@/lib/auth/schemas";
import { useRegistration } from "@/components/features/auth/RegistrationProvider";
import { RegisterStepFrame } from "@/components/features/auth/RegisterStepFrame";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function InterestsStep() {
  const { state, saveData, goToStep } = useRegistration();

  const isPendingRegistration =
    !state.currentProfile || state.currentProfile.status === "pending";

  const {
    register,
    handleSubmit,
    control,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<InterestsValues>({
    resolver: zodResolver(interestsSchema),
    mode: "onTouched",
    defaultValues: {
      interests: state.data.interests ?? [],
      requestedRole: (state.data.requestedRole as Role) ?? "student",
    },
  });

  const selectedInterests =
    useWatch({ control, name: "interests" }) || [];
  const selectedRole =
    (useWatch({ control, name: "requestedRole" }) as Role) || "student";

  const onSubmit = (values: InterestsValues) => {
    saveData(values);
    goToStep(4);
  };

  const handleBack = () => {
    saveData(getValues());
    goToStep(2);
  };

  const currentRoleMeta = roleMeta[selectedRole];

  return (
    <RegisterStepFrame
      step={3}
      title={registrationCopy.interests.title}
      subtitle={registrationCopy.interests.subtitle}
    >
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Fieldset 1: Interests */}
        <fieldset className="border-none p-0">
          <legend className="text-[14px] font-medium text-white">
            {registrationCopy.interests.interestsLabel}{" "}
            <span className="font-normal text-muted-foreground">
              {registrationCopy.interests.interestsHint}
            </span>
          </legend>

          <div className="mt-3 flex flex-wrap gap-2.5">
            {interestOptions.map((item) => {
              const isChecked = selectedInterests.includes(item);
              return (
                <label key={item} className="cursor-pointer select-none">
                  <input
                    type="checkbox"
                    value={item}
                    className="peer sr-only"
                    {...register("interests")}
                  />
                  <span
                    className={cn(
                      "flex h-10 items-center gap-1.5 rounded-md border border-border bg-card/40 px-4 text-[14px] text-muted-foreground transition-all",
                      "hover:border-primary/50 hover:text-white",
                      "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
                      isChecked &&
                        "border-primary bg-primary/10 text-primary font-medium"
                    )}
                  >
                    {isChecked && (
                      <Check
                        className="size-3.5 shrink-0 stroke-[2.5]"
                        aria-hidden="true"
                      />
                    )}
                    <span>{item}</span>
                  </span>
                </label>
              );
            })}
          </div>
          {errors.interests && (
            <p role="alert" className="mt-1.5 text-[13px] text-red-400">
              {errors.interests.message}
            </p>
          )}
        </fieldset>

        {/* Fieldset 2: Role (hidden when registration isn't pending) */}
        {isPendingRegistration && (
          <fieldset className="border-none p-0">
            <legend className="text-[14px] font-medium text-white">
              {registrationCopy.interests.roleLabel}{" "}
              <span className="ml-1 text-primary" aria-hidden="true">
                *
              </span>
            </legend>

            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-6">
              {signupRoles.map((roleKey, idx) => {
                const meta = roleMeta[roleKey];
                const isSelected = selectedRole === roleKey;
                const Icon = meta.icon;

                return (
                  <label
                    key={roleKey}
                    className={cn(
                      "relative flex min-h-[92px] cursor-pointer flex-col items-center justify-center rounded-lg border p-4 text-center transition-all select-none",
                      meta.tone.border,
                      meta.tone.bg,
                      isSelected && cn("ring-2", meta.tone.ring),
                      idx === 4
                        ? "col-span-2 sm:col-span-3"
                        : idx < 3
                          ? "col-span-1 sm:col-span-2"
                          : "col-span-1 sm:col-span-3"
                    )}
                  >
                    <input
                      type="radio"
                      value={roleKey}
                      className="sr-only"
                      {...register("requestedRole")}
                    />

                    {/* Top-right check badge when selected */}
                    {isSelected && (
                      <div
                        aria-hidden="true"
                        className={cn(
                          "absolute right-2 top-2 flex size-5 items-center justify-center rounded-full border bg-background/90",
                          meta.tone.border
                        )}
                      >
                        <Check
                          className={cn("size-3", meta.tone.text)}
                          strokeWidth={3}
                        />
                      </div>
                    )}

                    <Icon
                      className={cn("mb-2 size-7 shrink-0", meta.tone.text)}
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                    <span className="text-[15px] font-semibold text-white leading-tight">
                      {meta.label}
                    </span>
                    <span className="mt-1 text-[12.5px] text-muted-foreground leading-tight">
                      {meta.description}
                    </span>
                  </label>
                );
              })}
            </div>

            {errors.requestedRole && (
              <p role="alert" className="mt-1.5 text-[13px] text-red-400">
                {errors.requestedRole.message}
              </p>
            )}

            {/* Role Approval Notice */}
            {currentRoleMeta?.requiresApproval && (
              <div
                role="status"
                className="mt-3 rounded-md border border-primary/40 bg-primary/5 px-4 py-3 text-[13.5px] leading-[1.5] text-foreground"
              >
                {registrationCopy.interests.roleNotice}
              </div>
            )}
          </fieldset>
        )}

        {/* Navigation Buttons: Back and Next in grid-cols-[1fr_2fr] */}
        <div className="grid grid-cols-[1fr_2fr] gap-2.5 pt-1.5">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            className="h-10 text-[13.5px] font-medium"
          >
            <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
            <span>Back</span>
          </Button>

          <Button
            type="submit"
            variant="primary"
            withArrow
            disabled={isSubmitting}
            className="h-10 text-[13.5px] font-semibold"
          >
            Next
          </Button>
        </div>
      </form>
    </RegisterStepFrame>
  );
}
