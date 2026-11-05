"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Mail, IdCard, CalendarDays, Lock, Info, AlertCircle } from "lucide-react";
import { authCopy } from "@/data/auth";
import { registrationCopy, registrationConstants, countryCodes, genderOptions } from "@/data/registration";
import {
  basicInfoSchema,
  completeBasicInfoSchema,
  type BasicInfoValues,
  type CompleteBasicInfoValues,
} from "@/lib/auth/schemas";
import { useRegistration } from "@/components/features/auth/RegistrationProvider";
import { RegisterStepFrame } from "@/components/features/auth/RegisterStepFrame";
import { TextField } from "@/components/ui/TextField";
import { PasswordField } from "@/components/ui/PasswordField";
import { PhoneField } from "@/components/ui/PhoneField";
import { SelectField } from "@/components/ui/SelectField";
import { CheckboxField } from "@/components/ui/CheckboxField";
import { Button } from "@/components/ui/button";

export function BasicInfoStep() {
  const { state, saveData, goToStep } = useRegistration();
  const [showRegInfo, setShowRegInfo] = React.useState(false);

  const emailInputRef = React.useRef<HTMLInputElement | null>(null);

  const isCompleteMode = state.mode === "complete";
  const hasExistingRegNo = Boolean(state.currentProfile?.registrationNumber);
  const hasExistingDob = Boolean(state.currentProfile?.dateOfBirth);

  const maxDateOfBirth = React.useMemo(() => {
    const today = new Date();
    const maxYear = today.getFullYear() - registrationConstants.minAge;
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${maxYear}-${m}-${d}`;
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BasicInfoValues | CompleteBasicInfoValues>({
    resolver: zodResolver(
      isCompleteMode ? completeBasicInfoSchema : basicInfoSchema
    ),
    mode: "onTouched",
    defaultValues: {
      firstName: state.data.firstName ?? "",
      lastName: state.data.lastName ?? "",
      email: state.data.email ?? "",
      countryCode: state.data.countryCode ?? "+91",
      phone: state.data.phone ?? "",
      registrationNumber: state.data.registrationNumber ?? "",
      dateOfBirth: state.data.dateOfBirth ?? "",
      gender: (state.data.gender as "Male" | "Female") ?? undefined,
      ...(isCompleteMode
        ? {}
        : {
            password: state.data.password ?? "",
            confirmPassword: state.data.confirmPassword ?? "",
          }),
      termsAccepted: state.data.termsAccepted ?? true,
    },
  });

  const { ref: emailFormRef, ...emailFieldProps } = register("email" as const);

  React.useEffect(() => {
    if (state.focusEmail && !isCompleteMode) {
      emailInputRef.current?.focus();
    }
  }, [state.focusEmail, isCompleteMode]);

  const onSubmit = (values: BasicInfoValues | CompleteBasicInfoValues) => {
    saveData(values);
    goToStep(2);
  };

  const onInvalid = (formErrors: typeof errors) => {
    if (process.env.NODE_ENV !== "production") {
      console.warn("BasicInfoStep validation errors:", formErrors);
    }
  };

  return (
    <RegisterStepFrame
      step={1}
      title={registrationCopy.basic.title}
      subtitle={registrationCopy.basic.subtitle}
      autoFocusHeading={!state.focusEmail || isCompleteMode}
    >
      <form noValidate onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-2">
        <div className="grid gap-2 sm:gap-2.5 sm:grid-cols-2">
          {/* First Name & Last Name */}
          <TextField
            label={registrationCopy.basic.fields.firstName.label}
            placeholder={registrationCopy.basic.fields.firstName.placeholder}
            autoComplete="given-name"
            icon={User}
            required
            error={errors.firstName?.message}
            {...register("firstName")}
          />

          <TextField
            label={registrationCopy.basic.fields.lastName.label}
            placeholder={registrationCopy.basic.fields.lastName.placeholder}
            autoComplete="family-name"
            icon={User}
            required
            error={errors.lastName?.message}
            {...register("lastName")}
          />

          {/* Email & Phone */}
          <TextField
            label={registrationCopy.basic.fields.email.label}
            placeholder={registrationCopy.basic.fields.email.placeholder}
            type="email"
            inputMode="email"
            autoComplete="email"
            icon={Mail}
            required
            disabled={isCompleteMode}
            hint={isCompleteMode ? authCopy.complete.emailHint : undefined}
            error={"email" in errors ? (errors.email as { message?: string })?.message : undefined}
            {...emailFieldProps}
            ref={(node) => {
              emailFormRef(node);
              emailInputRef.current = node;
            }}
          />

          <PhoneField
            id="basic-phone"
            label={registrationCopy.basic.fields.phone.label}
            required
            error={errors.phone?.message}
            codes={countryCodes}
            selectLabel={registrationCopy.basic.countryCodeLabel}
            selectProps={register("countryCode")}
            inputProps={register("phone")}
          />

          {/* Registration Number & Date of Birth */}
          <TextField
            label={registrationCopy.basic.fields.registrationNumber.label}
            placeholder={
              registrationCopy.basic.fields.registrationNumber.placeholder
            }
            inputMode="numeric"
            autoComplete="off"
            icon={IdCard}
            required
            disabled={isCompleteMode && hasExistingRegNo}
            error={errors.registrationNumber?.message}
            hint={
              showRegInfo ? registrationCopy.basic.registrationInfo : undefined
            }
            labelAction={
              <button
                type="button"
                onClick={() => setShowRegInfo((prev) => !prev)}
                aria-label={registrationCopy.basic.registrationInfoLabel}
                aria-expanded={showRegInfo}
                className="flex items-center text-muted-foreground transition-colors hover:text-white cursor-pointer"
              >
                <Info className="size-[18px]" aria-hidden="true" />
              </button>
            }
            {...register("registrationNumber")}
          />

          <TextField
            label={registrationCopy.basic.fields.dateOfBirth.label}
            type="date"
            autoComplete="bday"
            icon={CalendarDays}
            required
            disabled={isCompleteMode && hasExistingDob}
            max={maxDateOfBirth}
            className="[color-scheme:dark]"
            error={errors.dateOfBirth?.message}
            {...register("dateOfBirth")}
          />

          {/* Gender (Male or Female only) */}
          <div className="sm:col-span-2">
            <SelectField
              label={registrationCopy.basic.fields.gender.label}
              placeholder={registrationCopy.basic.fields.gender.placeholder}
              required
              options={genderOptions}
              error={"gender" in errors ? (errors.gender as { message?: string })?.message : undefined}
              {...register("gender")}
            />
          </div>

          {/* Password & Confirm Password (hidden in complete mode) */}
          {!isCompleteMode && (
            <>
              <PasswordField
                label={registrationCopy.basic.fields.password.label}
                placeholder={registrationCopy.basic.fields.password.placeholder}
                autoComplete="new-password"
                icon={Lock}
                required
                error={"password" in errors ? (errors.password as { message?: string })?.message : undefined}
                {...register("password" as const)}
              />

              <PasswordField
                label={registrationCopy.basic.fields.confirmPassword.label}
                placeholder={
                  registrationCopy.basic.fields.confirmPassword.placeholder
                }
                autoComplete="new-password"
                icon={Lock}
                required
                error={
                  "confirmPassword" in errors
                    ? (errors.confirmPassword as { message?: string })?.message
                    : undefined
                }
                {...register("confirmPassword" as const)}
              />
            </>
          )}
        </div>

        {/* Spanning full width: Password hint (hidden in complete mode) */}
        {!isCompleteMode && (
          <p className="text-[11.5px] leading-snug text-muted-foreground">
            {registrationCopy.basic.passwordHint}
          </p>
        )}

        {/* Spanning full width: Terms checkbox */}
        <CheckboxField
          error={errors.termsAccepted?.message}
          {...register("termsAccepted")}
          label={
            <span>
              {registrationCopy.basic.terms.before}{" "}
              <a
                href={registrationCopy.basic.terms.termsHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                {registrationCopy.basic.terms.terms}
              </a>{" "}
              {registrationCopy.basic.terms.join}{" "}
              <a
                href={registrationCopy.basic.terms.privacyHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                {registrationCopy.basic.terms.privacy}
              </a>{" "}
              <span className="text-primary" aria-hidden="true">
                *
              </span>
            </span>
          }
        />

        {Object.keys(errors).length > 0 && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-[12px] text-red-300"
          >
            <AlertCircle className="size-4 shrink-0 text-red-400" />
            <span>Please check and correct the highlighted fields above to continue.</span>
          </div>
        )}

        {/* Full-width Next Button */}
        <Button
          type="submit"
          variant="primary"
          withArrow
          disabled={isSubmitting}
          className="h-10 w-full text-[13.5px] font-semibold"
        >
          Next
        </Button>

        {/* Below form note */}
        <p className="mt-2 text-center text-[11.5px] italic text-muted-foreground leading-relaxed">
          {registrationCopy.basic.note}
        </p>
      </form>
    </RegisterStepFrame>
  );
}
