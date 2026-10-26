"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Mail, IdCard, CalendarDays, Lock, Info } from "lucide-react";
import { registrationCopy, countryCodes } from "@/data/registration";
import { basicInfoSchema, type BasicInfoValues } from "@/lib/auth/schemas";
import { useRegistration } from "@/components/features/auth/RegistrationProvider";
import { RegisterStepFrame } from "@/components/features/auth/RegisterStepFrame";
import { TextField } from "@/components/ui/TextField";
import { PasswordField } from "@/components/ui/PasswordField";
import { PhoneField } from "@/components/ui/PhoneField";
import { CheckboxField } from "@/components/ui/CheckboxField";
import { Button } from "@/components/ui/button";

export function BasicInfoStep() {
  const { state, saveData, goToStep } = useRegistration();
  const [showRegInfo, setShowRegInfo] = React.useState(false);

  const emailInputRef = React.useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BasicInfoValues>({
    resolver: zodResolver(basicInfoSchema),
    mode: "onTouched",
    defaultValues: {
      firstName: state.data.firstName ?? "",
      lastName: state.data.lastName ?? "",
      email: state.data.email ?? "",
      countryCode: state.data.countryCode ?? "+91",
      phone: state.data.phone ?? "",
      registrationNumber: state.data.registrationNumber ?? "",
      dateOfBirth: state.data.dateOfBirth ?? "",
      password: state.data.password ?? "",
      confirmPassword: state.data.confirmPassword ?? "",
      termsAccepted: state.data.termsAccepted ?? true,
    },
  });

  const { ref: emailFormRef, ...emailFieldProps } = register("email");

  React.useEffect(() => {
    if (state.focusEmail) {
      emailInputRef.current?.focus();
    }
  }, [state.focusEmail]);

  const onSubmit = (values: BasicInfoValues) => {
    saveData(values);
    goToStep(2);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void handleSubmit(onSubmit)(e);
  };

  return (
    <RegisterStepFrame
      step={1}
      title={registrationCopy.basic.title}
      subtitle={registrationCopy.basic.subtitle}
      autoFocusHeading={!state.focusEmail}
    >
      <form noValidate onSubmit={handleFormSubmit} className="space-y-3.5">
        <div className="grid gap-3 sm:grid-cols-2">
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
            error={errors.email?.message}
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
            className="[color-scheme:dark]"
            error={errors.dateOfBirth?.message}
            {...register("dateOfBirth")}
          />

          {/* Password & Confirm Password */}
          <PasswordField
            label={registrationCopy.basic.fields.password.label}
            placeholder={registrationCopy.basic.fields.password.placeholder}
            autoComplete="new-password"
            icon={Lock}
            required
            error={errors.password?.message}
            {...register("password")}
          />

          <PasswordField
            label={registrationCopy.basic.fields.confirmPassword.label}
            placeholder={
              registrationCopy.basic.fields.confirmPassword.placeholder
            }
            autoComplete="new-password"
            icon={Lock}
            required
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
        </div>

        {/* Spanning full width: Password hint */}
        <p className="text-[13px] text-muted-foreground">
          {registrationCopy.basic.passwordHint}
        </p>

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

        {/* Full-width Next Button */}
        <Button
          type="submit"
          variant="primary"
          withArrow
          disabled={isSubmitting}
          className="h-11 w-full text-[14.5px] font-semibold"
        >
          Next
        </Button>

        {/* Below form note */}
        <p className="mt-4 text-center text-[12.5px] italic text-muted-foreground leading-relaxed">
          {registrationCopy.basic.note}
        </p>
      </form>
    </RegisterStepFrame>
  );
}
